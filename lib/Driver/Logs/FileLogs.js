'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _Logs = require('./Logs');

var _Logs2 = _interopRequireDefault(_Logs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Logs2.default {
    init(options) {
        super.init(options);
    }

    /**
     * 获取日志路径
     * @param type
     */
    getFilePath(name) {
        let dir = `${ THINK.LOG_PATH }/console`;
        if (this.options.log_itemtype === 'memory') {
            dir = `${ THINK.LOG_PATH }/memory`;
        } else if (this.options.log_itemtype === 'custom') {
            dir = `${ THINK.LOG_PATH }/custom`;
        }
        isDir(dir) || mkdir(dir);
        return `${ dir }/${ name ? name + '_' : '' }${ this.getDate() }.log`;
    }

    /**
     * 获取指定日期的log内容
     * @param name
     */
    get() {
        let name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        let file = this.getFilePath(name);
        return getFileContent(file);
    }

    set() {
        let name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        let value = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        if (!isEmpty(value)) {
            let file = this.getFilePath(name);
            let dateTime = this.getDateTime();
            try {
                value = ['[' + dateTime + ']'].concat([].slice.call(value));
                let message = _util2.default.format.apply(null, value) + '\n';
                _fs2.default.appendFile(file, message);
            } catch (e) {}
        }
    }

}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/12/2
    */