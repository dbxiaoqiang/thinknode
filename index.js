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

require('./lib/Common/common.js');
require('./lib/Common/function.js');
var thinknode = safeRequire(__dirname + '/lib/think.js');
//运行
var instance = new thinknode();
instance.run();