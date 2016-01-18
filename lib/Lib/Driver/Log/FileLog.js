'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _Log = require('../../Think/Log');

var _Log2 = _interopRequireDefault(_Log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_log) {
    (0, _inherits3.default)(_class, _log);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _log.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        _log.prototype.init.call(this, options);
    };

    /**
     * 获取日志路径
     * @param type
     */

    _class.prototype.getLogPath = function getLogPath(type) {
        if (type === 'memory') {
            this.options.log_path = THINK.LOG_PATH + '/memory';
        } else if (type === 'custom') {
            this.options.log_path = THINK.LOG_PATH + '/custom';
        } else {
            this.options.log_path = THINK.LOG_PATH + '/console';
        }
        isDir(this.options.log_path) || mkdir(this.options.log_path);
    };

    /**
     * 获取指定日期的log内容
     * @param name
     */

    _class.prototype.get = function get() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        var file = this.options.log_path + '/' + (name ? name + '_' : '') + this.getDate() + '.log';
        return getFileContent(file);
    };

    _class.prototype.set = function set() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var value = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        if (!isEmpty(value)) {
            var file = this.options.log_path + '/' + (name ? name + '_' : '') + this.getDate() + '.log';
            var dateTime = this.getDateTime();
            try {
                value = ['[' + dateTime + ']'].concat([].slice.call(value));
                var message = _util2.default.format.apply(null, value) + '\n';
                _fs2.default.appendFile(file, message);
            } catch (e) {}
        }
    };

    return _class;
}(_Log2.default); /**
                   *
                   * @author     richen
                   * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                   * @license    MIT
                   * @version    15/12/2
                   */

exports.default = _class;