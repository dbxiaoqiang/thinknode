/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _ThinkBase = require('../../Think/Base');

var _ThinkBase2 = _interopRequireDefault(_ThinkBase);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = extend(false, {
            memcache_host: C('memcache_host'),
            memcache_port: C('memcache_port')
        }, config);
        this.handle = null;
        this.deferred = null;
    };

    _default.prototype.connect = function connect() {
        var _this = this;

        if (this.handle) {
            return this.deferred.promise;
        }
        var deferred = getDefer();
        var memcached = require('memcached');
        //[ '192.168.0.102:11211', '192.168.0.103:11211', '192.168.0.104:11211' ]
        var connection = new memcached([this.config.memcache_host + ':' + this.config.memcache_port]);
        connection.on('issue', function () {
            _this.close();
            deferred.reject(connection);
        });
        connection.on('failure', function () {
            _this.close();
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

    _default.prototype.close = function close() {
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

    _default.prototype.wrap = function wrap(name, data) {
        var deferred;
        return _regeneratorRuntime.async(function wrap$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return _regeneratorRuntime.awrap(this.connect());

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
                    return context$2$0.abrupt('return', deferred.promise);

                case 7:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * 字符串获取
     * @param name
     */

    _default.prototype.get = function get(name) {
        return this.wrap('get', [name]);
    };

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */

    _default.prototype.set = function set(name, value, timeout) {
        return this.wrap('set', [name, value, timeout]);
    };

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */

    _default.prototype.expire = function expire(name, timeout) {
        return this.wrap('touch', [name, timeout]);
    };

    /**
     * 删除key
     * @param name
     */

    _default.prototype.rm = function rm(name) {
        return this.wrap('del', [name]);
    };

    /**
     * 自增
     * @param name
     */

    _default.prototype.incr = function incr(name) {
        return this.wrap('incr', [name, 1]);
    };

    /**
     * 自减
     * @param name
     * @returns {*}
     */

    _default.prototype.decr = function decr(name) {
        return this.wrap('decr', [name, 1]);
    };

    return _default;
})(_ThinkBase2['default']);

exports['default'] = _default;
module.exports = exports['default'];