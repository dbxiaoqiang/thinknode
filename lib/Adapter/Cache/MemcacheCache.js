'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _Cache = require('./Cache');

var _Cache2 = _interopRequireDefault(_Cache);

var _MemcacheSocket = require('../Socket/MemcacheSocket');

var _MemcacheSocket2 = _interopRequireDefault(_MemcacheSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */

var _class = function (_cache) {
    (0, _inherits3.default)(_class, _cache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(options) {
            (0, _get3.default)((0, _getPrototypeOf2.default)(_class.prototype), 'init', this).call(this, options);

            var key = THINK.hash(this.options.memcache_host + '_' + this.options.memcache_port);
            if (!(key in THINK.INSTANCES.MEMCACHE)) {
                THINK.INSTANCES.MEMCACHE[key] = new _MemcacheSocket2.default(this.options);
            }
            this.handle = THINK.INSTANCES.MEMCACHE[key];
        }

        /**
         *
         * @param name
         */

    }, {
        key: 'get',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name) {
                var value;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.handle.get(this.options.cache_key_prefix + name);

                            case 2:
                                value = _context.sent;
                                return _context.abrupt('return', value);

                            case 4:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
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
        value: function set(name, value) {
            var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.options.cache_timeout : arguments[2];

            return this.handle.set(this.options.cache_key_prefix + name, (0, _stringify2.default)(value), timeout);
        }

        /**
         *
         * @param name
         */

    }, {
        key: 'rm',
        value: function rm(name) {
            return this.handle.rm(this.options.cache_key_prefix + name);
        }
    }]);
    return _class;
}(_Cache2.default);

exports.default = _class;