/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/2
 */
var path = require('path');
var thinknode = require('../index.js');
//root path
var rootPath = path.dirname(__dirname);
//thinknode instantiation
var instance = new thinknode({
    ROOT_PATH: rootPath,
    APP_PATH: rootPath + path.sep + 'App',
    RESOURCE_PATH: __dirname,
    RUNTIME_PATH: rootPath + path.sep + 'Runtime',
    APP_DEBUG: true
});
//app run
instance.run();
