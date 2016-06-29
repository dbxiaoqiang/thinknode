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
//define THINK object
if (!global.THINK) {
    global.THINK = {};
}
//framwork path
THINK.THINK_PATH = __dirname;
//load framwork function lib
require(THINK.THINK_PATH + '/lib/Common/common.js');
require(THINK.THINK_PATH + '/lib/Common/function.js');

//load framework
var thinknode = safeRequire(THINK.THINK_PATH + '/lib/think.js');
//run
var instance = new thinknode();
instance.run();
