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

var _Promise = require('babel-runtime/core-js/promise')['default'];

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
            redis_port: C('redis_port'),
            redis_host: C('redis_host'),
            redis_password: C('redis_password')
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
        var port = this.config.redis_port || '6379';
        var host = this.config.redis_host || '127.0.0.1';
        var redis = require('redis');
        var connection = redis.createClient(port, host, this.config);
        if (this.config.redis_password) {
            connection.auth(this.config.redis_password, function () {});
        }
        connection.on('ready', function () {
            deferred.resolve();
        });
        connection.on('connect', function () {
            deferred.resolve();
        });
        connection.on('error', function () {
            _this.close();
            deferred.reject(connection);
        });
        connection.on('end', function () {
            _this.close();
            deferred.reject(connection);
        });
        this.handle = connection;
        if (this.deferred) {
            this.deferred.reject(new Error('connection closed'));
        }
        this.deferred = deferred;
        return this.deferred.promise;
    };

    _default.prototype.close = function close() {
        if (this.handle) {
            this.handle.quit();
            this.handle = null;
        }
    };

    /**
     *
     * @param name
     * @param data
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
        var setP = [this.wrap('set', [name, value])];
        if (timeout !== undefined) {
            setP.push(this.expire(name, timeout));
        }
        return _Promise.all(setP);
    };

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */

    _default.prototype.expire = function expire(name, timeout) {
        return this.wrap('expire', [name, timeout]);
    };

    /**
     * 删除key
     * @param name
     */

    _default.prototype.rm = function rm(name) {
        return this.wrap('del', [name]);
    };

    /**
     * 批量删除，可模糊匹配
     * @param keyword
     * @returns {*}
     */

    _default.prototype.batchRm = function batchRm(keyword) {
        var keys;
        return _regeneratorRuntime.async(function batchRm$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return _regeneratorRuntime.awrap(this.wrap('keys', keyword + '*'));

                case 2:
                    keys = context$2$0.sent;
                    return context$2$0.abrupt('return', this.wrap('delete', [keys]));

                case 4:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * 判断key是否存在
     * @param name
     */

    _default.prototype.exists = function exists(name) {
        return this.wrap('exists', [name]);
    };

    /**
     * 自增
     * @param name
     */

    _default.prototype.incr = function incr(name) {
        return this.wrap('incr', [name]);
    };

    /**
     * 自减
     * @param name
     * @returns {*}
     */

    _default.prototype.decr = function decr(name) {
        return this.wrap('decr', [name]);
    };

    /**
     * 字符key增加指定长度
     * @param name
     * @param incr
     * @returns {*}
     */

    _default.prototype.incrBy = function incrBy(name, incr) {
        incr = incr || 1;
        return this.wrap('incrby', [name, incr]);
    };

    /**
     * 哈希写入
     * @param name
     * @param key
     * @param value
     * @param timeout
     */

    _default.prototype.hSet = function hSet(name, key, value, timeout) {
        var setP = [this.wrap('hset', [name, key, value])];
        if (timeout !== undefined) {
            setP.push(this.expire(name, timeout));
        }
        return _Promise.all(setP);
    };

    /**
     * 哈希获取
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.hGet = function hGet(name, key) {
        return this.wrap('hget', [name, key]);
    };

    /**
     * 查看哈希表 hashKey 中，给定域 key 是否存在
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.hExists = function hExists(name, key) {
        return this.wrap('hexists', [name, key]);
    };

    /**
     * 返回哈希表 key 中域的数量
     * @param name
     * @returns {*}
     */

    _default.prototype.hLen = function hLen(name) {
        return this.wrap('hlen', [name]);
    };

    /**
     * 给哈希表指定key，增加increment
     * @param name
     * @param key
     * @param incr
     * @returns {*}
     */

    _default.prototype.hIncrBy = function hIncrBy(name, key) {
        var incr = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        return this.wrap('hincrby', [name, key, incr]);
    };

    /**
     * 返回哈希表所有key-value
     * @param name
     * @returns {*}
     */

    _default.prototype.hGetAll = function hGetAll(name) {
        return this.wrap('hgetall', [name]);
    };

    /**
     * 返回哈希表所有key
     * @param name
     * @returns {*}
     */

    _default.prototype.hKeys = function hKeys(name) {
        return this.wrap('hkeys', [name]);
    };

    /**
     * 返回哈希表所有value
     * @param name
     * @returns {*}
     */

    _default.prototype.hVals = function hVals(name) {
        return this.wrap('hvals', [name]);
    };

    /**
     * 哈希删除
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.hDel = function hDel(name, key) {
        return this.wrap('hdel', [name, key]);
    };

    /**
     * 判断列表长度，若不存在则表示为空
     * @param name
     * @returns {*}
     */

    _default.prototype.lLen = function lLen(name) {
        return this.wrap('llen', [name]);
    };

    /**
     * 将值插入列表表尾
     * @param name
     * @param value
     * @returns {*}
     */

    _default.prototype.rPush = function rPush(name, value) {
        return this.wrap('rpush', [name, value]);
    };

    /**
     * 将列表表头取出，并去除
     * @param name
     * @returns {*}
     */

    _default.prototype.lPop = function lPop(name) {
        return this.wrap('lpop', [name]);
    };

    /**
     * 集合新增
     * @param name
     * @param value
     * @returns {*}
     */

    _default.prototype.sAdd = function sAdd(name, value) {
        return this.wrap('sadd', [name, value]);
    };

    /**
     * 返回集合的基数(集合中元素的数量)
     * @param name
     * @returns {*}
     */

    _default.prototype.sCard = function sCard(name) {
        return this.wrap('scard', [name]);
    };

    /**
     * 判断 member 元素是否集合的成员
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.sisMember = function sisMember(name, key) {
        return this.wrap('sismember', [name, key]);
    };

    /**
     * 返回集合中的所有成员
     * @param name
     * @returns {*}
     */

    _default.prototype.sMembers = function sMembers(name) {
        return this.wrap('smembers', [name]);
    };

    /**
     * 移除并返回集合中的一个随机元素
     * @param name
     * @returns {*}
     */

    _default.prototype.sPop = function sPop(name) {
        return this.wrap('spop', [name]);
    };

    /**
     * 移除集合 key 中的一个 member 元素
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.sRem = function sRem(name, key) {
        return this.wrap('srem', [name, key]);
    };

    return _default;
})(_ThinkBase2['default']);

exports['default'] = _default;
module.exports = exports['default'];