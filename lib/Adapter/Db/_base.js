'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _parse2 = require('./_parse');

var _parse3 = _interopRequireDefault(_parse2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_parse) {
    (0, _inherits3.default)(_class, _parse);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _parse.apply(this, arguments));
    }

    _class.prototype.init = function init(config) {
        _parse.prototype.init.call(this, config);
        this.sql = '';
        this.lastInsertId = 0;
        this._socket = null;
        this.transTimes = 0; //transaction times
    };

    /**
     * 数据库连接,各子类自行实现
     */


    _class.prototype.socket = function socket() {};

    _class.prototype.add = function add(data, options, replace) {
        var values = [];
        var fields = [];
        for (var key in data) {
            var val = data[key];
            val = this.parseValue(val);
            if (THINK.isString(val) || THINK.isBoolean(val) || THINK.isNumber(val)) {
                values.push(val);
                fields.push(this.parseKey(key));
            }
        }
        var sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parseTable(options.table) + ' (' + fields.join(',') + ')';
        sql += ' VALUES (' + values.join(',') + ')';
        sql += this.parseLock(options.lock) + this.parseComment(options.comment);
        return this.execute(sql);
    };

    _class.prototype.addAll = function addAll(data, options, replace) {
        var _this2 = this;

        var fields = (0, _keys2.default)(data[0]).map(function (item) {
            return _this2.parseKey(item);
        }).join(',');
        var values = data.map(function (item) {
            var value = [];
            for (var key in item) {
                var val = item[key];
                val = _this2.parseValue(val);
                if (THINK.isString(val) || THINK.isBoolean(val) || THINK.isNumber(val)) {
                    value.push(val);
                }
            }
            return '(' + value.join(',') + ')';
        }).join(',');
        var sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parseTable(options.table) + '(' + fields + ')';
        sql += ' VALUES ' + values;
        sql += this.parseLock(options.lock) + this.parseComment(options.comment);
        return this.execute(sql);
    };

    _class.prototype.selectAdd = function selectAdd(fields, table) {
        var _this3 = this;

        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        if (THINK.isString(fields)) {
            fields = fields.split(/\s*,\s*/);
        }
        fields = fields.map(function (item) {
            return _this3.parseKey(item);
        });
        var sql = 'INSERT INTO ' + this.parseTable(table) + ' (' + fields.join(',') + ') ';
        sql += this.buildSelectSql(options);
        return this.execute(sql);
    };

    _class.prototype.delete = function _delete(options) {
        var sql = ['DELETE FROM ', this.parseTable(options.table), this.parseWhere(options.where), this.parseOrder(options.order), this.parseLimit(options.limit), this.parseLock(options.lock), this.parseComment(options.comment)].join('');
        return this.execute(sql);
    };

    _class.prototype.update = function update(options, data) {
        var sql = ['UPDATE ', this.parseTable(options.table), this.parseSet(data), this.parseWhere(options.where), this.parseOrder(options.order), this.parseLimit(options.limit), this.parseLock(options.lock), this.parseComment(options.comment)].join('');
        return this.execute(sql);
    };

    _class.prototype.select = function select(options, cache) {
        var _this4 = this;

        var sql = void 0;
        if (THINK.isObject(options)) {
            sql = this.buildSelectSql(options);
            cache = options.cache || cache;
        } else {
            sql = options;
        }
        if (!THINK.isEmpty(cache) && this.config.cache.on) {
            var key = cache.key || THINK.md5(sql);
            return THINK.cache(key, function () {
                return _this4.query(sql);
            }, cache);
        }
        return this.query(sql);
    };

    _class.prototype.escapeString = function escapeString(str) {
        if (!str) {
            return '';
        }
        return str.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
            switch (s) {
                case '\0':
                    return '\\0';
                case '\n':
                    return '\\n';
                case '\r':
                    return '\\r';
                case '\b':
                    return '\\b';
                case '\t':
                    return '\\t';
                case '\x1a':
                    return '\\Z';
                default:
                    return '\\' + s;
            }
        });
    };

    _class.prototype.getLastSql = function getLastSql() {
        return this.sql;
    };

    _class.prototype.getLastInsertId = function getLastInsertId() {
        return this.lastInsertId;
    };

    _class.prototype.query = function query(sql) {
        var _this5 = this;

        console.log(sql);
        this.sql = sql;
        return this.socket(sql).query(sql).then(function (data) {
            return _this5.bufferToString(data);
        });
    };

    _class.prototype.bufferToString = function bufferToString(data) {
        if (!this.config.buffer_tostring || !THINK.isArray(data)) {
            return data;
        }
        for (var i = 0, length = data.length; i < length; i++) {
            for (var key in data[i]) {
                if (THINK.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    };

    _class.prototype.execute = function execute(sql) {
        var _this6 = this;

        console.log(sql);
        this.sql = sql;
        return this.socket(sql).execute(sql).then(function (data) {
            if (data.insertId) {
                _this6.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    };

    _class.prototype.startTrans = function startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('START TRANSACTION');
        }
        this.transTimes++;
        return _promise2.default.resolve();
    };

    _class.prototype.commit = function commit() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return _promise2.default.resolve();
    };

    _class.prototype.rollback = function rollback() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return _promise2.default.resolve();
    };

    _class.prototype.close = function close() {
        if (this._socket) {
            this._socket.close();
            this._socket = null;
        }
    };

    return _class;
}(_parse3.default); /**
                     * Created by lihao on 16/7/19.
                     */


exports.default = _class;