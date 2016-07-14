'use strict';
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/2
 */
var fs = require('fs');
var path = require('path');
var util = require('util');
var crypto = require('crypto');
var net = require('net');
var querystring = require('querystring');

//Object上toString方法
global.toString = Object.prototype.toString;

/**
 * 获取对象的值
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
Object.values = function (obj) {
    let values = [];
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            values.push(obj[key]);
        }
    }
    return values;
};
/**
 * 日期格式化
 * @param format
 * @returns {*}
 * @constructor
 */
Date.prototype.Format = function (format) {
    let Week = ['日', '一', '二', '三', '四', '五', '六'];
    format = format.replace(/yyyy|YYYY/, this.getFullYear());
    format = format.replace(/yy|YY/, this.getYear() % 100 > 9 ? (this.getYear() % 100).toString() : '0' + this.getYear() % 100);
    format = format.replace(/mi|MI/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    format = format.replace(/mm|MM/, this.getMonth() + 1 > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    format = format.replace(/m|M/g, this.getMonth() + 1);
    format = format.replace(/w|W/g, Week[this.getDay()]);
    format = format.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    format = format.replace(/d|D/g, this.getDate());
    format = format.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    format = format.replace(/h|H/g, this.getHours());
    format = format.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    return format;
};
/**
 * 生成时间戳及时间字符串转时间戳
 * @param str
 * @constructor
 */
Date.prototype.Timestamp = function (str, format) {
    format = format || 'yyyy-mm-dd hh:mi:ss';
    if (toString.call(str) === '[object Number]') {
        let newDate = new Date();
        newDate.setTime(str * 1000);
        return newDate.Format(format);
    } else {
        let ts;
        if (str) {
            ts = Date.parse(new Date(str));
        } else {
            ts = Date.parse(new Date());
        }
        ts = ts / 1000;
        return ts;
    }
};

/**
 * console.log 封装
 * @param str
 */
global.echo = function (str) {
    let date = new Date().Format('yyyy-mm-dd hh:mi:ss');
    console.log(`----------${ date }----------`);
    console.log(str);
    console.log(`----------${ date }----------`);
};

//define THINK object
global.THINK = {};

/**
 * 是否是buffer
 * @type {Boolean}
 */
THINK.isBuffer = Buffer.isBuffer;
/**
 * 是否是个数组
 * @type {Boolean}
 */
THINK.isArray = Array.isArray;
/**
 * 是否是IP
 * @type {Boolean}
 */
THINK.isIP = net.isIP;
THINK.isIP4 = net.isIP4;
THINK.isIP6 = net.isIP6;
/**
 * check object is http object
 * @param  {Mixed}  obj []
 * @return {Boolean}      []
 */
THINK.isHttp = function (obj) {
    'use strict';

    return !!(obj && THINK.isObject(obj.req) && THINK.isObject(obj.res));
};
/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
THINK.isBoolean = function (obj) {
    'use strict';

    return toString.call(obj) === '[object Boolean]';
};
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isNumber = function (obj) {
    'use strict';

    return toString.call(obj) === '[object Number]';
};
/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isObject = function (obj) {
    'use strict';

    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return toString.call(obj) === '[object Object]';
};
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isString = function (obj) {
    'use strict';

    return toString.call(obj) === '[object String]';
};
/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isNumberString = function (obj) {
    'use strict';

    let numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(obj);
};
/**
 * 是否是标准JSON对象
 * @param obj
 * @returns {boolean}
 */
THINK.isJSONObj = function (obj) {
    'use strict';

    return typeof obj === 'object' && Object.prototype.toString.call(obj).toLowerCase() === '[object object]' && !obj.length;
};
/**
 * 是否是标准的JSON字符串
 * @param str
 * @returns {boolean}
 */
THINK.isJSONStr = function (str) {
    'use strict';
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isFunction = function (obj) {
    'use strict';

    return typeof obj === 'function';
};
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
THINK.isDate = function (obj) {
    'use strict';

    return util.isDate(obj);
};
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
THINK.isRegexp = function (obj) {
    'use strict';

    return util.isRegExp(obj);
};
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isError = function (obj) {
    'use strict';

    return util.isError(obj);
};
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isScalar = function (obj) {
    'use strict';

    return THINK.isBoolean(obj) || THINK.isNumber(obj) || THINK.isString(obj);
};
/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
THINK.isEmpty = function (obj) {
    'use strict';

    if (obj === null || obj === undefined || obj === '') {
        return true;
    } else if (THINK.isString(obj)) {
        //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
        return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    } else if (THINK.isArray(obj)) {
        return obj.length === 0;
    } else if (THINK.isObject(obj)) {
        for (let key in obj) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};
/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isPromise = function (obj) {
    'use strict';

    return !!(obj && typeof obj.then === 'function');
};
/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
THINK.promisify = function (fn, receiver) {
    'use strict';
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
THINK.getPromise = function (obj, reject) {
    'use strict';
    if (THINK.isPromise(obj)) {
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
THINK.getDefer = function () {
    'use strict';
    let deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};
/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
THINK.isFile = function (p) {
    'use strict';
    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isFile();
};
/**
 * 是否是个目录
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
THINK.isDir = function (p) {
    'use strict';
    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isDirectory();
};
/**
 * 判断一个文件或者目录是否可写
 * @param  {[type]}  p [description]
 * @return {Boolean}      [description]
 */
THINK.isWritable = function (p) {
    'use strict';
    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    let mode = stats.mode;
    let uid = process.getuid ? process.getuid() : 0;
    let gid = process.getgid ? process.getgid() : 0;
    let owner = uid === stats.uid;
    let group = gid === stats.gid;
    return !!(owner && (mode & parseInt('00200', 8)) ||
    group && (mode & parseInt('00020', 8)) ||
    (mode & parseInt('00002', 8)));
};
/**
 * 递归创建目录，同步模式
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
THINK.mkDir = function (p, mode) {
    'use strict';
    mode = mode || '0777';
    if (fs.existsSync(p)) {
        THINK.chmod(p, mode);
        return true;
    }
    let pp = path.dirname(p);
    if (fs.existsSync(pp)) {
        fs.mkdirSync(p, mode);
    } else {
        THINK.mkDir(pp, mode);
        THINK.mkDir(p, mode);
    }
    return true;
};
/**
 * 读取文件
 * @param filename 文件物理路径
 * @param enc      为空返回Buffer类型,'utf8'返回String类型
 * @returns {Promise}
 */
THINK.mReadFile = function (filename, enc) {
    'use strict';
    return new Promise(function (fulfill, reject) {
        fs.readFile(filename, enc, function (err, res) {
            if (err) reject(err);
            else fulfill(res);
        });
    });
};
/**
 * 写入文件
 * @param filename 文件物理路径
 * @param data     Buffer数据
 * @returns {Promise}
 */
THINK.mWriteFile = function (filename, data) {
    'use strict';
    return new Promise(function (fulfill, reject) {
        fs.writeFile(filename, data, function (err, res) {
            if (err) reject(err);
            else fulfill(res);
        })
    });
};
/**
 * 修改文件名，支持移动
 * @param filename 原文件名
 * @param sfilename 新文件名
 * @returns {Promise}
 */
THINK.mReName = function (filename, nfilename) {
    'use strict';
    return new Promise(function (fulfill, reject) {
        fs.rename(filename, nfilename, function (err, res) {
            if (err) reject(err);
            else fulfill(res);
        });
    });
};
/**
 * 递归的删除目录，返回promise
 * @param  string p       要删除的目录
 * @param  boolean reserve 是否保留当前目录，只删除子目录
 * @return Promise
 */
THINK.rmDir = function (p, reserve) {
    'use strict';
    if (!THINK.isDir(p)) {
        return Promise.resolve();
    }
    let deferred = THINK.getDefer();
    fs.readdir(p, function (err, files) {
        if (err) {
            return deferred.reject(err);
        }
        let promises = files.map(function (item) {
            let filepath = path.normalize(p + '/' + item);
            if (THINK.isDir(filepath)) {
                return THINK.rmDir(filepath, false);
            } else {
                let defer = THINK.getDefer();
                fs.unlink(filepath, function (err) {
                    return err ? defer.reject(err) : defer.resolve();
                });
                return defer.promise;
            }
        });
        let promise = files.length === 0 ? Promise.resolve() : Promise.all(promises);
        return promise.then(function () {
            if (!reserve) {
                let defer = THINK.getDefer();
                fs.rmdir(p, function (err) {
                    return err ? defer.reject(err) : defer.resolve();
                });
                return defer.promise;
            }
        }).then(function () {
            deferred.resolve();
        }).catch(function (err) {
            deferred.reject(err);
        })
    });
    return deferred.promise;
};
/**
 * 修改目录或者文件权限
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
THINK.chmod = function (p, mode) {
    'use strict';
    mode = mode || '0777';
    if (!fs.existsSync(p)) {
        return true;
    }
    return fs.chmodSync(p, mode);
};
/**
 * 获取文件内容
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
THINK.getFileContent = function (file, encoding) {
    'use strict';
    if (!fs.existsSync(file)) {
        return '';
    }
    return fs.readFileSync(file, encoding || 'utf8');
};

/**
 * 设置文件内容
 * @param  {[type]} file [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
THINK.setFileContent = function (file, data) {
    'use strict';
    let filepath = path.dirname(file);
    THINK.mkDir(filepath);
    return fs.writeFileSync(file, data);
};
/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
THINK.ucFirst = function (name) {
    'use strict';
    name = (name || '') + '';
    return name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase();
};
/**
 * 参数特殊字符转义
 * @param str
 * @returns {*}
 */
THINK.htmlspecialchars = function (str) {
    'use strict';
    if (str === null || str === undefined) {
        return '';
    }
    if (typeof str === 'string') {
        if ((/[&<>"']/).test(str)) {
            return str.
            replace(/&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;').
            replace(/"/g, '&quot;').
            replace(/'/g, '&apos;');
        }
    }
    return str;
};
/**
 * 获取字符串的md5
 * @param  {[type]} str [description]
 * @return {[type]} charset [description]
 */
THINK.md5 = function (str, charset = 'utf-8') {
    'use strict';
    let instance = crypto.createHash('md5');
    instance.update(str + '', charset);
    return instance.digest('hex');
};
/**
 * 字符串或文件hash,比md5效率高,但是有很低的概率重复
 * @param input
 * @returns {string}
 */
THINK.hash = function (input) {
    'use strict';
    let _hash = 5381;
    let I64BIT_TABLE =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
    let i = input.length - 1;

    if (typeof input === 'string') {
        for (; i > -1; i--)
            _hash += (_hash << 5) + input.charCodeAt(i);
    }
    else {
        for (; i > -1; i--)
            _hash += (_hash << 5) + input[i];
    }
    let value = _hash & 0x7FFFFFFF;

    let retValue = '';
    do {
        retValue += I64BIT_TABLE[value & 0x3F];
    }
    while (value >>= 6);

    return retValue;
};
/**
 * 获取随机整数
 * @param min
 * @param max
 * @returns {number}
 */
THINK.rand = function (min, max) {
    'use strict';
    return Math.floor(min + Math.random() * (max - min + 1));
};
/**
 * 快速生成一个object
 * @param  {[type]} key   [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
THINK.getObject = function (key, value) {
    'use strict';
    let obj = {};
    if (!THINK.isArray(key)) {
        obj[key] = value;
        return obj;
    }
    key.forEach(function (item, i) {
        obj[item] = value[i];
    });
    return obj;
};
/**
 * 判断值是否是数组的元素
 * @param needle
 * @param haystack 数组
 * @returns {boolean}
 */
THINK.inArray = function (needle, haystack) {
    'use strict';
    let length = haystack.length;
    for (let i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
};
/**
 * 将数组变成对象
 * @param  {[type]} arr       [description]
 * @param  {[type]} key       [description]
 * @param  {[type]} valueKeys [description]
 * @return {[type]}           [description]
 */
THINK.arrToObj = function (arr, key, valueKey) {
    'use strict';
    let result = {};
    let arrResult = [];
    arr.forEach(function (item) {
        let keyValue = item[key];
        if (valueKey === null) {
            arrResult.push(keyValue);
        } else if (valueKey) {
            result[keyValue] = item[valueKey];
        } else {
            result[keyValue] = item;
        }
    });
    return valueKey === null ? arrResult : result;
};
/**
 * 数组去重
 * @param arr
 * @returns {Array}
 */
THINK.arrUnique = function (arr) {
    'use strict';
    let ret = [],
        json = {},
        length = arr.length;
    for (let i = 0; i < length; i++) {
        let val = arr[i];
        if (!json[val]) {
            json[val] = 1;
            ret.push(val);
        }
    }
    return ret;
};
/**
 * 数组删除元素
 * @param array
 * @param toDeleteIndexes
 * @returns {Array}
 */
THINK.arrRemove = function (array, toDeleteIndexes) {
    'use strict';
    let result = [];
    for (let i = 0; i < array.length; i++) {
        let needDelete = false;
        for (let j = 0; j < toDeleteIndexes.length; j++) {
            if (i == toDeleteIndexes[j]) {
                needDelete = true;
                break;
            }
        }
        if (!needDelete) {
            result.push(array[i]);
        }
    }
    return result;
};
/**
 * extend, from jquery，具有深度复制功能
 * @return {[type]} [description]
 */
THINK.extend = function () {
    'use strict';
    let args = [].slice.call(arguments);
    let deep = true;
    let target;
    if (THINK.isBoolean(args[0])) {
        deep = args.shift();
    }
    if (deep) {
        target = THINK.isArray(args[0]) ? [] : {};
    } else {
        target = args.shift();
    }
    target = target || {};
    var i = 0,
        length = args.length,
        options = undefined,
        name = undefined,
        src = undefined,
        copy = undefined;
    for (; i < length; i++) {
        options = args[i];
        if (!options) {
            continue;
        }
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            if (deep) {
                if (THINK.isObject(copy)) {
                    target[name] = THINK.extend(src && THINK.isObject(src) ? src : {}, copy);
                } else if (THINK.isArray(copy)) {
                    target[name] = THINK.extend([], copy);
                } else {
                    target[name] = copy;
                }
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
THINK.safeRequire = function (file) {
    'use strict';
    let _interopSafeRequire = _file => {
        let obj = require(_file);
        if (obj && obj.__esModule && obj.default) {
            return obj.default;
        }
        return obj;
    };
    // absolute file path is not exist
    if (path.isAbsolute(file)) {
        //no need optimize, only invoked before service start
        if (!THINK.isFile(file)) {
            return null;
        }
        //when file is exist, require direct
        return _interopSafeRequire(file);
    }
    try {
        return _interopSafeRequire(file);
    } catch (err) {
        return null;
    }
};
/**
 * 抛出异常,当isbreak为true时中断执行
 * @param msg
 * @param isbreak
 * @returns {type[]}
 * @constructor
 */
THINK.Err = function (msg, isbreak) {
    'use strict';
    if (THINK.isPromise(msg)) {
        return msg.catch(e => {
            return THINK.Err(e);
        })
    }
    if (isbreak === undefined || isbreak === true) {
        isbreak = true;
    } else {
        isbreak = false;
    }
    msg = msg || '';
    if (!THINK.isError(msg)) {
        if (!THINK.isString(msg)) {
            msg = JSON.stringify(msg);
        }
        msg = new Error(msg);
    }
    if (isbreak === true) {
        return Promise.reject(msg);
    } else {
        THINK.cPrint(msg);//console print
        return msg;
    }
};
/**
 * 控制台打印封装
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
THINK.cPrint = function (msg, type, showTime) {
    'use strict';
    let d = new Date();
    let date = d.Format('yyyy-mm-dd');
    let time = d.Format('hh:mi:ss');
    let dateTime = `[${date} ${time}] `;

    if (THINK.isError(msg)) {
        type = 'ERROR';
        msg = msg.stack;
        console.error(msg);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        console.error(msg);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        console.warn(msg);
    } else {
        if (!THINK.isString(msg)) {
            msg = JSON.stringify(msg);
        }
        if (THINK.isNumber(showTime)) {
            let _time = Date.now() - showTime;
            msg += '  ' + `${_time}ms`;
        }
        type = type || 'INFO ';
    }
    console.log(`${dateTime}[${type}] ${msg}`);
    return;
};

/**
 * global memory cache
 * @param type
 * @param name
 * @param value
 * @returns {*}
 */
THINK.cache = function (type, name, value) {
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
 * @param name
 * @param type
 * @returns {*}
 */
THINK.require = function (name, type) {
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
            THINK.cache(type || THINK.CACHES.ALIAS_EXPORT, name, obj);
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
};

/**
 * 中间件挂载机制
 * @param args
 * @returns {*}
 */
THINK.hook = function (...args) {
    let [name, type, append] = args;
    if (!name || !type) {
        return;
    }
    THINK.CACHES['EXMIDDLEWARE'] || (THINK.CACHES['EXMIDDLEWARE'] = []);
    THINK.CACHES['EXMIDDLEWARE'].push({
        name: name,
        type: type,
        append: append || 'append'
    });
    return;
};
/**
 * 中间件执行机制
 * @param args
 * @returns {*}
 */
THINK.use = function (...args) {
    let [name, http, data] = args;
    if(THINK.isString(name)){
        let layer = 'Middleware';
        if (!name) {
            return data;
        }
        //支持目录
        name = name.split('/');
        let gc = name[0];
        if (name[1]) {
            gc = name[0] + '/' + name[1];
        }
        let fn = THINK.require(gc, layer);
        if (!fn) {
            return THINK.Err(`${ layer } ${ name } is undefined`);
        }
        if (fn.prototype.run) {
            let cls = new fn(http);
            return cls.run(data);
        } else {
            return fn(http, data);
        }
    }
    return name(http, data);
};

/**
 * Adapter机制
 * @param name
 * @param obj
 */
THINK.adapter = function (name, obj) {
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
};

/**
 * 自定义日志记录
 * @param context
 * @param name
 */
THINK.addLogs = function (name, context) {
    try {
        if (!THINK.isString(context)) {
            context = JSON.stringify(context);
        }
        if (!THINK.INSTANCES.LOG) {
            THINK.INSTANCES.LOG = THINK.adapter(`${THINK.CONF.log_type}Logs`);
        }
        return new (THINK.INSTANCES.LOG)({log_itemtype: 'custom'}).logCustom(name, context);
    } catch (e) {
        return THINK.Err(e, false);
    }
};

/**
 * 值循环过滤，深度过滤
 * @param object 数组或对象(对象属性值可以为字符串或数组)
 * @returns {*}
 */
THINK.walkFilter = function (object) {
    if (!THINK.isObject(object) && !THINK.isArray(object)) {
        return THINK.htmlspecialchars(object);
    }
    for (let n in object) {
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
};


/**
 * 调用一个具体的Controller类Action
 * THINK.A('Home/Index', this.http), A('Admin/Index/test', this.http)
 * @param name
 * @param http
 * @returns {*}
 * @constructor
 */
THINK.A = function (name, http) {
    name = name.split('/');
    http.group = name[0];
    http.controller = name[1];
    http.action = name[2] || 'index';
    let App = new (THINK.App)();
    return App.exec(http);
};

/**
 * 配置读取和写入
 * @param name
 * @param value
 * @returns {*}
 * @constructor
 */
THINK.C = function (name, value) {
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
};
//错误封装
THINK.E = THINK.Err;

/**
 * 快速文件读取和写入
 * 默认写入到App/Runtime/Data目录下
 * @param name
 * @param value
 * @param rootPath
 * @constructor
 */
THINK.F = function (name, value, rootPath) {
    try{
        rootPath = rootPath || THINK.DATA_PATH;
        let filePath = rootPath + '/' + name + '.json';
        if (value !== undefined) {
            THINK.mkDir(path.dirname(filePath));
            fs.writeFileSync(filePath, JSON.stringify(value));
            THINK.chmod(filePath);
            return;
        }
        if(THINK.isFile(filePath)){
            let content = THINK.getFileContent(filePath);
            if (content) {
                return JSON.parse(content);
            }
        }
        return;
    }catch (e){
        return THINK.Err(e);
    }
};

/**
 * 输入变量获取
 * @param name
 * @param cls
 * @param method
 * @param defaultValue
 * @returns {*}
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
};

/**
 * 实例化模型
 * @param name
 * @param config
 * @param layer
 * @returns {*}
 * @constructor
 */
THINK.M = function (name, config = {}) {
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
THINK.O = function (http, status = 200, msg = '', type) {
    type = type || http.runType;
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
                <html>
                <head>
                <meta charset="utf-8"/>
                <title>ThinkNode Error</title>
                </head>
                <body>
                <div id="wrapper">
                <h2>ThinkNode</h2>
                <h2><em>${ status }</em></h2>
                <ul><li><pre>${ msg }</pre></li></ul>
                </div>
                </body>
                </html>`, THINK.C('encoding'));
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
};

//控制台输出封装
THINK.P = THINK.cPrint;

/**
 * 运行挂载点挂载的中间件链
 * @param name
 * @param http
 * @param data
 * @returns {Promise.<*>}
 * @constructor
 */
THINK.R = function (name, http, data) {
    let list = THINK.HOOK[name] || [];
    let runItemMiddleware = function (list, index, http, data) {
        let item = list[index];
        if (!item) {
            return Promise.resolve(data);
        }
        return THINK.use(item, http, data).then(result => {
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
};

/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 * @param name
 * @param value
 * @param options
 * @returns {*}
 * @constructor
 */
THINK.S = function (name, value, options) {
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
};

/**
 * URL格式化 输出带伪静态支持的标准url
 * @param urls URL表达式，格式：'模块[/控制器/操作]'
 * @param http http对象
 * @param vars 传入的参数，支持对象和字符串 {var1: "aa", var2: "bb"}
 * @return string
 */
THINK.U = function (urls, http, vars = '') {
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
};

/**
 * 调用服务类
 * @param name
 * @param arg
 * @param config
 * @param layer
 * @returns {*}
 * @constructor
 */
THINK.X = function (name, arg, config, layer = 'Service') {
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
};
