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

var _class = function (_THINK$Behavior) {
    (0, _inherits3.default)(_class, _THINK$Behavior);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Behavior.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
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

    _class.prototype.run = function run(data) {
        if (!this.options.html_cache_on) {
            return data.content;
        }
        this.recordViewFile();
        S(this.getCacheName(data.var.data), data.content, this.options.cache_options);
        return data.content;
    };

    /**
     * 记录模版文件名
     * @return {[type]} [description]
     */

    _class.prototype.recordViewFile = function recordViewFile() {
        var tplFile = this.http._tplfile;
        var key = this.http.group + ':' + this.http.controller + ':' + this.http.action;
        thinkCache(THINK.CACHES.CACHE, key, tplFile);
    };

    /**
     *
     * @param data
     */

    _class.prototype.getCacheName = function getCacheName(data) {
        if (isObject(data)) {
            data = (0, _stringify2.default)(data);
        }
        data += this.http.group + ':' + this.http.controller + ':' + this.http.action;
        return md5(data) + this.options.html_cache_file_suffix;
    };

    return _class;
}(THINK.Behavior);

exports.default = _class;