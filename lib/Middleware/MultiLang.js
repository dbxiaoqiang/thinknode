'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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
        if (THINK.config('multi_lang')) {
            let pathname = this.http.pathname.split('/');
            if (pathname[0] && pathname[0] in THINK.LANGUAGE) {
                THINK.config('language', pathname[0]);
                pathname.shift();
                this.http.pathname = pathname.join('/');
            }
        }
        return _promise2.default.resolve();
    }
};