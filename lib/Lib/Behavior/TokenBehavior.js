/**
 * 给表单生成token
 * @param  {[type]} content){               }} [description]
 * @return {[type]}            [description]
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

exports.__esModule = true;

var _default = (function (_THINK$Behavior) {
    _inherits(_default, _THINK$Behavior);

    function _default() {
        _classCallCheck(this, _default);

        _THINK$Behavior.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        this.http = http;
    };

    _default.prototype.run = function run(content) {
        var token, key, name;
        return _regeneratorRuntime.async(function run$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    if (C('token_on')) {
                        context$2$0.next = 2;
                        break;
                    }

                    return context$2$0.abrupt('return', content);

                case 2:
                    context$2$0.next = 4;
                    return _regeneratorRuntime.awrap(this.getToken());

                case 4:
                    token = context$2$0.sent;
                    key = C('token_key');
                    name = C('token_name');

                    if (!(content.indexOf(key) > -1)) {
                        context$2$0.next = 11;
                        break;
                    }

                    return context$2$0.abrupt('return', content.replace(key, token));

                case 11:
                    if (!(content.indexOf('</form>') > -1)) {
                        context$2$0.next = 15;
                        break;
                    }

                    return context$2$0.abrupt('return', content.replace(/<\/form>/g, '<input type="hidden" name="' + name + '" value="' + token + '" /></form>'));

                case 15:
                    return context$2$0.abrupt('return', content.replace(/<\/head>/g, '<meta name="' + name + '" content="' + token + '" /></head>'));

                case 16:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    _default.prototype.getToken = function getToken() {
        var tokenName, value, token;
        return _regeneratorRuntime.async(function getToken$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    tokenName = C('token_name');
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap(this.http.session(tokenName));

                case 3:
                    value = context$2$0.sent;

                    if (!value) {
                        context$2$0.next = 6;
                        break;
                    }

                    return context$2$0.abrupt('return', value);

                case 6:
                    token = this.http._session.uid(32);
                    return context$2$0.abrupt('return', this.http.session(tokenName, token));

                case 8:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    return _default;
})(THINK.Behavior);

exports['default'] = _default;
module.exports = exports['default'];