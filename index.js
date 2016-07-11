/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
'use strict';
//rewite promise, bluebird is more faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;

//export framework
function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
module.exports = requireDefault(require('./lib/think.js')).default;
