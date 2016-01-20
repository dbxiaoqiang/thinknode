'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_THINK$Behavior) {
    (0, _inherits3.default)(_class, _THINK$Behavior);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Behavior.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
    };

    _class.prototype.run = function run() {
        var templateFile = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        if (!templateFile) {
            //根据group, controller, action自动生成
            templateFile = [THINK.APP_PATH, '/', this.http.group, '/View/', C('tpl_default_theme') || 'default', '/', this.http.controller.toLowerCase(), C('tpl_file_depr'), this.http.action.toLowerCase(), C('tpl_file_suffix')].join('');
        } else if (templateFile.indexOf('./') > -1) {
            //相对路径解析
            templateFile = _path3.default.resolve(_path3.default.normalize(templateFile));
        } else if (templateFile.indexOf('/') > 0) {
            //模块式访问 group/controller/view
            var _path = templateFile.split('/');
            var action = _path.pop().toLowerCase();
            var controller = _path.pop().toLowerCase() || this.http.controller.toLowerCase();
            var group = ucfirst(_path.pop() || this.http.group);
            templateFile = [THINK.APP_PATH, '/', group, '/View/', C('tpl_default_theme') || 'default', '/', controller, C('tpl_file_depr'), action, C('tpl_file_suffix')].join('');
        }
        return templateFile;
    };

    return _class;
}(THINK.Behavior); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/19
                    */

exports.default = _class;