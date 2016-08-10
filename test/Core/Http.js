/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/22
 */
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var muk = require('muk');
var _aToG = require('babel-runtime/helpers/asyncToGenerator');
var _asyncToGenerator = _interopRequireDefault(_aToG);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var thinknode = require('../../index.js');
//root path
var rootPath = path.dirname(path.dirname(__dirname));
//thinknode instantiation
var instance = new thinknode({
    ROOT_PATH: rootPath,
    APP_PATH: rootPath + path.sep + 'App',
    RESOURCE_PATH: path.dirname(__dirname),
    RUNTIME_PATH: rootPath + path.sep + 'Runtime',
    APP_DEBUG: false
});


var _http = require('../_http.js');

describe('Core/Http.js', function () {
    before( function () {
        //加载应用模块
        instance.loadApp();
        //加载挂载的中间件
        instance.loadExMiddleware();
        //日志监听
        THINK.INSTANCES.LOG || (THINK.INSTANCES.LOG = THINK.adapter(`${THINK.CONF.log_type}Logs`));
        if (THINK.CONF.log_loged) {
            new (THINK.INSTANCES.LOG)().logConsole();
        }
        //缓存对象
        instance.loadAliasExport();
        //异常拦截
        instance.captureError();
    });

    it('init', function () {
        var http = new THINK.Http();
        assert.equal(http.isend, false)
        assert.equal(http.typesend, false)
        assert.equal(http._payload, null)
        assert.equal(http._type, '')
        assert.equal(http._status, null)
        assert.equal(http._tplfile, null)
        assert.equal(http._endError, null)
        assert.equal(http._sendType, '')
        assert.equal(http.isRestful, false)
        assert.equal(http.isWebSocket, false)
        assert.equal(http.runType, null)
        assert.equal(http.loaded, false)

        assert.equal(THINK.isFunction(http.splitPathName), true)
        assert.equal(THINK.isFunction(http.cookieStringify), true)
        assert.equal(THINK.isFunction(http.cookieParse), true)
        assert.equal(THINK.isFunction(http.cookieUid), true)
        assert.equal(THINK.isFunction(http.cookieSign), true)
        assert.equal(THINK.isFunction(http.cookieUnsign), true)
    })

    it('run', function () {
        var req = THINK.extend({}, _http.req);
        var res = THINK.extend({}, _http.res);

       return  (0, _asyncToGenerator.default)(function* () {
           var http = yield THINK.Http.run(req, res);
           assert.equal(http.version, '1.1');
           assert.equal(http.method, 'GET');
           assert.equal(http.headers.connection, 'close');
           assert.equal(http.pathname, 'index/index/name/test');
           assert.equal(http.hostname, 'www.thinknode.org');

           assert.equal(http.isGet(), true);
           assert.equal(http.isPost(), false);
           assert.equal(http.isAjax(), false);
           assert.equal(http.isJsonp(), false);
           assert.equal(http.get('test'), "aaaa");
           assert.equal(http.get('value'), 1111);
        })();

    })
});
