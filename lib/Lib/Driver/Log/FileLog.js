'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _Log = require('../../Think/Log');

var _Log2 = _interopRequireDefault(_Log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Log2.default {
    init(options) {
        super.init(options);
    }

    /**
     * 获取日志路径
     * @param type
     */
    getLogPath(type) {
        if (type === 'memory') {
            this.options.log_path = `${ THINK.LOG_PATH }/memory`;
        } else if (type === 'custom') {
            this.options.log_path = `${ THINK.LOG_PATH }/custom`;
        } else {
            this.options.log_path = `${ THINK.LOG_PATH }/console`;
        }
        isDir(this.options.log_path) || mkdir(this.options.log_path);
    }

    /**
     * 获取指定日期的log内容
     * @param name
     */
    get() {
        let name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        let file = `${ this.options.log_path }/${ name ? name + '_' : '' }${ this.getDate() }.log`;
        return getFileContent(file);
    }

    set() {
        let name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        let value = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        if (!isEmpty(value)) {
            let file = `${ this.options.log_path }/${ name ? name + '_' : '' }${ this.getDate() }.log`;
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