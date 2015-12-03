'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */

var _default = (function () {
  /**
   * constructor
   * @param  {Object} http []
   * @return {}      []
   */

  function _default() {
    _classCallCheck(this, _default);

    this.init.apply(this, arguments);
  }

  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */

  _default.prototype.init = function init() {};

  /**
   * before magic method
   * @return {} []
   */

  _default.prototype.__before = function __before() {
    return getPromise();
  };

  /**
   * get current class filename
   * @return {} []
   */

  _default.prototype.filename = function filename() {
    var filename = this.__filename || __filename;
    return _path2['default'].basename(filename, '.js');
  };

  return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];