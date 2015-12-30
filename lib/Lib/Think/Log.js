/**
 * 记录日志 按天写入
 * @type {Object}
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.options = extend(false, {
            log_itemtype: C('log_itemtype'), //日志类型,console console输出的日志 | memory 内存使用和负载日志 | custom 自定义日志
            log_console_type: C('log_console_type'), //默认只接管console.error日志, console类型日志有效
            log_interval: C('log_interval') //一分钟记录一次, memory类型日志有效
        }, options);
    };

    /**
     * 获取当前日期
     * @return {[type]} [description]
     */

    _default.prototype.getDate = function getDate() {
        var d = new Date();
        return d.Format('yyyy-mm-dd');
    };

    /**
     * 获取当前时间
     * @return {[type]} [description]
     */

    _default.prototype.getDateTime = function getDateTime() {
        var d = new Date();
        return d.Format('yyyy-mm-dd hh:mi:ss');
    };

    /**
     *
     * @param name
     */

    _default.prototype.logConsole = function logConsole() {
        var self = this;
        var type = this.options.log_console_type || [];
        this.getLogPath('console');
        type.forEach(function (item) {
            console[item] = function () {
                var msgs = ['[' + item.toUpperCase() + ']'].concat([].slice.call(arguments));
                self.set('', msgs);
            };
        });
    };

    /**
     *
     * @param name
     */

    _default.prototype.logMemory = function logMemory() {
        var _this = this;

        var format = function format(data) {
            return (data / 1048576).toFixed(1) + 'MB'; // 1048576 = 1024 * 1024
        };
        setInterval(function () {
            var memoryUsage = process.memoryUsage();
            var loadAvg = _os2['default'].loadavg();
            var msgs = ['rss:' + format(memoryUsage.rss), 'heapTotal:' + format(memoryUsage.heapTotal), 'heapUsed:' + format(memoryUsage.heapUsed), 'freeMemory:' + format(_os2['default'].freemem()), 'loadAvg:' + loadAvg[0].toFixed(1) + ',' + loadAvg[1].toFixed(1) + ',' + loadAvg[2].toFixed(2)];
            _this.getLogPath('memory');
            _this.set('', msgs);
        }, this.options.log_interval);
    };

    /**
     *
     * @param name
     * @param msgs
     */

    _default.prototype.logCustom = function logCustom(name, msgs) {
        msgs = ['[INFO]', msgs];
        this.getLogPath('custom');
        this.set(name, msgs);
    };

    return _default;
})(_Base2['default']);

exports['default'] = _default;
module.exports = exports['default'];