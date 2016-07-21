'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
var _class = function () {
  /**
   * constructor
   * @param  {Object} http []
   * @return {}      []
   */
  function _class() {
    (0, _classCallCheck3.default)(this, _class);

    this.init.apply(this, arguments);
  }

  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */


  (0, _createClass3.default)(_class, [{
    key: 'init',
    value: function init() {}

    /**
     * get current class filename
     * @return {} []
     */

  }, {
    key: 'filename',
    value: function filename() {
      var fname = this.__filename || __filename;
      return _path2.default.basename(fname, '.js');
    }
  }]);
  return _class;
}(); /**
      *
      * @author     richen
      * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
      * @license    MIT
      * @version    15/11/19
      */


exports.default = _class;