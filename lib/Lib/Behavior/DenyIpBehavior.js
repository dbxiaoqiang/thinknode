/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

exports.__esModule = true;

var _default = (function (_THINK$Behavior) {
    _inherits(_default, _THINK$Behavior);

    function _default() {
        _classCallCheck(this, _default);

        _THINK$Behavior.apply(this, arguments);
    }

    //使用了解构,new的时候实参为{http: http, options: options}

    _default.prototype.init = function init(_ref) {
        var http = _ref.http;
        var options = _ref.options;

        this.http = http;
        this.options = extend(false, {
            deny_ip: [] //阻止的ip列表
        }, options);
    };

    _default.prototype.run = function run(data) {
        if (this.options.deny_ip.length === 0) {
            return true;
        }

        var clientIps = this.http.ip().split('.');
        var flag = this.options.deny_ip.some(function (item) {
            return item.split('.').every(function (num, i) {
                if (num === '*' || num === clientIps[i]) {
                    return true;
                }
            });
        });
        //如果在阻止的ip在列表里，则返回一个pendding promise，让后面的代码不执行
        if (flag) {
            return O(this.http, 403);
        }
        return true;
    };

    return _default;
})(THINK.Behavior);

exports['default'] = _default;
module.exports = exports['default'];