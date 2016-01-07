/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/29
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _ThinkSession = require('../../Think/Session');

var _ThinkSession2 = _interopRequireDefault(_ThinkSession);

var _SocketRedisSocket = require('../Socket/RedisSocket');

var _SocketRedisSocket2 = _interopRequireDefault(_SocketRedisSocket);

var _default = (function (_session) {
    _inherits(_default, _session);

    function _default() {
        _classCallCheck(this, _default);

        _session.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        _session.prototype.init.call(this, http);

        this.options['cache_key_prefix'] = 'Session:';
        var key = md5(JSON.stringify(this.options));
        if (!(key in THINK.INSTANCES.REDIS)) {
            THINK.INSTANCES.REDIS[key] = new _SocketRedisSocket2['default'](this.options);
        }
        this.handle = THINK.INSTANCES.REDIS[key];
    };

    _default.prototype.get = function get(name) {
        var cookie, content, value, now, data;
        return _regeneratorRuntime.async(function get$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    cookie = this.http.cookie(this.options.session_name);
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap(this.handle.get(this.options.cache_key_prefix + cookie));

                case 3:
                    content = context$2$0.sent;
                    value = {};

                    try {
                        content = JSON.parse(content || '{}');
                        value = content[name] || {};
                    } catch (e) {
                        value = {};
                    }

                    if (!isEmpty(value)) {
                        context$2$0.next = 8;
                        break;
                    }

                    return context$2$0.abrupt('return', getPromise());

                case 8:
                    now = Date.now();

                    if (this.updateExpire) {
                        value.expire = now + value.timeout * 1000;
                        try {
                            this.expire(name, value.expire);
                        } catch (e) {}
                    }
                    data = value.data;

                    //如果data是个对象或者数组，需要深度拷贝
                    if (isObject(data)) {
                        data = extend({}, data);
                    } else if (isArray(data)) {
                        data = extend([], data);
                    }
                    return context$2$0.abrupt('return', getPromise(data));

                case 13:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    _default.prototype.set = function set(name, value, timeout) {
        var cookie, data, content;
        return _regeneratorRuntime.async(function set$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    cookie = this.http.cookie(this.options.session_name);

                    if (timeout === undefined) {
                        timeout = this.options.session_timeout;
                    }
                    //如果value是个对象或者数组，这里需要深度拷贝，防止程序里修改值导致缓存值被修改
                    if (isObject(value)) {
                        value = extend({}, value);
                    } else if (isArray(value)) {
                        value = extend([], value);
                    }
                    data = {
                        data: value,
                        expire: Date.now() + timeout * 1000,
                        timeout: timeout
                    };
                    context$2$0.prev = 4;
                    context$2$0.next = 7;
                    return _regeneratorRuntime.awrap(this.handle.get(this.options.cache_key_prefix + cookie));

                case 7:
                    content = context$2$0.sent;

                    content = JSON.parse(content || '{}');
                    content[name] = data;
                    this.handle.set(this.options.cache_key_prefix + cookie, JSON.stringify(content), timeout);
                    return context$2$0.abrupt('return', getPromise());

                case 14:
                    context$2$0.prev = 14;
                    context$2$0.t0 = context$2$0['catch'](4);
                    return context$2$0.abrupt('return', getPromise());

                case 17:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[4, 14]]);
    };

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */

    _default.prototype.expire = function expire(name, timeout) {
        return this.handle.expire(this.options.cache_key_prefix + name, timeout);
    };

    _default.prototype.rm = function rm() {
        var cookie = this.http.cookie(this.options.session_name);
        return this.handle.rm(this.options.cache_key_prefix + cookie);
    };

    return _default;
})(_ThinkSession2['default']);

exports['default'] = _default;
module.exports = exports['default'];