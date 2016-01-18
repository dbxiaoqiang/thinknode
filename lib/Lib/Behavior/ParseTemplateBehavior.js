'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

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
    };

    _class.prototype.run = function run(data) {
        var file = data.file;
        //将模版文件路径写入到http对象上，供writehtmlcache里使用
        this.http._tplfile = file;
        var engine = C('tpl_engine_type');
        //不使用模版引擎，直接返回文件内容
        if (!engine) {
            return getFileContent(file);
        }

        return this.http.tplengine().fetch(file, data.var);
    };

    return _class;
}(THINK.Behavior);

exports.default = _class;