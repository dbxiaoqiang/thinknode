/**
 * 读取HTML缓存
 * @return {[type]} [description]
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

exports.__esModule = true;

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
            'html_cache_timeout': C('html_cache_timeout'), //缓存时间
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
        var content;
        return _regeneratorRuntime.async(function run$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    if (!(!this.options.html_cache_on || !this.options.html_cache_timeout)) {
                        context$2$0.next = 2;
                        break;
                    }

                    return context$2$0.abrupt('return', false);

                case 2:
                    context$2$0.next = 4;
                    return _regeneratorRuntime.awrap(S(this.getCacheName(data.data), '', this.options.cache_options));

                case 4:
                    content = context$2$0.sent;

                    if (!isEmpty(content)) {
                        context$2$0.next = 9;
                        break;
                    }

                    return context$2$0.abrupt('return', false);

                case 9:
                    context$2$0.next = 11;
                    return _regeneratorRuntime.awrap(this.http.echo(content));

                case 11:
                    return context$2$0.abrupt('return', getDefer().promise);

                case 12:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

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