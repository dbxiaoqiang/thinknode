/**
 * 定位模版路径
 * @return {[type]} [description]
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

var _default = (function (_THINK$Behavior) {
    _inherits(_default, _THINK$Behavior);

    function _default() {
        _classCallCheck(this, _default);

        _THINK$Behavior.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        this.http = http;
    };

    _default.prototype.run = function run() {
        var templateFile = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        if (!templateFile) {
            //根据group, controller, action自动生成
            templateFile = [THINK.APP_PATH, '/', this.http.group, '/View/', C('tpl_default_theme') || 'default', '/', this.http.controller.toLowerCase(), C('tpl_file_depr'), this.http.action.toLowerCase(), C('tpl_file_suffix')].join('');
        } else if (templateFile.indexOf('./') > -1) {
            //相对路径解析
            templateFile = _path3['default'].resolve(_path3['default'].normalize(templateFile));
        } else if (templateFile.indexOf('/') > 0) {
            //模块式访问 group/controller/view
            var _path = templateFile.split('/');
            var action = _path.pop();
            var controller = _path.pop() || this.http.controller.toLowerCase();
            var group = ucfirst(_path.pop() || this.http.group);
            templateFile = [THINK.APP_PATH, '/', group, '/View/', C('tpl_default_theme') || 'default', '/', controller, C('tpl_file_depr'), action, C('tpl_file_suffix')].join('');
        }
        return templateFile;
    };

    return _default;
})(THINK.Behavior);

exports['default'] = _default;
module.exports = exports['default'];