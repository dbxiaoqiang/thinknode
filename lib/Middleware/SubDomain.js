'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 二级域名支持中间件
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
exports.default = class extends THINK.Middleware {
    init(http) {
        this.http = http;
        this.subdomain = THINK.C('sub_domain');
    }

    run(data) {
        if (THINK.isEmpty(this.subdomain)) {
            return _promise2.default.resolve();
        }
        let hostname = this.http.hostname.split('.');
        let groupName = hostname[0];
        let value = this.subdomain[groupName];
        if (THINK.isEmpty(value)) {
            return _promise2.default.resolve();
        }
        let pathname = this.http.pathname;
        if (value && pathname.indexOf(value) === 0) {
            pathname = pathname.substr(value.length);
        }

        this.http.pathname = `${ value }/${ pathname }`;
        return _promise2.default.resolve();
    }
};