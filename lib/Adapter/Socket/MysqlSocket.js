'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _base = require('./_base.js');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * mysql socket class
 * @return {} []
 */
exports.default = class extends _base2.default {
    /**
     * init
     * @param  {Object} config [connection options]
     * @return {}        []
     */
    init() {
        let config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        super.init(config);

        //alias password config
        // if (config.pwd) {
        //   config.password = config.pwd;
        //   delete config.pwd;
        // }
        //merge config
        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3006,
            charset: config.db_charset || 'utf8',
            connectionLimit: config.poolsize || 10
        };

        //rename encoding to charset
        if (!this.config.db_charset && this.config.db_encoding) {
            this.config.charset = this.config.encoding;
            delete this.config.encoding;
        }
        //node-mysql2 not support utf8 or utf-8
        let charset = (this.config.charset || '').toLowerCase();
        if (charset === 'utf8' || charset === 'utf-8') {
            this.config.charset = 'UTF8_GENERAL_CI';
        }

        this.pool = null;
    }

    /**
     * get connection
     * @return {Promise} [conneciton handle]
     */
    getConnection() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this.connection) {
                return _this.connection;
            }

            let config = _this.config;
            let str = `mysql://${ config.user }:${ config.password }@${ config.host }:${ config.port }/${ config.database }`;
            if (_this.pool) {
                let fn = THINK.promisify(_this.pool.getConnection, _this.pool);
                let promise = fn().catch(function (err) {
                    _this.close();
                    return _promise2.default.reject(err);
                });
                let err = new Error(str);
                return THINK.E(promise, err);
            }

            let mysql = require('mysql2');

            //默认即开启连接池
            if (config.connectionLimit) {
                _this.logConnect(str, 'mysql');

                _this.pool = mysql.createPool(config);
                return _this.getConnection();
            }
            return THINK.await(str, function () {
                let deferred = THINK.getDefer();
                _this.connection = mysql.createConnection(config);
                _this.connection.connect(function (err) {
                    _this.logConnect(str, 'mysql');

                    if (err) {
                        deferred.reject(err);
                        _this.close();
                    } else {
                        deferred.resolve(_this.connection);
                    }
                });
                _this.connection.on('error', function () {
                    _this.close();
                });
                //PROTOCOL_CONNECTION_LOST
                _this.connection.on('end', function () {
                    _this.connection = null;
                });
                let err = new Error(str);
                return THINK.E(deferred.promise, err);
            });
        })();
    }

    /**
     * query sql
     * @param  {String} sql []
     * @return {[type]}     []
     */
    query(sql, nestTables) {
        var _this2 = this;

        let times = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
        return (0, _asyncToGenerator3.default)(function* () {
            let connection = yield _this2.getConnection();
            let data = {
                sql: sql,
                nestTables: nestTables
            };
            //query timeout
            if (_this2.config.timeout) {
                data.timeout = _this2.config.timeout;
            }
            let startTime = Date.now();
            let fn = THINK.promisify(connection.query, connection);
            let promise = fn(data).then(function () {
                let rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

                // just call connection.release() and the connection will return to the pool,
                // ready to be used again by someone else.
                // https://github.com/felixge/node-mysql#pooling-connections
                if (_this2.pool && connection.release) {
                    connection.release();
                }

                if (_this2.config.log_sql) {
                    THINK.log(sql, 'SQL', startTime);
                }
                return rows;
            }).catch((() => {
                var _ref = (0, _asyncToGenerator3.default)(function* (err) {
                    if (_this2.pool && connection.release) {
                        connection.release();
                    }
                    //Connection lost: The server closed the connection.
                    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'EPIPE') {
                        yield _this2.close();
                        if (times <= 3) {
                            return _this2.query(sql, nestTables, ++times);
                        }
                    }

                    if (_this2.config.log_sql) {
                        THINK.log(sql, 'SQL', startTime);
                    }
                    return _promise2.default.reject(err);
                });

                return function (_x4) {
                    return _ref.apply(this, arguments);
                };
            })());
            promise = _this2.autoClose(promise);
            return THINK.E(promise);
        })();
    }

    /**
     * execute
     * @param  {Array} args []
     * @return {Promise}         []
     */
    execute() {
        return this.query.apply(this, arguments);
    }

    /**
     * close connections
     * @return {} []
     */
    close() {
        if (this.pool) {
            let fn = THINK.promisify(this.pool.end, this.pool);
            return fn().then(() => this.pool = null);
        } else if (this.connection) {
            let fn = THINK.promisify(this.connection.end, this.connection);
            return fn().then(() => this.connection = null);
        }
    }
};