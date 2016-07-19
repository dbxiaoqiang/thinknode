'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(options) {
            (0, _get3.default)((0, _getPrototypeOf2.default)(_class.prototype), 'init', this).call(this, options);

            var key = THINK.hash(this.options.redis_host + '_' + this.options.redis_port);
            if (!(key in THINK.INSTANCES.REDIS)) {
                THINK.INSTANCES.REDIS[key] = new _RedisSocket2.default(this.options);
            }
            this.handle = THINK.INSTANCES.REDIS[key];
        }

        /**
         * 字符串获取
         * @param name
         */

    }, {
        key: 'get',
        value: function get(name) {
            return this.handle.get(this.options.cache_key_prefix + name);
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
        value: function set(name, value) {
            var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.options.cache_timeout : arguments[2];

            return this.handle.set(this.options.cache_key_prefix + name, value, timeout);
        }

        /**
         * 删除key
         * @param name
         */

    }, {
        key: 'rm',
        value: function rm(name) {
            return this.handle.rm(this.options.cache_key_prefix + name);
        }

        /**
         * 设置key超时属性
         * @param name
         * @param timeout
         */

    }, {
        key: 'expire',
        value: function expire(name) {
            var timeout = arguments.length <= 1 || arguments[1] === undefined ? this.options.cache_timeout : arguments[1];

            return this.handle.expire(this.options.cache_key_prefix + name, timeout);
        }

        /**
         * 批量删除，可模糊匹配
         * @param keyword
         * @returns {*}
         */

    }, {
        key: 'batchRm',
        value: function batchRm(keyword) {
            return this.handle.batchRm(this.options.cache_key_prefix + keyword);
        }

        /**
         * 判断key是否存在
         * @param name
         */

    }, {
        key: 'exists',
        value: function exists(name) {
            return this.handle.exists(this.options.cache_key_prefix + name);
        }

        /**
         * 自增
         * @param name
         */

    }, {
        key: 'incr',
        value: function incr(name) {
            return this.handle.incr(this.options.cache_key_prefix + name);
        }

        /**
         * 自减
         * @param name
         * @returns {*}
         */

    }, {
        key: 'decr',
        value: function decr(name) {
            return this.handle.decr(this.options.cache_key_prefix + name);
        }

        /**
         * 字符key增加指定长度
         * @param name
         * @param incr
         * @returns {*}
         */

    }, {
        key: 'incrBy',
        value: function incrBy(name, incr) {
            return this.handle.incrBy(this.options.cache_key_prefix + name, incr);
        }

        /**
         * 哈希写入
         * @param name
         * @param key
         * @param value
         * @param timeout
         */

    }, {
        key: 'hSet',
        value: function hSet(name, key, value) {
            var timeout = arguments.length <= 3 || arguments[3] === undefined ? this.options.cache_timeout : arguments[3];

            return this.handle.hSet(this.options.cache_key_prefix + name, key, value, timeout);
        }

        /**
         * 哈希获取
         * @param name
         * @param key
         * @returns {*}
         */

    }, {
        key: 'hGet',
        value: function hGet(name, key) {
            return this.handle.hGet(this.options.cache_key_prefix + name, key);
        }

        /**
         * 查看哈希表 hashKey 中，给定域 key 是否存在
         * @param name
         * @param key
         * @returns {*}
         */

    }, {
        key: 'hExists',
        value: function hExists(name, key) {
            return this.handle.hExists(this.options.cache_key_prefix + name, key);
        }

        /**
         * 返回哈希表 key 中域的数量
         * @param name
         * @returns {*}
         */

    }, {
        key: 'hLen',
        value: function hLen(name) {
            return this.handle.hLen(this.options.cache_key_prefix + name);
        }

        /**
         * 给哈希表指定key，增加increment
         * @param name
         * @param key
         * @param incr
         * @returns {*}
         */

    }, {
        key: 'hIncrBy',
        value: function hIncrBy(name, key, incr) {
            return this.handle.hIncrBy(this.options.cache_key_prefix + name, key, incr);
        }

        /**
         * 返回哈希表所有key-value
         * @param name
         * @returns {*}
         */

    }, {
        key: 'hGetAll',
        value: function hGetAll(name) {
            return this.handle.hGetAll(this.options.cache_key_prefix + name);
        }

        /**
         * 返回哈希表所有key
         * @param name
         * @returns {*}
         */

    }, {
        key: 'hKeys',
        value: function hKeys(name) {
            return this.handle.hKeys(this.options.cache_key_prefix + name);
        }

        /**
         * 返回哈希表所有value
         * @param name
         * @returns {*}
         */

    }, {
        key: 'hVals',
        value: function hVals(name) {
            return this.handle.hVals(this.options.cache_key_prefix + name);
        }

        /**
         * 哈希删除
         * @param name
         * @param key
         * @returns {*}
         */

    }, {
        key: 'hDel',
        value: function hDel(name, key) {
            return this.handle.hDel(this.options.cache_key_prefix + name, key);
        }

        /**
         * 判断列表长度，若不存在则表示为空
         * @param name
         * @returns {*}
         */

    }, {
        key: 'lLen',
        value: function lLen(name) {
            return this.handle.lLen(this.options.cache_key_prefix + name);
        }

        /**
         * 将值插入列表表尾
         * @param name
         * @param value
         * @returns {*}
         */

    }, {
        key: 'rPush',
        value: function rPush(name, value) {
            return this.handle.rPush(this.options.cache_key_prefix + name, value);
        }

        /**
         * 将列表表头取出，并去除
         * @param name
         * @returns {*}
         */

    }, {
        key: 'lPop',
        value: function lPop(name) {
            return this.handle.lPop(this.options.cache_key_prefix + name);
        }

        /**
         * 集合新增
         * @param name
         * @param value
         * @returns {*}
         */

    }, {
        key: 'sAdd',
        value: function sAdd(name, value) {
            return this.handle.sAdd(this.options.cache_key_prefix + name, value);
        }

        /**
         * 返回集合的基数(集合中元素的数量)
         * @param name
         * @returns {*}
         */

    }, {
        key: 'sCard',
        value: function sCard(name) {
            return this.handle.sCard(this.options.cache_key_prefix + name);
        }

        /**
         * 判断 member 元素是否集合的成员
         * @param name
         * @param key
         * @returns {*}
         */

    }, {
        key: 'sisMember',
        value: function sisMember(name, key) {
            return this.handle.sisMember(this.options.cache_key_prefix + name, key);
        }

        /**
         * 返回集合中的所有成员
         * @param name
         * @returns {*}
         */

    }, {
        key: 'sMembers',
        value: function sMembers(name) {
            return this.handle.sMembers(this.options.cache_key_prefix + name);
        }

        /**
         * 移除并返回集合中的一个随机元素
         * @param name
         * @returns {*}
         */

    }, {
        key: 'sPop',
        value: function sPop(name) {
            return this.handle.sPop(this.options.cache_key_prefix + name);
        }

        /**
         * 移除集合 key 中的一个 member 元素
         * @param name
         * @param key
         * @returns {*}
         */

    }, {
        key: 'sRem',
        value: function sRem(name, key) {
            return this.handle.sRem(this.options.cache_key_prefix + name, key);
        }
    }]);
    return _class;
}(_Cache2.default);

exports.default = _class;