'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _App = require('./Core/App');

var _App2 = _interopRequireDefault(_App);

var _Base = require('./Core/Base');

var _Base2 = _interopRequireDefault(_Base);

var _Controller = require('./Core/Controller');

var _Controller2 = _interopRequireDefault(_Controller);

var _Dispather = require('./Core/Dispather');

var _Dispather2 = _interopRequireDefault(_Dispather);

var _Http = require('./Core/Http');

var _Http2 = _interopRequireDefault(_Http);

var _Middleware = require('./Core/Middleware');

var _Middleware2 = _interopRequireDefault(_Middleware);

var _Model = require('./Core/Model');

var _Model2 = _interopRequireDefault(_Model);

var _Service = require('./Core/Service');

var _Service2 = _interopRequireDefault(_Service);

var _View = require('./Core/View');

var _View2 = _interopRequireDefault(_View);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
    function _class() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        (0, _classCallCheck3.default)(this, _class);

        //初始化
        this.initialize(options);
        //运行环境检测
        this.checkEnv();
        //加载框架文件
        this.loadFramework();

        //挂载核心类
        THINK.App = _App2.default;
        THINK.Base = _Base2.default;
        THINK.Controller = _Controller2.default;
        THINK.Middleware = _Middleware2.default;
        THINK.Service = _Service2.default;
        THINK.Model = _Model2.default;
        THINK.View = _View2.default;
    }

    /**
     * check node env
     * @return {Boolean} []
     */


    _class.prototype.checkEnv = function checkEnv() {
        this.checkNodeVersion();
        THINK.log('Check Node Version: success', 'THINK');
        this.checkDependencies();
        THINK.log('Check Dependencies: success', 'THINK');
    };

    /**
     * init
     * @param lib
     */


    _class.prototype.initialize = function initialize(options) {
        THINK.log('====================================', 'THINK');
        (0, _defineProperties2.default)(THINK, {
            "ROOT_PATH": { //项目根目录
                value: options.ROOT_PATH,
                writable: false
            },
            "APP_PATH": { //应用目录
                value: options.APP_PATH,
                writable: false
            },
            "RESOURCE_PATH": { //静态资源目录
                value: options.RESOURCE_PATH,
                writable: false
            },
            "RUNTIME_PATH": { //运行缓存目录
                value: options.RUNTIME_PATH,
                writable: false
            },
            "THINK_PATH": { //框架目录
                value: _path2.default.dirname(__dirname),
                writable: false
            }
        });
        THINK.APP_DEBUG = options.APP_DEBUG;
        //项目根目录
        if (!THINK.ROOT_PATH) {
            THINK.log('global.THINK.ROOT_PATH must be defined', 'ERROR');
            process.exit();
        }
        //静态资源目录
        if (!THINK.RESOURCE_PATH) {
            THINK.RESOURCE_PATH = THINK.ROOT_PATH + '/www';
        }
        //应用目录
        if (!THINK.APP_PATH) {
            THINK.APP_PATH = THINK.ROOT_PATH + '/App';
        }
        //DEBUG模式
        if (THINK.APP_DEBUG !== true) {
            THINK.APP_DEBUG = false;
        }
        //运行缓存目录
        if (!THINK.RUNTIME_PATH) {
            THINK.RUNTIME_PATH = THINK.ROOT_PATH + '/Runtime';
        }
        //日志目录
        if (THINK.LOG_PATH === undefined) {
            THINK.LOG_PATH = THINK.RUNTIME_PATH + '/Logs';
        }
        //缓存目录
        if (THINK.TEMP_PATH === undefined) {
            THINK.TEMP_PATH = THINK.RUNTIME_PATH + '/Temp';
        }
        //数据文件目录
        if (THINK.DATA_PATH === undefined) {
            THINK.DATA_PATH = THINK.RUNTIME_PATH + '/Data';
        }
        //文件缓存目录
        if (THINK.CACHE_PATH === undefined) {
            THINK.CACHE_PATH = THINK.RUNTIME_PATH + '/Cache';
        }

        //框架版本
        try {
            var pkgPath = THINK.THINK_PATH + '/package.json';
            var packages = JSON.parse(_fs2.default.readFileSync(pkgPath, 'utf8'));
            THINK.THINK_ENGINES = packages['engines'];
            THINK.THINK_VERSION = packages['version'];
        } catch (e) {
            THINK.THINK_ENGINES = { node: '>4.0.0' };
            THINK.THINK_VERSION = '3.X.X';
        }

        //debug模式 node --debug index.js
        if (THINK.APP_DEBUG || process.execArgv.indexOf('--debug') > -1) {
            THINK.APP_DEBUG = true;
            //waterline打印sql设置
            process.env.LOG_QUERIES = 'true';
        }
        //生产环境
        if (process.execArgv.indexOf('--production') > -1 || process.env.NODE_ENV === 'production') {
            THINK.APP_DEBUG = false;
            process.env.LOG_QUERIES = 'false';
        }
        //连接池类型
        THINK.INSTANCES = { 'DB': {}, 'MEMCACHE': {}, 'REDIS': {}, 'TPLENGINE': {}, 'LOG': null };
        //ORM DBDBCLIENT
        THINK.ORM = {};

        //Cache定时器
        THINK.GC = {};
        THINK.GCTIMER = function (instance) {
            if (THINK.GC[instance.options.gctype]) {
                return;
            }
            THINK.GC[instance.options.gctype] = setInterval(function () {
                var hour = new Date().getHours();
                if (THINK.config('cache_gc_hour').indexOf(hour) === -1) {
                    return;
                }
                return instance.gc && instance.gc(Date.now());
            }, 3600 * 1000);
        };
        //模板变量
        THINK.ViewVar = {};
        //缓存池
        THINK.CACHES = {
            ALIAS: 'alias',
            ALIAS_EXPORT: 'alias_export',
            COLLECTION: 'collection',
            LIMIT: 'limit',
            CONF: 'alias_conf',
            MODEL: 'alias_model',
            EXMIDDLEWARE: [],
            Adapter: {},
            Middleware: {},
            Ext: {},
            Controller: {},
            Model: {},
            Service: {},
            HTTP: _Http2.default,
            DISPATHER: _Dispather2.default,
            WLADAPTER: {} //Waterline adapter
        };
        THINK.log('Initialize: success', 'THINK');
    };

    /**
     * check node version
     * @return {} []
     */


    _class.prototype.checkNodeVersion = function checkNodeVersion() {
        var engines = THINK.THINK_ENGINES;
        var needVersion = engines.node.substr(1);

        var nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        if (needVersion > nodeVersion) {
            THINK.log('ThinkNode need node version >= ' + needVersion + ', current version is ' + nodeVersion + ', please upgrade it.', 'ERROR');
            process.exit();
        }
    };

    /**
     * check dependencies is installed before server start
     * @return {} []
     */


    _class.prototype.checkDependencies = function checkDependencies() {
        var packageFile = THINK.ROOT_PATH + '/package.json';
        if (!THINK.isFile(packageFile)) {
            return;
        }
        var dependencies = {};
        try {
            var data = JSON.parse(_fs2.default.readFileSync(packageFile, 'utf8'));
            dependencies = data.dependencies;
        } catch (e) {}
        for (var pkg in dependencies) {
            if (!THINK.isDir(THINK.ROOT_PATH + '/node_modules/' + pkg)) {
                THINK.log(' package `' + pkg + '` is not installed. please run \'npm install\' command before start server.', 'ERROR');
                process.exit();
            }
        }
    };

    /**
     * load alias
     * @param alias
     * @param g
     */


    _class.prototype.loadAlias = function loadAlias(alias, g) {
        THINK.CACHES[THINK.CACHES.ALIAS] || (THINK.CACHES[THINK.CACHES.ALIAS] = {});
        for (var v in alias) {
            if (THINK.isObject(alias[v])) {
                this.loadAlias(alias[v], v);
            } else {
                if (g) {
                    var _Object$assign2;

                    THINK.CACHES[THINK.CACHES.ALIAS][g] || (THINK.CACHES[THINK.CACHES.ALIAS][g] = {});
                    (0, _assign2.default)(THINK.CACHES[THINK.CACHES.ALIAS][g], (_Object$assign2 = {}, _Object$assign2[v] = alias[v], _Object$assign2));
                } else {
                    var _Object$assign3;

                    (0, _assign2.default)(THINK.CACHES[THINK.CACHES.ALIAS], (_Object$assign3 = {}, _Object$assign3[v] = alias[v], _Object$assign3));
                }
            }
        }
    };

    /**
     * load alias module export
     * @param alias
     * @param exp
     */


    _class.prototype.loadAliasExport = function loadAliasExport(alias) {
        var exp = arguments.length <= 1 || arguments[1] === undefined ? THINK.CACHES.ALIAS_EXPORT : arguments[1];

        alias = alias || THINK.loadCache(THINK.CACHES.ALIAS);
        for (var key in alias) {
            if (THINK.loadCache(exp, key)) {
                continue;
            }
            if (THINK.isObject(alias[key])) {
                this.loadAliasExport(alias[key], key);
            } else {
                THINK.loadCache(exp, key, THINK.safeRequire(alias[key]));
            }
        }
    };

    /**
     * load alias model export
     */


    _class.prototype.loadAliasModel = function loadAliasModel(alias) {
        THINK.loadCache(THINK.CACHES.MODEL, alias, 1);
    };

    /**
     * load external middleware
     */


    _class.prototype.loadExMiddleware = function loadExMiddleware() {
        THINK.CACHES['EXMIDDLEWARE'].forEach(function (item) {
            var tempName = void 0,
                cls = void 0;
            //挂载第三方中间件
            if (THINK.isFunction(item.name)) {
                tempName = THINK.hash(item.name);
                cls = item.name;
                THINK.CACHES['Middleware'][tempName] = item.name;
            } else {
                //内部中间件
                tempName = item.name;
                cls = item.name;
            }
            //挂载中间件链
            if (cls) {
                THINK.HOOK[item.type] || (THINK.HOOK[item.type] = []);
                var oriHooks = [].push(tempName);
                if (item.append === 'prepend') {
                    THINK.HOOK[item.type] = oriHooks.concat(THINK.HOOK[item.type]);
                } else {
                    THINK.HOOK[item.type].push(tempName);
                }
            }
        });
    };

    /**
     * flush alias module export
     */


    _class.prototype.flushAliasExport = function flushAliasExport(g, type, file) {
        g = g || THINK.CACHES.ALIAS_EXPORT;
        file && require.cache[file] && delete require.cache[file];
        THINK.loadCache(g, type, null);
    };

    /**
     * load files
     * @param ext
     * @param callback
     * @param g
     */


    _class.prototype.loadFiles = function loadFiles(ext, callback) {
        var g = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var tempDir = [];
        var subDir = [];
        var tempType = '';
        var tempName = '';
        var tempFile = '';

        var _loop = function _loop(type) {
            (function (t) {
                ext[t] = ext[t] || [];
                ext[t].forEach(function (v) {
                    if (THINK.isDir(v)) {
                        try {
                            tempDir = _fs2.default.readdirSync(v);
                        } catch (e) {
                            tempDir = [];
                        }
                        tempDir.forEach(function (f) {
                            tempFile = v + f;
                            if (THINK.isFile(tempFile) && tempFile.indexOf('.js') === tempFile.length - 3) {
                                tempName = _path2.default.basename(f, '.js');
                                tempType = g === '' ? tempName : g + '/' + tempName;
                                callback(tempType, v + f, type);
                            }
                        });
                    }
                });
            })(type);
        };

        for (var type in ext) {
            _loop(type);
        }
        tempDir = null;
        subDir = null;
        tempType = null;
        tempName = null;
        tempFile = null;
    };

    /**
     * 自动加载框架文件
     */


    _class.prototype.loadFramework = function loadFramework() {
        var _this = this;

        //加载配置
        THINK.CONF = null; //移除之前的所有配置
        THINK.CONF = THINK.safeRequire(THINK.THINK_PATH + '/lib/Conf/config.js');

        //别名文件
        if (THINK.isFile(THINK.THINK_PATH + '/lib/Conf/alias.js')) {
            this.loadAlias(THINK.safeRequire(THINK.THINK_PATH + '/lib/Conf/alias.js'));
        }
        //加载中间件
        THINK.HOOK || (THINK.HOOK = []);
        if (THINK.isFile(THINK.THINK_PATH + '/lib/Conf/hook.js')) {
            THINK.HOOK = THINK.safeRequire(THINK.THINK_PATH + '/lib/Conf/hook.js');
        }
        //加载多语言
        THINK.LANGUAGE = {};
        this.loadFiles({
            'Lang': [THINK.THINK_PATH + '/lib/Conf/Lang/']
        }, function (t, f, g) {
            THINK.LANGUAGE[t] = THINK.LANGUAGE[t] || {};
            THINK.LANGUAGE[t] = THINK.extend(false, THINK.LANGUAGE[t], THINK.safeRequire(f));
        });

        //加载框架类
        this.loadFiles({
            'Adapter': [THINK.THINK_PATH + '/lib/Adapter/Cache/', THINK.THINK_PATH + '/lib/Adapter/Logs/', THINK.THINK_PATH + '/lib/Adapter/Session/', THINK.THINK_PATH + '/lib/Adapter/Socket/', THINK.THINK_PATH + '/lib/Adapter/Template/'],
            'Ext': [THINK.THINK_PATH + '/lib/Extend/Controller/'],
            'Middleware': [THINK.THINK_PATH + '/lib/Middleware/']
        }, function (t, f, g) {
            var _g, _this$loadAlias;

            _this.loadAlias((_this$loadAlias = {}, _this$loadAlias[g] = (_g = {}, _g[t] = f, _g), _this$loadAlias));
        });
        THINK.log('Load ThinkNode Framework: success', 'THINK');
    };

    /**
     * 加载应用
     */


    _class.prototype.loadApp = function loadApp() {
        var _this2 = this;

        //加载应用函数库
        if (THINK.isFile(THINK.APP_PATH + '/Common/Util/function.js')) {
            THINK.safeRequire(THINK.APP_PATH + '/Common/Util/function.js');
        }
        //加载应用配置
        if (THINK.isFile(THINK.APP_PATH + '/Common/Conf/config.js')) {
            THINK.CONF = THINK.extend(false, THINK.CONF, THINK.safeRequire(THINK.APP_PATH + '/Common/Conf/config.js'));
        }
        //加载应用自定义路由
        if (THINK.CONF.url_route_on && THINK.isFile(THINK.APP_PATH + '/Common/Conf/route.js')) {
            THINK.CONF.url_route_rules = THINK.safeRequire(THINK.APP_PATH + '/Common/Conf/route.js');
        }
        //加载应用别名文件
        if (THINK.isFile(THINK.APP_PATH + '/Common/Conf/alias.js')) {
            var appAlias = THINK.safeRequire(THINK.APP_PATH + '/Common/Conf/alias.js');
            for (var n in appAlias) {
                if (THINK.loadCache(THINK.CACHES.ALIAS, n)) {
                    THINK.log('App alias ' + appAlias[n] + ' definition contains a reserved keyword', 'WARNING');
                    delete appAlias[n];
                } else {
                    this.flushAliasExport('', n, appAlias[n]);
                }
            }
            this.loadAlias(appAlias);
        }
        //加载应用多语言
        this.loadFiles({
            'Lang': [THINK.APP_PATH + '/Common/Conf/Lang/']
        }, function (t, f, g) {
            THINK.LANGUAGE[t] = THINK.LANGUAGE[t] || {};
            THINK.LANGUAGE[t] = THINK.extend(false, THINK.LANGUAGE[t], THINK.safeRequire(f));
        });
        //加载应用公共类
        this.loadFiles({
            'Adapter': [THINK.APP_PATH + '/Common/Adapter/'],
            'Controller': [THINK.APP_PATH + '/Common/Controller/'],
            'Middleware': [THINK.APP_PATH + '/Common/Middleware/'],
            'Model': [THINK.APP_PATH + '/Common/Model/'],
            'Service': [THINK.APP_PATH + '/Common/Service/']
        }, function (t, f, g) {
            var _g2, _this2$loadAlias;

            _this2.flushAliasExport(g, t, f);
            _this2.loadAlias((_this2$loadAlias = {}, _this2$loadAlias[g] = (_g2 = {}, _g2[t] = f, _g2), _this2$loadAlias));
            if (g === 'Model') {
                _this2.loadAliasModel(t);
            }
        }, 'Common');

        //解析应用模块列表
        return this.parseMoudleList();
    };

    /**
     * 解析应用模块列表
     */


    _class.prototype.parseMoudleList = function parseMoudleList() {
        var self = this;
        var filePath = THINK.APP_PATH;
        if (!THINK.isDir(filePath)) {
            var groupList = THINK.CONF.app_group_list.map(function (item) {
                return item.toLowerCase();
            });
            THINK.CONF.app_group_list = groupList;
            return;
        }
        var dirs = _fs2.default.readdirSync(filePath);
        //禁止访问的分组
        var denyDirs = THINK.CONF.deny_group_list;
        var result = [];
        dirs.forEach(function (dir) {
            if (denyDirs.find(function (d) {
                if (d.toLowerCase() === dir.toLowerCase()) {
                    return false;
                } else {
                    return true;
                }
            })) {
                result.push(dir.toLowerCase());
                //加载模块类
                self.loadMoudleFiles(dir);
            }
        });

        THINK.CONF.app_group_list = THINK.arrUnique(THINK.CONF.app_group_list.concat(result));
        return _promise2.default.resolve();
    };

    /**
     * 加载模块文件
     * @param group
     */


    _class.prototype.loadMoudleFiles = function loadMoudleFiles(group) {
        var _this3 = this;

        //加载模块类
        this.loadFiles({
            'Controller': [THINK.APP_PATH + '/' + group + '/Controller/'],
            'Middleware': [THINK.APP_PATH + '/' + group + '/Middleware/'],
            'Model': [THINK.APP_PATH + '/' + group + '/Model/'],
            'Service': [THINK.APP_PATH + '/' + group + '/Service/']
        }, function (t, f, g) {
            var _g3, _this3$loadAlias;

            _this3.flushAliasExport(g, t, f);
            _this3.loadAlias((_this3$loadAlias = {}, _this3$loadAlias[g] = (_g3 = {}, _g3[t] = f, _g3), _this3$loadAlias));
            if (g === 'Model') {
                _this3.loadAliasModel(t);
            }
        }, group);
    };

    /**
     * 初始化应用数据模型
     */


    _class.prototype.initModel = function initModel() {
        //Waterline adapter
        THINK.CACHES.WLADAPTER = {
            'mysql': THINK.require('sails-mysql')
        };
        var modelCache = THINK.loadCache(THINK.CACHES.MODEL);
        if (!THINK.isEmpty(modelCache)) {
            //循环加载模型到collections
            var ps = [];
            for (var v in modelCache) {
                var k = v.endsWith('/') ? null : v;
                if (k) {
                    ps.push(THINK.model('' + k, {}).setCollection());
                }
            }
            return _promise2.default.all(ps).then(function () {
                //初始化数据源连接池
                return new THINK.Model().setConnection();
            });
        }
        return _promise2.default.resolve();
    };

    /**
     * debug模式文件重载
     */


    _class.prototype.autoReload = function autoReload() {
        var _this4 = this;

        setInterval(function () {
            _this4.loadApp();
        }, 1000);
    };

    /**
     * 注册异常处理
     */


    _class.prototype.captureError = function captureError() {
        process.on('uncaughtException', function (err) {
            var msg = err.message;
            THINK.log(err, 'ERROR');
            if (/EADDRINUSE/.test(msg)) {
                process.exit();
            }
        });
    };

    /**
     * 运行
     */


    _class.prototype.run = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return this.loadApp();

                        case 2:
                            THINK.log('Load App Moudle: success', 'THINK');
                            //加载挂载的中间件
                            this.loadExMiddleware();
                            //初始化应用模型
                            _context.next = 6;
                            return this.initModel().catch(function (e) {
                                THINK.log('Initialize App Model error: ' + e.stack, 'ERROR');
                                process.exit();
                            });

                        case 6:
                            THINK.log('Initialize App Model: success', 'THINK');
                            //日志监听
                            THINK.INSTANCES.LOG || (THINK.INSTANCES.LOG = THINK.adapter(THINK.CONF.log_type + 'Logs'));
                            if (THINK.CONF.log_loged) {
                                new THINK.INSTANCES.LOG().logConsole();
                            }
                            if (THINK.APP_DEBUG) {
                                //debug模式
                                this.autoReload();
                            } else {
                                //缓存对象
                                this.loadAliasExport();
                                //异常拦截
                                this.captureError();
                            }
                            //运行应用
                            return _context.abrupt('return', THINK.App.run());

                        case 11:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function run() {
            return _ref.apply(this, arguments);
        }

        return run;
    }();

    return _class;
}(); /**
      *
      * @author     richen
      * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
      * @license    MIT
      * @version    15/11/19
      */


exports.default = _class;