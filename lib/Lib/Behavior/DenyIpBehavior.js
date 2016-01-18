'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

var _class = function (_THINK$Behavior) {
    (0, _inherits3.default)(_class, _THINK$Behavior);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Behavior.apply(this, arguments));
    }

    //使用了解构,new的时候实参为{http: http, options: options}

    _class.prototype.init = function init(_ref) {
        var http = _ref.http;
        var options = _ref.options;

        this.http = http;
        this.options = extend(false, {
            deny_ip: [] //阻止的ip列表
        }, options);
    };

    _class.prototype.run = function run(data) {
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

    return _class;
}(THINK.Behavior);

exports.default = _class;