'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
exports.default = class extends _Base2.default {
    init() {
        let options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.options = extend(false, {
            log_itemtype: C('log_itemtype'), //日志类型,console console输出的日志 | memory 内存使用和负载日志 | custom 自定义日志
            log_console_type: C('log_console_type'), //默认只接管console.error日志, console类型日志有效
            log_interval: C('log_interval') //一分钟记录一次, memory类型日志有效
        }, options);
    }

    /**
     * 获取当前日期
     * @return {[type]} [description]
     */
    getDate() {
        let d = new Date();
        return d.Format('yyyy-mm-dd');
    }
    /**
     * 获取当前时间
     * @return {[type]} [description]
     */
    getDateTime() {
        let d = new Date();
        return d.Format('yyyy-mm-dd hh:mi:ss');
    }

    /**
     *
     * @param name
     */
    logConsole() {
        let self = this;
        let type = this.options.log_console_type || [];
        this.getLogPath('console');
        type.forEach(item => {
            console[item] = function () {
                let msgs = ['[' + item.toUpperCase() + ']'].concat([].slice.call(arguments));
                self.set('', msgs);
            };
        });
    }

    /**
     *
     * @param name
     */
    logMemory() {
        let format = data => {
            return (data / 1048576).toFixed(1) + 'MB'; // 1048576 = 1024 * 1024
        };
        setInterval(() => {
            let memoryUsage = process.memoryUsage();
            let loadAvg = _os2.default.loadavg();
            let msgs = ['rss:' + format(memoryUsage.rss), 'heapTotal:' + format(memoryUsage.heapTotal), 'heapUsed:' + format(memoryUsage.heapUsed), 'freeMemory:' + format(_os2.default.freemem()), 'loadAvg:' + loadAvg[0].toFixed(1) + ',' + loadAvg[1].toFixed(1) + ',' + loadAvg[2].toFixed(2)];
            this.getLogPath('memory');
            this.set('', msgs);
        }, this.options.log_interval);
    }

    /**
     *
     * @param name
     * @param msgs
     */
    logCustom(name, msgs) {
        msgs = ['[INFO]', msgs];
        this.getLogPath('custom');
        this.set(name, msgs);
    }

};