'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

    _class.prototype.init = function init(http) {
        this.http = http;
    };

    _class.prototype.run = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(content) {
            var token, key, name;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (C('token_on')) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return', content);

                        case 2:
                            _context.next = 4;
                            return this.getToken();

                        case 4:
                            token = _context.sent;
                            key = C('token_key');
                            name = C('token_name');

                            if (!(content.indexOf(key) > -1)) {
                                _context.next = 11;
                                break;
                            }

                            return _context.abrupt('return', content.replace(key, token));

                        case 11:
                            if (!(content.indexOf('</form>') > -1)) {
                                _context.next = 15;
                                break;
                            }

                            return _context.abrupt('return', content.replace(/<\/form>/g, '<input type="hidden" name="' + name + '" value="' + token + '" /></form>'));

                        case 15:
                            return _context.abrupt('return', content.replace(/<\/head>/g, '<meta name="' + name + '" content="' + token + '" /></head>'));

                        case 16:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function run(_x) {
            return ref.apply(this, arguments);
        };
    }();

    _class.prototype.getToken = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var tokenName, value, token;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            tokenName = C('token_name');
                            _context2.next = 3;
                            return this.http.session(tokenName);

                        case 3:
                            value = _context2.sent;

                            if (!value) {
                                _context2.next = 6;
                                break;
                            }

                            return _context2.abrupt('return', value);

                        case 6:
                            token = this.http._session.uid(32);
                            return _context2.abrupt('return', this.http.session(tokenName, token));

                        case 8:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
        return function getToken() {
            return ref.apply(this, arguments);
        };
    }();

    return _class;
}(THINK.Behavior);

exports.default = _class;