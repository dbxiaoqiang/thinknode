'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

        this.cachePath = this.options.cache_path + '/session/' + C('session_name');
        isDir(this.cachePath) || mkdir(this.cachePath);
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    };

    _class.prototype.getFilePath = function getFilePath() {
        return this.cachePath + '/' + this.options.cache_key_prefix + this.options.cache_file_suffix;
    };

    /**
     *
     * @param name
     */

    _class.prototype.get = function get(name) {
        var file = this.getFilePath();
        if (!isFile(file)) {
            return _promise2.default.resolve();
        }
        var fn = promisify(_fs2.default.readFile, _fs2.default);
        return fn(file, { encoding: 'utf8' }).then(function (data) {
            if (!data) {
                return;
            }
            try {
                data = JSON.parse(data);
                if (data.expire && Date.now() > data.expire) {
                    _fs2.default.unlink(file, function () {
                        return;
                    });
                } else {
                    return data[name];
                }
            } catch (e) {
                _fs2.default.unlink(file, function () {
                    return;
                });
            }
        }).catch(function () {});
    };
    /**
     *
     * @param name
     * @param value
     * @param timeout
     */

    _class.prototype.set = function set(name, value, timeout) {
        var _content;

        var key = name;
        if (isObject(name)) {
            timeout = value;
            key = (0, _keys2.default)(name)[0];
        }
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        var file = this.getFilePath();
        var rfn = promisify(_fs2.default.readFile, _fs2.default);
        var wfn = promisify(_fs2.default.writeFile, _fs2.default);
        var content = (_content = {}, _content[name] = value, _content.expire = Date.now() + timeout * 1000, _content.timeout = timeout, _content),
            promise = getPromise();
        if (isFile(file)) {
            promise = rfn(file, { encoding: 'utf8' });
        }
        try {
            return promise.then(function (rdata) {
                if (!isEmpty(rdata)) {
                    rdata = JSON.parse(rdata);
                    content = extend(false, rdata, content);
                }
                return wfn(file, (0, _stringify2.default)(content)).then(function () {
                    //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
                    chmod(file);
                });
            });
        } catch (e) {
            return _promise2.default.resolve();
        }
    };

    /**
     *
     * @param name
     */

    _class.prototype.rm = function rm(name) {
        var file = this.getFilePath();
        if (isFile(file)) {
            var fn = promisify(_fs2.default.unlink, _fs2.default);
            return fn(file);
        }
        return _promise2.default.resolve();
    };

    /**
     *
     * @param now
     */

    _class.prototype.gc = function gc() {
        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        //缓存回收
        var path = this.cachePath;
        var files = _fs2.default.readdirSync(path);
        files.forEach(function (item) {
            var file = path + '/' + item;
            try {
                var data = getFileContent(file);
                data = JSON.parse(data);
                if (data.expire && now > data.expire) {
                    _fs2.default.unlink(file, function () {});
                }
            } catch (e) {}
        });
    };

    return _class;
}(_Cache2.default);

exports.default = _class;