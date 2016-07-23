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
     * @param  {Object} config []
     * @return {}        []
     */
    init(config) {
        super.init(config);

        config.port = config.db_port || 5432;
        //config.password = config.pwd;
        //delete config.pwd;

        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3006
        };
    }

    /**
     * get pg
     * @return {} []
     */
    getPG() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this.pg) {
                return _this.pg;
            }
            let pg = require('pg');
            //set poolSize
            if (_this.config.poolsize) {
                pg.defaults.poolSize = _this.config.poolsize;
            }
            //set poolIdleTimeout, change default `30 seconds` to 8 hours
            pg.defaults.poolIdleTimeout = _this.config.poolIdleTimeout * 1000 || 8 * 60 * 60 * 1000;

            //when has error, close connection
            pg.on('error', function () {
                _this.close();
            });
            pg.on('end', function () {
                _this.close();
            });
            pg.on('close', function () {
                _this.close();
            });
            _this.pg = pg;
            return pg;
        })();
    }

    /**
     * get connection
     * @return {} []
     */
    getConnection() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this2.connection) {
                return _this2.connection;
            }
            let pg = yield _this2.getPG();
            let config = _this2.config;
            let connectionStr = `postgres://${ config.user }:${ config.password }@${ config.host }:${ config.port }/${ config.database }`;

            return THINK.await(connectionStr, function () {
                let deferred = THINK.getDefer();
                pg.connect(_this2.config, function (err, client, done) {
                    _this2.logConnect(connectionStr, 'postgre');
                    if (err) {
                        deferred.reject(err);
                    } else {
                        _this2.connection = client;
                        _this2.release = done;
                        deferred.resolve(client);
                    }
                });
                return deferred.promise;
            });
        })();
    }

    /**
     * query
     * @return {Promise} []
     */
    query(sql) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let connection = yield _this3.getConnection();
            let startTime = Date.now();
            let fn = THINK.promisify(connection.query, connection);
            let promise = fn(sql).then(function (data) {
                _this3.release();
                if (_this3.config.log_sql) {
                    THINK.log(sql, 'SQL', startTime);
                }
                return data;
            }).catch(function (err) {
                _this3.release();

                //when socket is closed, try it
                if (err.code === 'EPIPE') {
                    _this3.close();
                    return _this3.query(sql);
                }

                if (_this3.config.log_sql) {
                    THINK.log(sql, 'SQL', startTime);
                }
                return _promise2.default.reject(err);
            });
            return THINK.E(promise);
        })();
    }

    /**
     * execute sql
     * @param  {Array} args []
     * @return {Promise}         []
     */
    execute() {
        return this.query.apply(this, arguments);
    }

    /**
     * close connection
     * @return {} []
     */
    close() {
        if (this.connection) {
            this.connection.end();
            this.connection = null;
        }
    }
};