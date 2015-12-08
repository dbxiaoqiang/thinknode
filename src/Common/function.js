/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2014- <ric3000(at)163.com>
 * @license    MIT
 * @version    15/1/15
 */
'use strict';

let fs = require('fs');
let path = require('path');
let util = require('util');
let colors = require('colors/safe');

//let System = require('systemjs');
//System.transpiler = 'babel';

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
    let Limit = thinkCache(thinkCache.COLLECTION, 'limit');
    if (!Limit) {
        Limit = thinkRequire('ParallelLimit');
        thinkCache(thinkCache.COLLECTION, 'limit', Limit);
    }

    let instance;
    if (key) {
        instance = thinkCache(thinkCache.LIMIT, key);
        if (!instance) {
            instance = new Limit(options.limit, callback);
            thinkCache(thinkCache.LIMIT, key, instance);
        }
    } else {
        instance = new Limit(options.limit, callback);
    }

    if (flag) {
        return instance.add(data);
    }
    return instance.addMany(data, options.ignoreError);
};

/**
 * global memory cache
 * @type {Object}
 */
global.thinkCache = function (type, name, value) {
    if (!(type in thinkCache)) {
        thinkCache[type] = {};
    }
    // get cache
    if (name === undefined) {
        return thinkCache[type];
    }
    //remove cache
    else if (name === null) {
        thinkCache[type] = {};
        return;
    }
    // get cache
    else if (value === undefined) {
        if (isString(name)) {
            return thinkCache[type][name];
        }
        thinkCache[type] = name;
        return;
    }
    //remove cache
    else if (value === null) {
        delete thinkCache[type][name];
        return;
    }
    //set cache
    thinkCache[type][name] = value;
};

/**
 * think alias
 * @type {String}
 */
thinkCache.ALIAS = 'alias';

/**
 * think alias_export
 * @type {String}
 */
thinkCache.ALIAS_EXPORT = 'alias_export';

/**
 * think collection class or function
 * @type {String}
 */
thinkCache.COLLECTION = 'collection';

/**
 * store limit instance
 * @type {String}
 */
thinkCache.LIMIT = 'limit';

/**
 * think cache
 * @type {String}
 */
thinkCache.CACHE = 'cache';

/**
 * think session
 * @type {String}
 */
thinkCache.SESSION = 'session';

/**
 * think model
 * @type {String}
 */
thinkCache.MODEL = 'model';

/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
global.thinkRequire = function (name) {
    if (!isString(name)) {
        return name;
    }
    let Cls = thinkCache(thinkCache.ALIAS_EXPORT, name);
    if (!isEmpty(Cls)) {
        return Cls;
    }
    let load = (name, filepath) => {
        let obj = safeRequire(filepath);
        if (isFunction(obj)) {
            obj.prototype.__filename = filepath;
        }
        if (obj) {
            thinkCache(thinkCache.ALIAS_EXPORT, name, obj);
        }
        return obj;
    };

    let filepath = thinkCache(thinkCache.ALIAS, name);
    if (filepath) {
        return load(name, path.normalize(filepath));
    }

    filepath = require.resolve(name);
    return load(name, filepath);
};

/**
 * es6动态加载模块
 * @param file
 * @returns {*}
 */
/*global.thinkImport = function (name) {
 if (!isString(name)) {
 return name;
 }
 let Cls = thinkCache(thinkCache.ALIAS_EXPORT, name);
 if (Cls) {
 return Cls;
 }
 let load = function (name, filepath) {
 return System.import(filepath).then(obj => {
 if (isFunction(obj)) {
 obj.prototype.__filename = filepath;
 }
 if (obj) {
 thinkCache(thinkCache.ALIAS_EXPORT, name, obj);
 }
 return obj;
 });
 };
 let filepath = thinkCache(thinkCache.ALIAS, name);
 if (filepath) {
 return load(name, path.normalize(filepath));
 }

 return System.import(name);
 };*/

/**
 * 安全方式加载文件
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
global.safeRequire = function (file) {
    if (!isFile(file)) {
        return {};
    }
    //when file is exist, require direct
    try {
        return require(file);
    } catch (e) {
        return {};
    }
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
 * 调用一个具体的Controller类Action
 * A('Home/Index', this.http), A('Admin/Index/test', this.http)
 * @param {[type]} name [description]
 */
global.A = function (name, http) {
    //将/转为:，兼容之前的方式
    name = name.replace(/\//g, ':').split(':');
    http.group = ucfirst(name[0]);
    http.controller = ucfirst(name[1]);
    http.action = name[2] || 'index';
    let App = new (thinkRequire('App'))();
    return App.exec(http);
};

/**
 * 调用执行指定的行为
 * @param {[type]} name [description]
 */
global.B = function (name, http, data) {
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
    return new (thinkRequire(gc))(http).run(data);
};

/**
 * 配置读取和写入
 * @param name
 * @param value
 * @returns {*}
 * @constructor
 */
global.C = function (name, value) {
    //获取所有的配置
    if (arguments.length === 0) {
        return THINK.CONF;
    }
    //清除所有的配置
    if (name === null) {
        THINK.CONF = {};
        return;
    }
    if (isString(name)) {
        //name里不含. 一级
        if (name.indexOf('.') === -1) {
            if (value === undefined) {
                return THINK.CONF[name];
            } else if (value === null) {
                delete THINK.CONF[name];
                return;
            } else {
                THINK.CONF[name] = value;
                return;
            }
        } else {
            //name中含有. 二级
            name = name.split('.');
            if (value === undefined) {
                value = THINK.CONF[name[0]] || {};
                return value[name[1]];
            } else {
                if (!THINK.CONF[name[0]]) {
                    THINK.CONF[name[0]] = {};
                } else {
                    if (value === null) {
                        delete THINK.CONF[name[0]][name[1]];
                    } else {
                        THINK.CONF[name[0]][name[1]] = value;
                    }
                }
                return;
            }
        }
    } else {
        THINK.CONF = extend(false, THINK.CONF, name);
    }
};

/**
 * 实例化模型,包含Model及Logic模型
 */
global.D = function (name, config, layer = 'Model') {
    if (!isString(name)) {
        return new (thinkRequire(name.__filename))(name.modelName, config);
    }
    //支持目录
    name = name.split('/');
    let gc = name[0] + layer;
    if (name[1]) {
        gc = name[0] + '/' + name[1] + layer;
        name[0] = name[1];
    }
    return new (thinkRequire(gc))(name[0], config);
};

/**
 * 抛出异常,当isbreak为true时中断执行
 * @param msg
 * @param isbreak
 * @returns {type[]}
 * @constructor
 */
global.E = function (msg, isbreak) {
    if (isbreak === undefined) {
        isbreak = true;
    } else {
        isbreak = false;
    }
    msg = msg || '';
    if (isError(msg)) {
        msg = msg.stack.replace(/Error:/g, '');
    } else if (!isString(msg)) {
        msg = JSON.stringify(msg);
    }
    msg = L(msg) || msg;
    P(new Error(msg));

    if (isbreak === true) {
        return getPromise(msg, true);
    } else {
        return getPromise(msg);
    }
};

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
        value = isEmpty(defaultValue) ? '' : defaultValue;
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
    //获取所有的语言
    if (arguments.length === 0) {
        return THINK.LANG;
    }
    //清除所有的语言
    if (name === null) {
        THINK.LANG = {};
        return;
    }
    if (isString(name)) {
        //name里不含. 一级
        if (name.indexOf('.') === -1) {
            if (value === undefined) {
                return THINK.LANG[name];
            } else if (value === null) {
                delete THINK.LANG[name];
                return;
            } else {
                THINK.LANG[name] = value;
                return;
            }
        } else {
            //name中含有. 二级
            name = name.split('.');
            if (value === undefined) {
                value = THINK.LANG[name[0]] || {};
                return value[name[1]];
            } else {
                if (!THINK.LANG[name[0]]) {
                    THINK.LANG[name[0]] = {};
                } else {
                    if (value === null) {
                        delete THINK.LANG[name[0]][name[1]];
                    } else {
                        THINK.LANG[name[0]][name[1]] = value;
                    }
                }
                return;
            }
        }
    } else {
        THINK.LANG = extend(false, THINK.LANG, name);
    }
};

/**
 * 实例化空模型,仅用于query原生语法(不推荐使用)
 * @param {[type]} name        [description]
 * @param {[type]} config      [description]
 */
global.M = function (config) {
    let model = 'Model';
    if (!isEmpty(config) && !isObject(config)) {
        return E('config error');
    }
    return new (thinkRequire(model))(undefined, config);
};

/**
 * HTTP输出封装
 * @param http
 * @param msg
 * @param status
 */
global.O = function (http, msg, status) {
    status = status || C('error_code');

    if (!http.res) {
        return;
    }

    let httpRes = (http, msg) => {
        if (!http.isend) {
            //控制台输出
            P(`${(http.method).toUpperCase()}  ${http.url}  ${status}`, 'HTTP', http.startTime);
            http.isend = true;
            if (!http.typesend) {
                http.header('Content-Type', 'text/html; charset=' + C('encoding'));
            }
            http.status(status);
            http.res.end();
        }
        return msg;
    };
    //正常输出
    if (status < 400) {
        return httpRes(http, msg);
    } else {
        httpRes(http, isError(msg) ? msg : new Error(msg));
        //中断执行
        return getDefer().promise;
    }
};

/**
 * 控制台打印封装
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
global.P = function (msg, type, showTime) {
    let d = new Date();
    let date = d.Format('yyyy-mm-dd');
    let time = d.Format('hh:mi:ss');

    let dateTime = colors.gray(`[${date} ${time}] `);
    if (showTime === null) {
        dateTime = '';
    }

    if (isError(msg)) {
        msg = msg.stack;
        console.error(msg);
        console.log(dateTime + colors.red('[ERROR] ') + msg);
    } else if (type == 'ERROR') {
        console.error(msg);
        console.log(dateTime + colors.red('[ERROR] ') + msg);
    } else {
        if (!isString(msg)) {
            msg = JSON.stringify(msg);
        }
        if (isNumber(showTime)) {
            let _time = Date.now() - showTime;
            msg += '  ' + colors.green(`${_time}ms`);
        }
        type = type || 'INFO';
        if (type) {
            console.log(dateTime + colors.cyan(`[${type}] `) + msg);
        } else {
            console.log(dateTime + msg);
        }
    }
};

/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 */
global.S = function (name, value, options) {
    if (isNumber(options)) {
        options = {timeout: options};
    } else if (options === true) {
        options = {type: true}
    }
    options = options || {};
    if (!options.cache_key_prefix) {
        options.cache_key_prefix = C('cache_key_prefix').indexOf(':') > -1 ? C('cache_key_prefix') + 'Cache:' : C('cache_key_prefix') + ':Cache:';
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
    } else if (isFunction(value)) { //获取缓存，如果不存在，则自动从回调里获取
        return instance.get(name).then(function (value) {
            return value ? JSON.parse(value) : value;
        }).then(function (data) {
            return isEmpty(data) ? value() : getPromise(data, true);
        }).then(function (data) {
            return S(name, data, options).then(function () {
                return data;
            });
        }).catch(function (data) {
            return data;
        })
    } else {
        return instance.set(name, JSON.stringify(value), options.timeout);
    }
};

/**
 * 执行tag.js绑定的行为,可以批量执行(行为执行无返回值)
 * @return {[type]} [description]
 */
global.T = function (name, http, data) {
    let tags = (C('tag.' + name) || []).slice();

    //tag处理的数据
    http.tagdata = data;
    if (!tags.length) {
        return getPromise(http.tagdata);
    }
    let index = 0;

    function runBehavior() {
        let behavior = tags[index++];
        if (!behavior) {
            return getPromise(http.tagdata);
        }
        let result = B(behavior, http, http.tagdata);
        return getPromise(result).then(data => {
            //如果返回值不是undefined，那么认为有返回值
            if (data !== undefined) {
                http.tagdata = data;
            }
            return runBehavior();
        })
    }

    return runBehavior();
};

/**
 * 调用接口服务
 * @param unknown_type name 接口名，跨模块使用  模块名/接口名
 * @param unknown_type arg  参数
 * @param unknown_type config  配置
 * @return Ambigous <>|Ambigous <object, NULL, mixed, unknown>
 */
global.X = function (name, arg, config) {
    if (!isString(name)) {
        return new (thinkRequire(name.__filename))(arg, config);
    }
    let layer = 'Service';
    //支持目录
    name = name.split('/');
    let gc = name[0] + layer;
    if (name[1]) {
        gc = name[0] + '/' + name[1] + layer;
    }
    return new (thinkRequire(gc))(arg, config);
};

/**
 * 自定义日志记录
 * @param context
 * @param name
 */
global.addLogs = function (context, name) {
    if (!isString(context)) {
        context = JSON.stringify(context);
    }
    return new (thinkRequire('Log'))(C('log_console_path')).info(context, name);
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