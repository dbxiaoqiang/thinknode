/**
 * 模版文件列表
 * @type {Object}
 */
var path = require('path');
var fs = require('fs');

var tplFiles = {};
/**
 * 写入html缓存
 * @return {[type]} [description]
 */
module.exports = Behavior(function () {
    'use strict';
    return {
        options: {
            'html_cache_on': C("html_cache_on"), //是否开启缓存
            'html_cache_path': C("html_cache_path"),
            'html_cache_file_suffix': C("html_cache_file_suffix") || '.html', //缓存文件扩展名
            'cache_options': {
                cache_path: C("html_cache_path"),
                cache_timeout: C("html_cache_timeout"),
                cache_key_prefix: C("cache_key_prefix").indexOf(':') > -1 ? C("cache_key_prefix") + 'Temp:' : C("cache_key_prefix") + ':Temp:'
            }
        },
        run: function (data) {
            if (!this.options.html_cache_on) {
                return data.content;
            }
            this.recordViewFile();
            S(this.getCacheName(data.var.data),data.content, this.options.cache_options);
            return data.content;
        },
        /**
         * 记录模版文件名
         * @return {[type]} [description]
         */
        recordViewFile: function () {
            var tplFile = this.http.tpl_file;
            var key = this.http.group + ':' + this.http.controller + ':' + this.http.action;
            tplFiles[key] = tplFile;
        },
        /**
         *
         * @param  {[type]} key [description]
         * @return {[type]}     [description]
         */
        getCacheName: function (data) {
            if(isObject(data)){
                data = JSON.stringify(data);
            }
            data += this.http.group + ':' + this.http.controller + ':' + this.http.action;
            return md5(data) + this.options.html_cache_file_suffix;
        }
    };
});
/**
 * 获取模版文件
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
module.exports.getViewFile = function (http) {
    'use strict';
    var key = http.group + ':' + http.controller + ':' + http.action;
    return tplFiles[key];
};