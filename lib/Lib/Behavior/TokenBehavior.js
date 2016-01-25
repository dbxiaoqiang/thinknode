'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

exports.default = class extends THINK.Behavior {
    init(http) {
        this.http = http;
    }

    run(content) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!C('token_on')) {
                return content;
            }
            let token = yield _this.getToken();
            let key = C('token_key');
            let name = C('token_name');
            if (content.indexOf(key) > -1) {
                return content.replace(key, token);
            } else if (content.indexOf('</form>') > -1) {
                return content.replace(/<\/form>/g, '<input type="hidden" name="' + name + '" value="' + token + '" /></form>');
            } else {
                return content.replace(/<\/head>/g, '<meta name="' + name + '" content="' + token + '" /></head>');
            }
        })();
    }

    getToken() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let tokenName = C('token_name');
            let value = yield _this2.http.session(tokenName);
            if (value) {
                return value;
            }
            let token = _this2.http.cookieUid(32);
            return _this2.http.session(tokenName, token);
        })();
    }
};