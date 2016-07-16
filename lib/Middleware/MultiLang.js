'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 多语言支持中间件
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
exports.default = class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run(data) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (THINK.C('multi_lang')) {
                let pathname = _this.http.pathname.split('/');
                if (pathname[0] && pathname[0] in THINK.LANG) {
                    THINK.C('language', pathname[0]);
                    pathname.shift();
                    _this.http.pathname = pathname.join('/');
                }
            }
            return _promise2.default.resolve();
        })();
    }
};