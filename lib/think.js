'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _App = require('./Lib/Core/App');

var _App2 = _interopRequireDefault(_App);

var _Behavior = require('./Lib/Core/Behavior');

var _Behavior2 = _interopRequireDefault(_Behavior);

var _Controller = require('./Lib/Core/Controller');

var _Controller2 = _interopRequireDefault(_Controller);

var _Logic = require('./Lib/Core/Logic');

var _Logic2 = _interopRequireDefault(_Logic);

var _Model = require('./Lib/Core/Model');

var _Model2 = _interopRequireDefault(_Model);

var _Service = require('./Lib/Core/Service');

var _Service2 = _interopRequireDefault(_Service);

var _View = require('./Lib/Core/View');

var _View2 = _interopRequireDefault(_View);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class {
    constructor() {
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
        THINK.Behavior = _Behavior2.default;
        THINK.Controller = _Controller2.default;
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
        P('====================================', 'THINK');
        this.checkNodeVersion();
        P('Check Node Version: success', 'THINK');
        this.checkDependencies();
        P('Check Dependencies: success', 'THINK');
    }

    /**
     * init
     */
    initialize() {
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
            THINK.CORE_PATH = THINK.THINK_PATH + '/Lib/Core';
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
            let pkgPath = _path2.default.dirname(THINK.THINK_PATH) + '/package.json';
            THINK.THINK_VERSION = JSON.parse(_fs2.default.readFileSync(pkgPath, 'utf8')).version;
        } catch (e) {
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
            process.env.LOG_QUERIES = 'false';
        }
        //连接池
        THINK.INSTANCES = { 'DB': {}, 'MEMCACHE': {}, 'REDIS': {} };
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
                if (C('cache_gc_hour').indexOf(hour) === -1) {
                    return;
                }
                return instance.gc && instance.gc(Date.now());
            }, 3600 * 1000);
        };
        //缓存池
        THINK.CACHES = {};
        //think alias
        THINK.CACHES.ALIAS = 'alias';
        //think alias_export
        THINK.CACHES.ALIAS_EXPORT = 'alias_export';
        //think collection class or function
        THINK.CACHES.COLLECTION = 'collection';
        //store limit instance
        THINK.CACHES.LIMIT = 'limit';
        //think conf
        THINK.CACHES.CONF = 'conf';
        //think cache
        THINK.CACHES.CACHE = 'cache';
        //think model
        THINK.CACHES.MODEL = 'model';

        P('Initialize Core variable: success', 'THINK');
    }

    /**
     * check node version
     * @return {} []
     */
    checkNodeVersion() {
        let packageFile = `${ THINK.ROOT_PATH }/node_modules/thinknode/package.json`;

        var _JSON$parse = JSON.parse(_fs2.default.readFileSync(packageFile, 'utf-8'));

        let engines = _JSON$parse.engines;

        let needVersion = engines.node.substr(2);

        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }

        if (needVersion > nodeVersion) {
            P(new Error(`ThinkNode need node version >= ${ needVersion }, current version is ${ nodeVersion }, please upgrade it.`));
            console.log();
            process.exit();
        }
    }

    /**
     * check dependencies is installed before server start
     * @return {} []
     */
    checkDependencies() {
        let packageFile = `${ THINK.ROOT_PATH }/package.json`;
        if (!isFile(packageFile)) {
            return;
        }
        let data = JSON.parse(_fs2.default.readFileSync(packageFile, 'utf8'));
        let dependencies = data.dependencies;
        for (let pkg in dependencies) {
            if (isDir(`${ THINK.ROOT_PATH }/node_modules/${ pkg }`)) {
                continue;
            }
            try {
                require(pkg);
            } catch (e) {
                P(new Error(` package \`${ pkg }\` is not installed. please run 'npm install' command before start server.`));
                console.log();
                process.exit();
            }
        }
    }

    /**
     * load alias
     * @param alias
     */
    loadAlias(alias) {
        for (let v in alias) {
            thinkCache(THINK.CACHES.ALIAS, v, alias[v]);
        }
    }

    /**
     * load alias module export
     */
    loadAliasExport() {
        let alias = thinkCache(THINK.CACHES.ALIAS);
        for (let key in alias) {
            if (thinkCache(THINK.CACHES.ALIAS_EXPORT, key)) {
                continue;
            }
            thinkCache(THINK.CACHES.ALIAS_EXPORT, key, thinkRequire(key));
        }
    }

    /**
     * load alias model export
     */
    loadAliasModel(alias) {
        thinkCache(THINK.CACHES.MODEL, alias, 1);
    }

    /**
     * flush alias
     */
    flushAlias(type) {
        thinkCache(THINK.CACHES.ALIAS, type, null);
    }

    /**
     * flush alias module export
     */
    flushAliasExport(type) {
        thinkCache(THINK.CACHES.ALIAS_EXPORT, type, null);
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
        let tempType = '';
        let tempName = '';

        for (let type in ext) {
            (function (t) {
                ext[t] = ext[t] || [];
                ext[t].forEach(v => {
                    if (isDir(v)) {
                        try {
                            tempDir = _fs2.default.readdirSync(v);
                        } catch (e) {
                            tempDir = [];
                        }
                        tempDir.forEach(f => {
                            if (isFile(v + f) && (v + f).indexOf('.js') > -1) {
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
        tempType = null;
        tempName = null;
    }

    /**
     * load files
     */
    loadExt() {
        let extDir = `${ THINK.THINK_PATH }/Lib/Extend`;
        let tempDir = [];
        let fileDir = [];
        let tempName = '';

        try {
            tempDir = _fs2.default.readdirSync(extDir);
        } catch (e) {
            tempDir = [];
        }
        tempDir.forEach(dir => {
            try {
                fileDir = _fs2.default.readdirSync(`${ extDir }/${ dir }/`);
            } catch (e) {
                fileDir = [];
            }
            fileDir.forEach(file => {
                if (isFile(`${ extDir }/${ dir }/${ file }`) && `${ extDir }/${ dir }/${ file }`.indexOf('.js') > -1) {
                    tempName = file.replace(/\.js/, '');
                    //THINK.Ext[dir] = {};
                    //THINK.Ext[dir][tempName] = thinkRequire(`${extDir}/${dir}/${file}`);
                    THINK.Ext[tempName] = thinkRequire(`${ extDir }/${ dir }/${ file }`);
                }
            });
        });
        extDir = null;
        tempDir = null;
        fileDir = null;
        tempName = null;
    }

    /**
     * 加载核心
     */
    loadCore() {
        let core = {
            'App': `${ THINK.CORE_PATH }/App.js`,
            'Behavior': `${ THINK.CORE_PATH }/Behavior.js`,
            'Controller': `${ THINK.CORE_PATH }/Controller.js`,
            'Logic': `${ THINK.CORE_PATH }/Logic.js`,
            'Model': `${ THINK.CORE_PATH }/Model.js`,
            'Service': `${ THINK.CORE_PATH }/Service.js`,
            'Thttp': `${ THINK.CORE_PATH }/Thttp.js`,
            'View': `${ THINK.CORE_PATH }/View.js`
        };
        this.loadAlias(core);
        P('Load ThinkNode Core: success', 'THINK');
    }

    /**
     * 自动加载框架文件
     */
    loadFramework() {
        //加载配置
        THINK.CONF = null; //移除之前的所有配置
        THINK.CONF = safeRequire(`${ THINK.THINK_PATH }/Conf/config.js`);
        //模式声明
        THINK.MODEL = [];
        //加载模式配置文件
        if (THINK.APP_MODE) {
            let modeFiles = [`${ THINK.THINK_PATH }/Conf/mode.js`, `${ THINK.APP_PATH }/Common/conf/mode.js`];
            modeFiles.forEach(function (file) {
                if (!isFile(file)) {
                    return;
                }
                let conf = safeRequire(file);
                if (conf[THINK.APP_MODE]) {
                    THINK.CONF = extend(false, THINK.CONF, conf[THINK.APP_MODE]);
                }
            });
        }
        //别名文件
        if (isFile(`${ THINK.THINK_PATH }/Conf/alias.js`)) {
            this.loadAlias(safeRequire(`${ THINK.THINK_PATH }/Conf/alias.js`));
        }
        //加载标签行为
        if (isFile(`${ THINK.THINK_PATH }/Conf/tag.js`)) {
            THINK.CONF.tag = safeRequire(`${ THINK.THINK_PATH }/Conf/tag.js`);
        }
        //加载多语言
        THINK.LANG = {};
        this.loadFiles({
            'Lang': [`${ THINK.THINK_PATH }/Lang/`]
        }, (t, f, g) => {
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = extend(false, THINK.LANG[t], safeRequire(f));
        });

        //加载框架类
        this.loadFiles({
            'Behavior': [`${ THINK.THINK_PATH }/Lib/Behavior/`],
            'Cache': [`${ THINK.THINK_PATH }/Lib/Driver/Cache/`],
            'Logs': [`${ THINK.THINK_PATH }/Lib/Driver/Logs/`],
            'Session': [`${ THINK.THINK_PATH }/Lib/Driver/Session/`],
            'Template': [`${ THINK.THINK_PATH }/Lib/Driver/Template/`]
        }, (t, f, g) => {
            this.loadAlias({ [t]: f });
        });

        //加载框架扩展
        this.loadExt();

        P('Load ThinkNode Framework: success', 'THINK');
    }

    /**
     * 加载应用
     */
    loadMoudles() {
        //加载应用函数库
        if (isFile(`${ THINK.APP_PATH }/Common/Common/function.js`)) {
            safeRequire(`${ THINK.APP_PATH }/Common/Common/function.js`);
        }
        //加载应用公共配置
        if (isFile(`${ THINK.APP_PATH }/Common/Conf/config.js`)) {
            THINK.CONF = extend(false, THINK.CONF, safeRequire(`${ THINK.APP_PATH }/Common/Conf/config.js`));
        }
        //加载应用自定义路由
        if (THINK.CONF.url_route_on && isFile(`${ THINK.APP_PATH }/Common/Conf/route.js`)) {
            THINK.CONF.url_route_rules = safeRequire(`${ THINK.APP_PATH }/Common/Conf/route.js`);
        }
        //加载应用别名文件
        if (isFile(`${ THINK.APP_PATH }/Common/Conf/alias.js`)) {
            this.loadAlias(safeRequire(`${ THINK.APP_PATH }/Common/Conf/alias.js`));
        }
        //加载应用标签行为
        if (isFile(`${ THINK.APP_PATH }/Common/Conf/tag.js`)) {
            THINK.CONF.tag = extend(false, THINK.CONF.tag, safeRequire(`${ THINK.APP_PATH }/Common/Conf/tag.js`));
        }
        //加载应用多语言
        this.loadFiles({
            'Lang': [`${ THINK.APP_PATH }/Common/Lang/`]
        }, (t, f, g) => {
            this.flushAlias(t);
            this.flushAliasExport(t);
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = extend(false, THINK.LANG[t], safeRequire(f));
        });

        //加载应用公共类
        this.loadFiles({
            'Behavior': [`${ THINK.APP_PATH }/Common/Behavior/`],
            'Controller': [`${ THINK.APP_PATH }/Common/Controller/`],
            'Model': [`${ THINK.APP_PATH }/Common/Model/`],
            'Logic': [`${ THINK.APP_PATH }/Common/Logic/`],
            'Service': [`${ THINK.APP_PATH }/Common/Service/`]
        }, (t, f, g) => {
            this.flushAlias(t);
            this.flushAliasExport(t);
            this.loadAlias({ [t]: f });
            if (g === 'Model') {
                this.loadAliasModel(t);
            }
        }, 'Common');
        //解析应用模块列表
        this.parseMoudleList();
    }

    /**
     * 解析应用模块列表
     */
    parseMoudleList() {
        let self = this;
        let filePath = THINK.APP_PATH;
        if (!isDir(filePath)) {
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

        THINK.CONF.app_group_list = extend(false, THINK.CONF.app_group_list, result);
    }

    /**
     * 加载模块文件
     * @param group
     */
    loadMoudleFiles(group) {
        //加载模块配置
        if (isFile(`${ THINK.APP_PATH }/${ group }/Conf/config.js`)) {
            THINK.CONF[group] = safeRequire(`${ THINK.APP_PATH }/${ group }/Conf/config.js`);
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
            this.loadAlias({ [t]: f });
            if (g === 'Model') {
                this.loadAliasModel(t);
            }
        }, group);
    }

    /**
     * 加载应用模型
     */
    loadModels() {
        try {
            let modelCache = thinkCache(THINK.CACHES.MODEL);
            if (!isEmpty(modelCache)) {
                //循环加载模型到collections
                for (let v in modelCache) {
                    (s => {
                        try {
                            if (s.includes('Model')) {
                                let k = s.substr(0, s.length - 5);
                                k = k.endsWith('/') ? null : k;
                                if (k) {
                                    M(`${ k }`).setCollections();
                                }
                            }
                        } catch (e) {
                            E(e, false);
                        }
                    })(v);
                }
                //初始化数据
                new _Model2.default().initDb();
                P('Initialize App Model: success', 'THINK');
            }
            //清除model cache
            thinkCache(THINK.CACHES.MODEL, null);
        } catch (e) {
            P(new Error(`Initialize App Model error: ${ e.stack }`));
            process.exit();
        }
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
                this.loadMoudles();
            }, 1000);
        }
    }

    /**
     * 注册异常处理
     */
    captureError() {
        process.on('uncaughtException', function (err) {
            let msg = err.message;
            P(err, 'ERROR');
            if (msg.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    }

    /**
     * 日志拦截
     */
    log() {
        //是否记录日志
        if (THINK.CONF.log_loged) {
            let cls = thinkRequire(`${ THINK.CONF.log_type }Logs`);
            new cls().logConsole();
        }
    }

    /**
     * 运行
     */
    run() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            //加载应用文件
            _this.loadMoudles();
            P('Load App Moudle: success', 'THINK');
            //debug模式
            if (THINK.APP_DEBUG) {
                _this.debug();
            } else {
                _this.captureError();
            }
            //日志拦截
            _this.log();
            //加载应用模型
            yield _this.loadModels();
            //运行应用
            return new _App2.default().run();
        })();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/19
    */