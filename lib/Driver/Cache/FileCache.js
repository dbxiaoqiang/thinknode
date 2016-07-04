'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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
        this.cachePath = `${ this.options.cache_path }/${ this.options.cache_key_prefix }/Cache`;
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    }

    getFilePath(name) {
        let tmp = hash(name).split('').slice(0, 1) || '';
        let dir = `${ this.cachePath }/${ tmp }`;
        isDir(dir) || mkDir(dir);
        return `${ dir }/${ name }${ this.options.cache_file_suffix }`;
    }

    /**
     *
     * @param name
     */
    get(name) {
        let file = this.getFilePath(name);
        if (!isFile(file)) {
            return _promise2.default.resolve('');
        }
        let fn = promisify(_fs2.default.readFile, _fs2.default);
        return fn(file, { encoding: 'utf8' }).then(data => {
            if (!data) {
                return '';
            }
            try {
                data = JSON.parse(data);
                if (Date.now() > (data.expire || 0)) {
                    _fs2.default.unlink(file, function () {});
                    return '';
                } else {
                    return data.data;
                }
            } catch (e) {
                _fs2.default.unlink(file, function () {});
                return '';
            }
        }).catch(() => '');
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout) {
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        let file = this.getFilePath(name);
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
     * @param path
     */
    gc() {
        let now = arguments.length <= 0 || arguments[0] === undefined ? Date.now() : arguments[0];
        let path = arguments[1];

        //缓存回收
        path = path || this.cachePath;
        let files = _fs2.default.readdirSync(path);
        files.forEach(item => {
            let file = path + '/' + item;
            if (isDir(file)) {
                this.gc(now, file);
            } else {
                let data = getFileContent(file);
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