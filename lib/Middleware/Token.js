'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
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
            if (THINK.C('token_on')) {
                let tokenName = THINK.C('token_name');
                let token = yield _this.getToken(tokenName);
                _this.http.view().assign(tokenName, token);
            }
            return data;
        })();
    }

    getToken(tokenName) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let value = yield _this2.http.session(tokenName);
            if (!value) {
                value = _this2.http.cookieUid(32);
                yield _this2.http.session(tokenName, value);
            }
            return value;
        })();
    }
};