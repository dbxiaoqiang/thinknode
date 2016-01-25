'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
exports.default = class extends THINK.Behavior {
    init(http) {
        this.http = http;
        this.options = {
            'html_cache_on': C('html_cache_on'), //是否开启缓存
            'html_cache_path': C('html_cache_path'),
            'html_cache_file_suffix': C('html_cache_file_suffix') || '.html', //缓存文件扩展名
            'cache_options': {
                cache_path: C('html_cache_path'),
                cache_timeout: C('html_cache_timeout'),
                cache_key_prefix: C('cache_key_prefix').indexOf(':') > -1 ? C('cache_key_prefix') + 'Temp:' : C('cache_key_prefix') + ':Temp:'
            }
        };
    }

    run(data) {
        if (!this.options.html_cache_on) {
            return data.content;
        }
        this.recordViewFile();
        S(this.getCacheName(data.var.data), data.content, this.options.cache_options);
        return data.content;
    }

    /**
     * 记录模版文件名
     * @return {[type]} [description]
     */
    recordViewFile() {
        let tplFile = this.http._tplfile;
        let key = this.http.group + ':' + this.http.controller + ':' + this.http.action;
        thinkCache(THINK.CACHES.CACHE, key, tplFile);
    }

    /**
     *
     * @param data
     */
    getCacheName(data) {
        if (isObject(data)) {
            data = (0, _stringify2.default)(data);
        }
        data += this.http.group + ':' + this.http.controller + ':' + this.http.action;
        return md5(data) + this.options.html_cache_file_suffix;
    }
};