'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Session = require('../../Think/Session');

var _Session2 = _interopRequireDefault(_Session);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_session) {
    (0, _inherits3.default)(_class, _session);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _session.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        _session.prototype.init.call(this, http);
        this.options.gctype = 'memorySession';
        THINK.GCTIMER(this);
    };

    /**
     *
     * @param name
     */

    _class.prototype.get = function get(name) {
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

    _class.prototype.set = function set(name, value, timeout) {
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

    _class.prototype.rm = function rm() {
        var cookie = this.http.cookie(this.options.session_name);
        thinkCache(thinkCache.SESSION, cookie, null);
        return getPromise();
    };

    /**
     *
     */

    _class.prototype.gc = function gc() {
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

    return _class;
}(_Session2.default); /**
                       *
                       * @author     richen
                       * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                       * @license    MIT
                       * @version    15/12/2
                       */

exports.default = _class;