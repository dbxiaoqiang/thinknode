/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/2
 */
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var muk = require('muk');

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


describe('think.js', function(){
    before( function () {

    });

    it('function lib', function () {
        var data = {"aa": {"qq": 555555}};
        var temp1 = THINK.extend(false, {"dd": 666666}, data);
        temp1.aa.qq = 222222;
        assert(data.aa.qq, 555555)
        var temp2 = THINK.extend(false, {"dd": 666666}, data);
        temp2.aa.qq = 222222;
        assert(data.aa.qq, 222222)
        assert.equal(THINK.isBuffer(new Buffer(1)), true)
        assert.equal(THINK.isArray(['']), true)
        assert.equal(THINK.isIP('127.0.0.1'), 4)
        assert.equal(THINK.isHttp({req: {}, res: {}}), true)
        assert.equal(THINK.isBoolean(false), true)
        assert.equal(THINK.isNumber(1), true)
        assert.equal(THINK.isObject({}), true)
        assert.equal(THINK.isString('test'), true)
        assert.equal(THINK.isNumberString('123'), true)
        assert.equal(THINK.isNumberString('test'), false)
        assert.equal(THINK.isJSONObj({"aa": "bb"}), true)
        assert.equal(THINK.isJSONStr('{"aa": "bb"}'), true)
        assert.equal(THINK.isFunction(function(){}), true)
        assert.equal(THINK.isRegexp(/a/g), true)
        assert.equal(THINK.isError(new Error()), true)
        assert.equal(THINK.isScalar('test'), true)
        assert.equal(THINK.isEmpty(''), true)
        assert.equal(THINK.isEmpty(' '), true)
        assert.equal(THINK.isEmpty('    '), true)
        assert.equal(THINK.isEmpty('\f\n\r\t\v'), true)
        assert.equal(THINK.isEmpty(false), false)
        assert.equal(THINK.isEmpty(undefined), true)
        assert.equal(THINK.isEmpty(null), true)
        assert.equal(THINK.isEmpty({}), true)
        assert.equal(THINK.isEmpty([]), true)
        assert.equal(THINK.isPromise(Promise.resolve()), true)
        assert.equal(THINK.isFile(`${ THINK.THINK_PATH }/lib/Core/App.js`), true)
        assert.equal(THINK.isDir(`${ THINK.THINK_PATH }/lib/`), true)
        assert.equal(THINK.ucFirst('testAa'), 'Testaa')
        assert.equal(THINK.inArray('test', ['test']), true)

    })

    it('initialize', function(){
        assert.equal(THINK.RESOURCE_PATH, THINK.ROOT_PATH + '/test')
        assert.equal(THINK.APP_PATH, THINK.ROOT_PATH + '/App')
        assert.equal(THINK.APP_DEBUG, true)
        assert.equal(THINK.RUNTIME_PATH, THINK.ROOT_PATH + '/Runtime')
        assert.equal(THINK.LOG_PATH, THINK.RUNTIME_PATH + '/Logs')
        assert.equal(THINK.TEMP_PATH, THINK.RUNTIME_PATH + '/Temp')
        assert.equal(THINK.DATA_PATH, THINK.RUNTIME_PATH + '/Data')
        assert.equal(THINK.CACHE_PATH, THINK.RUNTIME_PATH + '/Cache')


        assert.equal(THINK.isObject(THINK.THINK_PACKAGE), true)
        assert.equal(THINK.isString(THINK.THINK_VERSION), true)
        assert.equal(THINK.isObject(THINK.INSTANCES.DB), true)
        assert.equal(THINK.isObject(THINK.ORM), true)
        assert.equal(THINK.isObject(THINK.GC), true)
        assert.equal(THINK.isFunction(THINK.GCTIMER), true)

        assert.equal(THINK.isObject(THINK.CACHES), true)
        assert.equal(THINK.CACHES.ALIAS, 'alias')
        assert.equal(THINK.CACHES.ALIAS_EXPORT, 'alias_export')
        assert.equal(THINK.CACHES.COLLECTION, 'collection')
        assert.equal(THINK.CACHES.LIMIT, 'limit')
        assert.equal(THINK.CACHES.CONF, 'alias_conf')
        assert.equal(THINK.CACHES.MODEL, 'alias_model')

    })

    it('initialize', function(){
        process.execArgv = '--debug';
        var instance = new thinknode({
            ROOT_PATH: rootPath,
            APP_PATH: rootPath + path.sep + 'App',
            RESOURCE_PATH: __dirname,
            RUNTIME_PATH: rootPath + path.sep + 'Runtime',
        });
        console.log(process.execArgv.indexOf('--debug'))
        assert.equal(THINK.APP_DEBUG, true)
        assert.equal(THINK.APP_MODE, 'debug')
        assert.equal(process.env.LOG_QUERIES, 'true')
    })
    //
    it('initialize', function(){
        process.execArgv = '--production';
        var instance = new thinknode({
            ROOT_PATH: rootPath,
            APP_PATH: rootPath + path.sep + 'App',
            RESOURCE_PATH: __dirname,
            RUNTIME_PATH: rootPath + path.sep + 'Runtime',
            APP_DEBUG: true
        });
        assert.equal(THINK.APP_DEBUG, false)
        assert.equal(THINK.APP_MODE, 'production')
        assert.equal(process.env.LOG_QUERIES, 'false')
    })
    //
    it('checkNodeVersion', function(done){
        instance.checkNodeVersion();
        done();
    })
    //
    it('checkDependencies', function(done){
        instance.checkDependencies();
        done();
    })
    //
    it('loadAlias', function(done){
        instance.loadAlias({'App': `${ THINK.THINK_PATH }/lib/Core/App.js`});
        assert.equal(THINK.thinkCache(THINK.CACHES.ALIAS, 'App'), `${ THINK.THINK_PATH }/lib/Core/App.js`)
        done();
    })
    //
    it('loadAliasExport', function(){
        instance.loadAlias({'App': `${ THINK.THINK_PATH }/lib/Core/App.js`});
        instance.loadAliasExport();
        assert.deepEqual(THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, 'App'), THINK.safeRequire(`${ THINK.THINK_PATH }/lib/Core/App.js`))
    })
    //
    it('flushAlias', function(){
        THINK.thinkCache(THINK.CACHES.ALIAS, 'App', null);
        assert.equal(THINK.thinkCache(THINK.CACHES.ALIAS, 'App'), null)
    })
    //
    it('flushAliasExport', function(){
        THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, 'App', null);
        assert.equal(THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, 'App'), null)
    })
    //
    it('loadFiles', function(done){
        instance.loadFiles({
            'Lang': [`${ THINK.THINK_PATH }/lib/Lang/`]
        }, function (t, f, g) {
            assert.equal(THINK.inArray(t, ['zh-cn','en']), true)
            assert.equal(THINK.inArray(f, [`${ THINK.THINK_PATH }/lib/Lang/en.js`,`${ THINK.THINK_PATH }/lib/Lang/zh-cn.js`]), true)
            assert.equal(g, 'Lang')
        })
        done();
    })
    //
    it('loadExt', function(done){
        //加载配置
        THINK.CONF = null; //移除之前的所有配置
        THINK.CONF = THINK.safeRequire(`${THINK.THINK_PATH}/lib/Conf/config.js`);
        assert.equal(THINK.C('db_type'), 'mysql')
        assert.equal(THINK.isFunction(THINK.Ext['Rest']), true)
        done();
    })
    //
    it('loadFramework', function(done){
        assert.equal(THINK.thinkCache(THINK.CACHES.ALIAS, 'Adapter')['RedisCache'], `${THINK.THINK_PATH}/lib/Adapter/Cache/RedisCache.js`)
        assert.equal(THINK.thinkCache(THINK.CACHES.ALIAS, 'Middleware')['ParseForm'], `${THINK.THINK_PATH}/lib/Middleware/ParseForm.js`)
        assert.equal(THINK.thinkCache(THINK.CACHES.ALIAS, 'Ext')['Rest'], `${THINK.THINK_PATH}/lib/Extend/Controller/Rest.js`)
        assert.equal(THINK.CONF.app_port, 3000)
        assert.equal(THINK.LANG['en']['500'], 'Internal Server Error')
        done();
    })
    //
    it('loadMoudles', function(done){
        THINK.mkDir(THINK.ROOT_PATH + '/App/Common/Conf');
        THINK.mkDir(THINK.ROOT_PATH + '/App/Home/Controller');
        THINK.mkDir(THINK.ROOT_PATH + '/App/Home/Model');
        instance.loadApp();
        assert.equal(THINK.inArray('home', THINK.CONF.app_group_list), true)
        THINK.rmDir(THINK.ROOT_PATH + '/App').then(done);
    })

});
