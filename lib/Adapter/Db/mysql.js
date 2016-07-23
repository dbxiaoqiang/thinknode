'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _base = require('./_base');

var _base2 = _interopRequireDefault(_base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _base2.default {
    socket(sql) {
        if (this._socket) {
            return this._socket;
        }
        let config = THINK.extend({
            sql: sql
        }, this.config);
        let MysqlSocket = THINK.safeRequire(`${ THINK.THINK_PATH }/lib/Adapter/Socket/MysqlSocket`);
        this._socket = new MysqlSocket(config);
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
            let data = yield _this.query(`SHOW COLUMNS FROM ${ _this.parseKey(table) }`);
            let ret = {};
            data.forEach(function (item) {
                ret[item.Field] = {
                    'name': item.Field,
                    'type': item.Type,
                    'required': item.Null === '',
                    //'default': item.Default,
                    'primary': item.Key === 'PRI',
                    'unique': item.Key === 'UNI',
                    'auto_increment': item.Extra.toLowerCase() === 'auto_increment'
                };
            });
            return ret;
        })();
    }

    /**
     * parse key
     * @param  {String} key []
     * @return {String}     []
     */
    parseKey() {
        let key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        key = key.trim();
        if (THINK.isEmpty(key)) {
            return '';
        }
        if (THINK.isNumberString(key)) {
            return key;
        }
        if (!/[,\'\"\*\(\)`.\s]/.test(key)) {
            key = '`' + key + '`';
        }
        return key;
    }
}; /**
    * Created by lihao on 16/7/19.
    */