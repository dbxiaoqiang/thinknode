'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_THINK$Middleware) {
    (0, _inherits3.default)(_class, _THINK$Middleware);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Middleware.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
    };

    _class.prototype.run = function run(_ref) {
        var _ref$ = _ref[0];
        var templateFile = _ref$ === undefined ? '' : _ref$;
        var tVar = _ref[1];

        if (THINK.isEmpty(templateFile)) {
            //根据group, controller, action自动生成
            templateFile = [THINK.APP_PATH, '/', this.http.group, '/View/', THINK.config('tpl_default_theme') || 'default', '/', this.http.controller.toLowerCase(), THINK.config('tpl_file_depr'), this.http.action.toLowerCase(), THINK.config('tpl_file_suffix')].join('');
        } else {
            templateFile = templateFile + '';
            if (templateFile.indexOf('./') === 0) {
                //相对路径解析
                templateFile = _path2.default.resolve(_path2.default.normalize(templateFile));
            } else if (templateFile.indexOf('/') > 0) {
                //模块式访问 group/controller/view
                var tplPath = templateFile.split('/');
                var action = tplPath.pop().toLowerCase();
                var controller = tplPath.pop().toLowerCase() || this.http.controller.toLowerCase();
                var group = THINK.ucFirst(tplPath.pop() || this.http.group);
                templateFile = [THINK.APP_PATH, '/', group, '/View/', THINK.config('tpl_default_theme') || 'default', '/', controller, THINK.config('tpl_file_depr'), action, THINK.config('tpl_file_suffix')].join('');
            }
        }

        this.http.templateFile = templateFile;
        return _promise2.default.resolve();
    };

    return _class;
}(THINK.Middleware); /**
                      *
                      * @author     richen
                      * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                      * @license    MIT
                      * @version    15/11/19
                      */


exports.default = _class;