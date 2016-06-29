/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/6/29
 */
var path = require('path');
var fs = require('fs');
var assert = require('assert');
var muk = require('muk');

//rewite promise, bluebird is more faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;

//load framwork function lib
require('../lib/Common/common.js');
require('../lib/Common/function.js');

if (!global.THINK) {
    global.THINK = {};
}
THINK.ROOT_PATH = __dirname.replace('/test', '');
THINK.THINK_PATH = THINK.ROOT_PATH;
//load framework
var thinknode = safeRequire( THINK.ROOT_PATH + '/lib/think.js');



describe('think.js', function(){
    before( function () {

    });

    it('initialize', function(){
        var instance = new thinknode();
        assert.equal(THINK.RESOURCE_PATH, THINK.ROOT_PATH + '/www')
        assert.equal(THINK.APP_PATH, THINK.ROOT_PATH + '/App')
        assert.equal(THINK.APP_DEBUG, false)
        assert.equal(THINK.CORE_PATH, THINK.THINK_PATH + '/Core')
        assert.equal(THINK.RUNTIME_PATH, THINK.ROOT_PATH + '/Runtime')
        assert.equal(THINK.LOG_PATH, THINK.RUNTIME_PATH + '/Logs')
        assert.equal(THINK.TEMP_PATH, THINK.RUNTIME_PATH + '/Temp')
        assert.equal(THINK.DATA_PATH, THINK.RUNTIME_PATH + '/Data')
        assert.equal(THINK.CACHE_PATH, THINK.RUNTIME_PATH + '/Cache')


        assert.equal(isObject(THINK.THINK_PACKAGE), true)
        assert.equal(isString(THINK.THINK_VERSION), true)
        assert.equal(isObject(THINK.INSTANCES.DB), true)
        assert.equal(isObject(THINK.ORM), true)
        assert.equal(isObject(THINK.GC), true)
        assert.equal(isFunction(THINK.GCTIMER), true)

        assert.equal(isObject(THINK.CACHES), true)
        assert.equal(THINK.CACHES.ALIAS, 'alias')
        assert.equal(THINK.CACHES.ALIAS_EXPORT, 'alias_export')
        assert.equal(THINK.CACHES.COLLECTION, 'collection')
        assert.equal(THINK.CACHES.LIMIT, 'limit')
        assert.equal(THINK.CACHES.CONF, 'conf')
        assert.equal(THINK.CACHES.CACHE, 'cache')
        assert.equal(THINK.CACHES.MODEL, 'model')

    })

    it('initialize', function(){
        process.execArgv = '--debug';
        var instance = new thinknode();
        console.log(process.execArgv.indexOf('--debug'))
        assert.equal(THINK.APP_DEBUG, true)
        assert.equal(THINK.APP_MODE, 'debug')
        assert.equal(process.env.LOG_QUERIES, 'true')
    })

    it('initialize', function(){
        process.execArgv = '--production';
        var instance = new thinknode();
        assert.equal(THINK.APP_DEBUG, false)
        assert.equal(THINK.APP_MODE, 'production')
        assert.equal(process.env.LOG_QUERIES, 'false')
    })

    it('checkNodeVersion', function(done){
        var instance = new thinknode();
        instance.checkNodeVersion();
        done();
    })

    it('checkDependencies', function(done){
        var instance = new thinknode();
        instance.checkDependencies();
        done();
    })

    it('loadAlias', function(){
        assert.equal(thinkCache(THINK.CACHES.ALIAS, 'App'), `${ THINK.CORE_PATH }/App.js`)
    })

    it('loadAliasExport', function(){
        assert.deepEqual(thinkCache(THINK.CACHES.ALIAS_EXPORT, 'App'), safeRequire(`${ THINK.CORE_PATH }/App.js`))
    })

    it('flushAlias', function(){
        thinkCache(THINK.CACHES.ALIAS, 'App', null);
        assert.equal(thinkCache(THINK.CACHES.ALIAS, 'App'), null)
    })

    it('flushAliasExport', function(){
        thinkCache(THINK.CACHES.ALIAS_EXPORT, 'App', null);
        assert.equal(thinkCache(THINK.CACHES.ALIAS_EXPORT, 'App'), null)
    })
});
