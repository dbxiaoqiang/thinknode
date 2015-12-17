/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/2
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _ThinkLog = require('../../Think/Log');

var _ThinkLog2 = _interopRequireDefault(_ThinkLog);

var _default = (function (_log) {
    _inherits(_default, _log);

    function _default() {
        _classCallCheck(this, _default);

        _log.apply(this, arguments);
    }

    _default.prototype.init = function init(options) {
        _log.prototype.init.call(this, options);

        if (this.options.log_type === 'memory') {
            this.options.log_path = THINK.LOG_PATH + '/memory';
        } else if (this.options.log_type === 'custom') {
            this.options.log_path = THINK.LOG_PATH + '/custom';
        } else {
            this.options.log_path = THINK.LOG_PATH + '/console';
        }
        isDir(this.options.log_path) || mkdir(this.options.log_path);
    };

    /**
     * 获取指定日期的log内容
     * @param name
     * @param date
     */

    _default.prototype.get = function get() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var date = arguments.length <= 1 || arguments[1] === undefined ? this.getDate() : arguments[1];

        var file = this.options.log_path + '/' + date + name + '.log';
        return getFileContent(file);
    };

    _default.prototype.set = function set() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var value = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        if (!isEmpty(value)) {
            var file = this.options.log_path + '/' + this.getDate() + name + '.log';
            var dateTime = this.getDateTime();
            try {
                value = ['[' + dateTime + ']'].concat([].slice.call(value));
                var message = _util2['default'].format.apply(null, value) + '\n';
                _fs2['default'].appendFile(file, message);
            } catch (e) {}
        }
    };

    return _default;
})(_ThinkLog2['default']);

exports['default'] = _default;
module.exports = exports['default'];