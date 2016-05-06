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

//load framwork function lib
require('./lib/Common/common.js');
require('./lib/Common/function.js');

//load framework
var thinknode = safeRequire(__dirname + '/lib/think.js');
//run
var instance = new thinknode();
instance.run();
