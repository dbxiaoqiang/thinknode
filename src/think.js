/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import fs from 'fs';
import path from 'path';
import app from './Core/App';
import base from './Core/Base';
import middleware from './Core/Middleware';
import controller from './Core/Controller';
import model from './Core/Model';
import service from './Core/Service';
import view from './Core/View';

export default class {
    constructor(options = {}) {
        //初始化
        this.initialize(options);
        //运行环境检测
        this.checkEnv();
        //加载框架文件
        this.loadFramework();

        //挂载核心类
        THINK.App = app;
        THINK.Base = base;
        THINK.Controller = controller;
        THINK.Middleware = middleware;
        THINK.Service = service;
        THINK.Model = model;
        THINK.View = view;
    }

    /**
     * check node env
     * @return {Boolean} []
     */
    checkEnv() {
        this.checkNodeVersion();
        THINK.log('Check Node Version: success', 'THINK');
        this.checkDependencies();
        THINK.log('Check Dependencies: success', 'THINK');
    }

    /**
     * init
     * @param lib
     */
    initialize(options) {
        THINK.log('====================================', 'THINK');
        Object.defineProperties(THINK, {
            "ROOT_PATH": {//项目根目录
                value: options.ROOT_PATH,
                writable: false
            },
            "APP_PATH": {//应用目录
                value: options.APP_PATH,
                writable: false
            },
            "RESOURCE_PATH": {//静态资源目录
                value: options.RESOURCE_PATH,
                writable: false
            },
            "RUNTIME_PATH": {//运行缓存目录
                value: options.RUNTIME_PATH,
                writable: false
            },
            "THINK_PATH": {//框架目录
                value: path.dirname(__dirname),
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
            THINK.RESOURCE_PATH = `${THINK.ROOT_PATH}/www`;
        }
        //应用目录
        if (!THINK.APP_PATH) {
            THINK.APP_PATH = `${THINK.ROOT_PATH}/App`;
        }
        //DEBUG模式
        if (THINK.APP_DEBUG !== true) {
            THINK.APP_DEBUG = false;
        }
        //运行缓存目录
        if (!THINK.RUNTIME_PATH) {
            THINK.RUNTIME_PATH = `${THINK.ROOT_PATH}/Runtime`;
        }
        //日志目录
        if (THINK.LOG_PATH === undefined) {
            THINK.LOG_PATH = `${THINK.RUNTIME_PATH}/Logs`;
        }
        //缓存目录
        if (THINK.TEMP_PATH === undefined) {
            THINK.TEMP_PATH = `${THINK.RUNTIME_PATH}/Temp`;
        }
        //数据文件目录
        if (THINK.DATA_PATH === undefined) {
            THINK.DATA_PATH = `${THINK.RUNTIME_PATH}/Data`;
        }
        //文件缓存目录
        if (THINK.CACHE_PATH === undefined) {
            THINK.CACHE_PATH = `${THINK.RUNTIME_PATH}/Cache`;
        }

        //框架版本
        try {
            let pkgPath = `${THINK.THINK_PATH}/package.json`;
            let packages = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
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
        if ((process.execArgv.indexOf('--production') > -1) || (process.env.NODE_ENV === 'production')) {
            THINK.APP_DEBUG = false;
            process.env.LOG_QUERIES = 'false';
        }
        //连接池类型
        THINK.INSTANCES = {'DB': {}, 'MEMCACHE': {}, 'REDIS': {}, 'TPLENGINE': {}, 'LOG': null};
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
            Service: {}
        };
        THINK.log('Initialize: success', 'THINK');
    }

    /**
     * check node version
     * @return {} []
     */
    checkNodeVersion() {
        let engines = THINK.THINK_ENGINES;
        let needVersion = engines.node.substr(1);

        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }
        if (needVersion > nodeVersion) {
            THINK.log(`ThinkNode need node version >= ${needVersion}, current version is ${nodeVersion}, please upgrade it.`, 'ERROR');
            process.exit();
        }
    }

    /**
     * check dependencies is installed before server start
     * @return {} []
     */
    checkDependencies() {
        let packageFile = `${THINK.ROOT_PATH}/package.json`;
        if (!THINK.isFile(packageFile)) {
            return;
        }
        let dependencies = {};
        try{
            let data = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
            dependencies = data.dependencies;
        }catch (e){}
        for (let pkg in dependencies) {
            if (!THINK.isDir(`${THINK.ROOT_PATH}/node_modules/${pkg}`)) {
                THINK.log(` package \`${pkg}\` is not installed. please run 'npm install' command before start server.`, 'ERROR');
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
                    Object.assign(THINK.CACHES[THINK.CACHES.ALIAS][g], {[v]: alias[v]});
                } else {
                    Object.assign(THINK.CACHES[THINK.CACHES.ALIAS], {[v]: alias[v]});
                }
            }
        }
    }

    /**
     * load alias module export
     * @param alias
     * @param exp
     */
    loadAliasExport(alias, exp = THINK.CACHES.ALIAS_EXPORT) {
        alias = alias || THINK.cache(THINK.CACHES.ALIAS);
        for (let key in alias) {
            if (THINK.cache(exp, key)) {
                continue;
            }
            if (THINK.isObject(alias[key])) {
                this.loadAliasExport(alias[key], key);
            } else {
                THINK.cache(exp, key, THINK.safeRequire(alias[key]));
            }
        }
    }

    /**
     * load alias model export
     */
    loadAliasModel(alias) {
        THINK.cache(THINK.CACHES.MODEL, alias, 1);
    }

    /**
     * load external middleware
     */
    loadExMiddleware(){
        THINK.CACHES['EXMIDDLEWARE'].forEach(item => {
            let tempName, cls;
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
            if(cls){
                THINK.HOOK[item.type] || (THINK.HOOK[item.type] = []);
                let oriHooks = [].push(tempName);
                if (item.append === 'prepend') {
                    THINK.HOOK[item.type] = oriHooks.concat(THINK.HOOK[item.type]);
                } else {
                    THINK.HOOK[item.type].push(tempName);
                }
            }
        });
    }

    /**
     * flush alias module export
     */
    flushAliasExport(g, type, file) {
        g = g || THINK.CACHES.ALIAS_EXPORT;
        file && require.cache[file] && delete require.cache[file];
        THINK.cache(g, type, null);
    }

    /**
     * load files
     * @param ext
     * @param callback
     * @param g
     */
    loadFiles(ext, callback, g = '') {
        let [tempDir, subDir, tempType, tempName] = [[], [], '', ''];
        for (let type in ext) {
            (function (t) {
                ext[t] = ext[t] || [];
                ext[t].forEach(v => {
                    if (THINK.isDir(v)) {
                        try {
                            tempDir = fs.readdirSync(v);
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
        [tempDir, subDir, tempType, tempName] = [null, null, null, null];
    }

    /**
     * 自动加载框架文件
     */
    loadFramework() {
        //加载配置
        THINK.CONF = null; //移除之前的所有配置
        THINK.CONF = THINK.safeRequire(`${THINK.THINK_PATH}/lib/Conf/config.js`);

        //别名文件
        if (THINK.isFile(`${THINK.THINK_PATH}/lib/Conf/alias.js`)) {
            this.loadAlias(THINK.safeRequire(`${THINK.THINK_PATH}/lib/Conf/alias.js`));
        }
        //加载中间件
        THINK.HOOK || (THINK.HOOK = []);
        if (THINK.isFile(`${THINK.THINK_PATH}/lib/Conf/hook.js`)) {
            THINK.HOOK = THINK.safeRequire(`${THINK.THINK_PATH}/lib/Conf/hook.js`);
        }
        //加载多语言
        THINK.LANG = {};
        this.loadFiles({
            'Lang': [
                `${THINK.THINK_PATH}/lib/Conf/Lang/`
            ]
        }, (t, f, g) => {
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = THINK.extend(false, THINK.LANG[t], THINK.safeRequire(f));
        });

        //加载框架类
        this.loadFiles({
            'Adapter': [
                `${THINK.THINK_PATH}/lib/Adapter/Cache/`,
                `${THINK.THINK_PATH}/lib/Adapter/Logs/`,
                `${THINK.THINK_PATH}/lib/Adapter/Session/`,
                `${THINK.THINK_PATH}/lib/Adapter/Template/`
            ],
            'Ext': [
                `${THINK.THINK_PATH}/lib/Extend/Controller/`
            ],
            'Middleware': [
                `${THINK.THINK_PATH}/lib/Middleware/`
            ]
        }, (t, f, g) => {
            this.loadAlias({[g]: {[t]: f}});
        });
        THINK.log('Load ThinkNode Framework: success', 'THINK');
    }

    /**
     * 加载应用
     */
    loadApp() {
        //加载应用函数库
        if (THINK.isFile(`${THINK.APP_PATH}/Common/Util/function.js`)) {
            THINK.safeRequire(`${THINK.APP_PATH}/Common/Util/function.js`);
        }
        //加载应用配置
        if (THINK.isFile(`${THINK.APP_PATH}/Common/Conf/config.js`)) {
            THINK.CONF = THINK.extend(false, THINK.CONF, THINK.safeRequire(`${THINK.APP_PATH}/Common/Conf/config.js`));
        }
        //加载应用自定义路由
        if (THINK.CONF.url_route_on && THINK.isFile(`${THINK.APP_PATH}/Common/Conf/route.js`)) {
            THINK.CONF.url_route_rules = THINK.safeRequire(`${THINK.APP_PATH}/Common/Conf/route.js`);
        }
        //加载应用别名文件
        if (THINK.isFile(`${ THINK.APP_PATH }/Common/Conf/alias.js`)) {
            let appAlias = THINK.safeRequire(`${ THINK.APP_PATH }/Common/Conf/alias.js`);
            for (let n in appAlias) {
                if (THINK.cache(THINK.CACHES.ALIAS, n)) {
                    THINK.log(`App alias ${appAlias[n]} definition contains a reserved keyword`, 'WARNING');
                    delete appAlias[n];
                } else {
                    this.flushAliasExport('', n, appAlias[n]);
                }
            }
            this.loadAlias(appAlias);
        }
        //加载应用多语言
        this.loadFiles({
            'Lang': [
                `${THINK.APP_PATH}/Common/Conf/Lang/`
            ]
        }, (t, f, g) => {
            THINK.LANG[t] = THINK.LANG[t] || {};
            THINK.LANG[t] = THINK.extend(false, THINK.LANG[t], THINK.safeRequire(f));
        });
        //加载应用公共类
        this.loadFiles({
            'Adapter': [
                `${THINK.APP_PATH}/Common/Adapter/`
            ],
            'Controller': [
                `${THINK.APP_PATH}/Common/Controller/`
            ],
            'Middleware': [
                `${THINK.APP_PATH}/Common/Middleware/`
            ],
            'Model': [
                `${THINK.APP_PATH}/Common/Model/`
            ],
            'Service': [
                `${THINK.APP_PATH}/Common/Service/`
            ]
        }, (t, f, g) => {
            this.flushAliasExport(g, t, f);
            this.loadAlias({[g]: {[t]: f}});
            if (g === 'Model') {
                this.loadAliasModel(t);
            }
        }, 'Common');

        //解析应用模块列表
        this.parseMoudleList();
        return Promise.resolve();
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
        let dirs = fs.readdirSync(filePath);
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

        THINK.CONF.app_group_list = THINK.arrUnique((THINK.CONF.app_group_list).concat(result));
    }

    /**
     * 加载模块文件
     * @param group
     */
    loadMoudleFiles(group) {
        //加载模块类
        this.loadFiles({
            'Controller': [
                `${THINK.APP_PATH}/${group}/Controller/`
            ],
            'Middleware': [
                `${THINK.APP_PATH}/${group}/Middleware/`
            ],
            'Model': [
                `${THINK.APP_PATH}/${group}/Model/`
            ],
            'Service': [
                `${THINK.APP_PATH}/${group}/Service/`
            ]
        }, (t, f, g) => {
            this.flushAliasExport(g, t, f);
            this.loadAlias({[g]: {[t]: f}});
            if (g === 'Model') {
                this.loadAliasModel(t);
            }
        }, group);
    }

    /**
     * 初始化应用数据模型
     */
    initModel() {
        let modelCache = THINK.cache(THINK.CACHES.MODEL);
        if (!THINK.isEmpty(modelCache)) {
            //循环加载模型到collections
            let ps = [];
            for (let v in modelCache) {
                let k = v.endsWith('/') ? null : v;
                if (k) {
                    ps.push(THINK.M(`${k}`).setCollections());
                }
            }
            return Promise.all(ps).then(() => {
                //初始化数据源连接池
                return new THINK.Model().setConnectionPool();
            });
        }
        return Promise.resolve();
    }

    /**
     * debug模式文件重载
     */
    autoReload() {
        setInterval(() => {
            this.loadApp();
        }, 1000);
    }

    /**
     * 注册异常处理
     */
    captureError() {
        process.on('uncaughtException', function (err) {
            let msg = err.message;
            THINK.log(err, 'ERROR');
            if (msg.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    }

    /**
     * 运行
     */
    async run() {
        //加载应用模块
        await this.loadApp();
        THINK.log('Load App Moudle: success', 'THINK');
        //加载挂载的中间件
        this.loadExMiddleware();
        //初始化应用模型
        await this.initModel().catch(e => THINK.E(`Initialize App Model error: ${ e.stack }`));
        THINK.log('Initialize App Model: success', 'THINK');
        //日志监听
        THINK.INSTANCES.LOG || (THINK.INSTANCES.LOG = THINK.adapter(`${THINK.CONF.log_type}Logs`));
        if (THINK.CONF.log_loged) {
            new (THINK.INSTANCES.LOG)().logConsole();
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
        return new app().run();
    }
}
