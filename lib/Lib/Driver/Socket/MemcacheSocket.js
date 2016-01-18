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

var _Base = require('../../Think/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = extend(false, {
            memcache_host: C('memcache_host'),
            memcache_port: C('memcache_port')
        }, config);
        this.handle = null;
        this.deferred = null;
    };

    _class.prototype.connect = function connect() {
        var _this2 = this;

        if (this.handle) {
            return this.deferred.promise;
        }
        var deferred = getDefer();
        var memcached = require('memcached');
        //[ '192.168.0.102:11211', '192.168.0.103:11211', '192.168.0.104:11211' ]
        var connection = new memcached([this.config.memcache_host + ':' + this.config.memcache_port]);
        connection.on('issue', function () {
            _this2.close();
            deferred.reject(connection);
        });
        connection.on('failure', function () {
            _this2.close();
            deferred.reject(connection);
        });

        this.handle = connection;
        if (this.deferred) {
            this.deferred.reject(new Error('connection closed'));
        }
        deferred.resolve();
        this.deferred = deferred;
        return this.deferred.promise;
    };

    _class.prototype.close = function close() {
        if (this.handle) {
            this.handle.remove();
            this.handle = null;
        }
    };

    /**
     *
     * @param name
     * @param data
     * @returns {*}
     */

    _class.prototype.wrap = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name, data) {
            var deferred;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return this.connect();

                        case 2:
                            deferred = getDefer();

                            if (!isArray(data)) {
                                data = data === undefined ? [] : [data];
                            }
                            data.push(function (err, data) {
                                if (err) {
                                    deferred.reject(err);
                                } else {
                                    deferred.resolve(data);
                                }
                            });
                            this.handle[name].apply(this.handle, data);
                            return _context.abrupt('return', deferred.promise);

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function wrap(_x2, _x3) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 字符串获取
     * @param name
     */

    _class.prototype.get = function get(name) {
        return this.wrap('get', [name]);
    };

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */

    _class.prototype.set = function set(name, value, timeout) {
        return this.wrap('set', [name, value, timeout]);
    };

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */

    _class.prototype.expire = function expire(name, timeout) {
        return this.wrap('touch', [name, timeout]);
    };

    /**
     * 删除key
     * @param name
     */

    _class.prototype.rm = function rm(name) {
        return this.wrap('del', [name]);
    };

    /**
     * 自增
     * @param name
     */

    _class.prototype.incr = function incr(name) {
        return this.wrap('incr', [name, 1]);
    };

    /**
     * 自减
     * @param name
     * @returns {*}
     */

    _class.prototype.decr = function decr(name) {
        return this.wrap('decr', [name, 1]);
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/12/3
                    */

exports.default = _class;