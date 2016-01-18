'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.options = extend(false, {
            cache_type: C('cache_type'), //数据缓存类型 File,Redis,Memcache
            cache_key_prefix: C('cache_key_prefix'), //缓存key前置
            cache_timeout: C('cache_timeout'), //数据缓存有效期，单位: 秒
            cache_path: THINK.CACHE_PATH, //缓存路径设置 (File缓存方式有效)
            cache_file_suffix: C('cache_file_suffix'), //File缓存方式下文件后缀名
            cache_gc_hour: C('cache_gc_hour') //缓存清除的时间点，数据为小时
        }, options);
        //cache keystore
        this.cacheStore = THINK.CACHES.CACHE;
        //cache auto refresh
        this.updateExpire = false;
        //cache prekey
        this.preKey = '';
        if (this.options.cache_key_prefix) {
            this.preKey = hash(this.options.cache_key_prefix);
        }
    };

    _class.prototype.get = function get(name) {
        try {
            var store = thinkCache(this.cacheStore);
            var value = undefined,
                preName = this.preKey + '_' + name;
            if (preName in store) {
                value = store[preName];
                if (isEmpty(value)) {
                    return getPromise();
                }
                var now = Date.now();
                if (now > value.expire) {
                    this.rm(name);
                    return getPromise();
                }
                if (this.updateExpire) {
                    value.expire = now + value.timeout * 1000;
                    this.set(name, value.data, value.timeout);
                }
                var data = value.data;
                //如果data是个对象或者数组，需要深度拷贝
                if (isObject(data)) {
                    data = extend({}, data);
                } else if (isArray(data)) {
                    data = extend([], data);
                }
                return getPromise(data);
            } else {
                return this.getData(name);
            }
        } catch (e) {
            return getPromise();
        }
    };

    _class.prototype.set = function set(name, value, timeout) {
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        //如果value是个对象或者数组，这里需要深度拷贝，防止程序里修改值导致缓存值被修改
        if (isObject(value)) {
            value = extend({}, value);
        } else if (isArray(value)) {
            value = extend([], value);
        }
        var data = {
            data: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        try {
            var preName = this.preKey + '_' + name;
            thinkCache(this.cacheStore, preName, data);
            this.setData(name, data.data, timeout);
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    _class.prototype.rm = function rm(name) {
        if (name === undefined) {
            var store = thinkCache(this.cacheStore);
            for (var i in store) {
                if (i.indexOf(this.preKey + '_') > -1) {
                    thinkCache(this.cacheStore, i, null);
                }
            }
        } else {
            var preName = this.preKey + '_' + name;
            thinkCache(this.cacheStore, preName, null);
        }

        return this.rmData(name);
    };

    _class.prototype.gc = function gc() {
        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        //内存缓存回收
        var store = thinkCache(this.cacheStore);
        for (var i in store) {
            if (store[i]['expire'] && now > store[i]['expire']) {
                thinkCache(this.cacheStore, i, null);
            }
        }
        this.gcData && this.gcData(now);
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/19
                    */

exports.default = _class;