'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _ejs = require('ejs');

var _ejs2 = _interopRequireDefault(_ejs);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.options = THINK.extend(false, THINK.config('tpl_engine_config'), options);
    };

    /**
     *
     * @param templateFile
     */


    _class.prototype.fetch = function fetch(templateFile, data) {
        this.options.filename = templateFile;
        var content = THINK.getFileContent(templateFile);
        return _ejs2.default.compile(content, this.options)(data);
    };

    return _class;
}(_Base2.default);

exports.default = _class;