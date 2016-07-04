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

    it('extend', function () {
        var data = {"aa": {"qq": 555555}};
        var temp1 = extend(false, {"dd": 666666}, data);
        temp1.aa.qq = 222222;
        assert(data.aa.qq, 555555)
        var temp2 = extend(false, {"dd": 666666}, data);
        temp2.aa.qq = 222222;
        assert(data.aa.qq, 222222)
    })

    it('initialize', function(){
        var instance = new thinknode();
        assert.equal(THINK.RESOURCE_PATH, THINK.ROOT_PATH + '/www')
        assert.equal(THINK.APP_PATH, THINK.ROOT_PATH + '/App')
        assert.equal(THINK.APP_DEBUG, false)
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

    it('loadAlias', function(done){
        var instance = new thinknode();
        instance.loadAlias({'App': `${ THINK.CORE_PATH }/App.js`});
        assert.equal(thinkCache(THINK.CACHES.ALIAS, 'App'), `${ THINK.CORE_PATH }/App.js`)
        done();
    })

    it('loadAliasExport', function(){
        var instance = new thinknode();
        instance.loadAlias({'App': `${ THINK.CORE_PATH }/App.js`});
        instance.loadAliasExport();
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

    it('loadFiles', function(done){
        var instance = new thinknode();
        instance.loadFiles({
            'Lang': [`${ THINK.THINK_PATH }/lib/Lang/`]
        }, function (t, f, g) {
            assert.equal(inArray(t, ['zh-cn','en']), true)
            assert.equal(inArray(f, [`${ THINK.THINK_PATH }/lib/Lang/en.js`,`${ THINK.THINK_PATH }/lib/Lang/zh-cn.js`]), true)
            assert.equal(g, 'Lang')
        })
        done();
    })

    it('loadExt', function(done){
        var instance = new thinknode();
        //加载配置
        THINK.CONF = null; //移除之前的所有配置
        THINK.CONF = safeRequire(`${THINK.THINK_PATH}/lib/Conf/config.js`);
        instance.loadExt();
        assert.equal(isFunction(THINK.Ext['RestController']), true)
        done();
    })

    it('loadFramework', function(done){
        var instance = new thinknode();
        instance.loadFramework();
        assert.equal(thinkCache(THINK.CACHES.ALIAS, 'App'), `${THINK.THINK_PATH}/lib/Core/App.js`)
        assert.equal(THINK.CONF.app_port, 3000)
        assert.equal(thinkCache(THINK.CACHES.ALIAS, 'Filter'), `${THINK.THINK_PATH}/lib/Util/Filter.js`)
        assert.equal(!isEmpty(THINK.TAG['app_init']), true)
        assert.equal(THINK.LANG['en']['500'], 'Internal Server Error')
        assert.equal(thinkCache(THINK.CACHES.ALIAS, 'RedisCache'), `${THINK.THINK_PATH}/lib/Driver/Cache/RedisCache.js`)
        done();
    })

    it('loadMoudles', function(done){
        mkDir(THINK.ROOT_PATH + '/App/Common/Conf');
        mkDir(THINK.ROOT_PATH + '/App/Home/Controller');
        mkDir(THINK.ROOT_PATH + '/App/Home/Model');
        var instance = new thinknode();
        instance.loadMoudles();
        assert.equal(inArray('home', THINK.CONF.app_group_list), true)
        rmDir(THINK.ROOT_PATH + '/App').then(done);
    })



});
