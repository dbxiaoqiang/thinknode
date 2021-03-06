'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 二级域名支持中间件
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
var _class = function (_THINK$Middleware) {
    (0, _inherits3.default)(_class, _THINK$Middleware);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Middleware.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.subdomain = THINK.config('sub_domain');
    };

    _class.prototype.run = function run(data) {
        if (THINK.isEmpty(this.subdomain)) {
            return _promise2.default.resolve();
        }
        var hostname = this.http.hostname.split('.');
        var groupName = hostname[0];
        var value = this.subdomain[groupName];
        if (THINK.isEmpty(value)) {
            return _promise2.default.resolve();
        }
        var pathname = this.http.pathname;
        if (value && pathname.indexOf(value) === 0) {
            pathname = pathname.substr(value.length);
        }

        this.http.pathname = value + '/' + pathname;
        return _promise2.default.resolve();
    };

    return _class;
}(THINK.Middleware);

exports.default = _class;