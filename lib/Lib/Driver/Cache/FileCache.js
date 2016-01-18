'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Cache = require('../../Think/Cache');

var _Cache2 = _interopRequireDefault(_Cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */

var _class = function (_cache) {
    (0, _inherits3.default)(_class, _cache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _cache.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        _cache.prototype.init.call(this, options);
        this.cachePath = this.options.cache_path + '/' + hash(this.options.cache_key_prefix);
        isDir(this.cachePath) || mkdir(this.cachePath);
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    };

    _class.prototype.getFilePath = function getFilePath(name) {
        var tmp = hash(name);
        tmp = tmp.slice(0, 1).split('').join('/');
        return this.cachePath + '/' + tmp + '/' + name + this.options.cache_file_suffix;
    };

    /**
     *
     * @param name
     */

    _class.prototype.getData = function getData(name) {
        var file = this.getFilePath(name);
        if (!isFile(file)) {
            return getPromise();
        }
        var value = getFileContent(file);
        try {
            value = JSON.parse(value);
        } catch (e) {
            _fs2.default.unlink(file);
            value = '';
        }
        if (isEmpty(value)) {
            return getPromise();
        }
        var now = Date.now();
        if (now > value.expire) {
            _fs2.default.unlink(file);
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

    _class.prototype.setData = function setData(name, value, timeout) {
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
            setFileContent(file, (0, _stringify2.default)(data));
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     * @param name
     */

    _class.prototype.rmData = function rmData(name) {
        var file = this.getFilePath(name);
        try {
            _fs2.default.unlink(file);
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     * @param now
     */

    _class.prototype.gcData = function gcData() {
        var _this2 = this;

        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        //缓存回收
        var path = this.cachePath;
        var files = undefined;
        try {
            files = _fs2.default.readdirSync(path);
        } catch (e) {
            files = [];
        }
        var file = undefined,
            data = undefined;
        files.forEach(function (item) {
            file = _this2.getFilePath(item);
            data = getFileContent(file);
            try {
                data = JSON.parse(data);
                if (!isEmpty(data) && now > data.expire) {
                    _fs2.default.unlink(file);
                }
            } catch (e) {
                _fs2.default.unlink(file);
                data = '';
            }
        });
    };

    return _class;
}(_Cache2.default);

exports.default = _class;