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

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

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
        //File类型下文件存储位置，默认为系统的tmp目录
        this.options.session_path = isEmpty(C('session_path')) ? _path2['default'].normalize(_os2['default'].tmpdir() + '/thinknode') : C('session_path');
        isDir(this.options.session_path) || mkdir(this.options.session_path);
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    };

    /**
     *
     * @param name
     */

    _default.prototype.get = function get(name) {
        var cookie = this.http.cookie(this.options.session_name);
        var file = this.options.session_path + '/' + cookie + '.json';
        if (!isFile(file)) {
            return getPromise();
        }
        var content = getFileContent(file);
        var value = {};
        try {
            content = JSON.parse(content || '{}');
            value = content[name];
        } catch (e) {
            try {
                _fs2['default'].unlink(file);
            } catch (e) {}
            value = {};
        }
        if (isEmpty(value)) {
            return getPromise();
        }
        var now = Date.now();
        if (now > value.expire) {
            _fs2['default'].unlink(file);
            return getPromise();
        }
        if (this.updateExpire) {
            value.expire = now + value.timeout * 1000;
            try {
                content[name] && delete content[name];
                content[name] = value;
                setFileContent(file, JSON.stringify(content));
            } catch (e) {}
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
     * @param vlaue
     * @param timeout
     */

    _default.prototype.set = function set(name, value, timeout) {
        var cookie = this.http.cookie(this.options.session_name);
        var file = this.options.session_path + '/' + cookie + '.json';
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
            var content = JSON.parse(getFileContent(file) || '{}');
            content[name] = data;
            setFileContent(file, JSON.stringify(content));
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
        try {
            var _file = this.options.session_path + '/' + cookie + '.json';
            _fs2['default'].unlink(_file);
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     */

    _default.prototype.gc = function gc() {
        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        var ls = undefined,
            data = undefined;
        try {
            ls = _fs2['default'].readdirSync(this.options.session_path);
        } catch (e) {
            ls = [];
        }
        ls.forEach(function (item) {
            try {
                if (isFile(item)) {
                    data = JSON.parse(getFileContent(item));
                    if (!isEmpty(data) && now > data.expire) {
                        _fs2['default'].unlink(file);
                    }
                }
            } catch (e) {}
        });
    };

    return _default;
})(_ThinkSession2['default']);

exports['default'] = _default;
module.exports = exports['default'];