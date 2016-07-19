'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            this.options = THINK.extend(false, {
                memcache_host: THINK.config('memcache_host'),
                memcache_port: THINK.config('memcache_port')
            }, options);
            this.handle = null;
            this.deferred = null;
        }
    }, {
        key: 'connect',
        value: function connect() {
            var _this2 = this;

            if (this.handle) {
                return this.deferred.promise;
            }
            var deferred = THINK.getDefer();
            var memcached = require('memcached');
            //[ '192.168.0.102:11211', '192.168.0.103:11211', '192.168.0.104:11211' ]
            var connection = new memcached([this.options.memcache_host + ':' + this.options.memcache_port]);
            connection.on('issue', function () {
                _this2.close();
                deferred.reject('connection issue');
            });
            connection.on('failure', function (err) {
                _this2.close();
                deferred.reject(err);
            });

            this.handle = connection;
            if (this.deferred) {
                this.deferred.reject(new Error('connection closed'));
            }
            deferred.resolve();
            this.deferred = deferred;
            return this.deferred.promise;
        }
    }, {
        key: 'close',
        value: function close() {
            if (this.handle) {
                this.handle.remove();
                this.handle = null;
            }
        }

        /**
         *
         * @param name
         * @param data
         * @returns {*}
         */

    }, {
        key: 'wrap',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name, data) {
                var deferred;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                deferred = THINK.getDefer();
                                _context.next = 3;
                                return this.connect().catch(function (e) {
                                    return deferred.reject(e);
                                });

                            case 3:
                                if (!THINK.isArray(data)) {
                                    data = data === undefined ? [] : [data];
                                }
                                data.push(function (err, data) {
                                    if (err) {
                                        deferred.reject(err);
                                    } else {
                                        deferred.resolve(data);
                                    }
                                });
                                if (this.handle) {
                                    this.handle[name].apply(this.handle, data);
                                } else {
                                    deferred.reject('connection end');
                                }
                                return _context.abrupt('return', deferred.promise);

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function wrap(_x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return wrap;
        }()

        /**
         * 字符串获取
         * @param name
         */

    }, {
        key: 'get',
        value: function get(name) {
            return this.wrap('get', [name]);
        }

        /**
         * 字符串写入
         * @param name
         * @param value
         * @param timeout
         * @returns {Promise}
         */

    }, {
        key: 'set',
        value: function set(name, value, timeout) {
            return this.wrap('set', [name, value, timeout]);
        }

        /**
         * 设置key超时属性
         * @param name
         * @param timeout
         */

    }, {
        key: 'expire',
        value: function expire(name, timeout) {
            return this.wrap('touch', [name, timeout]);
        }

        /**
         * 删除key
         * @param name
         */

    }, {
        key: 'rm',
        value: function rm(name) {
            return this.wrap('del', [name]);
        }

        /**
         * 自增
         * @param name
         */

    }, {
        key: 'incr',
        value: function incr(name) {
            return this.wrap('incr', [name, 1]);
        }

        /**
         * 自减
         * @param name
         * @returns {*}
         */

    }, {
        key: 'decr',
        value: function decr(name) {
            return this.wrap('decr', [name, 1]);
        }
    }]);
    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/12/3
                    */


exports.default = _class;