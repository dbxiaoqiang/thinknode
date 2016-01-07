/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _default = (function (_base) {
  _inherits(_default, _base);

  function _default() {
    _classCallCheck(this, _default);

    _base.apply(this, arguments);
  }

  _default.prototype.init = function init(name, config) {};

  return _default;
})(_Base2['default']);

exports['default'] = _default;
module.exports = exports['default'];