'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_THINK$Middleware) {
    (0, _inherits3.default)(_class, _THINK$Middleware);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(http) {
            this.http = http;
        }
    }, {
        key: 'run',
        value: function run(_ref) {
            var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

            var _ref2$ = _ref2[0];
            var templateFile = _ref2$ === undefined ? '' : _ref2$;
            var tVar = _ref2[1];

            if (THINK.isEmpty(templateFile)) {
                //根据group, controller, action自动生成
                templateFile = [THINK.APP_PATH, '/', this.http.group, '/View/', THINK.config('tpl_default_theme') || 'default', '/', this.http.controller.toLowerCase(), THINK.config('tpl_file_depr'), this.http.action.toLowerCase(), THINK.config('tpl_file_suffix')].join('');
            } else {
                templateFile = templateFile + '';
                if (templateFile.indexOf('./') > -1) {
                    //相对路径解析
                    templateFile = _path3.default.resolve(_path3.default.normalize(templateFile));
                } else if (templateFile.indexOf('/') > 0) {
                    //模块式访问 group/controller/view
                    var _path = templateFile.split('/');
                    var action = _path.pop().toLowerCase();
                    var controller = _path.pop().toLowerCase() || this.http.controller.toLowerCase();
                    var group = THINK.ucFirst(_path.pop() || this.http.group);
                    templateFile = [THINK.APP_PATH, '/', group, '/View/', THINK.config('tpl_default_theme') || 'default', '/', controller, THINK.config('tpl_file_depr'), action, THINK.config('tpl_file_suffix')].join('');
                }
            }

            this.http.templateFile = templateFile;
            return _promise2.default.resolve();
        }
    }]);
    return _class;
}(THINK.Middleware); /**
                      *
                      * @author     richen
                      * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                      * @license    MIT
                      * @version    15/11/19
                      */


exports.default = _class;