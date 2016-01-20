'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

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

var _MemcacheCache = require('../Cache/MemcacheCache');

var _MemcacheCache2 = _interopRequireDefault(_MemcacheCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_memcachecache) {
    (0, _inherits3.default)(_class, _memcachecache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _memcachecache.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        this.keyName = options.cache_key_prefix;
        _memcachecache.prototype.init.call(this, options);
        this.options.cache_key_prefix = C('cache_key_prefix') + 'Session:';
    };

    /**
     *
     * @param name
     */

    _class.prototype.get = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name) {
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

                            return _context.abrupt('return');

                        case 5:
                            _context.prev = 5;

                            data = JSON.parse(data);

                            if (!(data.expire && Date.now() > data.expire)) {
                                _context.next = 11;
                                break;
                            }

                            return _context.abrupt('return', this.handle.rm(this.options.cache_key_prefix + this.keyName));

                        case 11:
                            return _context.abrupt('return', data[name]);

                        case 12:
                            _context.next = 17;
                            break;

                        case 14:
                            _context.prev = 14;
                            _context.t0 = _context['catch'](5);
                            return _context.abrupt('return', this.handle.rm(this.options.cache_key_prefix + this.keyName));

                        case 17:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[5, 14]]);
        }));
        return function get(_x) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */

    _class.prototype.set = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(name, value, timeout) {
            var _content;

            var key, rdata, content;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            key = name;

                            if (isObject(name)) {
                                timeout = value;
                                key = (0, _keys2.default)(name)[0];
                            }
                            if (timeout === undefined) {
                                timeout = this.options.cache_timeout;
                            }

                            _context2.next = 5;
                            return this.handle.get(this.options.cache_key_prefix + this.keyName);

                        case 5:
                            rdata = _context2.sent;
                            content = (_content = {}, _content[name] = value, _content.expire = Date.now() + timeout * 1000, _content.timeout = timeout, _content);
                            _context2.prev = 7;

                            if (!isEmpty(rdata)) {
                                rdata = JSON.parse(rdata);
                                content = extend(false, rdata, content);
                            }
                            return _context2.abrupt('return', this.handle.set(this.options.cache_key_prefix + name, (0, _stringify2.default)(content), timeout));

                        case 12:
                            _context2.prev = 12;
                            _context2.t0 = _context2['catch'](7);
                            return _context2.abrupt('return', _promise2.default.resolve());

                        case 15:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[7, 12]]);
        }));
        return function set(_x2, _x3, _x4) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     *
     * @param
     */

    _class.prototype.rm = function rm() {
        return this.handle.rm(this.options.cache_key_prefix + this.keyName);
    };

    return _class;
}(_MemcacheCache2.default); /**
                             *
                             * @author     richen
                             * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                             * @license    MIT
                             * @version    15/12/2
                             */

exports.default = _class;