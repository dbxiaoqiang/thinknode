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

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ThinkCacheJs = require('../../Think/Cache.js');

var _ThinkCacheJs2 = _interopRequireDefault(_ThinkCacheJs);

var _default = (function (_cache) {
    _inherits(_default, _cache);

    function _default() {
        _classCallCheck(this, _default);

        _cache.apply(this, arguments);
    }

    _default.prototype.init = function init(options) {
        _cache.prototype.init.call(this, options);
        isDir(this.options.cache_path) || mkdir(this.options.cache_path);
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    };

    /**
     *
     * @param name
     */

    _default.prototype.get = function get(name) {
        var file = this.options.cache_path + '/' + hash(name) + '/' + name + '.json';
        if (!isFile(file)) {
            return getPromise();
        }
        var value = getFileContent(file);
        try {
            value = JSON.parse(value);
        } catch (e) {
            _fs2['default'].unlink(file);
            value = '';
        }
        if (isEmpty(value)) {
            return getPromise();
        }
        var now = Date.now();
        if (now > value.expire) {
            _fs2['default'].unlink(file);
            return getPromise();
        }
        var data = value.data;
        //如果data是个对象或者数组，需要深度拷贝
        if (isObject(data)) {
            data = extend({}, data);
        } else if (isArray(data)) {
            data = extend([], data);
        }
        return getPromise(data);
    };

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */

    _default.prototype.set = function set(name, value, timeout) {
        var file = this.options.cache_path + '/' + hash(name) + '/' + name + '.json';
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
            expire: Date.now() + timeout * 1000
        };
        _fs2['default'].writeFile(file, JSON.stringify(data));
        return getPromise();
    };

    /**
     *
     * @param name
     */

    _default.prototype.rm = function rm(name) {
        var file = this.options.cache_path + '/' + hash(name) + '/' + name + '.json';
        _fs2['default'].unlink(file);
        return getPromise();
    };

    /**
     *
     * @param now
     */

    _default.prototype.gc = function gc() {
        var _this = this;

        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        var path = this.options.cache_path;
        var files = undefined;
        try {
            files = _fs2['default'].readdirSync(path);
        } catch (e) {
            files = [];
        }
        var file = undefined,
            data = undefined;
        files.forEach(function (item) {
            file = _this.options.cache_path + '/' + hash(item) + '/' + item + '.json';
            data = getFileContent(file);
            try {
                data = JSON.parse(data);
                if (!isEmpty(data) && now > data.expire) {
                    _fs2['default'].unlink(file);
                }
            } catch (e) {
                _fs2['default'].unlink(file);
                data = '';
            }
        });
    };

    return _default;
})(_ThinkCacheJs2['default']);

exports['default'] = _default;
module.exports = exports['default'];