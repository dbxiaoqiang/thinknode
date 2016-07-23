'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toArray2 = require('babel-runtime/helpers/toArray');

var _toArray3 = _interopRequireDefault(_toArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _base = require('./_base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * postgre db
 */
exports.default = class extends _base2.default {
    /**
     * get postgre socket instance
     * @param  {Object} config []
     * @return {}        []
     */
    socket(sql) {
        if (this._socket) {
            return this._socket;
        }
        let config = THINK.extend({
            sql: sql
        }, this.config);
        let PGSocket = THINK.safeRequire(`${ THINK.THINK_PATH }/lib/Adapter/Socket/PostgresqlSocket`);
        this._socket = new PGSocket(config);
        return this._socket;
    }

    /**
     * 获取表模型
     * @param  {String} table [table name]
     * @return {Promise}       []
     */
    getSchema(table) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let columnSql = `SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='${ table }'`;
            let columnsPromise = _this.query(columnSql);
            let indexSql = `SELECT indexname,indexdef FROM pg_indexes WHERE tablename='${ table }'`;
            let indexPromise = _this.query(indexSql);

            var _ref = yield _promise2.default.all([columnsPromise, indexPromise]);

            var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

            let columns = _ref2[0];
            let indexs = _ref2[1];

            let schema = {};
            columns.forEach(function (item) {
                schema[item.column_name] = {
                    name: item.column_name,
                    type: item.data_type,
                    required: item.is_nullable === 'NO',
                    default: '',
                    auto_increment: false
                };
            });
            let extra = {};
            let reg = /\((\w+)(?:, (\w+))*\)/;
            indexs.forEach(function (item) {
                var _item$indexdef$match = item.indexdef.match(reg);

                var _item$indexdef$match2 = (0, _toArray3.default)(_item$indexdef$match);

                let name = _item$indexdef$match2[1];

                let others = _item$indexdef$match2.slice(2);

                extra[name] = {};
                if (item.indexdef.indexOf(' pkey ') > -1) {
                    extra[name].primary = true;
                }
                let index = item.indexdef.indexOf(' UNIQUE ') > -1 ? 'unique' : 'index';
                extra[name][index] = others.length ? others : true;
            });

            return THINK.extend(schema, extra);
        })();
    }

    /**
     * start transaction
     * @return {Promise} []
     */
    startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('BEGIN');
        }
        this.transTimes++;
        return _promise2.default.resolve();
    }

    /**
     * parse limit
     * @param  {String} limit []
     * @return {String}       []
     */
    parseLimit(limit) {
        if (THINK.isEmpty(limit)) {
            return '';
        }
        if (THINK.isNumber(limit)) {
            return ` LIMIT ${ limit }`;
        }
        if (THINK.isString(limit)) {
            limit = limit.split(/\s*,\s*/);
        }
        if (limit[1]) {
            return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
        }
        return ' LIMIT ' + (limit[0] | 0);
    }

    /**
     * parse value
     * @param  {Mixed} value []
     * @return {Mixed}       []
     */
    parseValue(value) {
        if (THINK.isString(value)) {
            value = 'E\'' + this.escapeString(value) + '\'';
        } else if (THINK.isArray(value)) {
            if (/^exp$/.test(value[0])) {
                value = value[1];
            } else {
                value = value.map(item => this.parseValue(item));
            }
        } else if (THINK.isBoolean(value)) {
            value = value ? 'true' : 'false';
        } else if (value === null) {
            value = 'null';
        }
        return value;
    }

    /**
     * query string
     * @param  string str
     * @return promise
     */
    query(sql) {
        this.sql = sql;
        return THINK.await(sql, () => {
            return this.socket(sql).query(sql).then(data => {
                return this.bufferToString(data.rows);
            });
        });
    }

    /**
     * execute sql
     * @param  {String} sql []
     * @return {}     []
     */
    execute(sql) {
        this.sql = sql;
        let insertInto = 'insert into ';
        let prefix = sql.slice(0, insertInto.length).toLowerCase();
        let isInsert = false;
        if (prefix === insertInto) {
            sql += ' RETURNING id';
            isInsert = true;
        }
        return this.socket(sql).execute(sql).then(data => {
            if (isInsert) {
                this.lastInsertId = data.rows[0].id;
            }
            return data.rowCount || 0;
        });
    }
};