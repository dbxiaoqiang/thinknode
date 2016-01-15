/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
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

var _ThinkCache = require('../../Think/Cache');

var _ThinkCache2 = _interopRequireDefault(_ThinkCache);

var _default = (function (_cache) {
    _inherits(_default, _cache);

    function _default() {
        _classCallCheck(this, _default);

        _cache.apply(this, arguments);
    }

    _default.prototype.init = function init(options) {
        _cache.prototype.init.call(this, options);
        this.cachePath = this.options.cache_path + '/' + hash(this.options.cache_key_prefix);
        isDir(this.cachePath) || mkdir(this.cachePath);
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    };

    _default.prototype.getFilePath = function getFilePath(name) {
        var tmp = hash(name);
        tmp = tmp.slice(0, 1).split('').join('/');
        return this.cachePath + '/' + tmp + '/' + name + this.options.cache_file_suffix;
    };

    /**
     *
     * @param name
     */

    _default.prototype.getData = function getData(name) {
        var file = this.getFilePath(name);
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

    _default.prototype.setData = function setData(name, value, timeout) {
        var file = this.getFilePath(name);
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        var data = {
            data: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        try {
            setFileContent(file, JSON.stringify(data));
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     * @param name
     */

    _default.prototype.rmData = function rmData(name) {
        var file = this.getFilePath(name);
        try {
            _fs2['default'].unlink(file);
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     * @param now
     */

    _default.prototype.gcData = function gcData() {
        var _this = this;

        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        //缓存回收
        var path = this.cachePath;
        var files = undefined;
        try {
            files = _fs2['default'].readdirSync(path);
        } catch (e) {
            files = [];
        }
        var file = undefined,
            data = undefined;
        files.forEach(function (item) {
            file = _this.getFilePath(item);
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
})(_ThinkCache2['default']);

exports['default'] = _default;
module.exports = exports['default'];