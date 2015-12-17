/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/3
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _events = require('events');

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

        _events.EventEmitter.call(this);
        this.config = extend(false, {
            memcache_port: C('memcache_port'),
            memcache_host: C('memcache_host')
        }, config);
        //换行符
        this.config.crlf = '\r\n';
        //定义错误
        this.config.errors = ['ERROR', 'NOT_FOUND', 'CLIENT_ERROR', 'SERVER_ERROR'];

        this.buffer = '';
        this.callbacks = []; //回调函数
        this.handle = null; //socket连接句柄
    };

    _default.prototype.connect = function connect() {
        if (this.handle) {
            return this;
        }
        var self = this;
        var deferred = getDefer();
        this.handle = _net2['default'].createConnection(this.config.memcache_port, this.config.memcache_host);
        this.handle.on('connect', function () {
            this.setTimeout(0);
            this.setNoDelay();
            self.emit('connect');
            deferred.resolve();
        });
        this.handle.on('data', function (data) {
            self.buffer += data.toString();
            self.handleData();
        });
        this.handle.on('end', function () {
            while (self.callbacks.length > 0) {
                var callback = self.callbacks.shift();
                if (callback && callback.callback) {
                    callback.callback('CONNECTION_CLOSED');
                }
            }
            self.handle = null;
        });
        this.handle.on('close', function () {
            self.handle = null;
            self.emit('close');
        });
        this.handle.on('timeout', function () {
            if (self.callbacks.length > 0) {
                var callback = self.callbacks.shift();
                if (callback && callback.callback) {
                    callback.callback('TIMEOUT');
                }
            }
            self.emit('timeout');
        });
        this.handle.on('error', function (error) {
            while (self.callbacks.length > 0) {
                var callback = self.callbacks.shift();
                if (callback && callback.callback) {
                    callback.callback('ERROR');
                }
            }
            self.handle = null;
            self.emit('clienterror', error);
        });
        this.promise = deferred.promise;
        return this;
    };

    _default.prototype.close = function close() {
        if (this.handle && this.handle.readyState === 'open') {
            this.handle.end();
            this.handle = null;
        }
    };

    /**
     *
     * @param query
     * @param type
     */

    _default.prototype.wrap = function wrap(query, type) {
        var deferred, callback;
        return _regeneratorRuntime.async(function wrap$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return _regeneratorRuntime.awrap(this.connect());

                case 2:
                    deferred = getDefer();

                    callback = function callback(error, value) {
                        return error ? deferred.reject(error) : deferred.resolve(value);
                    };

                    this.callbacks.push({ type: type, callback: callback });
                    this.handle.write(query + this.config.crlf);
                    return context$2$0.abrupt('return', deferred.promise);

                case 7:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * 获取
     * @param key
     */

    _default.prototype.get = function get(key) {
        return this.wrap('get ' + key, 'get');
    };

    /**
     *
     * @param key
     * @param value
     * @param lifetime
     * @param flags
     * @returns {*}
     */

    _default.prototype.set = function set(key, value) {
        var lifetime = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var flags = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

        var length = Buffer.byteLength(value.toString());
        var query = ['set', key, flags, lifetime, length].join(' ') + this.config.crlf + value;
        return this.wrap(query, 'simple');
    };

    /**
     *
     * @param key
     */

    _default.prototype.rm = function rm(key) {
        return this.wrap('delete ' + key, 'simple');
    };

    /**
     * 增长
     * @param key
     * @param step
     * @returns {*}
     */

    _default.prototype.incr = function incr(key) {
        var step = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

        return this.wrap('incr ' + key + ' ' + step, 'simple');
    };

    /**
     * 减少
     * @param key
     * @param step
     * @returns {*}
     */

    _default.prototype.decr = function decr(key) {
        var step = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

        return this.wrap('decr ' + key + ' ' + step, 'simple');
    };

    /**
     *
     */

    _default.prototype.handleData = function handleData() {
        while (this.buffer.length > 0) {
            var result = this.getHandleResult(this.buffer);
            if (result === false) {
                break;
            }
            var value = result[0];
            var pos = result[1];
            var error = result[2];
            if (pos > this.buffer.length) {
                break;
            }
            this.buffer = this.buffer.substring(pos);
            var callback = this.callbacks.shift();
            if (callback && callback.callback) {
                callback.callback(error, value);
            }
        }
    };

    /**
     *
     * @param buffer
     */

    _default.prototype.getHandleResult = function getHandleResult(buffer) {
        if (buffer.indexOf(this.config.crlf) === -1) {
            return false;
        }
        for (var i = 0; i < this.config.errors.length; i++) {
            var item = this.config.errors[i];
            if (buffer.indexOf(item) > -1) {
                return this.handleError(buffer);
            }
        }
        var callback = this.callbacks[0];
        if (callback && callback.type) {
            return this['handle' + ucfirst(callback.type)](buffer);
        }
        return false;
    };

    /**
     *
     * @param buffer
     */

    _default.prototype.handleError = function handleError(buffer) {
        var line = buffer.indexOf(this.config.crlf);
        if (line > -1) {
            line = buffer.substr(0, line);
        }
        return [null, line.length + this.config.crlf.length, line];
    };

    /**
     *
     * @param buffer
     */

    _default.prototype.handleGet = function handleGet(buffer) {
        var value = null,
            end = 3,
            resultLen = 0,
            firstPos = undefined,
            crlfLen = this.config.crlf.length;
        if (buffer.indexOf('END') === 0) {
            return [value, end + crlfLen];
        } else if (buffer.indexOf('VALUE') === 0 && buffer.indexOf('END') > -1) {
            firstPos = buffer.indexOf(CRLF) + crlfLen;
            var endPos = buffer.indexOf('END');
            resultLen = endPos - firstPos - crlfLen;
            value = buffer.substr(firstPos, resultLen);
            return [value, firstPos + parseInt(resultLen, 10) + crlfLen + end + crlfLen];
        } else {
            firstPos = buffer.indexOf(this.config.crlf) + crlfLen;
            resultLen = buffer.substr(0, firstPos).split(' ')[3];
            value = buffer.substr(firstPos, resultLen);
            return [value, firstPos + parseInt(resultLen) + crlfLen + end + crlfLen];
        }
    };

    /**
     *
     * @param buffer
     */

    _default.prototype.handleSimple = function handleSimple(buffer) {
        var line = buffer.indexOf(this.config.crlf);
        if (line > -1) {
            line = buffer.substr(0, line);
        }
        return [line, line.length + this.config.crlf.length, null];
    };

    return _default;
})(_ThinkBase2['default']);

exports['default'] = _default;
module.exports = exports['default'];