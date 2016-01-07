/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

require('./Common/common');

require('./Common/function');

var _LibThinkApp = require('./Lib/Think/App');

var _LibThinkApp2 = _interopRequireDefault(_LibThinkApp);

var _LibThinkController = require('./Lib/Think/Controller');

var _LibThinkController2 = _interopRequireDefault(_LibThinkController);

var _LibThinkModel = require('./Lib/Think/Model');

var _LibThinkModel2 = _interopRequireDefault(_LibThinkModel);

var _LibThinkService = require('./Lib/Think/Service');

var _LibThinkService2 = _interopRequireDefault(_LibThinkService);

var _LibThinkLogic = require('./Lib/Think/Logic');

var _LibThinkLogic2 = _interopRequireDefault(_LibThinkLogic);

var _LibThinkBehavior = require('./Lib/Think/Behavior');

var _LibThinkBehavior2 = _interopRequireDefault(_LibThinkBehavior);

var _LibThinkView = require('./Lib/Think/View');

var _LibThinkView2 = _interopRequireDefault(_LibThinkView);

var _default = (function () {
    function _default() {
        _classCallCheck(this, _default);

        //运行环境检测
        this.checkEnv();
        //初始化
        this.initialize();
        //加载核心
        this.loadCore();
        //加载框架文件
        THINK.Ext = {};
        this.loadFramework();
        //缓存框架
        this.loadAliasExport();
        //挂载核心类
        THINK.Behavior = _LibThinkBehavior2['default'];
        THINK.Controller = _LibThinkController2['default'];
        THINK.Service = _LibThinkService2['default'];
        THINK.Logic = _LibThinkLogic2['default'];
        THINK.Model = _LibThinkModel2['default'];
        THINK.View = _LibThinkView2['default'];
    }

    /**
     * check node env
     * @return {Boolean} []
     */

    _default.prototype.checkEnv = function checkEnv() {
        P('====================================', 'THINK');
        this.checkNodeVersion();
        P('Check Node Version: success', 'THINK');
        this.checkDependencies();
        P('Check Dependencies: success', 'THINK');
    };

    /**
     * init
     */

    _default.prototype.initialize = function initialize() {

        if (!global.THINK) {
            global.THINK = {};
        }
        //项目根目录
        if (!THINK.ROOT_PATH) {
            P(new Error('global.THINK.ROOT_PATH must be defined'));
        }
        //静态资源目录
        if (THINK.RESOURCE_PATH === undefined) {
            THINK.RESOURCE_PATH = THINK.ROOT_PATH + '/www';
        }

        //应用目录
        if (THINK.APP_PATH === undefined) {
            THINK.APP_PATH = THINK.ROOT_PATH + '/App';
        }

        //框架目录
        if (THINK.THINK_PATH === undefined) {
            THINK.THINK_PATH = __dirname;
        }
        //DEBUG模式
        if (THINK.APP_DEBUG === undefined) {
            THINK.APP_DEBUG = false;
        }
        //框架核心目录
        if (THINK.CORE_PATH === undefined) {
            THINK.CORE_PATH = THINK.THINK_PATH + '/Lib/Think';
        }
        //运行缓存目录
        if (THINK.RUNTIME_PATH === undefined) {
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

        if (THINK.DATA_PATH === undefined) {
            THINK.DATA_PATH = THINK.RUNTIME_PATH + '/Data';
        }

        if (THINK.CACHE_PATH === undefined) {
            THINK.CACHE_PATH = THINK.RUNTIME_PATH + '/Cache';
        }

        //框架版本
        try {
            var pkgPath = _path2['default'].dirname(THINK.THINK_PATH) + '/package.json';
            THINK.THINK_VERSION = JSON.parse(_fs2['default'].readFileSync(pkgPath, 'utf8')).version;
        } catch (e) {
            THINK.THINK_VERSION = '0.0.0';
        }

        //运行模式
        THINK.APP_MODE = THINK.APP_MODE || '';

        //debug模式 node --debug index.js
        if (THINK.APP_DEBUG || process.execArgv.indexOf('--debug') > -1) {
            THINK.APP_DEBUG = true;
            THINK.APP_MODE = 'debug';
            //waterline打印sql设置
            process.env.LOG_QUERIES = 'true';
        }
        //生产环境
        if (process.execArgv.indexOf('--production') > -1 || process.env.NODE_ENV === 'production') {
            THINK.APP_DEBUG = false;
            process.env.LOG_QUERIES = 'false';
        }
        //命令行模式
        if (process.argv[2] && !/^\d+$/.test(process.argv[2])) {
            THINK.APP_MODE = 'cli';
        }
        //连接池
        THINK.INSTANCES = { 'DB': {}, 'MEMCACHE': {}, 'REDIS': {} };
        //ORM DBDBCLIENT
        THINK.ORM = {};

        //Cache定时器
        THINK.GC = {};
        THINK.GCTIMER = function (instance) {
            if (THINK.APP_DEBUG || THINK.APP_MODE === 'cli' || THINK.GC[instance.options.gctype]) {
                return;
            }
            THINK.GC[instance.options.gctype] = setInterval(function () {
                var hour = new Date().getHours();
                if (C('cache_gc_hour').indexOf(hour) === -1) {
                    return;
                }
                return instance.gc && instance.gc(Date.now());
            }, 3600 * 1000);
        };
        P('Initialize Core variable: success', 'THINK');
    };

    /**
     * check node version
     * @return {} []
     */

    _default.prototype.checkNodeVersion = function checkNodeVersion() {
        var packageFile = THINK.ROOT_PATH + '/node_modules/thinknode/package.json';

        var _JSON$parse = JSON.parse(_fs2['default'].readFileSync(packageFile, 'utf-8'));

        var engines = _JSON$parse.engines;

        var needVersion = engines.node.substr(2);

        var nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }

        if (needVersion > nodeVersion) {
            P(new Error('ThinkNode need node version >= ' + needVersion + ', current version is ' + nodeVersion + ', please upgrade it.'));
            console.log();
            process.exit();
        }
    };

    /**
     * check dependencies is installed before server start
     * @return {} []
     */

    _default.prototype.checkDependencies = function checkDependencies() {
        var packageFile = THINK.ROOT_PATH + '/package.json';
        if (!isFile(packageFile)) {
            return;
        }
        var data = JSON.parse(_fs2['default'].readFileSync(packageFile, 'utf8'));
        var dependencies = data.dependencies;
        for (var pkg in dependencies) {
            if (isDir(THINK.ROOT_PATH + '/node_modules/' + pkg)) {
                continue;
            }
            try {
                require(pkg);
            } catch (e) {
                P(new Error(' package `' + pkg + '` is not installed. please run \'npm install\' command before start server.'));
                console.log();
                process.exit();
            }
        }
    };

    /**
     * load alias
     * @param alias
     */

    _default.prototype.loadAlias = function loadAlias(alias) {
        for (var v in alias) {
            thinkCache(thinkCache.ALIAS, v, alias[v]);
        }
    };

    /**
     * load alias module export
     */

    _default.prototype.loadAliasExport = function loadAliasExport() {
        var alias = thinkCache(thinkCache.ALIAS);
        for (var key in alias) {
            if (thinkCache(thinkCache.ALIAS_EXPORT, key)) {
                continue;
            }
            thinkCache(thinkCache.ALIAS_EXPORT, key, thinkRequire(key));
        }
    };

    /**
     * load alias model export
     */

    _default.prototype.loadAliasModel = function loadAliasModel(alias) {
        thinkCache(thinkCache.MODEL, alias, 1);
    };

    /**
     * flush alias
     */

    _default.prototype.flushAlias = function flushAlias(type) {
        thinkCache(thinkCache.ALIAS, type, null);
    };

    /**
     * flush alias module export
     */

    _default.prototype.flushAliasExport = function flushAliasExport(type) {
        thinkCache(thinkCache.ALIAS_EXPORT, type, null);
    };

    /**
     * load files
     * @param ext
     * @param callback
     * @param g
     */

    _default.prototype.loadFiles = function loadFiles(ext, callback) {
        var g = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var tempDir = [];
        var tempType = '';
        var tempName = '';

        var _loop = function (type) {
            (function (t) {
                ext[t] = ext[t] || [];
                ext[t].forEach(function (v) {
                    if (isDir(v)) {
                        try {
                            tempDir = _fs2['default'].readdirSync(v);
                        } catch (e) {
                            tempDir = [];
                        }
                        tempDir.forEach(function (f) {
                            if (isFile(v + f) && (v + f).indexOf('.js') > -1) {
                                tempName = f.replace(/\.js/, '');
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
        tempType = null;
        tempName = null;
    };

    /**
     * load files
     */

    _default.prototype.loadExt = function loadExt() {
        var extDir = THINK.THINK_PATH + '/Lib/Extend';
        var tempDir = [];
        var fileDir = [];
        var tempName = '';

        try {
            tempDir = _fs2['default'].readdirSync(extDir);
        } catch (e) {
            tempDir = [];
        }
        tempDir.forEach(function (dir) {
            try {
                fileDir = _fs2['default'].readdirSync(extDir + '/' + dir + '/');
            } catch (e) {
                fileDir = [];
            }
            fileDir.forEach(function (file) {
                if (isFile(extDir + '/' + dir + '/' + file) && (extDir + '/' + dir + '/' + file).indexOf('.js') > -1) {
                    tempName = file.replace(/\.js/, '');
                    //THINK.Ext[dir] = {};
                    //THINK.Ext[dir][tempName] = thinkRequire(`${extDir}/${dir}/${file}`);
                    THINK.Ext[tempName] = thinkRequire(extDir + '/' + dir + '/' + file);
                }
            });
        });
        extDir = null;
        tempDir = null;
        fileDir = null;
        tempName = null;
    };

    /**
     * 加载核心
     */

    _default.prototype.loadCore = function loadCore() {
        var core = {
            'Http': THINK.CORE_PATH + '/Http.js',
            'App': THINK.CORE_PATH + '/App.js',
            'Dispatcher': THINK.CORE_PATH + '/Dispatcher.js',
            'Controller': THINK.CORE_PATH + '/Controller.js',
            'Behavior': THINK.CORE_PATH + '/Behavior.js',
            'Model': THINK.CORE_PATH + '/Model.js',
            'View': THINK.CORE_PATH + '/View.js',
            'Cache': THINK.CORE_PATH + '/Cache.js',
            'Session': THINK.CORE_PATH + '/Session.js',
            'Log': THINK.CORE_PATH + '/Log.js'
        };
        this.loadAlias(core);
        P('Load ThinkNode Core: success', 'THINK');
    };

    /**
     * 自动加载框架文件
     */

    _default.prototype.loadFramework = function loadFramework() {
        var _this = this;

        //加载配置
        C(null); //移除之前的所有配置
        THINK.CONF = require(THINK.THINK_PATH + '/Conf/config.js');
        //模式声明
        THINK.MODEL = [];
        //加载模式配置文件
        if (THINK.APP_MODE) {
            var modeFiles = [THINK.THINK_PATH + '/Conf/mode.js', THINK.APP_PATH + '/Common/conf/mode.js'];
            modeFiles.forEach(function (file) {
                if (!isFile(file)) {
                    return;
                }
                var conf = safeRequire(file);
                if (conf[THINK.APP_MODE]) {
                    THINK.CONF = extend(false, THINK.CONF, conf[THINK.APP_MODE]);
                }
            });
        }
        //别名文件
        if (isFile(THINK.THINK_PATH + '/Conf/alias.js')) {
            this.loadAlias(require(THINK.THINK_PATH + '/Conf/alias.js'));
        }
        //加载标签行为
        if (isFile(THINK.THINK_PATH + '/Conf/tag.js')) {
            THINK.CONF.tag = require(THINK.THINK_PATH + '/Conf/tag.js');
        }
        //加载多语言
        THINK.LANG = {};
        this.loadFiles({
            'Lang': [THINK.THINK_PATH + '/Lang/']
        }, function (t, f, g) {
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = extend(false, THINK.LANG[t], safeRequire(f));
        });

        //加载框架类
        this.loadFiles({
            'Behavior': [THINK.THINK_PATH + '/Lib/Behavior/'],
            'Cache': [THINK.THINK_PATH + '/Lib/Driver/Cache/'],
            'Log': [THINK.THINK_PATH + '/Lib/Driver/Log/'],
            'Session': [THINK.THINK_PATH + '/Lib/Driver/Session/'],
            'Template': [THINK.THINK_PATH + '/Lib/Driver/Template/']
        }, function (t, f, g) {
            var _loadAlias;

            _this.loadAlias((_loadAlias = {}, _loadAlias[t] = f, _loadAlias));
        });

        //加载框架扩展
        this.loadExt();

        P('Load ThinkNode Framework files: success', 'THINK');
    };

    /**
     * 加载应用
     */

    _default.prototype.loadMoudles = function loadMoudles() {
        var _this2 = this;

        //加载应用函数库
        if (isFile(THINK.APP_PATH + '/Common/Common/function.js')) {
            require(THINK.APP_PATH + '/Common/Common/function.js');
        }
        //加载应用公共配置
        if (isFile(THINK.APP_PATH + '/Common/Conf/config.js')) {
            THINK.CONF = extend(false, THINK.CONF, require(THINK.APP_PATH + '/Common/Conf/config.js'));
        }
        //加载应用自定义路由
        if (THINK.CONF.url_route_on && isFile(THINK.APP_PATH + '/Common/Conf/route.js')) {
            THINK.CONF.url_route_rules = require(THINK.APP_PATH + '/Common/Conf/route.js');
        }
        //加载应用别名文件
        if (isFile(THINK.APP_PATH + '/Common/Conf/alias.js')) {
            this.loadAlias(require(THINK.APP_PATH + '/Common/Conf/alias.js'));
        }
        //加载应用标签行为
        if (isFile(THINK.APP_PATH + '/Common/Conf/tag.js')) {
            THINK.CONF.tag = extend(false, THINK.CONF.tag, require(THINK.APP_PATH + '/Common/Conf/tag.js'));
        }
        //加载应用多语言
        this.loadFiles({
            'Lang': [THINK.APP_PATH + '/Common/Lang/']
        }, function (t, f, g) {
            _this2.flushAlias(t);
            _this2.flushAliasExport(t);
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = extend(false, THINK.LANG[t], safeRequire(f));
        });

        //加载应用公共类
        this.loadFiles({
            'Behavior': [THINK.APP_PATH + '/Common/Behavior/'],
            'Controller': [THINK.APP_PATH + '/Common/Controller/'],
            'Model': [THINK.APP_PATH + '/Common/Model/'],
            'Logic': [THINK.APP_PATH + '/Common/Logic/'],
            'Service': [THINK.APP_PATH + '/Common/Service/']
        }, function (t, f, g) {
            var _loadAlias2;

            _this2.flushAlias(t);
            _this2.flushAliasExport(t);
            _this2.loadAlias((_loadAlias2 = {}, _loadAlias2[t] = f, _loadAlias2));
            if (g === 'Model') {
                _this2.loadAliasModel(t);
            }
        }, 'Common');
        //解析应用模块列表
        this.parseMoudleList();
    };

    /**
     * 解析应用模块列表
     */

    _default.prototype.parseMoudleList = function parseMoudleList() {
        var self = this;
        var filePath = THINK.APP_PATH;
        if (!isDir(filePath)) {
            var groupList = THINK.CONF.app_group_list.map(function (item) {
                return item.toLowerCase();
            });
            THINK.CONF.app_group_list = groupList;
            return;
        }
        var dirs = _fs2['default'].readdirSync(filePath);
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

        THINK.CONF.app_group_list = extend(false, THINK.CONF.app_group_list, result);
    };

    /**
     * 加载模块文件
     * @param group
     */

    _default.prototype.loadMoudleFiles = function loadMoudleFiles(group) {
        var _this3 = this;

        //加载模块配置
        if (isFile(THINK.APP_PATH + '/' + group + '/Conf/config.js')) {
            THINK.CONF[group] = require(THINK.APP_PATH + '/' + group + '/Conf/config.js');
        }
        //加载模块类
        this.loadFiles({
            'Behavior': [THINK.APP_PATH + '/' + group + '/Behavior/'],
            'Controller': [THINK.APP_PATH + '/' + group + '/Controller/'],
            'Model': [THINK.APP_PATH + '/' + group + '/Model/'],
            'Logic': [THINK.APP_PATH + '/' + group + '/Logic/'],
            'Service': [THINK.APP_PATH + '/' + group + '/Service/']
        }, function (t, f, g) {
            var _loadAlias3;

            _this3.flushAlias(t);
            _this3.flushAliasExport(t);
            _this3.loadAlias((_loadAlias3 = {}, _loadAlias3[t] = f, _loadAlias3));
            if (g === 'Model') {
                _this3.loadAliasModel(t);
            }
        }, group);
    };

    /**
     * 加载应用模型
     */

    _default.prototype.loadModels = function loadModels() {
        var modelCache = thinkCache(thinkCache.MODEL);
        if (!isEmpty(modelCache)) {
            for (var v in modelCache) {
                (function (s) {
                    try {
                        var k = s.indexOf('Model') === s.length - 5 ? s.substr(0, s.length - 5) : s;
                        var _model = D('' + k);
                        _model.setCollections(true);
                    } catch (e) {
                        E(e, false);
                    }
                })(v);
            }
            //ORM初始化
            try {
                new _LibThinkModel2['default']().initDb();
            } catch (e) {
                P(new Error('Initialize App Model error: ' + e));
            }
            P('Initialize App Model: success', 'THINK');
        }
    };

    /**
     * debug模式文件重载
     */

    _default.prototype.debug = function debug() {
        var _this4 = this;

        //清除require的缓存
        if (THINK.CONF.clear_require_cache) {
            (function () {
                //这些文件不清除缓存
                var retainFiles = THINK.CONF.debug_retain_files;
                setInterval(function () {
                    var _loop2 = function (file) {
                        var flag = retainFiles.find(function (item) {
                            //windows目录定界符为\
                            if (process.platform === 'win32') {
                                item = item.replace(/\//g, '\\');
                            }
                            if (file.indexOf(item) > -1) {
                                return true;
                            }
                        });
                        if (!flag) {
                            delete require.cache[file];
                        }
                    };

                    for (var file in require.cache) {
                        _loop2(file);
                    }
                    _this4.loadMoudles();
                }, 1000);
            })();
        }
    };

    /**
     * 注册异常处理
     */

    _default.prototype.captureError = function captureError() {
        process.on('uncaughtException', function (err) {
            var msg = err.message;
            P(err, 'ERROR');
            if (msg.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    };

    /**
     * 日志拦截
     */

    _default.prototype.log = function log() {
        //是否记录日志
        if (THINK.CONF.log_loged) {
            var cls = thinkRequire(THINK.CONF.log_type + 'Log');
            new cls().logConsole();
        }
    };

    /**
     * 运行
     */

    _default.prototype.run = function run() {
        return _regeneratorRuntime.async(function run$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    //加载应用文件
                    this.loadMoudles();
                    P('Load App Moudle: success', 'THINK');
                    //debug模式
                    if (THINK.APP_DEBUG) {
                        this.debug();
                    } else {
                        this.captureError();
                    }
                    //日志拦截
                    this.log();
                    //加载应用模型
                    context$2$0.next = 6;
                    return _regeneratorRuntime.awrap(this.loadModels());

                case 6:
                    return context$2$0.abrupt('return', new _LibThinkApp2['default']().run());

                case 7:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];

//运行应用