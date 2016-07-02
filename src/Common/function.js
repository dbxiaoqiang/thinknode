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


/**
 * global memory cache
 * @type {Object}
 */
THINK.thinkCache = function (type, name, value) {
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
};

/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
THINK.thinkRequire = function (name) {
    if (!THINK.isString(name)) {
        return name;
    }
    let Cls = THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, name);
    if (!THINK.isEmpty(Cls)) {
        return Cls;
    }
    let load = (name, filepath) => {
        let obj = THINK.safeRequire(filepath);
        if (THINK.isFunction(obj)) {
            obj.prototype.__filename = filepath;
        }
        if (obj) {
            THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, name, obj);
        }
        return obj;
    };

    try{
        let filepath = THINK.thinkCache(THINK.CACHES.ALIAS, name);
        if (filepath) {
            return load(name, path.normalize(filepath));
        }

        filepath = require.resolve(name);
        return load(name, filepath);
    }catch (e){
        return null;
    }
};

/**
 * es6动态加载模块
 * @param file
 * @returns {*}
 */
//THINK.thinkImport = function (name) {
//    if (!THINK.isString(name)) {
//        return name;
//    }
//    let Cls = THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, name);
//    if (Cls) {
//        return Cls;
//    }
//    let load = function (name, filepath) {
//        let System = require('systemjs');
//        System.transpiler = 'babel';
//        return System.import(filepath).then(obj => {
//            if (THINK.isFunction(obj)) {
//                obj.prototype.__filename = filepath;
//            }
//            if (obj) {
//                THINK.thinkCache(THINK.CACHES.ALIAS_EXPORT, name, obj);
//            }
//            return obj;
//        });
//    };
//    let filepath = THINK.thinkCache(THINK.CACHES.ALIAS, name);
//    if (filepath) {
//        return load(name, path.normalize(filepath));
//    }
//
//    return System.import(name);
//};


/**
 * 调用一个具体的Controller类Action
 * THINK.A('Home/Index', this.http), A('Admin/Index/test', this.http)
 * @param {[type]} name [description]
 */
THINK.A = function (name, http) {
    try{
        name = name.split('/');
        http.group = name[0];
        http.controller = name[1];
        http.action = name[2] || 'index';
        let App = new (THINK.thinkRequire('App'))();
        return App.exec(http);
    }catch (e){
        return THINK.Err(e);
    }
};

/**
 * 调用执行指定的行为
 * @param {[type]} name [description]
 */
THINK.B = function (name, http, data) {
    try{
        if (!name) {
            return data;
        }
        if (THINK.isFunction(name)) {
            return name(http, data);
        }
        //支持目录
        name = name.split('/');
        let gc = name[0] + 'Behavior';
        if (name[1]) {
            gc = name[0] + '/' + name[1] + 'Behavior';
        }
        let cls = THINK.thinkRequire(gc);
        if(!cls){
            return THINK.Err(`Behavior ${name} is undefined`);
        }
        return new cls(http).run(data);
    }catch (e){
        return THINK.Err(e);
    }
};

/**
 * 配置读取和写入
 * @param name
 * @param value
 * @returns {*}
 * @constructor
 */
THINK.C = function (name, value) {
    let _conf = THINK.thinkCache(THINK.CACHES.CONF);
    //获取所有的配置
    if (!name && !value){
        return THINK.extend(THINK.CONF, _conf || {});
    }
    if(THINK.isString(name)){
        //name里不含. 一级
        if(!~name.indexOf('.')){
            if(value === undefined){
                value = (name in _conf) ? _conf[name] : THINK.CONF[name];
                return value;
            } else {
                THINK.thinkCache(THINK.CACHES.CONF, name, value);
                return;
            }
        } else {//name中含有. 二级
            name = name.split('.');
            if(value === undefined){
                value = ((name[0] in _conf) ? _conf[name[0]] : THINK.CONF[name[0]]) || {};
                return value[name[1]];
            } else {
                if(!_conf[name[0]]) _conf[name[0]] = {};
                _conf[name[0]][name[1]] = value;
                THINK.thinkCache(THINK.CACHES.CONF, name[0], _conf[name[0]]);
                return;
            }
        }
    } else {
        _conf = THINK.extend(false, _conf, name);
        THINK.CACHES[THINK.CACHES.CONF] = _conf;
        return;
    }
};

THINK.E = THINK.Err;

/**
 * 快速文件读取和写入
 * 默认写入到App/Runtime/Data目录下
 */
THINK.F = function (name, value, rootPath) {
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
};

/**
 * 输入变量获取
 * @param name
 * @param cls
 * @param defaultValue
 * @constructor
 */
THINK.I = function (name, cls, method, defaultValue = '') {
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
};

/**
 * 多语言输出
 * @param name
 * @param value
 * @returns {*}
 * @constructor
 */
THINK.L = function (name, value) {
    if(THINK.C('language')){
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
};

/**
 * 实例化模型,包含Model及Logic模型
 */
THINK.M = function (name, config = {}, layer = 'Model') {
    try{
        let cls;
        if (!THINK.isString(name) && name.__filename) {
            cls = THINK.thinkRequire(name.__filename);
            return new cls(name.modelName, config);
        }

        //支持目录
        name = name.split('/');
        let gc = name[0] + layer;
        if (name[1]) {
            gc = name[0] + '/' + name[1] + layer;
            name[0] = name[1];
        }
        cls = THINK.thinkRequire(gc);
        if(!cls){
            THINK.Err(`Model ${gc} is undefined`, false);
            return {};
        }
        return new cls(name[0], config);
    }catch (e){
        THINK.Err(e, false);
        return {};
    }

};

/**
 * HTTP输出封装
 * @param http
 * @param status
 * @param msg
 * @param type
 * @returns {*}
 * @constructor
 */
THINK.O = function (http, status = 200, msg = '', type = 'HTTP') {
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
            if(THINK.isError(msg)){
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
    THINK.thinkCache(THINK.CACHES.CONF, null);
    //释放模板变量
    THINK.ViewVar = null;
    //释放http对象
    http = null;
    return THINK.getDefer().promise;
};

THINK.P = THINK.cPrint;

/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 */
THINK.S = function (name, value, options) {
    try{
        if (THINK.isNumber(options)) {
            options = {cache_timeout: options};
        } else if (options === null) {
            options = {cache_timeout: null}
        }
        options = options || {};
        options.cache_key_prefix = (~(THINK.C('cache_key_prefix').indexOf(':'))) ? `${THINK.C('cache_key_prefix')}Cache:` : `${THINK.C('cache_key_prefix')}:Cache:`;
        let cls = THINK.thinkRequire(`${THINK.C('cache_type') || 'File'}Cache`);
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
    }catch (e){
        return THINK.Err(e);
    }
};

/**
 * 执行tag.js绑定的行为,可以批量执行
 * @return {[type]} [description]
 */
THINK.T = function (name, http, data) {
    let list = THINK.TAG[name];
    let runBehavior = function (list, index, http, data) {
        let item = list[index];
        if(!item){
            return Promise.resolve(data);
        }
        return Promise.resolve(THINK.B(item, http, data)).then(result => {
            if(result){
                data = result;
            }
            return runBehavior(list, index + 1, http, data);
        }).catch(err => {
            return THINK.Err(err);
        });
    };

    if(!list || list.length === 0){
        return Promise.resolve(data);
    }
    return runBehavior(list, 0, http, data);
};

/**
 * URL格式化 输出带伪静态支持的标准url
 * @param string url URL表达式，格式：'模块[/控制器/操作]'
 * @param object http http对象
 * @param object vars 传入的参数，支持对象和字符串 {var1: "aa", var2: "bb"}
 * @return string
 */
THINK.U = function (urls, http,  vars = '') {
    if(!urls){
        return '';
    }
    let bCamelReg = function (s) {
        s = s.slice(0, 1).toLowerCase() + s.slice(1);
        return s.replace(/([A-Z])/g,"_$1").toLowerCase();
    };

    if(urls.indexOf('/') === 0){
        urls = urls.slice(1);
    }

    let temp = urls.split('/');
    let retUrl = '';
    if(temp[0]){
        retUrl = bCamelReg(temp[0]);
    } else {
        retUrl = bCamelReg(http.group || THINK.C('default_group'));
    }
    if(temp[1]){
        retUrl = `${retUrl}/${bCamelReg(temp[1])}`;
    } else {
        retUrl = `${retUrl}/${bCamelReg(http.controller || THINK.C('default_controller'))}`;
    }
    if(temp[2]){
        retUrl = `${retUrl}/${bCamelReg(temp[2])}`;
    } else {
        retUrl = `${retUrl}/${bCamelReg(http.action || THINK.C('default_action'))}`;
    }

    retUrl = `${retUrl}${THINK.C('url_pathname_suffix')}`;
    if(!THINK.isEmpty(vars)){
        if(THINK.isString(vars)){
            retUrl = `${retUrl}?${vars}`;
        } else if(THINK.isObject(vars)){
            retUrl = `${retUrl}?${querystring.stringify(vars)}`;
        }
    }

    return retUrl;
};

/**
 * 调用service服务
 * @param unknown_type name 模块名/service名
 * @param unknown_type arg  参数
 * @param unknown_type config  配置
 * @return Ambigous <>|Ambigous <object, NULL, mixed, unknown>
 */
THINK.X = function (name, arg, config) {
    try{
        let layer = 'Service';
        //支持目录
        name = name.split('/');
        let gc = name[0] + layer;
        if (name[1]) {
            gc = name[0] + '/' + name[1] + layer;
        }
        let cls = THINK.thinkRequire(gc);
        if (!cls){
            return THINK.Err(`Service ${name} is undefined`);
        }
        return new cls(arg, config);
    }catch (e){
        return THINK.Err(e);
    }
};

/**
 * 自定义日志记录
 * @param context
 * @param name
 */
THINK.addLogs = function (name, context) {
    try{
        if (!THINK.isString(context)) {
            context = JSON.stringify(context);
        }
        if (!THINK.LOG) {
            THINK.LOG = THINK.thinkRequire(`${THINK.CONF.log_type}Logs`);
        }
        return new (THINK.LOG)({log_itemtype: 'custom'}).logCustom(name, context);
    }catch (e){
        return THINK.Err(e);
    }
};

/**
 * 值循环过滤，深度过滤
 * @param object 数组或对象(对象属性值可以为字符串或数组)
 * @returns {*}
 */
THINK.walkFilter = function (object) {
    if(!THINK.isObject(object) && !THINK.isArray(object)){
        return THINK.htmlspecialchars(object);
    }
    for(let n in object){
        object[n] = THINK.walkFilter(object[n]);
    }
    return object;
};

/**
 * 并行处理
 * @param  {String}   key      []
 * @param  {Mixed}   data     []
 * @param  {Function} callback []
 * @return {}            []
 */
THINK.parallelLimit = function (key, data, callback, options = {}) {
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
    let Limit = THINK.thinkCache(THINK.CACHES.COLLECTION, 'limit');
    if (!Limit) {
        Limit = THINK.thinkRequire('ParallelLimit');
        THINK.thinkCache(THINK.CACHES.COLLECTION, 'limit', Limit);
    }

    let instance;
    if (key) {
        instance = THINK.thinkCache(THINK.CACHES.LIMIT, key);
        if (!instance) {
            instance = new Limit(options.limit, callback);
            THINK.thinkCache(THINK.CACHES.LIMIT, key, instance);
        }
    } else {
        instance = new Limit(options.limit, callback);
    }

    if (flag) {
        return instance.add(data);
    }
    return instance.addMany(data, options.ignoreError);
};
