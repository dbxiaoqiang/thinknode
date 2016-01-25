'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _MemcacheCache = require('../Cache/MemcacheCache');

var _MemcacheCache2 = _interopRequireDefault(_MemcacheCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _MemcacheCache2.default {

    init(options) {
        this.keyName = options.cache_key_prefix;
        super.init(options);
        this.options.cache_key_prefix = `${ C('cache_key_prefix') }Session:`;
    }

    /**
     *
     * @param name
     */
    get(name) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let data = yield _this.handle.get(_this.options.cache_key_prefix + _this.keyName);
            if (!data) {
                return;
            }
            try {
                data = JSON.parse(data);
                if (data.expire && Date.now() > data.expire) {
                    return _this.handle.rm(_this.options.cache_key_prefix + _this.keyName);
                } else {
                    return data[name];
                }
            } catch (e) {
                return _this.handle.rm(_this.options.cache_key_prefix + _this.keyName);
            }
        })();
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let key = name;
            if (isObject(name)) {
                timeout = value;
                key = (0, _keys2.default)(name)[0];
            }
            if (timeout === undefined) {
                timeout = _this2.options.cache_timeout;
            }

            let rdata = yield _this2.handle.get(_this2.options.cache_key_prefix + _this2.keyName);
            let content = {
                [name]: value,
                expire: Date.now() + timeout * 1000,
                timeout: timeout
            };
            try {
                if (!isEmpty(rdata)) {
                    rdata = JSON.parse(rdata);
                    content = extend(false, rdata, content);
                }
                return _this2.handle.set(_this2.options.cache_key_prefix + _this2.keyName, (0, _stringify2.default)(content), timeout);
            } catch (e) {
                return _promise2.default.resolve();
            }
        })();
    }

    /**
     *
     * @param
     */
    rm() {
        return this.handle.rm(this.options.cache_key_prefix + this.keyName);
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/12/2
    */