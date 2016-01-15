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

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _ThinkCache = require('../../Think/Cache');

var _ThinkCache2 = _interopRequireDefault(_ThinkCache);

var _SocketRedisSocket = require('../Socket/RedisSocket');

var _SocketRedisSocket2 = _interopRequireDefault(_SocketRedisSocket);

var _default = (function (_cache) {
    _inherits(_default, _cache);

    function _default() {
        _classCallCheck(this, _default);

        _cache.apply(this, arguments);
    }

    _default.prototype.init = function init(options) {
        _cache.prototype.init.call(this, options);

        var key = md5(JSON.stringify(this.options));
        if (!(key in THINK.INSTANCES.REDIS)) {
            THINK.INSTANCES.REDIS[key] = new _SocketRedisSocket2['default'](this.options);
        }
        this.handle = THINK.INSTANCES.REDIS[key];
        this.options.gctype = 'redisCache';
        THINK.GCTIMER(this);
    };

    /**
     * 字符串获取
     * @param name
     */

    _default.prototype.getData = function getData(name) {
        return this.handle.get(this.options.cache_key_prefix + name);
    };

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */

    _default.prototype.setData = function setData(name, value, timeout) {
        return this.handle.set(this.options.cache_key_prefix + name, value, timeout);
    };

    /**
     * 删除key
     * @param name
     */

    _default.prototype.rmData = function rmData(name) {
        return this.handle.rm(this.options.cache_key_prefix + name);
    };

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */

    _default.prototype.expire = function expire(name, timeout) {
        return this.handle.expire(this.options.cache_key_prefix + name, timeout);
    };

    /**
     * 批量删除，可模糊匹配
     * @param keyword
     * @returns {*}
     */

    _default.prototype.batchRm = function batchRm(keyword) {
        return this.handle.batchRm(this.options.cache_key_prefix + keyword);
    };

    /**
     * 判断key是否存在
     * @param name
     */

    _default.prototype.exists = function exists(name) {
        return this.handle.exists(this.options.cache_key_prefix + name);
    };

    /**
     * 自增
     * @param name
     */

    _default.prototype.incr = function incr(name) {
        return this.handle.incr(this.options.cache_key_prefix + name);
    };

    /**
     * 自减
     * @param name
     * @returns {*}
     */

    _default.prototype.decr = function decr(name) {
        return this.handle.decr(this.options.cache_key_prefix + name);
    };

    /**
     * 字符key增加指定长度
     * @param name
     * @param incr
     * @returns {*}
     */

    _default.prototype.incrBy = function incrBy(name, incr) {
        return this.handle.incrBy(this.options.cache_key_prefix + name, incr);
    };

    /**
     * 哈希写入
     * @param name
     * @param key
     * @param value
     * @param timeout
     */

    _default.prototype.hSet = function hSet(name, key, value, timeout) {
        return this.handle.hSet(this.options.cache_key_prefix + name, key, value, timeout);
    };

    /**
     * 哈希获取
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.hGet = function hGet(name, key) {
        return this.handle.hGet(this.options.cache_key_prefix + name, key);
    };

    /**
     * 查看哈希表 hashKey 中，给定域 key 是否存在
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.hExists = function hExists(name, key) {
        return this.handle.hExists(this.options.cache_key_prefix + name, key);
    };

    /**
     * 返回哈希表 key 中域的数量
     * @param name
     * @returns {*}
     */

    _default.prototype.hLen = function hLen(name) {
        return this.handle.hLen(this.options.cache_key_prefix + name);
    };

    /**
     * 给哈希表指定key，增加increment
     * @param name
     * @param key
     * @param incr
     * @returns {*}
     */

    _default.prototype.hIncrBy = function hIncrBy(name, key, incr) {
        return this.handle.hIncrBy(this.options.cache_key_prefix + name, key, incr);
    };

    /**
     * 返回哈希表所有key-value
     * @param name
     * @returns {*}
     */

    _default.prototype.hGetAll = function hGetAll(name) {
        return this.handle.hGetAll(this.options.cache_key_prefix + name);
    };

    /**
     * 返回哈希表所有key
     * @param name
     * @returns {*}
     */

    _default.prototype.hKeys = function hKeys(name) {
        return this.handle.hKeys(this.options.cache_key_prefix + name);
    };

    /**
     * 返回哈希表所有value
     * @param name
     * @returns {*}
     */

    _default.prototype.hVals = function hVals(name) {
        return this.handle.hVals(this.options.cache_key_prefix + name);
    };

    /**
     * 哈希删除
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.hDel = function hDel(name, key) {
        return this.handle.hDel(this.options.cache_key_prefix + name, key);
    };

    /**
     * 判断列表长度，若不存在则表示为空
     * @param name
     * @returns {*}
     */

    _default.prototype.lLen = function lLen(name) {
        return this.handle.lLen(this.options.cache_key_prefix + name);
    };

    /**
     * 将值插入列表表尾
     * @param name
     * @param value
     * @returns {*}
     */

    _default.prototype.rPush = function rPush(name, value) {
        return this.handle.rPush(this.options.cache_key_prefix + name, value);
    };

    /**
     * 将列表表头取出，并去除
     * @param name
     * @returns {*}
     */

    _default.prototype.lPop = function lPop(name) {
        return this.handle.lPop(this.options.cache_key_prefix + name);
    };

    /**
     * 集合新增
     * @param name
     * @param value
     * @returns {*}
     */

    _default.prototype.sAdd = function sAdd(name, value) {
        return this.handle.sAdd(this.options.cache_key_prefix + name, value);
    };

    /**
     * 返回集合的基数(集合中元素的数量)
     * @param name
     * @returns {*}
     */

    _default.prototype.sCard = function sCard(name) {
        return this.handle.sCard(this.options.cache_key_prefix + name);
    };

    /**
     * 判断 member 元素是否集合的成员
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.sisMember = function sisMember(name, key) {
        return this.handle.sisMember(this.options.cache_key_prefix + name, key);
    };

    /**
     * 返回集合中的所有成员
     * @param name
     * @returns {*}
     */

    _default.prototype.sMembers = function sMembers(name) {
        return this.handle.sMembers(this.options.cache_key_prefix + name);
    };

    /**
     * 移除并返回集合中的一个随机元素
     * @param name
     * @returns {*}
     */

    _default.prototype.sPop = function sPop(name) {
        return this.handle.sPop(this.options.cache_key_prefix + name);
    };

    /**
     * 移除集合 key 中的一个 member 元素
     * @param name
     * @param key
     * @returns {*}
     */

    _default.prototype.sRem = function sRem(name, key) {
        return this.handle.sRem(this.options.cache_key_prefix + name, key);
    };

    return _default;
})(_ThinkCache2['default']);

exports['default'] = _default;
module.exports = exports['default'];