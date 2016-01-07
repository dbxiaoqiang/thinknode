/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

exports.__esModule = true;

var _default = (function (_THINK$Behavior) {
    _inherits(_default, _THINK$Behavior);

    function _default() {
        _classCallCheck(this, _default);

        _THINK$Behavior.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        this.http = http;
    };

    _default.prototype.run = function run(data) {
        var file = data.file;
        //将模版文件路径写入到http对象上，供writehtmlcache里使用
        this.http._tplfile = file;
        var engine = C('tpl_engine_type');
        //不使用模版引擎，直接返回文件内容
        if (!engine) {
            return getFileContent(file);
        }

        return this.http.tplengine().fetch(file, data['var']);
    };

    return _default;
})(THINK.Behavior);

exports['default'] = _default;
module.exports = exports['default'];