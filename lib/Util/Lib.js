'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * 是否是buffer
 * @type {Boolean}
 */
var isBuffer = Buffer.isBuffer;
/**
 * 是否是个数组
 * @type {Boolean}
 */
var isArray = Array.isArray;
/**
 * 是否是IP
 * @type {Boolean}
 */
var isIP = net.isIP;
var isIP4 = net.isIP4;
var isIP6 = net.isIP6;
/**
 * check object is http object
 * @param  {Mixed}  obj []
 * @return {Boolean}      []
 */
function isHttp(obj) {
    'use strict';

    return !!(obj && isObject(obj.req) && isObject(obj.res));
}
/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
function isBoolean(obj) {
    'use strict';

    return toString.call(obj) === '[object Boolean]';
}
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isNumber(obj) {
    'use strict';

    return toString.call(obj) === '[object Number]';
}
/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isObject(obj) {
    'use strict';

    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return toString.call(obj) === '[object Object]';
}
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isString(obj) {
    'use strict';

    return toString.call(obj) === '[object String]';
}
/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isNumberString(obj) {
    'use strict';

    let numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(obj);
}
/**
 * 是否是标准JSON对象
 * @param obj
 * @returns {boolean}
 */
function isJSONObj(obj) {
    'use strict';

    return typeof obj === 'object' && Object.prototype.toString.call(obj).toLowerCase() === '[object object]' && !obj.length;
}
/**
 * 是否是标准的JSON字符串
 * @param str
 * @returns {boolean}
 */
function isJSONStr(str) {
    'use strict';

    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isFunction(obj) {
    'use strict';

    return typeof obj === 'function';
}
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
function isDate(obj) {
    'use strict';

    return util.isDate(obj);
}
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
function isRegexp(obj) {
    'use strict';

    return util.isRegExp(obj);
}
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isError(obj) {
    'use strict';

    return util.isError(obj);
}
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isScalar(obj) {
    'use strict';

    return isBoolean(obj) || isNumber(obj) || isString(obj);
}
/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
function isEmpty(obj) {
    'use strict';

    if (obj === null || obj === undefined || obj === '') {
        return true;
    } else if (isString(obj)) {
        //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
        return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    } else if (Array.isArray(obj)) {
        return obj.length === 0;
    } else if (isObject(obj)) {
        for (let key in obj) {
            return false;
        }
        return true;
    } else {
        return false;
    }
}
/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isPromise(obj) {
    'use strict';

    return !!(obj && typeof obj.then === 'function');
}
/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
function promisify(fn, receiver) {
    'use strict';

    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new _promise2.default(function (resolve, reject) {
            fn.apply(receiver, [].concat(args, [function (err, res) {
                return err ? reject(err) : resolve(res);
            }]));
        });
    };
}
/**
 * 生成一个promise,如果传入的参数是promise则直接返回
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function getPromise(obj, reject) {
    'use strict';

    if (isPromise(obj)) {
        return obj;
    }
    if (reject) {
        return _promise2.default.reject(obj);
    }
    return _promise2.default.resolve(obj);
}
/**
 * 生成一个defer对象
 * @return {[type]} [description]
 */
function getDefer() {
    'use strict';

    let deferred = {};
    deferred.promise = new _promise2.default(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}
/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
function isFile(p) {
    'use strict';

    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isFile();
}
/**
 * 是否是个目录
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
function isDir(p) {
    'use strict';

    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isDirectory();
}
/**
 * 判断一个文件或者目录是否可写
 * @param  {[type]}  p [description]
 * @return {Boolean}      [description]
 */
function isWritable(p) {
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
    return !!(owner && mode & parseInt('00200', 8) || group && mode & parseInt('00020', 8) || mode & parseInt('00002', 8));
}
/**
 * 递归创建目录，同步模式
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
function mkDir(p, mode) {
    'use strict';

    mode = mode || '0777';
    if (fs.existsSync(p)) {
        chmod(p, mode);
        return true;
    }
    let pp = path.dirname(p);
    if (fs.existsSync(pp)) {
        fs.mkdirSync(p, mode);
    } else {
        mkDir(pp, mode);
        mkDir(p, mode);
    }
    return true;
}
/**
 * 读取文件
 * @param filename 文件物理路径
 * @param enc      为空返回Buffer类型,'utf8'返回String类型
 * @returns {Promise}
 */
function mReadFile(filename, enc) {
    'use strict';

    return new _promise2.default(function (fulfill, reject) {
        fs.readFile(filename, enc, function (err, res) {
            if (err) reject(err);else fulfill(res);
        });
    });
}
/**
 * 写入文件
 * @param filename 文件物理路径
 * @param data     Buffer数据
 * @returns {Promise}
 */
function mWriteFile(filename, data) {
    'use strict';

    return new _promise2.default(function (fulfill, reject) {
        fs.writeFile(filename, data, function (err, res) {
            if (err) reject(err);else fulfill(res);
        });
    });
}
/**
 * 修改文件名，支持移动
 * @param filename 原文件名
 * @param sfilename 新文件名
 * @returns {Promise}
 */
function mReName(filename, nfilename) {
    'use strict';

    return new _promise2.default(function (fulfill, reject) {
        fs.rename(filename, nfilename, function (err, res) {
            if (err) reject(err);else fulfill(res);
        });
    });
}
/**
 * 递归的删除目录，返回promise
 * @param  string p       要删除的目录
 * @param  boolean reserve 是否保留当前目录，只删除子目录
 * @return Promise
 */
function rmDir(p, reserve) {
    'use strict';

    if (!isDir(p)) {
        return _promise2.default.resolve();
    }
    let deferred = getDefer();
    fs.readdir(p, function (err, files) {
        if (err) {
            return deferred.reject(err);
        }
        let promises = files.map(function (item) {
            let filepath = path.normalize(p + '/' + item);
            if (isDir(filepath)) {
                return rmDir(filepath, false);
            } else {
                let defer = getDefer();
                fs.unlink(filepath, function (err) {
                    return err ? defer.reject(err) : defer.resolve();
                });
                return defer.promise;
            }
        });
        let promise = files.length === 0 ? _promise2.default.resolve() : _promise2.default.all(promises);
        return promise.then(function () {
            if (!reserve) {
                let defer = getDefer();
                fs.rmdir(p, function (err) {
                    return err ? defer.reject(err) : defer.resolve();
                });
                return defer.promise;
            }
        }).then(function () {
            deferred.resolve();
        }).catch(function (err) {
            deferred.reject(err);
        });
    });
    return deferred.promise;
}
/**
 * 修改目录或者文件权限
 * @param  {[type]} p    [description]
 * @param  {[type]} mode [description]
 * @return {[type]}      [description]
 */
function chmod(p, mode) {
    'use strict';

    mode = mode || '0777';
    if (!fs.existsSync(p)) {
        return true;
    }
    return fs.chmodSync(p, mode);
}
/**
 * 获取文件内容
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function getFileContent(file, encoding) {
    'use strict';

    if (!fs.existsSync(file)) {
        return '';
    }
    return fs.readFileSync(file, encoding || 'utf8');
}

/**
 * 设置文件内容
 * @param  {[type]} file [description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function setFileContent(file, data) {
    'use strict';

    let filepath = path.dirname(file);
    mkDir(filepath);
    return fs.writeFileSync(file, data);
}
/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
function ucFirst(name) {
    'use strict';

    name = (name || '') + '';
    return name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase();
}
/**
 * 参数特殊字符转义
 * @param str
 * @returns {*}
 */
function htmlspecialchars(str) {
    'use strict';

    if (str === null || str === undefined) {
        return '';
    }
    if (typeof str === 'string') {
        if (/[&<>"']/.test(str)) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        }
    }
    return str;
}
/**
 * 获取字符串的md5
 * @param  {[type]} str [description]
 * @return {[type]} charset [description]
 */
function md5(str) {
    'use strict';

    let charset = arguments.length <= 1 || arguments[1] === undefined ? 'utf-8' : arguments[1];
    let instance = crypto.createHash('md5');
    instance.update(str + '', charset);
    return instance.digest('hex');
}
/**
 * 字符串或文件hash,比md5效率高,但是有很低的概率重复
 * @param input
 * @returns {string}
 */
function hash(input) {
    'use strict';

    let _hash = 5381;
    let I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
    let i = input.length - 1;

    if (typeof input === 'string') {
        for (; i > -1; i--) _hash += (_hash << 5) + input.charCodeAt(i);
    } else {
        for (; i > -1; i--) _hash += (_hash << 5) + input[i];
    }
    let value = _hash & 0x7FFFFFFF;

    let retValue = '';
    do {
        retValue += I64BIT_TABLE[value & 0x3F];
    } while (value >>= 6);

    return retValue;
}
/**
 * 获取随机整数
 * @param min
 * @param max
 * @returns {number}
 */
function rand(min, max) {
    'use strict';

    return Math.floor(min + Math.random() * (max - min + 1));
}
/**
 * 快速生成一个object
 * @param  {[type]} key   [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
function getObject(key, value) {
    'use strict';

    let obj = {};
    if (!isArray(key)) {
        obj[key] = value;
        return obj;
    }
    key.forEach(function (item, i) {
        obj[item] = value[i];
    });
    return obj;
}
/**
 * 判断值是否是数组的元素
 * @param needle
 * @param haystack 数组
 * @returns {boolean}
 */
function inArray(needle, haystack) {
    'use strict';

    let length = haystack.length;
    for (let i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
}
/**
 * 将数组变成对象
 * @param  {[type]} arr       [description]
 * @param  {[type]} key       [description]
 * @param  {[type]} valueKeys [description]
 * @return {[type]}           [description]
 */
function arrToObj(arr, key, valueKey) {
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
}
/**
 * 数组去重
 * @param arr
 * @returns {Array}
 */
function arrUnique(arr) {
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
}
/**
 * 数组删除元素
 * @param array
 * @param toDeleteIndexes
 * @returns {Array}
 */
function arrRemove(array, toDeleteIndexes) {
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
}
/**
 * extend, from jquery，具有深度复制功能
 * @return {[type]} [description]
 */
function extend() {
    'use strict';

    let args = [].slice.call(arguments);
    let deep = true;
    let target;
    if (isBoolean(args[0])) {
        deep = args.shift();
    }
    if (deep) {
        target = isArray(args[0]) ? [] : {};
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
                if (isObject(copy)) {
                    target[name] = extend(src && isObject(src) ? src : {}, copy);
                } else if (isArray(copy)) {
                    target[name] = extend([], copy);
                } else {
                    target[name] = copy;
                }
            } else {
                target[name] = copy;
            }
        }
    }
    return target;
}
/**
 * 安全方式加载文件
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
function safeRequire(file) {
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
        if (!isFile(file)) {
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
}
/**
 * 抛出异常,当isbreak为true时中断执行
 * @param msg
 * @param isbreak
 * @returns {type[]}
 * @constructor
 */
function Err(msg, isbreak) {
    'use strict';

    if (isPromise(msg)) {
        return msg.catch(e => {
            return Err(e);
        });
    }
    if (isbreak === undefined || isbreak === true) {
        isbreak = true;
    } else {
        isbreak = false;
    }
    msg = msg || '';
    if (!isError(msg)) {
        if (!isString(msg)) {
            msg = (0, _stringify2.default)(msg);
        }
        msg = new Error(msg);
    }
    if (isbreak === true) {
        return _promise2.default.reject(msg);
    } else {
        cPrint(msg); //console print
        return msg;
    }
}
/**
 * 控制台打印封装
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
function cPrint(msg, type, showTime) {
    'use strict';

    let d = new Date();
    let date = d.Format('yyyy-mm-dd');
    let time = d.Format('hh:mi:ss');
    let dateTime = `[${ date } ${ time }] `;

    if (isError(msg)) {
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
        if (!isString(msg)) {
            msg = (0, _stringify2.default)(msg);
        }
        if (isNumber(showTime)) {
            let _time = Date.now() - showTime;
            msg += '  ' + `${ _time }ms`;
        }
        type = type || 'INFO ';
    }
    console.log(`${ dateTime }[${ type }] ${ msg }`);
    return;
}

module.exports = {
    isBuffer: isBuffer,
    isArray: isArray,
    isIP: isIP,
    isIP4: isIP4,
    isIP6: isIP6,
    isHttp: isHttp,
    isBoolean: isBoolean,
    isNumber: isNumber,
    isObject: isObject,
    isString: isString,
    isNumberString: isNumberString,
    isJSONObj: isJSONObj,
    isJSONStr: isJSONStr,
    isFunction: isFunction,
    isDate: isDate,
    isRegexp: isRegexp,
    isError: isError,
    isScalar: isScalar,
    isEmpty: isEmpty,
    isPromise: isPromise,
    promisify: promisify,
    getPromise: getPromise,
    getDefer: getDefer,
    isFile: isFile,
    isDir: isDir,
    isWritable: isWritable,
    mkDir: mkDir,
    mReadFile: mReadFile,
    mWriteFile: mWriteFile,
    mReName: mReName,
    rmDir: rmDir,
    chmod: chmod,
    getFileContent: getFileContent,
    setFileContent: setFileContent,
    ucFirst: ucFirst,
    htmlspecialchars: htmlspecialchars,
    md5: md5,
    hash: hash,
    rand: rand,
    getObject: getObject,
    inArray: inArray,
    arrToObj: arrToObj,
    arrUnique: arrUnique,
    arrRemove: arrRemove,
    extend: extend,
    safeRequire: safeRequire,
    Err: Err,
    cPrint: cPrint
};