'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
            'html_cache_timeout': C('html_cache_timeout'), //缓存时间
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
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this.options.html_cache_on || !_this.options.html_cache_timeout) {
                return false;
            }
            let content = yield S(_this.getCacheName(data.data), '', _this.options.cache_options);
            if (isEmpty(content)) {
                return false;
            } else {
                yield _this.http.echo(content);
                return getDefer().promise;
            }
        })();
    }

    getCacheName(data) {
        if (isObject(data)) {
            data = (0, _stringify2.default)(data);
        }
        data += this.http.group + ':' + this.http.controller + ':' + this.http.action;
        return md5(data) + this.options.html_cache_file_suffix;
    }
};