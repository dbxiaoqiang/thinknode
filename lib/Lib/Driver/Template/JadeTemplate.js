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

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _jade = require('jade');

var _jade2 = _interopRequireDefault(_jade);

var _ThinkBase = require('../../Think/Base');

var _ThinkBase2 = _interopRequireDefault(_ThinkBase);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = extend(false, C('tpl_engine_config'), config);
    };

    /**
     *
     * @param templateFile
     */

    _default.prototype.fetch = function fetch(templateFile, data) {
        this.config.filename = templateFile;
        var content = getFileContent(templateFile);
        return _jade2['default'].compile(content, this.config)(data);
    };

    return _default;
})(_ThinkBase2['default']);

exports['default'] = _default;
module.exports = exports['default'];