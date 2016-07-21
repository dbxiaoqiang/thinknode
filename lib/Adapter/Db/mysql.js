'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
}; /**
    * Created by lihao on 16/7/19.
    */