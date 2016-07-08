'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _App = require('./Core/App');

var _App2 = _interopRequireDefault(_App);

var _Behavior = require('./Core/Behavior');

var _Behavior2 = _interopRequireDefault(_Behavior);

var _Middleware = require('./Core/Middleware');

var _Middleware2 = _interopRequireDefault(_Middleware);

var _Controller = require('./Core/Controller');

var _Controller2 = _interopRequireDefault(_Controller);

var _Logic = require('./Core/Logic');

var _Logic2 = _interopRequireDefault(_Logic);

var _Model = require('./Core/Model');

var _Model2 = _interopRequireDefault(_Model);

var _Service = require('./Core/Service');

var _Service2 = _interopRequireDefault(_Service);

var _View = require('./Core/View');

var _View2 = _interopRequireDefault(_View);

var _Lib = require('./Util/Lib');

var _Lib2 = _interopRequireDefault(_Lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class {
    constructor() {
        let options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        if (!global.THINK) {
            global.THINK = {};
        }
        global.THINK = _Lib2.default.extend(false, {
            ROOT_PATH: options.ROOT_PATH,
            APP_PATH: options.APP_PATH,
            RESOURCE_PATH: options.RESOURCE_PATH,
            RUNTIME_PATH: options.RUNTIME_PATH,
            APP_DEBUG: options.APP_DEBUG
        }, _Lib2.default, global.THINK);
        //初始化
        this.initialize(options);
        //运行环境检测
        this.checkEnv();
        //加载框架文件
        this.loadFramework();

        //挂载核心类
        THINK.App = _App2.default;
        THINK.Behavior = _Behavior2.default;
        THINK.Controller = _Controller2.default;
        THINK.Middleware = _Middleware2.default;
        THINK.Service = _Service2.default;
        THINK.Logic = _Logic2.default;
        THINK.Model = _Model2.default;
        THINK.View = _View2.default;
    }

    /**
     * check node env
     * @return {Boolean} []
     */
    checkEnv() {
        this.checkNodeVersion();
        THINK.cPrint('Check Node Version: success', 'THINK');
        this.checkDependencies();
        THINK.cPrint('Check Dependencies: success', 'THINK');
    }

    /**
     * init
     * @param lib
     */
    initialize() {
        THINK.cPrint('====================================', 'THINK');

        //项目根目录
        if (!THINK.ROOT_PATH) {
            THINK.cPrint('global.THINK.ROOT_PATH must be defined', 'ERROR');
            process.exit();
        }
        //静态资源目录
        if (!THINK.RESOURCE_PATH) {
            THINK.RESOURCE_PATH = `${ THINK.ROOT_PATH }/www`;
        }
        //应用目录
        if (!THINK.APP_PATH) {
            THINK.APP_PATH = `${ THINK.ROOT_PATH }/App`;
        }
        //DEBUG模式
        if (THINK.APP_DEBUG !== true) {
            THINK.APP_DEBUG = false;
        }
        //运行缓存目录
        if (!THINK.RUNTIME_PATH) {
            THINK.RUNTIME_PATH = `${ THINK.ROOT_PATH }/Runtime`;
        }
        //日志目录
        if (THINK.LOG_PATH === undefined) {
            THINK.LOG_PATH = `${ THINK.RUNTIME_PATH }/Logs`;
        }
        //缓存目录
        if (THINK.TEMP_PATH === undefined) {
            THINK.TEMP_PATH = `${ THINK.RUNTIME_PATH }/Temp`;
        }
        //数据文件目录
        if (THINK.DATA_PATH === undefined) {
            THINK.DATA_PATH = `${ THINK.RUNTIME_PATH }/Data`;
        }
        //文件缓存目录
        if (THINK.CACHE_PATH === undefined) {
            THINK.CACHE_PATH = `${ THINK.RUNTIME_PATH }/Cache`;
        }

        //框架版本
        try {
            let pkgPath = `${ THINK.THINK_PATH }/package.json`;
            THINK.THINK_PACKAGE = JSON.parse(_fs2.default.readFileSync(pkgPath, 'utf8'));
            THINK.THINK_VERSION = THINK.THINK_PACKAGE['version'];
        } catch (e) {
            THINK.THINK_PACKAGE = {};
            THINK.THINK_VERSION = '0.0.0';
        }

        //运行模式
        THINK.APP_MODE = THINK.APP_MODE || 'production';

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
            THINK.APP_MODE = 'production';
            process.env.LOG_QUERIES = 'false';
        }
        //连接池类型
        THINK.INSTANCES = { 'DB': {}, 'MEMCACHE': {}, 'REDIS': {}, 'TPLENGINE': {}, 'LOG': null };
        //ORM DBDBCLIENT
        THINK.ORM = {};

        //Cache定时器
        THINK.GC = {};
        THINK.GCTIMER = instance => {
            if (THINK.GC[instance.options.gctype]) {
                return;
            }
            THINK.GC[instance.options.gctype] = setInterval(() => {
                var hour = new Date().getHours();
                if (THINK.C('cache_gc_hour').indexOf(hour) === -1) {
                    return;
                }
                return instance.gc && instance.gc(Date.now());
            }, 3600 * 1000);
        };
        //缓存池
        THINK.CACHES = {
            ALIAS: 'alias',
            ALIAS_EXPORT: 'alias_export',
            COLLECTION: 'collection',
            LIMIT: 'limit',
            CONF: 'alias_conf',
            MODEL: 'alias_model',
            Adapter: {},
            Middleware: {},
            Ext: {},
            Controller: {},
            Logic: {},
            Model: {},
            Service: {}
        };
        THINK.cPrint('Initialize: success', 'THINK');
    }

    /**
     * check node version
     * @return {} []
     */
    checkNodeVersion() {
        let engines = THINK.THINK_PACKAGE['engines'];
        let needVersion = engines.node.substr(1);

        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        if (needVersion > nodeVersion) {
            THINK.cPrint(`ThinkNode need node version >= ${ needVersion }, current version is ${ nodeVersion }, please upgrade it.`, 'ERROR');
            process.exit();
        }
    }

    /**
     * check dependencies is installed before server start
     * @return {} []
     */
    checkDependencies() {
        let packageFile = `${ THINK.ROOT_PATH }/package.json`;
        if (!THINK.isFile(packageFile)) {
            return;
        }
        let data = JSON.parse(_fs2.default.readFileSync(packageFile, 'utf8'));
        let dependencies = data.dependencies;
        for (let pkg in dependencies) {
            if (!THINK.isDir(`${ THINK.ROOT_PATH }/node_modules/${ pkg }`)) {
                THINK.cPrint(` package \`${ pkg }\` is not installed. please run 'npm install' command before start server.`, 'ERROR');
                process.exit();
            }
        }
    }

    /**
     * load alias
     * @param alias
     * @param g
     */
    loadAlias(alias, g) {
        THINK.CACHES[THINK.CACHES.ALIAS] || (THINK.CACHES[THINK.CACHES.ALIAS] = {});
        for (let v in alias) {
            if (THINK.isObject(alias[v])) {
                this.loadAlias(alias[v], v);
            } else {
                if (g) {
                    THINK.CACHES[THINK.CACHES.ALIAS][g] || (THINK.CACHES[THINK.CACHES.ALIAS][g] = {});
                    (0, _assign2.default)(THINK.CACHES[THINK.CACHES.ALIAS][g], { [v]: alias[v] });
                } else {
                    (0, _assign2.default)(THINK.CACHES[THINK.CACHES.ALIAS], { [v]: alias[v] });
                }
            }
        }
    }

    /**
     * load alias module export
     * @param alias
     * @param exp
     */
    loadAliasExport(alias) {
        let exp = arguments.length <= 1 || arguments[1] === undefined ? THINK.CACHES.ALIAS_EXPORT : arguments[1];

        alias = alias || THINK.thinkCache(THINK.CACHES.ALIAS);
        for (let key in alias) {
            if (THINK.thinkCache(exp, key)) {
                continue;
            }
            if (THINK.isObject(alias[key])) {
                this.loadAliasExport(alias[key], key);
            } else {
                THINK.thinkCache(exp, key, THINK.safeRequire(alias[key]));
            }
        }
    }

    /**
     * load alias model export
     */
    loadAliasModel(alias) {
        THINK.thinkCache(THINK.CACHES.MODEL, alias, 1);
    }

    /**
     * flush alias
     */
    flushAlias(type) {
        THINK.thinkCache(THINK.CACHES.ALIAS, type, null);
    }

    /**
     * flush alias module export
     */
    flushAliasExport(type) {
        THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, type, null);
    }

    /**
     * load files
     * @param ext
     * @param callback
     * @param g
     */
    loadFiles(ext, callback) {
        let g = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        let tempDir = [];
        let subDir = [];
        let tempType = '';
        let tempName = '';

        for (let type in ext) {
            (function (t) {
                ext[t] = ext[t] || [];
                ext[t].forEach(v => {
                    if (THINK.isDir(v)) {
                        try {
                            tempDir = _fs2.default.readdirSync(v);
                        } catch (e) {
                            tempDir = [];
                        }
                        tempDir.forEach(f => {
                            if (THINK.isFile(v + f) && (v + f).indexOf('.js') > -1) {
                                tempName = f.replace(/\.js/, '');
                                tempType = g === '' ? tempName : `${ g }/${ tempName }`;
                                callback(tempType, v + f, type);
                            }
                        });
                    }
                });
            })(type);
        }
        tempDir = null;
        subDir = null;
        tempType = null;
        tempName = null;
    }

    /**
     * 自动加载框架文件
     */
    loadFramework() {
        //加载函数库
        THINK.safeRequire(`${ THINK.THINK_PATH }/lib/Common/function.js`);

        //加载配置
        THINK.CONF = null; //移除之前的所有配置
        THINK.CONF = THINK.safeRequire(`${ THINK.THINK_PATH }/lib/Conf/config.js`);

        //加载模式配置文件
        if (THINK.APP_MODE) {
            let modeFiles = [`${ THINK.THINK_PATH }/lib/Conf/mode.js`, `${ THINK.APP_PATH }/Common/conf/mode.js`];
            modeFiles.forEach(function (file) {
                if (!THINK.isFile(file)) {
                    return;
                }
                let conf = THINK.safeRequire(file);
                if (conf[THINK.APP_MODE]) {
                    THINK.CONF = THINK.extend(false, THINK.CONF, conf[THINK.APP_MODE]);
                }
            });
        }
        //别名文件
        if (THINK.isFile(`${ THINK.THINK_PATH }/lib/Conf/alias.js`)) {
            this.loadAlias(THINK.safeRequire(`${ THINK.THINK_PATH }/lib/Conf/alias.js`));
        }
        //加载中间件
        THINK.HOOK || (THINK.HOOK = []);
        if (THINK.isFile(`${ THINK.THINK_PATH }/lib/Conf/hook.js`)) {
            THINK.HOOK = THINK.safeRequire(`${ THINK.THINK_PATH }/lib/Conf/hook.js`);
        }
        //加载多语言
        THINK.LANG = {};
        this.loadFiles({
            'Lang': [`${ THINK.THINK_PATH }/lib/Lang/`]
        }, (t, f, g) => {
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = THINK.extend(false, THINK.LANG[t], THINK.safeRequire(f));
        });

        //加载框架类
        this.loadFiles({
            'Adapter': [`${ THINK.THINK_PATH }/lib/Adapter/Cache/`, `${ THINK.THINK_PATH }/lib/Adapter/Logs/`, `${ THINK.THINK_PATH }/lib/Adapter/Session/`, `${ THINK.THINK_PATH }/lib/Adapter/Template/`],
            'Ext': [`${ THINK.THINK_PATH }/lib/Extend/Controller/`],
            'Middleware': [`${ THINK.THINK_PATH }/lib/Middleware/`]
        }, (t, f, g) => {
            this.loadAlias({ [g]: { [t]: f } });
        });
        THINK.Ext = THINK.CACHES.Ext;
        THINK.cPrint('Load ThinkNode Framework: success', 'THINK');
    }

    /**
     * 加载应用
     */
    loadApp() {
        //加载应用函数库
        if (THINK.isFile(`${ THINK.APP_PATH }/Common/Common/function.js`)) {
            let appFunc = THINK.safeRequire(`${ THINK.APP_PATH }/Common/Common/function.js`);
            //防止应用函数污染
            for (let n in appFunc) {
                if (!THINK[n]) {
                    THINK[n] = appFunc[n];
                } else {
                    THINK.cPrint(`${ appFunc[n] } The function of the same name already exists in the frame`, 'WARNING');
                }
            }
        }
        //加载应用公共配置
        if (THINK.isFile(`${ THINK.APP_PATH }/Common/Conf/config.js`)) {
            THINK.CONF = THINK.extend(false, THINK.CONF, THINK.safeRequire(`${ THINK.APP_PATH }/Common/Conf/config.js`));
        }
        //加载应用自定义路由
        if (THINK.CONF.url_route_on && THINK.isFile(`${ THINK.APP_PATH }/Common/Conf/route.js`)) {
            THINK.CONF.url_route_rules = THINK.safeRequire(`${ THINK.APP_PATH }/Common/Conf/route.js`);
        }
        //加载应用别名文件
        if (THINK.isFile(`${ THINK.APP_PATH }/Common/Conf/alias.js`)) {
            let appAlias = THINK.safeRequire(`${ THINK.APP_PATH }/Common/Conf/alias.js`);
            for (let n in appAlias) {
                if (THINK.thinkCache(THINK.CACHES.ALIAS, n)) {
                    THINK.cPrint(`App alias ${ appAlias[n] } definition contains a reserved keyword`, 'WARNING');
                    delete appAlias[n];
                }
            }
            this.loadAlias(appAlias);
        }
        //加载应用多语言
        this.loadFiles({
            'Lang': [`${ THINK.APP_PATH }/Common/Lang/`]
        }, (t, f, g) => {
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = THINK.extend(false, THINK.LANG[t], THINK.safeRequire(f));
        });
        //加载应用公共类
        this.loadFiles({
            'Behavior': [`${ THINK.APP_PATH }/Common/Behavior/`],
            'Controller': [`${ THINK.APP_PATH }/Common/Controller/`],
            'Model': [`${ THINK.APP_PATH }/Common/Model/`],
            'Logic': [`${ THINK.APP_PATH }/Common/Logic/`],
            'Service': [`${ THINK.APP_PATH }/Common/Service/`],
            'Adapter': [`${ THINK.APP_PATH }/Common/Adapter/`],
            'Middleware': [`${ THINK.APP_PATH }/Common/Middleware/`]
        }, (t, f, g) => {
            this.flushAlias(t);
            this.flushAliasExport(t);
            this.loadAlias({ [g]: { [t]: f } });
            if (g === 'Model') {
                this.loadAliasModel(t);
            }
        }, 'Common');

        //解析应用模块列表
        this.parseMoudleList();
        return _promise2.default.resolve();
    }

    /**
     * 解析应用模块列表
     */
    parseMoudleList() {
        let self = this;
        let filePath = THINK.APP_PATH;
        if (!THINK.isDir(filePath)) {
            let groupList = THINK.CONF.app_group_list.map(function (item) {
                return item.toLowerCase();
            });
            THINK.CONF.app_group_list = groupList;
            return;
        }
        let dirs = _fs2.default.readdirSync(filePath);
        //禁止访问的分组
        let denyDirs = THINK.CONF.deny_group_list;
        let result = [];
        dirs.forEach(function (dir) {
            if (denyDirs.find(d => {
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
    }

    /**
     * 加载模块文件
     * @param group
     */
    loadMoudleFiles(group) {
        //加载模块配置
        if (THINK.isFile(`${ THINK.APP_PATH }/${ group }/Conf/config.js`)) {
            THINK.CONF[group] = THINK.safeRequire(`${ THINK.APP_PATH }/${ group }/Conf/config.js`);
        }
        //加载模块类
        this.loadFiles({
            'Behavior': [`${ THINK.APP_PATH }/${ group }/Behavior/`],
            'Controller': [`${ THINK.APP_PATH }/${ group }/Controller/`],
            'Model': [`${ THINK.APP_PATH }/${ group }/Model/`],
            'Logic': [`${ THINK.APP_PATH }/${ group }/Logic/`],
            'Service': [`${ THINK.APP_PATH }/${ group }/Service/`]
        }, (t, f, g) => {
            this.flushAlias(t);
            this.flushAliasExport(t);
            this.loadAlias({ [g]: { [t]: f } });
            if (g === 'Model') {
                this.loadAliasModel(t);
            }
        }, group);
    }

    /**
     * 初始化应用数据模型
     */
    initModel() {
        let modelCache = THINK.thinkCache(THINK.CACHES.MODEL);
        if (!THINK.isEmpty(modelCache)) {
            //循环加载模型到collections
            let ps = [];
            for (let v in modelCache) {
                let k = v.endsWith('/') ? null : v;
                if (k) {
                    ps.push(THINK.M(`${ k }`).setCollections());
                }
            }
            return _promise2.default.all(ps).then(() => {
                //初始化数据源连接池
                return new THINK.Model().setConnectionPool();
            });
        }
        return _promise2.default.resolve();
    }

    /**
     * debug模式文件重载
     */
    debug() {
        //清除require的缓存
        if (THINK.CONF.clear_require_cache) {
            //这些文件不清除缓存
            let retainFiles = THINK.CONF.debug_retain_files;
            setInterval(() => {
                for (let file in require.cache) {
                    let flag = retainFiles.find(item => {
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
                }
                this.loadApp();
            }, 1000);
        }
    }

    /**
     * 注册异常处理
     */
    captureError() {
        process.on('uncaughtException', function (err) {
            let msg = err.message;
            THINK.cPrint(err, 'ERROR');
            if (msg.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    }

    /**
     * 运行
     */
    run() {
        //加载应用模块
        return this.loadApp().then(() => {
            THINK.cPrint('Load App Moudle: success', 'THINK');
            //缓存对象
            return this.loadAliasExport();
        }).then(() => {
            //初始化应用模型
            return this.initModel();
        }).catch(e => {
            THINK.cPrint(`Initialize App Model error: ${ e.stack }`, 'ERROR');
            return THINK.getDefer().promise;
        }).then(() => {
            THINK.cPrint('Initialize App Model: success', 'THINK');
            //日志监听
            THINK.INSTANCES.LOG || (THINK.INSTANCES.LOG = THINK.adapter(`${ THINK.CONF.log_type }Logs`));

            if (THINK.CONF.log_loged) {
                new THINK.INSTANCES.LOG().logConsole();
            }

            //debug模式
            if (THINK.APP_DEBUG) {
                //this.debug();
            } else {
                this.captureError();
            }
            //运行应用
            return new _App2.default().run();
        });
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/19
    */