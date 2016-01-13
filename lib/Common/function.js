/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2014- <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/1/15
 */
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Object$values = require('babel-runtime/core-js/object/values')['default'];

var fs = require('fs');
var path = require('path');
var util = require('util');
var colors = require('colors/safe');

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
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new _Promise(function (resolve, reject) {
            fn.apply(receiver, [].concat(args, [function (err, res) {
                return err ? reject(err) : resolve(res);
            }]));
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
        return _Promise.reject(obj);
    }
    return _Promise.resolve(obj);
};

/**
 * 生成一个defer对象
 * @return {[type]} [description]
 */
global.getDefer = function () {
    var deferred = {};
    deferred.promise = new _Promise(function (resolve, reject) {
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
global.parallelLimit = function (key, data, callback) {
    var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

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
        options = { limit: options };
    }

    var flag = !isArray(data) || options.array;
    if (!flag) {
        key = '';
    }

    //get parallel limit class
    var Limit = thinkCache(thinkCache.COLLECTION, 'limit');
    if (!Limit) {
        Limit = thinkRequire('ParallelLimit');
        thinkCache(thinkCache.COLLECTION, 'limit', Limit);
    }

    var instance = undefined;
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
 * store websockets
 * @type {String}
 */
thinkCache.WEBSOCKET = 'websocket';

/**
 * 自定义的require, 加入别名功能
 * @type {[type]}
 */
global.thinkRequire = function (name) {
    if (!isString(name)) {
        return name;
    }
    var Cls = thinkCache(thinkCache.ALIAS_EXPORT, name);
    if (!isEmpty(Cls)) {
        return Cls;
    }
    var load = function load(name, filepath) {
        var obj = safeRequire(filepath);
        if (isFunction(obj)) {
            obj.prototype.__filename = filepath;
        }
        if (obj) {
            thinkCache(thinkCache.ALIAS_EXPORT, name, obj);
        }
        return obj;
    };

    var filepath = thinkCache(thinkCache.ALIAS, name);
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
    var args = [].slice.call(arguments);
    var deep = true;
    var target = args.shift();
    if (isBoolean(target)) {
        deep = target;
        target = args.shift();
    }
    target = target || {};
    var length = args.length;
    var options = undefined,
        name = undefined,
        src = undefined,
        copy = undefined,
        copyAsArray = undefined,
        clone = undefined;
    for (var i = 0; i < length; i++) {
        options = args[i] || {};
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            if (deep && copy && (isObject(copy) || (copyAsArray = isArray(copy)))) {
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
 * console.log 封装
 * @param str
 */
global.echo = function (str) {
    var date = new Date().Format('yyyy-mm-dd hh:mi:ss');
    console.log(colors.blue('----------' + date + '----------'));
    console.log(str);
    console.log(colors.blue('----------' + date + '----------'));
};

/**
 * 调用一个具体的Controller类Action
 * A('Home/Index', this.http), A('Admin/Index/test', this.http)
 * @param {[type]} name [description]
 */
global.A = function (name, http) {
    try {
        //将/转为:，兼容之前的方式
        name = name.replace(/\//g, ':').split(':');
        http.group = ucfirst(name[0]);
        http.controller = ucfirst(name[1]);
        http.action = name[2] || 'index';
        var App = new (thinkRequire('App'))();
        return App.exec(http);
    } catch (e) {
        return Err(e);
    }
};

/**
 * 调用执行指定的行为
 * @param {[type]} name [description]
 */
global.B = function (name, http, data) {
    try {
        if (!name) {
            return data;
        }
        if (isFunction(name)) {
            return name(http, data);
        }
        //支持目录
        name = name.split('/');
        var gc = name[0] + 'Behavior';
        if (name[1]) {
            gc = name[0] + '/' + name[1] + 'Behavior';
        }
        var cls = thinkRequire(gc);
        if (isEmpty(cls)) {
            return Err('Behavior ' + name + ' is undefined');
        }
        return new cls(http).run(data);
    } catch (e) {
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
    //获取所有的配置
    if (isEmpty(name) && isEmpty(value)) {
        return THINK.CONF;
    } else if (name === null) {
        //清除所有的配置
        THINK.CONF = {};
        return;
    }
    if (isString(name)) {
        //name里不含. 一级
        if (name.indexOf('.') === -1) {
            if (value === undefined) {
                return THINK.CONF[name];
            } else {
                if (value === null) {
                    THINK.CONF[name] && delete THINK.CONF[name];
                } else {
                    THINK.CONF[name] = THINK.CONF[name] || {};
                    THINK.CONF[name] = value;
                }
                return;
            }
        } else {
            //name中含有. 二级
            name = name.split('.');
            if (value === undefined) {
                value = THINK.CONF[name[0]] || {};
                return value[name[1]];
            } else {
                THINK.CONF[name[0]] = THINK.CONF[name[0]] || {};
                if (value === null) {
                    THINK.CONF[name[0]][name[1]] && delete THINK.CONF[name[0]][name[1]];
                } else {
                    THINK.CONF[name[0]][name[1]] = value;
                }
                return;
            }
        }
    } else {
        THINK.CONF = extend(false, THINK.CONF, name);
        return;
    }
};

/**
 * 实例化模型,包含Model及Logic模型
 */
global.D = function (name) {
    var layer = arguments.length <= 1 || arguments[1] === undefined ? 'Model' : arguments[1];

    try {
        var cls = undefined;
        if (!isString(name) && name.__filename) {
            cls = thinkRequire(name.__filename);
            return new cls(name.modelName);
        }
        //支持目录
        name = name.split('/');
        var gc = name[0] + layer;
        if (name[1]) {
            gc = name[0] + '/' + name[1] + layer;
            name[0] = name[1];
        }
        cls = thinkRequire(gc);
        if (isEmpty(cls)) {
            return Err('Model ' + name + ' is undefined');
        }
        return new cls(name[0]);
    } catch (e) {
        return Err(e);
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
        return getPromise(msg, true);
    } else {
        P(msg); //console print
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
    var filePath = rootPath + '/' + name + '.json';
    if (value !== undefined) {
        try {
            mkdir(path.dirname(filePath));
            fs.writeFileSync(filePath, JSON.stringify(value));
            chmod(filePath);
        } catch (e) {}

        return;
    }
    if (isFile(filePath)) {
        try {
            var content = getFileContent(filePath);
            if (content) {
                return JSON.parse(content);
            }
        } catch (e) {}
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
global.I = function (name, cls, method) {
    var defaultValue = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

    if (isEmpty(cls)) {
        return defaultValue;
    }
    var value = undefined;
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
    if (C('language')) {
        name = name ? C('language') + '.' + name : name;
    }
    //获取所有的语言
    if (isEmpty(name) && isEmpty(value)) {
        return THINK.LANG;
    } else if (name === null) {
        //清除所有的语言
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
 * 动态实例化模型,仅用于query原生语法(支持跨数据源\库查询)
 * @param {[type]} name        [description]
 * @param {[type]} config      [description]
 */
global.M = function () {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    try {
        var model = 'Model';
        config = extend(false, config, {
            db_ext_config: { safe: true }
        });
        var cls = thinkRequire(model);
        if (isEmpty(cls)) {
            return Err('Model is undefined');
        }
        return new cls(undefined, config);
    } catch (e) {
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
global.O = function (http) {
    var status = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];
    var msg = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
    var type = arguments.length <= 3 || arguments[3] === undefined ? 'HTTP' : arguments[3];

    try {
        if (!http || !http.res) {
            return getDefer().promise;
        }
        if (!http.isend) {
            if (!http.typesend) {
                http.type(C('tpl_content_type'), C('encoding'));
            }
            http.status(status);

            //错误输出
            msg = isError(msg) ? msg.stack.replace(/Error: /g, '') : msg;
            msg && Err(msg, false);
            //控制台输出
            P(http.method.toUpperCase() + '  ' + status + '  ' + http.url, type, http.startTime);

            if (!THINK.APP_DEBUG || status < 400) {
                return http.end();
            } else {
                status = status ? status + '  ' + L(status.toString()) : '';
                return http.echo('<html><head><title>ThinkNode Error</title><style>body{margin:0;padding:80px 100px;font:13px "Helvetica Neue","Lucida Grande",Arial;background:#ECE9E9 -webkit-gradient(linear,0 0,0 100%,from(#fff),to(#ECE9E9));background:#ECE9E9 -moz-linear-gradient(top,#fff,#ECE9E9);background-repeat:no-repeat;color:#555;-webkit-font-smoothing:antialiased}h1,h2,h3{margin:0;font-size:22px;color:#343434}h1 em,h2 em{padding:0 5px;font-weight:400}h1{font-size:60px}h2{margin-top:10px}h3{margin:5px 0 10px 0;padding-bottom:5px;border-bottom:1px solid #eee;font-size:18px}ul{margin:0;padding:0}ul li{margin:5px 0;padding:3px 8px;list-style:none}ul li:hover{cursor:pointer;color:#2e2e2e}ul li .path{padding-left:5px;font-weight:700}ul li .line{padding-right:5px;font-style:italic}ul li:first-child .path{padding-left:0}p{line-height:1.5}a{color:#555;text-decoration:none}a:hover{color:#303030}#stacktrace{margin-top:15px}.directory h1{margin-bottom:15px;font-size:18px}ul#files{width:100%;height:500px}ul#files li{padding:0}ul#files li img{position:absolute;top:5px;left:5px}ul#files li a{position:relative;display:block;margin:1px;width:30%;height:25px;line-height:25px;text-indent:8px;float:left;border:1px solid transparent;-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;overflow:hidden;text-overflow:ellipsis}ul#files li a.icon{text-indent:25px}ul#files li a:focus,ul#files li a:hover{outline:0;background:rgba(255,255,255,.65);border:1px solid #ececec}ul#files li a.highlight{-webkit-transition:background .4s ease-in-out;background:#ffff4f;border-color:#E9DC51}#search{display:block;position:fixed;top:20px;right:20px;width:90px;-webkit-transition:width ease .2s,opacity ease .4s;-moz-transition:width ease .2s,opacity ease .4s;-webkit-border-radius:32px;-moz-border-radius:32px;-webkit-box-shadow:inset 0 0 3px rgba(0,0,0,.25),inset 0 1px 3px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.03);-moz-box-shadow:inset 0 0 3px rgba(0,0,0,.25),inset 0 1px 3px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.03);-webkit-font-smoothing:antialiased;text-align:left;font:13px "Helvetica Neue",Arial,sans-serif;padding:4px 10px;border:none;background:0 0;margin-bottom:0;outline:0;opacity:.7;color:#888}#search:focus{width:120px;opacity:1}</style></head><body><div id="wrapper"><h2>ThinkNode</h2><h2><em>' + status + '</em></h2><ul id="stacktrace"><li><pre>' + msg + '</pre></li></ul></div></body></html>').then(function () {
                    return http.end();
                });
            }
        } else {
            http = null;
            return getDefer().promise;
        }
    } catch (e) {
        http = null;
        return Err(e);
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
    try {
        var d = new Date();
        var date = d.Format('yyyy-mm-dd');
        var time = d.Format('hh:mi:ss');

        var dateTime = colors.gray('[' + date + ' ' + time + '] ');
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
                var _time = Date.now() - showTime;
                msg += '  ' + colors.green(_time + 'ms');
            }
            type = type || 'INFO';
            if (type) {
                console.log(dateTime + colors.cyan('[' + type + '] ') + msg);
            } else {
                console.log(dateTime + msg);
            }
        }
    } catch (e) {
        console.error(e.stack);
    }
};

/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 */
global.S = function (name, value, options) {
    try {
        if (isNumber(options)) {
            options = { timeout: options };
        } else if (options === true) {
            options = { type: true };
        }
        options = options || {};
        if (!options.cache_key_prefix) {
            options.cache_key_prefix = C('cache_key_prefix').indexOf(':') > -1 ? C('cache_key_prefix') + 'Cache:' : C('cache_key_prefix') + ':Cache:';
        }
        var type = options.type === undefined ? C('cache_type') : options.type;
        var cls = (type === true ? '' : ucfirst(type)) + 'Cache';
        var instance = new (thinkRequire(cls))(options);
        if (value === undefined || value === '') {
            //获取缓存
            return instance.get(name).then(function (value) {
                return value ? JSON.parse(value) : value;
            });
        } else if (value === null) {
            return instance.rm(name); //删除缓存
        } else if (isFunction(value)) {
                //获取缓存，如果不存在，则自动从回调里获取
                return instance.get(name).then(function (value) {
                    return value ? JSON.parse(value) : value;
                }).then(function (data) {
                    return isEmpty(data) ? value() : getPromise(data, true);
                }).then(function (data) {
                    return S(name, data, options).then(function () {
                        return data;
                    });
                })['catch'](function (data) {
                    return data;
                });
            } else {
                return instance.set(name, JSON.stringify(value), options.timeout);
            }
    } catch (e) {
        return Err(e);
    }
};

/**
 * 执行tag.js绑定的行为,可以批量执行(行为执行无返回值)
 * @return {[type]} [description]
 */
global.T = function (name, http, data) {
    var index = 0;
    var tags = (C('tag.' + name) || []).slice();
    function runBehavior() {
        var behavior = tags[index++];
        if (!behavior) {
            return getPromise(http.tagdata);
        }
        var result = B(behavior, http, http.tagdata);
        return getPromise(result).then(function (data) {
            //如果返回值不是undefined，那么认为有返回值
            if (data !== undefined) {
                http.tagdata = data;
            }
            return runBehavior();
        });
    }
    try {
        //tag处理的数据
        http.tagdata = data;
        if (!tags.length) {
            return getPromise(http.tagdata);
        }
        return runBehavior();
    } catch (e) {
        return Err(e);
    }
};

/**
 * 调用接口服务
 * @param unknown_type name 接口名，跨模块使用  模块名/接口名
 * @param unknown_type arg  参数
 * @param unknown_type config  配置
 * @return Ambigous <>|Ambigous <object, NULL, mixed, unknown>
 */
global.X = function (name, arg, config) {
    try {
        var cls = undefined;
        if (!isString(name) && name.__filename) {
            cls = thinkRequire(name.__filename);
            return new cls(arg, config);
        }
        var layer = 'Service';
        //支持目录
        name = name.split('/');
        var gc = name[0] + layer;
        if (name[1]) {
            gc = name[0] + '/' + name[1] + layer;
        }
        cls = thinkRequire(gc);
        if (isEmpty(cls)) {
            return Err('Service ' + name + ' is undefined');
        }
        return new cls(arg, config);
    } catch (e) {
        return Err(e);
    }
};

/**
 * 自定义日志记录
 * @param context
 * @param name
 */
global.addLogs = function (name, context) {
    try {
        if (!isString(context)) {
            context = JSON.stringify(context);
        }
        var cls = thinkRequire(THINK.CONF.log_type + 'Log');
        return new cls().logCustom(name, context);
    } catch (e) {
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

    var _filter = thinkRequire(filter);
    var walkArray = function walkArray(arr) {
        var rst = [];
        arr.forEach(function (v) {
            if (isArray(v)) {
                rst.push(walkFilter(v));
            } else {
                rst.push(_filter(v));
            }
        });
        return rst;
    };

    var result = [],
        k = [];

    if (isObject(array)) {
        result = _Object$values(array);
        var keys = function keys(array) {
            for (var key in array) {
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