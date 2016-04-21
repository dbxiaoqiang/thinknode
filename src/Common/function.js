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

/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
global.isPromise = function (obj) {
    return !!(obj && typeof obj.then === 'function');
};

/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
global.promisify = function (fn, receiver) {
    return function (...args) {
        return new Promise(function (resolve, reject) {
            fn.apply(receiver, [...args, function (err, res) {
                return err ? reject(err) : resolve(res);
            }]);
        });
    };
};

/**
 * 生成一个promise,如果传入的参数是promise则直接返回
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
global.getPromise = function (obj, reject) {
    if (isPromise(obj)) {
        return obj;
    }
    if (reject) {
        return Promise.reject(obj);
    }
    return Promise.resolve(obj);
};

/**
 * 生成一个defer对象
 * @return {[type]} [description]
 */
global.getDefer = function () {
    let deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};

/**
 * extend, from jquery，具有深度复制功能
 * @return {[type]} [description]
 */
global.extend = function () {
    let args = [].slice.call(arguments);
    let deep = true;
    let target = args.shift();
    if (isBoolean(target)) {
        deep = target;
        target = args.shift();
    }
    target = target || {};
    let length = args.length;
    let options, name, src, copy, copyAsArray, clone;
    for (let i = 0; i < length; i++) {
        options = args[i] || {};
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            if (deep && copy && (isObject(copy) || (copyAsArray = isArray(copy) ))) {
                if (copyAsArray) {
                    copyAsArray = false;
                    clone = [];
                } else {
                    clone = src && isObject(src) ? src : {};
                }
                target[name] = extend(deep, clone, copy);
            } else {
                target[name] = copy;
            }
        }
    }
    return target;
};

/**
 * 安全方式加载文件
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
global.safeRequire = function (file) {
    let _interopSafeRequire = file => {
        let obj = require(file);
        if(obj && obj.__esModule && obj.default){
            return obj.default;
        }
        return obj;
    };
    // absolute file path is not exist
    if (path.isAbsolute(file)) {
        //no need optimize, only invoked before service start
        if(!isFile(file)){
            return null;
        }
        //when file is exist, require direct
        return _interopSafeRequire(file);
    }
    try{
        return _interopSafeRequire(file);
    }catch(err){
        return null;
    }
};

/**
 * global memory cache
 * @type {Object}
 */
global.thinkCache = function (type, name, value) {
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
        if (isString(name)) {
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
global.thinkRequire = function (name) {
    if (!isString(name)) {
        return name;
    }
    let Cls = thinkCache(THINK.CACHES.ALIAS_EXPORT, name);
    if (!isEmpty(Cls)) {
        return Cls;
    }
    let load = (name, filepath) => {
        let obj = safeRequire(filepath);
        if (isFunction(obj)) {
            obj.prototype.__filename = filepath;
        }
        if (obj) {
            thinkCache(THINK.CACHES.ALIAS_EXPORT, name, obj);
        }
        return obj;
    };

    try{
        var filepath = thinkCache(THINK.CACHES.ALIAS, name);
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
//global.thinkImport = function (name) {
//    if (!isString(name)) {
//        return name;
//    }
//    let Cls = thinkCache(THINK.CACHES.ALIAS_EXPORT, name);
//    if (Cls) {
//        return Cls;
//    }
//    let load = function (name, filepath) {
//        let System = require('systemjs');
//        System.transpiler = 'babel';
//        return System.import(filepath).then(obj => {
//            if (isFunction(obj)) {
//                obj.prototype.__filename = filepath;
//            }
//            if (obj) {
//                thinkCache(THINK.CACHES.ALIAS_EXPORT, name, obj);
//            }
//            return obj;
//        });
//    };
//    let filepath = thinkCache(THINK.CACHES.ALIAS, name);
//    if (filepath) {
//        return load(name, path.normalize(filepath));
//    }
//
//    return System.import(name);
//};

/**
 * console.log 封装
 * @param str
 */
global.echo = function (str) {
    let date = new Date().Format('yyyy-mm-dd hh:mi:ss');
    console.log(`----------${date}----------`);
    console.log(str);
    console.log(`----------${date}----------`);
};

/**
 * 调用一个具体的Controller类Action
 * A('Home/Index', this.http), A('Admin/Index/test', this.http)
 * @param {[type]} name [description]
 */
global.A = function (name, http) {
    try{
        name = name.split('/');
        http.group = name[0];
        http.controller = name[1];
        http.action = name[2] || 'index';
        let App = new (thinkRequire('App'))();
        return App.exec(http);
    }catch (e){
        return Err(e);
    }
};

/**
 * 调用执行指定的行为
 * @param {[type]} name [description]
 */
global.B = function (name, http, data) {
    try{
        if (!name) {
            return data;
        }
        if (isFunction(name)) {
            return name(http, data);
        }
        //支持目录
        name = name.split('/');
        let gc = name[0] + 'Behavior';
        if (name[1]) {
            gc = name[0] + '/' + name[1] + 'Behavior';
        }
        let cls = thinkRequire(gc);
        if(!cls){
            return Err(`Behavior ${name} is undefined`);
        }
        return new cls(http).run(data);
    }catch (e){
        return Err(e);
    }
};

/**
 * 配置读取和写入
 * @param name
 * @param value
 * @returns {*}
 * @constructor
 */
global.C = function (name, value) {
    let _conf = thinkCache(THINK.CACHES.CONF);
    //获取所有的配置
    if (!name && !value){
        return extend(false, THINK.CONF, _conf || {});
    }
    if(isString(name)){
        //name里不含. 一级
        if(!~name.indexOf('.')){
            if(value === undefined){
                value = (name in _conf) ? _conf[name] : THINK.CONF[name];
                return value;
            } else {
                thinkCache(THINK.CACHES.CONF, name, value);
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
                thinkCache(THINK.CACHES.CONF, name[0], _conf[name[0]]);
                return;
            }
        }
    } else {
        _conf = extend(false, _conf, name);
        THINK.CACHES[THINK.CACHES.CONF] = _conf;
        return;
    }
};

/**
 * 抛出异常,当isbreak为true时中断执行
 * @param msg
 * @param isbreak
 * @returns {type[]}
 * @constructor
 */
function Err(msg, isbreak) {
    if (isbreak === undefined || isbreak === true) {
        isbreak = true;
    } else {
        isbreak = false;
    }
    msg = msg || '';
    if (!isError(msg)) {
        if (!isString(msg)) {
            msg = JSON.stringify(msg);
        }
        msg = new Error(msg);
    }
    if (isbreak === true) {
        return Promise.reject(msg);
    } else {
        cPrint(msg);//console print
        return msg;
    }
}
global.E = Err;

/**
 * 快速文件读取和写入
 * 默认写入到App/Runtime/Data目录下
 */
global.F = function (name, value, rootPath) {
    rootPath = rootPath || THINK.DATA_PATH;
    let filePath = rootPath + '/' + name + '.json';
    if (value !== undefined) {
        try {
            mkdir(path.dirname(filePath));
            fs.writeFileSync(filePath, JSON.stringify(value));
            chmod(filePath);
        } catch (e) {
        }

        return;
    }
    if (isFile(filePath)) {
        try {
            let content = getFileContent(filePath);
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
global.I = function (name, cls, method, defaultValue = '') {
    if (isEmpty(cls)) {
        return defaultValue;
    }
    let value;
    if (!isEmpty(method)) {
        if (!isEmpty(name)) {
            value = cls.http[method](name);
        } else {
            value = cls.http[method]();
        }
    } else {
        if (!isEmpty(name)) {
            value = cls.http.param(name);
        } else {
            value = cls.http.param();
        }
    }
    if (isEmpty(value)) {
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
global.L = function (name, value) {
    if(C('language')){
        name = name ? `${C('language')}.${name}` : name;
    }
    //获取所有的语言
    if (isEmpty(name) && isEmpty(value)) {
        return THINK.LANG;
    } else if (name === null) {//清除所有的语言
        THINK.LANG = {};
        return;
    }
    if (isString(name)) {
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
        THINK.LANG = extend(false, THINK.LANG, name);
        return;
    }
};

/**
 * 实例化模型,包含Model及Logic模型
 */
global.M = function (name, config = {}, layer = 'Model') {
    try{
        let cls;
        if (!isString(name) && name.__filename) {
            cls = thinkRequire(name.__filename);
            return new cls(name.modelName, config);
        }

        //支持目录
        name = name.split('/');
        let gc = name[0] + layer;
        if (name[1]) {
            gc = name[0] + '/' + name[1] + layer;
            name[0] = name[1];
        }
        cls = thinkRequire(gc);
        if(!cls){
            return Err(`Model ${name} is undefined`);
        }
        return new cls(name[0], config);
    }catch (e){
        return Err(e);
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
global.O = function (http, status = 200, msg = '', type = 'HTTP') {
    //错误输出
    msg && Err(msg, false);

    if (!http || !http.res) {
        return getDefer().promise;
    }
    //控制台输出
    cPrint(`${(http.req.method).toUpperCase()}  ${status}  ${http.url || '/'}`, type, http.startTime);
    if (!http.isend) {
        if (!http.typesend) {
            http.type && http.type(C('tpl_content_type'), C('encoding'));
        }
        if (!http.res.headersSent) {
            http._status = status;
            http.res.statusCode = status;
        }
        if (status > 399) {
            if(isError(msg)){
                msg = THINK.APP_DEBUG ? msg.stack : 'Something went wrong,but we are working on it!';
            }
            status = status ? `${status}  ${L(status.toString())}` : '';
            http.res.write(`
                <html><head><title>ThinkNode Error</title>
                </head>
                <body><div id="wrapper">
                <h2>ThinkNode</h2>
                <h2><em>${status}</em></h2>
                <ul><li><pre>${msg}</pre></li></ul>
                </div></body></html>`, C('encoding'));
        }
        http.isend = true;
        http.res.end();
    }
    http = null;
    return getDefer().promise;
};

/**
 * 控制台打印封装
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
function cPrint(msg, type, showTime) {
    try{
        let d = new Date();
        let date = d.Format('yyyy-mm-dd');
        let time = d.Format('hh:mi:ss');

        let dateTime = `[${date} ${time}] `;
        if (showTime === null) {
            dateTime = '';
        }

        if (isError(msg)) {
            msg = msg.stack;
            console.error(msg);
            console.log(dateTime + '[ERROR] ' + msg);
        } else if (type == 'ERROR') {
            console.error(msg);
            console.log(dateTime + '[ERROR] ' + msg);
        } else if (type == 'WARNING'){
            console.warn(msg);
            console.log(dateTime + '[WARNING] ' + msg);
        } else {
            if (!isString(msg)) {
                msg = JSON.stringify(msg);
            }
            if (isNumber(showTime)) {
                let _time = Date.now() - showTime;
                msg += '  ' + `${_time}ms`;
            }
            type = type || 'INFO';
            if (type) {
                console.log(dateTime + `[${type}] ` + msg);
            } else {
                console.log(dateTime + msg);
            }
        }
    }catch (e){
        console.error(e.stack);
    }
}
global.P = cPrint;

/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 */
global.S = function (name, value, options) {
    try{
        if (isNumber(options)) {
            options = {cache_timeout: options};
        } else if (options === null) {
            options = {cache_timeout: null}
        }
        options = options || {};
        if (!options.cache_key_prefix) {
            options.cache_key_prefix = ~C('cache_key_prefix').indexOf(':') ? C('cache_key_prefix') + 'Cache:' : C('cache_key_prefix') + ':Cache:';
        }
        let type = options.type === undefined ? C('cache_type') : options.type;
        let cls = (type === true ? '' : ucfirst(type)) + 'Cache';
        let instance = new (thinkRequire(cls))(options);
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
        return Err(e);
    }
};

/**
 * 执行tag.js绑定的行为,可以批量执行
 * @return {[type]} [description]
 */
global.T = function (name, http, data) {
    let list = THINK.TAG[name];
    let runBehavior = function (list, index, http, data) {
        let item = list[index];
        if(!item){
            return Promise.resolve(data);
        }
        return Promise.resolve(B(item, http, data)).then(result => {
            if(result === null){
                return data;
            }else if(result !== undefined){
                data = result;
            }
            return runBehavior(list, index + 1, http, data);
        });
    };

    if(!list || list.length === 0){
        return Promise.resolve(data);
    }
    return runBehavior(list, 0, http, data);
};

/**
 * 调用service服务
 * @param unknown_type name 模块名/service名
 * @param unknown_type arg  参数
 * @param unknown_type config  配置
 * @return Ambigous <>|Ambigous <object, NULL, mixed, unknown>
 */
global.X = function (name, arg, config) {
    try{
        let layer = 'Service';
        //支持目录
        name = name.split('/');
        let gc = name[0] + layer;
        if (name[1]) {
            gc = name[0] + '/' + name[1] + layer;
        }
        let cls = thinkRequire(gc);
        if (!cls){
            return Err(`Service ${name} is undefined`);
        }
        return new cls(arg, config);
    }catch (e){
        return Err(e);
    }
};

/**
 * 自定义日志记录
 * @param context
 * @param name
 */
global.addLogs = function (name, context) {
    try{
        if (!isString(context)) {
            context = JSON.stringify(context);
        }
        let cls = thinkRequire(`${THINK.CONF.log_type}Logs`);
        return new cls().logCustom(name, context);
    }catch (e){
        return Err(e);
    }
};

/**
 * 值循环过滤，深度过滤
 * @param array 数组或对象(对象属性值可以为字符串或数组，不能为子对象;支持多重数组)
 * @param filter 过滤函数
 * @returns {*}
 */
global.walkFilter = function (array, filter) {
    if (isEmpty(filter)) {
        filter = 'htmlspecialchars';
    }

    let _filter = thinkRequire(filter);
    let walkArray = function (arr) {
        let rst = [];
        arr.forEach(function (v) {
            if (isArray(v)) {
                rst.push(walkFilter(v));
            } else {
                rst.push(_filter(v));
            }
        });
        return rst;
    };

    let result = [], k = [];

    if (isObject(array)) {
        result = Object.values(array);
        let keys = function (array) {
            for (let key in array) {
                k.push(key);
            }
            return k;
        };
        return getObject(keys(array), walkArray(result));
    } else if (isArray(array)) {
        return walkArray(array);
    } else {
        return _filter(array);
    }
};

/**
 * 并行处理
 * @param  {String}   key      []
 * @param  {Mixed}   data     []
 * @param  {Function} callback []
 * @return {}            []
 */
global.parallelLimit = function (key, data, callback, options = {}) {
    if (!isString(key) || isFunction(data)) {
        options = callback || {};
        callback = data;
        data = key;
        key = '';
    }
    if (!isFunction(callback)) {
        options = callback || {};
        callback = undefined;
    }
    if (isNumber(options)) {
        options = {limit: options};
    }

    let flag = !isArray(data) || options.array;
    if (!flag) {
        key = '';
    }

    //get parallel limit class
    let Limit = thinkCache(THINK.CACHES.COLLECTION, 'limit');
    if (!Limit) {
        Limit = thinkRequire('ParallelLimit');
        thinkCache(THINK.CACHES.COLLECTION, 'limit', Limit);
    }

    let instance;
    if (key) {
        instance = thinkCache(THINK.CACHES.LIMIT, key);
        if (!instance) {
            instance = new Limit(options.limit, callback);
            thinkCache(THINK.CACHES.LIMIT, key, instance);
        }
    } else {
        instance = new Limit(options.limit, callback);
    }

    if (flag) {
        return instance.add(data);
    }
    return instance.addMany(data, options.ignoreError);
};
