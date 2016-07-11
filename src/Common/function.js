/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2014- <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/1/15
 */
'use strict';

let fs = require('fs');
let path = require('path');
let util = require('util');
let querystring = require('querystring');

export default {
    /**
     * global memory cache
     * @param type
     * @param name
     * @param value
     * @returns {*}
     */
    cache (type, name, value) {
        if (!(type in THINK.CACHES)) {
            THINK.CACHES[type] = {};
        }
        // get cache
        if (name === undefined) {
            return THINK.CACHES[type];
        }
        //remove cache
        else if (name === null) {
            THINK.CACHES[type] = {};
            return;
        }
        // get cache
        else if (value === undefined) {
            if (THINK.isString(name)) {
                return THINK.CACHES[type][name];
            }
            THINK.CACHES[type] = name;
            return;
        }
        //remove cache
        else if (value === null) {
            delete THINK.CACHES[type][name];
            return;
        }
        //set cache
        THINK.CACHES[type][name] = value;
    },

    /**
     * 自定义的require, 加入别名功能
     * @param name
     * @param type
     * @returns {*}
     */
    require(name, type) {
        if (!THINK.isString(name)) {
            return name;
        }
        let Cls = THINK.cache(type || THINK.CACHES.ALIAS_EXPORT, name);
        if (!THINK.isEmpty(Cls)) {
            return Cls;
        }
        let load = (name, filepath) => {
            let obj = THINK.safeRequire(filepath);
            if (THINK.isFunction(obj)) {
                obj.prototype.__filename = filepath;
            }
            if (obj) {
                THINK.cache(type, name, obj);
            }
            return obj;
        };

        try {
            let filepath = type ? THINK.cache(THINK.CACHES.ALIAS, type)[name] : THINK.cache(THINK.CACHES.ALIAS, name);
            if (filepath) {
                return load(name, path.normalize(filepath));
            }
            filepath = require.resolve(name);
            return load(name, filepath);
        } catch (e) {
            return null;
        }
    },


    /**
     * 调用一个具体的Controller类Action
     * THINK.A('Home/Index', this.http), A('Admin/Index/test', this.http)
     * @param name
     * @param http
     * @returns {*}
     * @constructor
     */
    A(name, http) {
        try {
            name = name.split('/');
            http.group = name[0];
            http.controller = name[1];
            http.action = name[2] || 'index';
            let App = new (THINK.App)();
            return App.exec(http);
        } catch (e) {
            return THINK.Err(e);
        }
    },

    /**
     * 配置读取和写入
     * @param name
     * @param value
     * @returns {*}
     * @constructor
     */
    C(name, value) {
        let _conf = THINK.cache(THINK.CACHES.CONF);
        //获取所有的配置
        if (!name && !value) {
            return THINK.extend(THINK.CONF, _conf || {});
        }
        if (THINK.isString(name)) {
            //name里不含. 一级
            if (!~name.indexOf('.')) {
                if (value === undefined) {
                    value = (name in _conf) ? _conf[name] : THINK.CONF[name];
                    return value;
                } else {
                    THINK.cache(THINK.CACHES.CONF, name, value);
                    return;
                }
            } else {//name中含有. 二级
                name = name.split('.');
                if (value === undefined) {
                    value = ((name[0] in _conf) ? _conf[name[0]] : THINK.CONF[name[0]]) || {};
                    return value[name[1]];
                } else {
                    if (!_conf[name[0]]) _conf[name[0]] = {};
                    _conf[name[0]][name[1]] = value;
                    THINK.cache(THINK.CACHES.CONF, name[0], _conf[name[0]]);
                    return;
                }
            }
        } else {
            _conf = THINK.extend(false, _conf, name);
            THINK.CACHES[THINK.CACHES.CONF] = _conf;
            return;
        }
    },
    //错误封装
    E: THINK.Err,

    /**
     * 快速文件读取和写入
     * 默认写入到App/Runtime/Data目录下
     * @param name
     * @param value
     * @param rootPath
     * @constructor
     */
    F(name, value, rootPath) {
        rootPath = rootPath || THINK.DATA_PATH;
        let filePath = rootPath + '/' + name + '.json';
        if (value !== undefined) {
            try {
                THINK.mkDir(path.dirname(filePath));
                fs.writeFileSync(filePath, JSON.stringify(value));
                THINK.chmod(filePath);
            } catch (e) {
            }

            return;
        }
        if (THINK.isFile(filePath)) {
            try {
                let content = THINK.getFileContent(filePath);
                if (content) {
                    return JSON.parse(content);
                }
            } catch (e) {
            }
        }
        return;
    },

    /**
     * 输入变量获取
     * @param name
     * @param cls
     * @param method
     * @param defaultValue
     * @returns {*}
     * @constructor
     */
    I(name, cls, method, defaultValue = '') {
        if (THINK.isEmpty(cls)) {
            return defaultValue;
        }
        let value;
        if (!THINK.isEmpty(method)) {
            if (!THINK.isEmpty(name)) {
                value = cls.http[method](name);
            } else {
                value = cls.http[method]();
            }
        } else {
            if (!THINK.isEmpty(name)) {
                value = cls.http.param(name);
            } else {
                value = cls.http.param();
            }
        }
        if (THINK.isEmpty(value)) {
            value = defaultValue;
        }
        return value;
    },

    /**
     * 多语言输出
     * @param name
     * @param value
     * @returns {*}
     * @constructor
     */
    L(name, value) {
        if (THINK.C('language')) {
            name = name ? `${THINK.C('language')}.${name}` : name;
        }
        //获取所有的语言
        if (THINK.isEmpty(name) && THINK.isEmpty(value)) {
            return THINK.LANG;
        } else if (name === null) {//清除所有的语言
            THINK.LANG = {};
            return;
        }
        if (THINK.isString(name)) {
            //name里不含. 一级
            if (name.indexOf('.') === -1) {
                if (value === undefined) {
                    return THINK.LANG[name];
                } else {
                    if (value === null) {
                        THINK.LANG[name] && delete THINK.LANG[name];
                    } else {
                        THINK.LANG[name] = THINK.LANG[name] || {};
                        THINK.LANG[name] = value;
                    }
                    return;
                }
            } else {
                //name中含有. 二级
                name = name.split('.');
                if (value === undefined) {
                    value = THINK.LANG[name[0]] || {};
                    return value[name[1]];
                } else {
                    THINK.LANG[name[0]] = THINK.LANG[name[0]] || {};
                    if (value === null) {
                        THINK.LANG[name[0]][name[1]] && delete THINK.LANG[name[0]][name[1]];
                    } else {
                        THINK.LANG[name[0]][name[1]] = value;
                    }
                    return;
                }
            }
        } else {
            THINK.LANG = THINK.extend(false, THINK.LANG, name);
            return;
        }
    },

    /**
     * 实例化模型
     * @param name
     * @param config
     * @param layer
     * @returns {*}
     * @constructor
     */
    M(name, config = {}) {
        try {
            let cls, layer = 'Model';
            if (!THINK.isString(name) && name.__filename) {
                cls = THINK.require(name.__filename);
                return new cls(name.modelName, config);
            }

            //支持目录
            name = name.split('/');
            let gc = name[0];
            if (name[1]) {
                gc = name[0] + '/' + name[1];
                name[0] = name[1];
            }
            cls = THINK.require(gc, layer);
            if (!cls) {
                THINK.Err(`${layer} ${gc} is undefined`, false);
                return {};
            }
            return new cls(name[0], config);
        } catch (e) {
            return THINK.Err(e);
        }

    },

    /**
     * HTTP输出封装
     * @param http
     * @param status
     * @param msg
     * @param type
     * @returns {*}
     * @constructor
     */
    O(http, status = 200, msg = '', type = 'HTTP') {
        //错误输出
        msg && THINK.Err(msg, false);

        if (!http || !http.res) {
            return THINK.getDefer().promise;
        }
        //控制台输出
        THINK.cPrint(`${(http.req.method).toUpperCase()}  ${status}  ${http.url || '/'}`, type, http.startTime);
        if (!http.isend) {
            if (!http.res.headersSent) {
                http._status = status;
                http.res.statusCode = status;
                if (!http.typesend) {
                    http.type && http.type(THINK.C('tpl_content_type'), THINK.C('encoding'));
                }
            }
            if (status > 399) {
                if (THINK.isError(msg)) {
                    msg = THINK.APP_DEBUG ? msg.stack : 'Something went wrong,but we are working on it!';
                }
                status = status ? `${status}  ${THINK.L(status.toString())}` : '';
                http.res.write(`
                <html><head><title>ThinkNode Error</title>
                </head>
                <body><div id="wrapper">
                <h2>ThinkNode</h2>
                <h2><em>${status}</em></h2>
                <ul><li><pre>${msg}</pre></li></ul>
                </div></body></html>`, THINK.C('encoding'));
            }
            http.isend = true;
            http.res.end();
        }
        //清除动态配置
        THINK.cache(THINK.CACHES.CONF, null);
        //释放模板变量
        THINK.ViewVar = null;
        //释放http对象
        http = null;
        return THINK.getDefer().promise;
    },

    //控制台输出封装
    P: THINK.cPrint,

    /**
     * 执行中间件,可以批量执行
     * @param name
     * @param http
     * @param data
     * @returns {Promise.<*>}
     * @constructor
     */
    R(name, http, data) {
        let list = THINK.HOOK[name] || [];
        let runItemMiddleware = async function (list, index, http, data) {
            let item = list[index];
            if (!item) {
                return Promise.resolve(data);
            }
            return Promise.resolve(THINK.use(item, http, data)).then(result => {
                if (result === null) {
                    return Promise.resolve(data);
                } else if (result !== undefined) {
                    data = result;
                }
                return runItemMiddleware(list, index + 1, http, data);
            }).catch(err => {
                return THINK.Err(err);
            });
        };

        if (!list || list.length === 0) {
            return Promise.resolve(data);
        }
        return runItemMiddleware(list, 0, http, data);
    },

    /**
     * 缓存的设置和读取
     * 获取返回的是一个promise
     * @param name
     * @param value
     * @param options
     * @returns {*}
     * @constructor
     */
    S(name, value, options) {
        try {
            if (THINK.isNumber(options)) {
                options = {cache_timeout: options};
            } else if (options === null) {
                options = {cache_timeout: null}
            }
            options = options || {};
            options.cache_key_prefix = (~(THINK.C('cache_key_prefix').indexOf(':'))) ? `${THINK.C('cache_key_prefix')}Cache:` : `${THINK.C('cache_key_prefix')}:Cache:`;
            let cls = THINK.adapter(`${THINK.C('cache_type') || 'File'}Cache`);
            let instance = new cls(options);
            if (value === undefined || value === '') {//获取缓存
                return instance.get(name).then(function (value) {
                    return value ? JSON.parse(value) : value;
                });
            } else if (value === null) {
                return instance.rm(name); //删除缓存
            } else {
                return instance.set(name, JSON.stringify(value), options.cache_timeout);
            }
        } catch (e) {
            return THINK.Err(e);
        }
    },

    /**
     * URL格式化 输出带伪静态支持的标准url
     * @param urls URL表达式，格式：'模块[/控制器/操作]'
     * @param http http对象
     * @param vars 传入的参数，支持对象和字符串 {var1: "aa", var2: "bb"}
     * @return string
     */
    U(urls, http, vars = '') {
        if (!urls) {
            return '';
        }
        let bCamelReg = function (s) {
            s = s.slice(0, 1).toLowerCase() + s.slice(1);
            return s.replace(/([A-Z])/g, "_$1").toLowerCase();
        };

        if (urls.indexOf('/') === 0) {
            urls = urls.slice(1);
        }

        let temp = urls.split('/');
        let retUrl = '';
        if (temp[0]) {
            retUrl = bCamelReg(temp[0]);
        } else {
            retUrl = bCamelReg(http.group || THINK.C('default_group'));
        }
        if (temp[1]) {
            retUrl = `${retUrl}/${bCamelReg(temp[1])}`;
        } else {
            retUrl = `${retUrl}/${bCamelReg(http.controller || THINK.C('default_controller'))}`;
        }
        if (temp[2]) {
            retUrl = `${retUrl}/${bCamelReg(temp[2])}`;
        } else {
            retUrl = `${retUrl}/${bCamelReg(http.action || THINK.C('default_action'))}`;
        }

        retUrl = `${retUrl}${THINK.C('url_pathname_suffix')}`;
        if (!THINK.isEmpty(vars)) {
            if (THINK.isString(vars)) {
                retUrl = `${retUrl}?${vars}`;
            } else if (THINK.isObject(vars)) {
                retUrl = `${retUrl}?${querystring.stringify(vars)}`;
            }
        }

        return retUrl;
    },

    /**
     * 调用服务类
     * @param name
     * @param arg
     * @param config
     * @param layer
     * @returns {*}
     * @constructor
     */
    X(name, arg, config, layer = 'Service') {
        try {
            //支持目录
            name = name.split('/');
            let gc = name[0];
            if (name[1]) {
                gc = name[0] + '/' + name[1];
            }
            let cls = THINK.require(gc, layer);
            if (!cls) {
                return THINK.Err(`${layer} ${name} is undefined`);
            }
            //兼容2.0的Behavior
            return new cls(arg, config);
        } catch (e) {
            return THINK.Err(e);
        }
    },

    /**
     * 中间件机制
     * @param name
     * @param type
     * @param obj
     * @returns {*}
     */
    use(...args) {
        let [name, obj, type] = args;
        if (!THINK.isEmpty(name)) {
            if (THINK.isString(name) && THINK.isHttp(obj)) {
                try {
                    let layer = 'Middleware';
                    if (!name) {
                        return type;
                    }
                    //支持目录
                    name = name.split('/');
                    let gc = name[0];
                    if (name[1]) {
                        gc = name[0] + '/' + name[1];
                    }
                    let cls = THINK.require(gc, layer);
                    if (!cls) {
                        return THINK.Err(`${layer} ${name} is undefined`);
                    }
                    if (cls.prototype.run) {
                        return new cls(obj).run(type);
                    } else {
                        return cls(obj, type);
                    }
                } catch (e) {
                    return THINK.Err(e);
                }
            } else {
                if (obj === undefined) {
                    return THINK.CACHES['Middleware'][name];
                } else if (obj === null) {
                    THINK.CACHES['Middleware'][name] = null;
                } else if (!THINK.isEmpty(obj)) {
                    //挂载执行
                    if (type) {
                        if (type in THINK.HOOK) {
                            THINK.HOOK[type].push(name);
                        } else {
                            THINK.HOOK[type] || (THINK.HOOK[type] = {});
                        }
                    }
                    THINK.CACHES['Middleware'][name] || (THINK.CACHES['Middleware'][name] = {});
                    if (THINK.isFunction(obj)) {
                        THINK.CACHES['Middleware'][name] = obj;
                    } else {
                        let cls = THINK.require(obj, 'Middleware') || THINK.safeRequire(obj);
                        cls && (THINK.CACHES['Middleware'][name] = cls);
                    }
                }
            }
        }
        return;
    },

    /**
     * Adapter机制
     * @param name
     * @param obj
     */
    adapter(name, obj) {
        if (THINK.isEmpty(name) || !THINK.CACHES['Adapter']) {
            return null;
        } else {

            if (obj === undefined) {
                return THINK.CACHES['Adapter'][name];
            } else if (obj === null) {
                THINK.CACHES['Adapter'][name] = null;
            } else {
                if (THINK.isFunction(obj)) {
                    THINK.CACHES['Adapter'][name] = obj;
                } else {
                    let cls = THINK.safeRequire(obj);
                    THINK.CACHES['Adapter'][name] = cls;
                }
            }
            return;
        }
    },

    /**
     * 自定义日志记录
     * @param context
     * @param name
     */
    addLogs (name, context) {
        try {
            if (!THINK.isString(context)) {
                context = JSON.stringify(context);
            }
            if (!THINK.INSTANCES.LOG) {
                THINK.INSTANCES.LOG = THINK.adapter(`${THINK.CONF.log_type}Logs`);
            }
            return new (THINK.INSTANCES.LOG)({log_itemtype: 'custom'}).logCustom(name, context);
        } catch (e) {
            return THINK.Err(e);
        }
    },

    /**
     * 值循环过滤，深度过滤
     * @param object 数组或对象(对象属性值可以为字符串或数组)
     * @returns {*}
     */
    walkFilter(object) {
        if (!THINK.isObject(object) && !THINK.isArray(object)) {
            return THINK.htmlspecialchars(object);
        }
        for (let n in object) {
            object[n] = THINK.walkFilter(object[n]);
        }
        return object;
    },

    /**
     * 并行处理
     * @param  {String}   key      []
     * @param  {Mixed}   data     []
     * @param  {Function} callback []
     * @return {}            []
     */
    parallelLimit (key, data, callback, options = {}) {
        if (!THINK.isString(key) || THINK.isFunction(data)) {
            options = callback || {};
            callback = data;
            data = key;
            key = '';
        }
        if (!THINK.isFunction(callback)) {
            options = callback || {};
            callback = undefined;
        }
        if (THINK.isNumber(options)) {
            options = {limit: options};
        }

        let flag = !THINK.isArray(data) || options.array;
        if (!flag) {
            key = '';
        }

        //get parallel limit class
        let Limit = THINK.cache(THINK.CACHES.COLLECTION, 'limit');
        if (!Limit) {
            Limit = THINK.require('ParallelLimit');
            THINK.cache(THINK.CACHES.COLLECTION, 'limit', Limit);
        }

        let instance;
        if (key) {
            instance = THINK.cache(THINK.CACHES.LIMIT, key);
            if (!instance) {
                instance = new Limit(options.limit, callback);
                THINK.cache(THINK.CACHES.LIMIT, key, instance);
            }
        } else {
            instance = new Limit(options.limit, callback);
        }

        if (flag) {
            return instance.add(data);
        }
        return instance.addMany(data, options.ignoreError);
    }
}
