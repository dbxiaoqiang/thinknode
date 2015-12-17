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

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

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
        this.options.session_path = this.options.session_path || _os2['default'].tmpdir() + '/thinknode';
        isDir(this.options.session_path) || mkdir(this.options.session_path);
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    };

    /**
     *
     * @param name
     */

    _default.prototype.get = function get(name) {
        var file = this.options.session_path + '/' + hash(name) + '/' + name + '.json';
        if (!isFile(file)) {
            return getPromise();
        }
        var value = getFileContent(file);
        try {
            value = JSON.parse(value);
        } catch (e) {
            try {
                _fs2['default'].unlink(file);
            } catch (e) {}
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
        if (this.updateExpire) {
            value.expire = now + value.timeout * 1000;
            try {
                _fs2['default'].writeFile(file, JSON.stringify(value));
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
        var file = this.options.session_path + '/' + hash(name) + '/' + name + '.json';

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

    _default.prototype.rm = function rm(name) {
        var file = this.options.session_path + '/' + hash(name) + '/' + name + '.json';
        try {
            _fs2['default'].unlink(file);
            return getPromise();
        } catch (e) {
            return getPromise();
        }
    };

    /**
     *
     */

    _default.prototype.gc = function gc() {
        var _this = this;

        var now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        var ls = undefined,
            file = undefined,
            data = undefined;
        try {
            ls = _fs2['default'].readdirSync(this.options.session_path);
        } catch (e) {
            ls = [];
        }
        ls.forEach(function (item) {
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
})(_ThinkSession2['default']);

exports['default'] = _default;
module.exports = exports['default'];