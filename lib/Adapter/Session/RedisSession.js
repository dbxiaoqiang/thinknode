'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _RedisCache = require('../Cache/RedisCache');

var _RedisCache2 = _interopRequireDefault(_RedisCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_rediscache) {
    (0, _inherits3.default)(_class, _rediscache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(options) {
            this.keyName = options.cache_key_prefix;
            (0, _get3.default)((0, _getPrototypeOf2.default)(_class.prototype), 'init', this).call(this, options);
            this.options.cache_key_prefix = (~THINK.config('cache_key_prefix').indexOf(':') ? THINK.config('cache_key_prefix') : THINK.config('cache_key_prefix') + ':') + 'Session:';
        }

        /**
         *
         * @param name
         */

    }, {
        key: 'get',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name) {
                var data;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.handle.get(this.options.cache_key_prefix + this.keyName);

                            case 2:
                                data = _context.sent;

                                if (data) {
                                    _context.next = 5;
                                    break;
                                }

                                return _context.abrupt('return', '');

                            case 5:
                                _context.prev = 5;

                                data = JSON.parse(data);

                                if (!(data.expire && Date.now() > data.expire)) {
                                    _context.next = 12;
                                    break;
                                }

                                this.handle.rm(this.options.cache_key_prefix + this.keyName);
                                return _context.abrupt('return', '');

                            case 12:
                                return _context.abrupt('return', data[name]);

                            case 13:
                                _context.next = 19;
                                break;

                            case 15:
                                _context.prev = 15;
                                _context.t0 = _context['catch'](5);

                                this.handle.rm(this.options.cache_key_prefix + this.keyName);
                                return _context.abrupt('return', '');

                            case 19:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[5, 15]]);
            }));

            function get(_x) {
                return _ref.apply(this, arguments);
            }

            return get;
        }()

        /**
         *
         * @param name
         * @param value
         * @param timeout
         */

    }, {
        key: 'set',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(name, value, timeout) {
                var _content;

                var rdata, content;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (timeout === undefined) {
                                    timeout = this.options.cache_timeout;
                                }

                                _context2.next = 3;
                                return this.handle.get(this.options.cache_key_prefix + this.keyName);

                            case 3:
                                rdata = _context2.sent;
                                content = (_content = {}, (0, _defineProperty3.default)(_content, name, value), (0, _defineProperty3.default)(_content, 'expire', Date.now() + timeout * 1000), (0, _defineProperty3.default)(_content, 'timeout', timeout), _content);
                                _context2.prev = 5;

                                if (!THINK.isEmpty(rdata)) {
                                    rdata = JSON.parse(rdata);
                                    content = THINK.extend(false, rdata, content);
                                }
                                return _context2.abrupt('return', this.handle.set(this.options.cache_key_prefix + this.keyName, (0, _stringify2.default)(content), timeout));

                            case 10:
                                _context2.prev = 10;
                                _context2.t0 = _context2['catch'](5);
                                return _context2.abrupt('return', _promise2.default.resolve());

                            case 13:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[5, 10]]);
            }));

            function set(_x2, _x3, _x4) {
                return _ref2.apply(this, arguments);
            }

            return set;
        }()

        /**
         *
         * @param
         */

    }, {
        key: 'rm',
        value: function rm() {
            return this.handle.rm(this.options.cache_key_prefix + this.keyName);
        }
    }]);
    return _class;
}(_RedisCache2.default); /**
                          *
                          * @author     richen
                          * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                          * @license    MIT
                          * @version    15/12/29
                          */


exports.default = _class;