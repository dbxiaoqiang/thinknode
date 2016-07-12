/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/2
 */
'use strict';
//rewite promise, bluebird is more faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;


function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//define THINK object
global.THINK = Object.create(requireDefault(require('./lib/Util/Lib.js')).default);
//export framework
module.exports = requireDefault(require('./lib/think.js')).default;
