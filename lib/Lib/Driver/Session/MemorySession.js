/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/2
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _ThinkSession = require('../../Think/Session');

var _ThinkSession2 = _interopRequireDefault(_ThinkSession);

var _default = (function (_session) {
    _inherits(_default, _session);

    function _default() {
        _classCallCheck(this, _default);

        _session.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        _session.prototype.init.call(this, http);
        this.options.gctype = 'memorySession';
        THINK.GCTIMER(this);
    };

    /**
     *
     * @param name
     */

    _default.prototype.get = function get(name) {
        try {
            var cookie = this.http.cookie(this.options.session_name);
            if (!(cookie in thinkCache(thinkCache.SESSION))) {
                return getPromise();
            }
            var content = thinkCache(thinkCache.SESSION, cookie);
            var value = content[name];
            if (isEmpty(value)) {
                return getPromise();
            }
            var now = Date.now();
            if (now > value.expire) {
                thinkCache(thinkCache.SESSION, name, null);
                return getPromise();
            }
            if (this.updateExpire) {
                value.expire = now + value.timeout * 1000;
                thinkCache(thinkCache.SESSION, name, value);
            }
            var data = value.data;
            //如果data是个对象或者数组，需要深度拷贝
            if (isObject(data)) {
                data = extend({}, data);
            } else if (isArray(data)) {
                data = extend([], data);
            }
            return getPromise(data);
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     * @param name
     * @param vlaue
     * @param timeout
     */

    _default.prototype.set = function set(name, value, timeout) {
        if (timeout === undefined) {
            timeout = this.options.session_timeout;
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
            var cookie = this.http.cookie(this.options.session_name);
            var content = thinkCache(thinkCache.SESSION, cookie) || {};
            content[name] = data;
            thinkCache(thinkCache.SESSION, cookie, content);
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     * @param name
     */

    _default.prototype.rm = function rm() {
        var cookie = this.http.cookie(this.options.session_name);
        thinkCache(thinkCache.SESSION, cookie, null);
        return getPromise();
    };

    /**
     *
     */

    _default.prototype.gc = function gc() {
        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        var ls = extend({}, thinkCache(thinkCache.SESSION));
        for (var v in ls) {
            (function (k) {
                for (var i in k) {
                    (function (s) {
                        if (now > k[s].expire) {
                            thinkCache(thinkCache.SESSION, k, null);
                        }
                    })(i);
                }
            })(v);
        }
    };

    return _default;
})(_ThinkSession2['default']);

exports['default'] = _default;
module.exports = exports['default'];