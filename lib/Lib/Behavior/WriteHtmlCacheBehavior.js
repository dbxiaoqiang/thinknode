/**
 * 写入html缓存
 * @return {[type]} [description]
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _default = (function (_THINK$Behavior) {
    _inherits(_default, _THINK$Behavior);

    function _default() {
        _classCallCheck(this, _default);

        _THINK$Behavior.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
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
    };

    _default.prototype.run = function run(data) {
        if (!this.options.html_cache_on) {
            return data.content;
        }
        this.recordViewFile();
        S(this.getCacheName(data['var'].data), data.content, this.options.cache_options);
        return data.content;
    };

    /**
     * 记录模版文件名
     * @return {[type]} [description]
     */

    _default.prototype.recordViewFile = function recordViewFile() {
        var tplFile = this.http._tplfile;
        var key = this.http.group + ':' + this.http.controller + ':' + this.http.action;
        thinkCache(thinkCache.CACHE, key, tplFile);
    };

    /**
     *
     * @param data
     */

    _default.prototype.getCacheName = function getCacheName(data) {
        if (isObject(data)) {
            data = JSON.stringify(data);
        }
        data += this.http.group + ':' + this.http.controller + ':' + this.http.action;
        return md5(data) + this.options.html_cache_file_suffix;
    };

    return _default;
})(THINK.Behavior);

exports['default'] = _default;
module.exports = exports['default'];