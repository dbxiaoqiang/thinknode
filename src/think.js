/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/19
 */
import fs from 'fs';
import path from 'path';
import './Common/common.js';
import './Common/function.js';
import app from './Lib/Think/App.js';
import controller from './Lib/Think/Controller.js';
import model from './Lib/Think/Model.js';
import service from './Lib/Think/Service.js';
import logic from './Lib/Think/Logic.js';
import behavior from './Lib/Think/Behavior.js';
import view from './Lib/Think/View.js';

export default class {
    constructor() {
        //运行环境检测
        this.checkEnv();
        //初始化
        this.initialize();
        //加载核心
        this.loadCore();
        //加载框架文件
        this.loadFiles();
        //缓存框架
        this.loadAliasExport();
        //挂载核心类
        THINK.Behavior = behavior;
        THINK.Controller = controller;
        THINK.Service = service;
        THINK.Logic = logic;
        THINK.Model = model;
        THINK.View = view;
    }

    /**
     * check node env
     * @return {Boolean} []
     */
    checkEnv() {
        this.checkNodeVersion();
        P(`Check Node Version: success`, 'THINK');
        this.checkDependencies();
        P(`Check Dependencies: success`, 'THINK');
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
            let pkgPath = path.dirname(THINK.THINK_PATH) + '/package.json';
            THINK.THINK_VERSION = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).version;
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
        if ((process.execArgv.indexOf('--production') > -1) || (process.env.NODE_ENV === 'production')) {
            THINK.APP_DEBUG = false;
            process.env.LOG_QUERIES = 'false';
        }
        //命令行模式
        if (process.argv[2] && !(/^\d+$/.test(process.argv[2]))) {
            THINK.APP_MODE = 'cli';
        }
        //连接池
        THINK.INSTANCES = {'DB': {}, 'MEMCACHE': {}, 'REDIS': {}};
        //ORM DBDBCLIENT
        THINK.ORM = {};

        //Cache定时器
        THINK.GC = {};
        THINK.GCTIMER = instance => {
            if (THINK.APP_DEBUG || THINK.APP_MODE === 'cli' || THINK.GC[instance.options.gctype]) {
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
        P(`Initialize Core variable: success`, 'THINK');
    }

    /**
     * check node version
     * @return {} []
     */
    checkNodeVersion() {
        let packageFile = `${THINK.ROOT_PATH}/node_modules/thinknode/package.json`;
        let {engines} = JSON.parse(fs.readFileSync(packageFile, 'utf-8'));
        let needVersion = engines.node.substr(2);

        let nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }

        if (needVersion > nodeVersion) {
            P(new Error(`ThinkNode need node version >= ${needVersion}, current version is ${nodeVersion}, please upgrade it.`));
            console.log();
            process.exit();
        }
    }

    /**
     * check dependencies is installed before server start
     * @return {} []
     */
    checkDependencies() {
        let packageFile = `${THINK.ROOT_PATH}/package.json`;
        if (!isFile(packageFile)) {
            return;
        }
        let data = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        let dependencies = data.dependencies;
        for (let pkg in dependencies) {
            if (isDir(`${THINK.ROOT_PATH}/node_modules/${pkg}`)) {
                continue;
            }
            try {
                require(pkg);
            } catch (e) {
                P(new Error(` package \`${pkg}\` is not installed. please run 'npm install' command before start server.`));
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
            thinkCache(thinkCache.ALIAS, v, alias[v]);
        }
    }

    /**
     * load alias module export
     */
    loadAliasExport() {
        let alias = thinkCache(thinkCache.ALIAS);
        for (let key in alias) {
            if (thinkCache(thinkCache.ALIAS_EXPORT, key)) {
                continue;
            }
            thinkCache(thinkCache.ALIAS_EXPORT, key, thinkRequire(key));
        }
    }

    /**
     * load alias model export
     */
    loadAliasModel(alias) {
        thinkCache(thinkCache.MODEL, alias, 1);
    }

    /**
     * flush alias
     */
    flushAlias(type) {
        thinkCache(thinkCache.ALIAS, type, null);
    }

    /**
     * flush alias module export
     */
    flushAliasExport(type) {
        thinkCache(thinkCache.ALIAS_EXPORT, type, null);
    }

    /**
     * load ext
     * @param ext
     * @param callback
     */
    loadExt(ext, callback, g = '') {
        let [tempDir, tempType, tempName] = [[], '', ''];
        for (let type in ext) {
            (function (t) {
                ext[t] = ext[t] || [];
                ext[t].forEach(v => {
                    if (isDir(v)) {
                        try {
                            tempDir = fs.readdirSync(v);
                        } catch (e) {
                            tempDir = [];
                        }
                        tempDir.forEach(f => {
                            if (isFile(v + f) && (v + f).indexOf('.js') > -1) {
                                tempName = f.replace(/\.js/, '');
                                tempType = g === '' ? tempName : `${g}/${tempName}`;
                                callback(tempType, (v + f), type);
                            }
                        });
                    }
                });
            })(type)
        }
        [tempDir, tempType, tempName] = [null, null, null];
    }

    /**
     * 加载核心
     */
    loadCore() {
        let core = {
            'Http': `${THINK.CORE_PATH}/Http.js`,
            'App': `${THINK.CORE_PATH}/App.js`,
            'Dispatcher': `${THINK.CORE_PATH}/Dispatcher.js`,
            'Controller': `${THINK.CORE_PATH}/Controller.js`,
            'Behavior': `${THINK.CORE_PATH}/Behavior.js`,
            'Model': `${THINK.CORE_PATH}/Model.js`,
            'View': `${THINK.CORE_PATH}/View.js`,
            'Cache': `${THINK.CORE_PATH}/Cache.js`,
            'Session': `${THINK.CORE_PATH}/Session.js`,
            'Log': `${THINK.CORE_PATH}/Log.js`
        };
        this.loadAlias(core);
        P(`Load ThinkNode Core: success`, 'THINK');
    }

    /**
     * 自动加载文件
     */
    loadFiles() {
        //加载配置
        C(null); //移除之前的所有配置
        THINK.CONF = require(`${THINK.THINK_PATH}/Conf/config.js`);
        //模式声明
        THINK.MODEL = [];
        //加载模式配置文件
        if (THINK.APP_MODE) {
            let modeFiles = [
                `${THINK.THINK_PATH}/Conf/mode.js`,
                `${THINK.APP_PATH}/Common/conf/mode.js`
            ];
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

        //框架路由
        if (THINK.CONF.url_route_on && isFile(`${THINK.THINK_PATH}/Conf/route.js`)) {
            THINK.CONF.url_route_rules = require(`${THINK.THINK_PATH}/Conf/route.js`);
        }
        //别名文件
        if (isFile(`${THINK.THINK_PATH}/Conf/alias.js`)) {
            this.loadAlias(require(`${THINK.THINK_PATH}/Conf/alias.js`));
        }
        //加载标签行为
        if (THINK.CONF.app_tag_on && isFile(`${THINK.THINK_PATH}/Conf/tag.js`)) {
            THINK.CONF.tag = require(`${THINK.THINK_PATH}/Conf/tag.js`);
        }
        //加载多语言
        THINK.LANG = {};
        this.loadExt({
            'Lang': [
                `${THINK.THINK_PATH}/Lang/`
            ]
        }, (t, f, g) => {
            THINK.LANG = extend(false, THINK.LANG, safeRequire(f));
        });

        //加载框架类
        this.loadExt({
            'Behavior': [
                `${THINK.THINK_PATH}/Lib/Behavior/`
            ],
            'Controller': [
                `${THINK.THINK_PATH}/Lib/Extend/Controller/`
            ],
            'Model': [
                `${THINK.THINK_PATH}/Lib/Extend/Model/`
            ],
            'Cache': [
                `${THINK.THINK_PATH}/Lib/Driver/Cache/`
            ],
            'Log': [
                `${THINK.THINK_PATH}/Lib/Driver/Log/`
            ],
            'Session': [
                `${THINK.THINK_PATH}/Lib/Driver/Session/`
            ],
            'Template': [
                `${THINK.THINK_PATH}/Lib/Driver/Template/`
            ]
        }, (t, f, g) => {
            this.loadAlias({[t]: f});
        });
        P(`Load ThinkNode Framework files: success`, 'THINK');
    }

    /**
     * 加载应用
     */
    loadMoudles() {
        //加载应用函数库
        if (isFile(`${THINK.APP_PATH}/Common/Common/function.js`)) {
            require(`${THINK.APP_PATH}/Common/Common/function.js`);
        }
        //加载应用公共配置
        if (isFile(`${THINK.APP_PATH}/Common/Conf/config.js`)) {
            THINK.CONF = extend(false, THINK.CONF, require(`${THINK.APP_PATH}/Common/Conf/config.js`));
        }
        //加载应用自定义路由
        if (THINK.CONF.url_route_on && isFile(`${THINK.APP_PATH}/Common/Conf/route.js`)) {
            THINK.CONF.url_route_rules = extend(false, THINK.CONF.url_route_rules, require(`${THINK.APP_PATH}/Common/Conf/route.js`));
        }
        //加载多语言
        this.loadExt({
            'Lang': [
                `${THINK.APP_PATH}/Common/Lang/`
            ]
        }, (t, f, g) => {
            this.flushAlias(t);
            this.flushAliasExport(t);
            THINK.LANG = extend(false, THINK.LANG, safeRequire(f));
        });

        //加载应用公共类
        this.loadExt({
            'Behavior': [
                `${THINK.APP_PATH}/Common/Behavior/`
            ],
            'Controller': [
                `${THINK.APP_PATH}/Common/Controller/`
            ],
            'Model': [
                `${THINK.APP_PATH}/Common/Model/`
            ],
            'Logic': [
                `${THINK.APP_PATH}/Common/Logic/`
            ],
            'Service': [
                `${THINK.APP_PATH}/Common/Service/`
            ]
        }, (t, f, g) => {
            this.flushAlias(t);
            this.flushAliasExport(t);
            this.loadAlias({[t]: f});
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

        THINK.CONF.app_group_list = extend(false, THINK.CONF.app_group_list, result);
    }

    /**
     * 加载模块文件
     * @param group
     */
    loadMoudleFiles(group) {
        //加载模块配置
        if (isFile(`${THINK.APP_PATH}/${group}/Conf/config.js`)) {
            THINK.CONF[group] = require(`${THINK.APP_PATH}/${group}/Conf/config.js`);
        }
        //加载模块类
        this.loadExt({
            'Behavior': [
                `${THINK.APP_PATH}/${group}/Behavior/`
            ],
            'Controller': [
                `${THINK.APP_PATH}/${group}/Controller/`
            ],
            'Model': [
                `${THINK.APP_PATH}/${group}/Model/`
            ],
            'Logic': [
                `${THINK.APP_PATH}/${group}/Logic/`
            ],
            'Service': [
                `${THINK.APP_PATH}/${group}/Service/`
            ]
        }, (t, f, g) => {
            this.flushAlias(t);
            this.flushAliasExport(t);
            this.loadAlias({[t]: f});
            if (g === 'Model') {
                this.loadAliasModel(t);
            }
        }, group);
    }

    /**
     * 加载应用模型
     */
    async loadModels() {
        let modelCache = thinkCache(thinkCache.MODEL);
        for (let v in modelCache) {
            ((s)=> {
                try {
                    let k = s.indexOf('Model') === (s.length - 5) ? s.substr(0, s.length - 5) : s;
                    let model = D(`${k}`);
                    model.setCollections(true);
                } catch (e) {
                    E(e, false);
                }
            })(v);
        }
        //ORM初始化
        await new model().initDb();
        P(`Initialize App Model: success`, 'THINK');
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
            let cls = thinkRequire(`${THINK.CONF.log_type}Log`);
            new cls().logConsole();
        }
    }

    /**
     * 运行
     */
    async run() {
        //加载应用文件
        this.loadMoudles();
        P(`Load App Moudle: success`, 'THINK');
        //debug模式
        if (THINK.APP_DEBUG) {
            this.debug();
        } else {
            this.captureError();
        }
        //日志拦截
        this.log();
        //加载应用模型
        await this.loadModels();
        //运行应用
        return new app().run();
    }
}