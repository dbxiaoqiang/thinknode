'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
exports.default = class {
  /**
   * constructor
   * @param  {Object} http []
   * @return {}      []
   */
  constructor() {
    this.init.apply(this, arguments);
  }

  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init() {}

  /**
   * get current class filename
   * @return {} []
   */
  filename() {
    let fname = this.__filename || __filename;
    return _path2.default.basename(fname, '.js');
  }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/19
    */