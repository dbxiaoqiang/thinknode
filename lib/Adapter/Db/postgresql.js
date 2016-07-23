'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('./_base');

var _base3 = _interopRequireDefault(_base2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * postgre db
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    /**
     * get postgre socket instance
     * @param  {Object} config []
     * @return {}        []
     */
    _class.prototype.socket = function socket(sql) {
        if (this._socket) {
            return this._socket;
        }
        var config = THINK.extend({
            sql: sql
        }, this.config);
        var PGSocket = THINK.safeRequire(THINK.THINK_PATH + '/lib/Adapter/Socket/PostgresqlSocket');
        this._socket = new PGSocket(config);
        return this._socket;
    };

    /**
     * 获取表模型
     * @param  {String} table [table name]
     * @return {Promise}       []
     */


    _class.prototype.getSchema = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(table) {
            var columnSql, columnsPromise, indexSql, indexPromise, _ref2, columns, indexs, schema, extra, reg;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            columnSql = 'SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name=\'' + table + '\'';
                            columnsPromise = this.query(columnSql);
                            indexSql = 'SELECT indexname,indexdef FROM pg_indexes WHERE tablename=\'' + table + '\'';
                            indexPromise = this.query(indexSql);
                            _context.next = 6;
                            return _promise2.default.all([columnsPromise, indexPromise]);

                        case 6:
                            _ref2 = _context.sent;
                            columns = _ref2[0];
                            indexs = _ref2[1];
                            schema = {};

                            columns.forEach(function (item) {
                                schema[item.column_name] = {
                                    name: item.column_name,
                                    type: item.data_type,
                                    required: item.is_nullable === 'NO',
                                    default: '',
                                    auto_increment: false
                                };
                            });
                            extra = {};
                            reg = /\((\w+)(?:, (\w+))*\)/;

                            indexs.forEach(function (item) {
                                var _item$indexdef$match = item.indexdef.match(reg);

                                var name = _item$indexdef$match[1];

                                var others = _item$indexdef$match.slice(2);

                                extra[name] = {};
                                if (item.indexdef.indexOf(' pkey ') > -1) {
                                    extra[name].primary = true;
                                }
                                var index = item.indexdef.indexOf(' UNIQUE ') > -1 ? 'unique' : 'index';
                                extra[name][index] = others.length ? others : true;
                            });

                            return _context.abrupt('return', THINK.extend(schema, extra));

                        case 15:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getSchema(_x) {
            return _ref.apply(this, arguments);
        }

        return getSchema;
    }();

    /**
     * start transaction
     * @return {Promise} []
     */


    _class.prototype.startTrans = function startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('BEGIN');
        }
        this.transTimes++;
        return _promise2.default.resolve();
    };

    /**
     * parse limit
     * @param  {String} limit []
     * @return {String}       []
     */


    _class.prototype.parseLimit = function parseLimit(limit) {
        if (THINK.isEmpty(limit)) {
            return '';
        }
        if (THINK.isNumber(limit)) {
            return ' LIMIT ' + limit;
        }
        if (THINK.isString(limit)) {
            limit = limit.split(/\s*,\s*/);
        }
        if (limit[1]) {
            return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
        }
        return ' LIMIT ' + (limit[0] | 0);
    };

    /**
     * parse value
     * @param  {Mixed} value []
     * @return {Mixed}       []
     */


    _class.prototype.parseValue = function parseValue(value) {
        var _this2 = this;

        if (THINK.isString(value)) {
            value = 'E\'' + this.escapeString(value) + '\'';
        } else if (THINK.isArray(value)) {
            if (/^exp$/.test(value[0])) {
                value = value[1];
            } else {
                value = value.map(function (item) {
                    return _this2.parseValue(item);
                });
            }
        } else if (THINK.isBoolean(value)) {
            value = value ? 'true' : 'false';
        } else if (value === null) {
            value = 'null';
        }
        return value;
    };

    /**
     * query string
     * @param  string str
     * @return promise
     */


    _class.prototype.query = function query(sql) {
        var _this3 = this;

        this.sql = sql;
        return THINK.await(sql, function () {
            return _this3.socket(sql).query(sql).then(function (data) {
                return _this3.bufferToString(data.rows);
            });
        });
    };

    /**
     * execute sql
     * @param  {String} sql []
     * @return {}     []
     */


    _class.prototype.execute = function execute(sql) {
        var _this4 = this;

        this.sql = sql;
        var insertInto = 'insert into ';
        var prefix = sql.slice(0, insertInto.length).toLowerCase();
        var isInsert = false;
        if (prefix === insertInto) {
            sql += ' RETURNING id';
            isInsert = true;
        }
        return this.socket(sql).execute(sql).then(function (data) {
            if (isInsert) {
                _this4.lastInsertId = data.rows[0].id;
            }
            return data.rowCount || 0;
        });
    };

    return _class;
}(_base3.default);

exports.default = _class;