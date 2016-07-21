'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Cache = require('./Cache');

var _Cache2 = _interopRequireDefault(_Cache);

var _RedisSocket = require('../Socket/RedisSocket');

var _RedisSocket2 = _interopRequireDefault(_RedisSocket);

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
        return (0, _possibleConstructorReturn3.default)(this, _cache.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        _cache.prototype.init.call(this, options);

        var key = THINK.hash(this.options.redis_host + '_' + this.options.redis_port);
        if (!(key in THINK.INSTANCES.REDIS)) {
            THINK.INSTANCES.REDIS[key] = new _RedisSocket2.default(this.options);
        }
        this.handle = THINK.INSTANCES.REDIS[key];
    };

    /**
     * 字符串获取
     * @param name
     */


    _class.prototype.get = function get(name) {
        return this.handle.get(this.options.cache_key_prefix + name);
    };

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */


    _class.prototype.set = function set(name, value) {
        var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.options.cache_timeout : arguments[2];

        return this.handle.set(this.options.cache_key_prefix + name, value, timeout);
    };

    /**
     * 删除key
     * @param name
     */


    _class.prototype.rm = function rm(name) {
        return this.handle.rm(this.options.cache_key_prefix + name);
    };

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */


    _class.prototype.expire = function expire(name) {
        var timeout = arguments.length <= 1 || arguments[1] === undefined ? this.options.cache_timeout : arguments[1];

        return this.handle.expire(this.options.cache_key_prefix + name, timeout);
    };

    /**
     * 批量删除，可模糊匹配
     * @param keyword
     * @returns {*}
     */


    _class.prototype.batchRm = function batchRm(keyword) {
        return this.handle.batchRm(this.options.cache_key_prefix + keyword);
    };

    /**
     * 判断key是否存在
     * @param name
     */


    _class.prototype.exists = function exists(name) {
        return this.handle.exists(this.options.cache_key_prefix + name);
    };

    /**
     * 自增
     * @param name
     */


    _class.prototype.incr = function incr(name) {
        return this.handle.incr(this.options.cache_key_prefix + name);
    };

    /**
     * 自减
     * @param name
     * @returns {*}
     */


    _class.prototype.decr = function decr(name) {
        return this.handle.decr(this.options.cache_key_prefix + name);
    };

    /**
     * 字符key增加指定长度
     * @param name
     * @param incr
     * @returns {*}
     */


    _class.prototype.incrBy = function incrBy(name, incr) {
        return this.handle.incrBy(this.options.cache_key_prefix + name, incr);
    };

    /**
     * 哈希写入
     * @param name
     * @param key
     * @param value
     * @param timeout
     */


    _class.prototype.hSet = function hSet(name, key, value) {
        var timeout = arguments.length <= 3 || arguments[3] === undefined ? this.options.cache_timeout : arguments[3];

        return this.handle.hSet(this.options.cache_key_prefix + name, key, value, timeout);
    };

    /**
     * 哈希获取
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.hGet = function hGet(name, key) {
        return this.handle.hGet(this.options.cache_key_prefix + name, key);
    };

    /**
     * 查看哈希表 hashKey 中，给定域 key 是否存在
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.hExists = function hExists(name, key) {
        return this.handle.hExists(this.options.cache_key_prefix + name, key);
    };

    /**
     * 返回哈希表 key 中域的数量
     * @param name
     * @returns {*}
     */


    _class.prototype.hLen = function hLen(name) {
        return this.handle.hLen(this.options.cache_key_prefix + name);
    };

    /**
     * 给哈希表指定key，增加increment
     * @param name
     * @param key
     * @param incr
     * @returns {*}
     */


    _class.prototype.hIncrBy = function hIncrBy(name, key, incr) {
        return this.handle.hIncrBy(this.options.cache_key_prefix + name, key, incr);
    };

    /**
     * 返回哈希表所有key-value
     * @param name
     * @returns {*}
     */


    _class.prototype.hGetAll = function hGetAll(name) {
        return this.handle.hGetAll(this.options.cache_key_prefix + name);
    };

    /**
     * 返回哈希表所有key
     * @param name
     * @returns {*}
     */


    _class.prototype.hKeys = function hKeys(name) {
        return this.handle.hKeys(this.options.cache_key_prefix + name);
    };

    /**
     * 返回哈希表所有value
     * @param name
     * @returns {*}
     */


    _class.prototype.hVals = function hVals(name) {
        return this.handle.hVals(this.options.cache_key_prefix + name);
    };

    /**
     * 哈希删除
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.hDel = function hDel(name, key) {
        return this.handle.hDel(this.options.cache_key_prefix + name, key);
    };

    /**
     * 判断列表长度，若不存在则表示为空
     * @param name
     * @returns {*}
     */


    _class.prototype.lLen = function lLen(name) {
        return this.handle.lLen(this.options.cache_key_prefix + name);
    };

    /**
     * 将值插入列表表尾
     * @param name
     * @param value
     * @returns {*}
     */


    _class.prototype.rPush = function rPush(name, value) {
        return this.handle.rPush(this.options.cache_key_prefix + name, value);
    };

    /**
     * 将列表表头取出，并去除
     * @param name
     * @returns {*}
     */


    _class.prototype.lPop = function lPop(name) {
        return this.handle.lPop(this.options.cache_key_prefix + name);
    };

    /**
     * 集合新增
     * @param name
     * @param value
     * @returns {*}
     */


    _class.prototype.sAdd = function sAdd(name, value) {
        return this.handle.sAdd(this.options.cache_key_prefix + name, value);
    };

    /**
     * 返回集合的基数(集合中元素的数量)
     * @param name
     * @returns {*}
     */


    _class.prototype.sCard = function sCard(name) {
        return this.handle.sCard(this.options.cache_key_prefix + name);
    };

    /**
     * 判断 member 元素是否集合的成员
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.sisMember = function sisMember(name, key) {
        return this.handle.sisMember(this.options.cache_key_prefix + name, key);
    };

    /**
     * 返回集合中的所有成员
     * @param name
     * @returns {*}
     */


    _class.prototype.sMembers = function sMembers(name) {
        return this.handle.sMembers(this.options.cache_key_prefix + name);
    };

    /**
     * 移除并返回集合中的一个随机元素
     * @param name
     * @returns {*}
     */


    _class.prototype.sPop = function sPop(name) {
        return this.handle.sPop(this.options.cache_key_prefix + name);
    };

    /**
     * 移除集合 key 中的一个 member 元素
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.sRem = function sRem(name, key) {
        return this.handle.sRem(this.options.cache_key_prefix + name, key);
    };

    return _class;
}(_Cache2.default);

exports.default = _class;