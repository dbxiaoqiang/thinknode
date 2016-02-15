'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Cache = require('./Cache');

var _Cache2 = _interopRequireDefault(_Cache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
exports.default = class extends _Cache2.default {

    init(options) {
        super.init(options);

        this.cachePath = `${ this.options.cache_path }/${ hash(this.options.cache_key_prefix) }`;
        isDir(this.cachePath) || mkdir(this.cachePath);
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    }

    getFilePath(name) {
        let tmp = hash(name);
        let dir = tmp.split('').slice(0, 2).join('/');
        return `${ this.cachePath }/${ tmp }/${ name }${ this.options.cache_file_suffix }`;
    }

    /**
     *
     * @param name
     */
    get(name) {
        let file = this.getFilePath(name);
        if (!isFile(file)) {
            return _promise2.default.resolve();
        }
        let fn = promisify(_fs2.default.readFile, _fs2.default);
        return fn(file, { encoding: 'utf8' }).then(data => {
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
                    return data.data;
                }
            } catch (e) {
                _fs2.default.unlink(file, function () {
                    return;
                });
            }
        }).catch(() => {});
    }
    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout) {
        let key = name;
        if (isObject(name)) {
            timeout = value;
            key = (0, _keys2.default)(name)[0];
        }
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        let file = this.getFilePath(key);
        let data = {
            data: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        let fn = promisify(_fs2.default.writeFile, _fs2.default);
        return fn(file, (0, _stringify2.default)(data)).then(() => {
            //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
            chmod(file);
        });
    }

    /**
     *
     * @param name
     */
    rm(name) {
        let file = this.getFilePath(name);
        if (isFile(file)) {
            let fn = promisify(_fs2.default.unlink, _fs2.default);
            return fn(file);
        }
        return _promise2.default.resolve();
    }

    /**
     *
     * @param now
     */
    gc() {
        let now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];

        //缓存回收
        let path = this.cachePath;
        let self = this;
        let files = _fs2.default.readdirSync(path);
        files.forEach(function (item) {
            var file = path + '/' + item;
            var stat = _fs2.default.statSync(file);
            if (stat.isDirectory()) {
                self.gc(now, file);
            } else if (stat.isFile()) {
                var data = getFileContent(file);
                try {
                    data = JSON.parse(data);
                    if (now > data.expire) {
                        _fs2.default.unlink(file, function () {});
                    }
                } catch (e) {}
            }
        });
    }
};