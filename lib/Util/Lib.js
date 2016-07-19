'use strict';
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/2
 */

var _defineProperty = require('babel-runtime/core-js/object/define-property');

var _defineProperty2 = _interopRequireDefault(_defineProperty);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');
var util = require('util');
var crypto = require('crypto');
var net = require('net');
var querystring = require('querystring');
var _objDefinePropertyNoWrite = [];
function _interopSafeRequire(obj) {
    return obj && obj.__esModule && obj.default ? obj.default : obj;
}
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
THINK.isBuffer = Buffer.isBuffer;
_objDefinePropertyNoWrite.push('isBuffer');
/**
 * 是否是个数组
 * @type {Boolean}
 */
THINK.isArray = Array.isArray;
_objDefinePropertyNoWrite.push('isArray');
/**
 * 是否是IP
 * @type {Boolean}
 */
THINK.isIP = net.isIP;
_objDefinePropertyNoWrite.push('isIP');
THINK.isIP4 = net.isIP4;
_objDefinePropertyNoWrite.push('isIP4');
THINK.isIP6 = net.isIP6;
_objDefinePropertyNoWrite.push('isIP6');
/**
 * check object is http object
 * @param  {Mixed}  obj []
 * @return {Boolean}      []
 */
THINK.isHttp = function (obj) {
    'use strict';

    return !!(obj && THINK.isObject(obj.req) && THINK.isObject(obj.res));
};
_objDefinePropertyNoWrite.push('isHttp');
/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
THINK.isBoolean = function (obj) {
    'use strict';

    return toString.call(obj) === '[object Boolean]';
};
_objDefinePropertyNoWrite.push('isBoolean');
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isNumber = function (obj) {
    'use strict';

    return toString.call(obj) === '[object Number]';
};
_objDefinePropertyNoWrite.push('isNumber');
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
_objDefinePropertyNoWrite.push('isObject');
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isString = function (obj) {
    'use strict';

    return toString.call(obj) === '[object String]';
};
_objDefinePropertyNoWrite.push('isString');
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
_objDefinePropertyNoWrite.push('isNumberString');
/**
 * 是否是标准JSON对象
 * @param obj
 * @returns {boolean}
 */
THINK.isJSONObj = function (obj) {
    'use strict';

    return typeof obj === 'object' && Object.prototype.toString.call(obj).toLowerCase() === '[object object]' && !obj.length;
};
_objDefinePropertyNoWrite.push('isJSONObj');
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
_objDefinePropertyNoWrite.push('isJSONStr');
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isFunction = function (obj) {
    'use strict';

    return typeof obj === 'function';
};
_objDefinePropertyNoWrite.push('isFunction');
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
THINK.isDate = function (obj) {
    'use strict';

    return util.isDate(obj);
};
_objDefinePropertyNoWrite.push('isDate');
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
THINK.isRegexp = function (obj) {
    'use strict';

    return util.isRegExp(obj);
};
_objDefinePropertyNoWrite.push('isRegexp');
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isError = function (obj) {
    'use strict';

    return util.isError(obj);
};
_objDefinePropertyNoWrite.push('isError');
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isScalar = function (obj) {
    'use strict';

    return THINK.isBoolean(obj) || THINK.isNumber(obj) || THINK.isString(obj);
};
_objDefinePropertyNoWrite.push('isScalar');
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
_objDefinePropertyNoWrite.push('isEmpty');
/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
THINK.isPromise = function (obj) {
    'use strict';

    return !!(obj && typeof obj.then === 'function');
};
_objDefinePropertyNoWrite.push('isPromise');
/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
THINK.promisify = function (fn, receiver) {
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
};
_objDefinePropertyNoWrite.push('promisify');
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
        return _promise2.default.reject(obj);
    }
    return _promise2.default.resolve(obj);
};
_objDefinePropertyNoWrite.push('getPromise');
/**
 * 生成一个defer对象
 * @return {[type]} [description]
 */
THINK.getDefer = function () {
    'use strict';

    let deferred = {};
    deferred.promise = new _promise2.default(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};
_objDefinePropertyNoWrite.push('getDefer');
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
_objDefinePropertyNoWrite.push('isFile');
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
_objDefinePropertyNoWrite.push('isDir');
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
    return !!(owner && mode & parseInt('00200', 8) || group && mode & parseInt('00020', 8) || mode & parseInt('00002', 8));
};
_objDefinePropertyNoWrite.push('isWritable');
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
_objDefinePropertyNoWrite.push('mkDir');
/**
 * 读取文件
 * @param filename 文件物理路径
 * @param enc      为空返回Buffer类型,'utf8'返回String类型
 * @returns {Promise}
 */
THINK.mReadFile = function (filename, enc) {
    'use strict';

    return new _promise2.default(function (fulfill, reject) {
        fs.readFile(filename, enc, function (err, res) {
            if (err) reject(err);else fulfill(res);
        });
    });
};
_objDefinePropertyNoWrite.push('mReadFile');
/**
 * 写入文件
 * @param filename 文件物理路径
 * @param data     Buffer数据
 * @returns {Promise}
 */
THINK.mWriteFile = function (filename, data) {
    'use strict';

    return new _promise2.default(function (fulfill, reject) {
        fs.writeFile(filename, data, function (err, res) {
            if (err) reject(err);else fulfill(res);
        });
    });
};
_objDefinePropertyNoWrite.push('mWriteFile');
/**
 * 修改文件名，支持移动
 * @param filename 原文件名
 * @param sfilename 新文件名
 * @returns {Promise}
 */
THINK.mReName = function (filename, nfilename) {
    'use strict';

    return new _promise2.default(function (fulfill, reject) {
        fs.rename(filename, nfilename, function (err, res) {
            if (err) reject(err);else fulfill(res);
        });
    });
};
_objDefinePropertyNoWrite.push('mReName');
/**
 * 递归的删除目录，返回promise
 * @param  string p       要删除的目录
 * @param  boolean reserve 是否保留当前目录，只删除子目录
 * @return Promise
 */
THINK.rmDir = function (p, reserve) {
    'use strict';

    if (!THINK.isDir(p)) {
        return _promise2.default.resolve();
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
        let promise = files.length === 0 ? _promise2.default.resolve() : _promise2.default.all(promises);
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
        });
    });
    return deferred.promise;
};
_objDefinePropertyNoWrite.push('rmDir');
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
_objDefinePropertyNoWrite.push('chmod');
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
_objDefinePropertyNoWrite.push('getFileContent');
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
_objDefinePropertyNoWrite.push('setFileContent');
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
_objDefinePropertyNoWrite.push('ucFirst');
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
        if (/[&<>"']/.test(str)) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        }
    }
    return str;
};
_objDefinePropertyNoWrite.push('htmlspecialchars');
/**
 * 获取字符串的md5
 * @param  {[type]} str [description]
 * @return {[type]} charset [description]
 */
THINK.md5 = function (str) {
    'use strict';

    let charset = arguments.length <= 1 || arguments[1] === undefined ? 'utf-8' : arguments[1];
    let instance = crypto.createHash('md5');
    instance.update(str + '', charset);
    return instance.digest('hex');
};
_objDefinePropertyNoWrite.push('md5');
/**
 * 字符串或文件hash,比md5效率高,但是有很低的概率重复
 * @param input
 * @returns {string}
 */
THINK.hash = function (input) {
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
};
_objDefinePropertyNoWrite.push('hash');
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
_objDefinePropertyNoWrite.push('rand');
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
_objDefinePropertyNoWrite.push('getObject');
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
_objDefinePropertyNoWrite.push('inArray');
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
_objDefinePropertyNoWrite.push('arrToObj');
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
_objDefinePropertyNoWrite.push('arrUnique');
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
_objDefinePropertyNoWrite.push('arrRemove');

/*#################################################system function lib#####################################################*/
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
_objDefinePropertyNoWrite.push('extend');
/**
 * 安全方式加载文件
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
THINK.safeRequire = function (file) {
    'use strict';

    try {
        var obj = require(file);
        return _interopSafeRequire(obj);
    } catch (err) {
        return null;
    }
};
_objDefinePropertyNoWrite.push('safeRequire');
/**
 * global memory cache
 * @param type
 * @param name
 * @param value
 * @returns {*}
 */
THINK.loadCache = function (type, name, value) {
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
_objDefinePropertyNoWrite.push('loadCache');
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
    let Cls = THINK.loadCache(type || THINK.CACHES.ALIAS_EXPORT, name);
    if (!THINK.isEmpty(Cls)) {
        return Cls;
    }
    let load = (name, filepath) => {
        let obj = THINK.safeRequire(filepath);
        if (THINK.isFunction(obj)) {
            obj.prototype.__filename = filepath;
        }
        if (obj) {
            THINK.loadCache(type || THINK.CACHES.ALIAS_EXPORT, name, obj);
        }
        return obj;
    };

    try {
        let filepath = type ? THINK.loadCache(THINK.CACHES.ALIAS, type)[name] : THINK.loadCache(THINK.CACHES.ALIAS, name);
        if (filepath) {
            return load(name, path.normalize(filepath));
        }
        filepath = require.resolve(name);
        return load(name, filepath);
    } catch (e) {
        return null;
    }
};
_objDefinePropertyNoWrite.push('require');

/*#################################################custom function lib#####################################################*/

/**
 * 调用执行Group/Controller/Action
 * THINK.action('Home/Index', this.http), THINK.action('Admin/Index/test', this.http)
 * @param name
 * @param http
 * @returns {*}
 * @constructor
 */
THINK.action = function (name, http) {
    name = name.split('/');
    http.group = name[0];
    http.controller = name[1];
    http.action = name[2] || 'index';
    let App = new THINK.App();
    return App.exec(http);
};
THINK.A = function (name, http) {
    THINK.log('function THINK.A is pending deprecation, please use THINK.action', 'WARNING');
    return THINK.action(name, http);
};
_objDefinePropertyNoWrite.push('action');
/**
 * 加载/实例化一个Adapter
 * @param name
 * @param options
 * @returns {*}
 */
THINK.adapter = function (name, options) {
    try {
        let cls;
        if (!THINK.isString(name) && name.__filename) {
            cls = THINK.require(name.__filename, 'Adapter');
        } else {
            cls = THINK.require(name, 'Adapter');
        }
        if (!cls) {
            return THINK.error(`Adapter ${ name } is undefined`);
        }
        if (options !== undefined) {
            return new cls(options);
        }
        return cls;
    } catch (e) {
        return THINK.error(e);
    }
};
_objDefinePropertyNoWrite.push('adapter');
/**
 * 自定义日志记录
 * @param context
 * @param name
 */
THINK.addLogs = function (name, context) {
    try {
        if (!THINK.isString(context)) {
            context = (0, _stringify2.default)(context);
        }
        if (!THINK.INSTANCES.LOG) {
            THINK.INSTANCES.LOG = THINK.adapter(`${ THINK.CONF.log_type }Logs`);
        }
        return new THINK.INSTANCES.LOG({ log_itemtype: 'custom' }).logCustom(name, context);
    } catch (e) {
        return THINK.error(e, false);
    }
};
_objDefinePropertyNoWrite.push('addLogs');
/**
 * 执行等待，避免一个耗时的操作多次被执行。 callback 需要返回一个 Promise 。
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
var _awaitInstance = new (_interopSafeRequire(require('./Await.js')))();
THINK.await = function (key, callback) {
    return _awaitInstance.run(key, callback);
};
_objDefinePropertyNoWrite.push('await');
/**
 * 缓存的设置和读取
 * 获取返回的是一个promise
 * @param name
 * @param value
 * @param options
 * @returns {*}
 * @constructor
 */
THINK.cache = function (name, value, options) {
    try {
        if (THINK.isNumber(options)) {
            options = { cache_timeout: options };
        } else if (options === null) {
            options = { cache_timeout: null };
        }
        options = options || {};
        options.cache_key_prefix = ~THINK.config('cache_key_prefix').indexOf(':') ? `${ THINK.config('cache_key_prefix') }Cache:` : `${ THINK.config('cache_key_prefix') }:Cache:`;
        let cls = THINK.adapter(`${ THINK.config('cache_type') || 'File' }Cache`);
        let instance = new cls(options);
        if (value === undefined || value === '') {
            //获取缓存
            return instance.get(name).then(function (value) {
                return value ? JSON.parse(value) : value;
            });
        } else if (value === null) {
            return instance.rm(name); //删除缓存
        } else {
            return instance.set(name, (0, _stringify2.default)(value), options.cache_timeout);
        }
    } catch (e) {
        return THINK.error(e);
    }
};
THINK.S = function (name, value, options) {
    THINK.log('function THINK.S is pending deprecation, please use THINK.cache', 'WARNING');
    return THINK.cache(name, value, options);
};
_objDefinePropertyNoWrite.push('cache');
/**
 * 配置读取和写入
 * @param name
 * @param value
 * @returns {*}
 * @constructor
 */
THINK.config = function (name, value) {
    let _conf = THINK.loadCache(THINK.CACHES.CONF);
    //获取所有的配置
    if (!name && !value) {
        return THINK.extend(THINK.CONF, _conf || {});
    }
    if (THINK.isString(name)) {
        //name里不含. 一级
        if (!~name.indexOf('.')) {
            if (value === undefined) {
                value = name in _conf ? _conf[name] : THINK.CONF[name];
                return value;
            } else {
                THINK.loadCache(THINK.CACHES.CONF, name, value);
                return;
            }
        } else {
            //name中含有. 二级
            name = name.split('.');
            if (value === undefined) {
                value = (name[0] in _conf ? _conf[name[0]] : THINK.CONF[name[0]]) || {};
                return value[name[1]];
            } else {
                if (!_conf[name[0]]) _conf[name[0]] = {};
                _conf[name[0]][name[1]] = value;
                THINK.loadCache(THINK.CACHES.CONF, name[0], _conf[name[0]]);
                return;
            }
        }
    } else {
        _conf = THINK.extend(false, _conf, name);
        THINK.CACHES[THINK.CACHES.CONF] = _conf;
        return;
    }
};
THINK.C = function (name, value) {
    THINK.log('function THINK.C is pending deprecation, please use THINK.config', 'WARNING');
    return THINK.config(name, value);
};
_objDefinePropertyNoWrite.push('config');
/**
 * 加载/实例化一个Controller
 * @param name
 * @param http
 * @returns {*}
 */
THINK.controller = function (name, http) {
    try {
        if (!name && !http) {
            return THINK.Controller;
        }
        let cls;
        if (!THINK.isString(name) && name.__filename) {
            cls = THINK.require(name.__filename, 'Controller');
        } else {
            cls = THINK.require(name, 'Controller');
        }
        if (!cls) {
            return THINK.error(`Controller ${ name } is undefined`);
        }
        if (http && THINK.isHttp(http)) {
            return new cls(http);
        }
        return cls;
    } catch (e) {
        return THINK.error(e);
    }
};
_objDefinePropertyNoWrite.push('controller');
/**
 * 快速文件读取和写入
 * 默认写入到App/Runtime/Data目录下
 * @param name
 * @param value
 * @param rootPath
 * @constructor
 */
THINK.data = function (name, value, rootPath) {
    try {
        rootPath = rootPath || THINK.DATA_PATH;
        let filePath = rootPath + '/' + name + '.json';
        if (value !== undefined) {
            THINK.mkDir(path.dirname(filePath));
            fs.writeFileSync(filePath, (0, _stringify2.default)(value));
            THINK.chmod(filePath);
            return;
        }
        if (THINK.isFile(filePath)) {
            let content = THINK.getFileContent(filePath);
            if (content) {
                return JSON.parse(content);
            }
        }
        return;
    } catch (e) {
        return THINK.error(e);
    }
};
THINK.F = function (name, value, rootPath) {
    THINK.log('function THINK.F is pending deprecation, please use THINK.data', 'WARNING');
    return THINK.data(name, value, rootPath);
};
_objDefinePropertyNoWrite.push('data');
/**
 * http生命周期结束
 * @param http
 * @param status
 * @param msg
 * @param type
 * @returns {*}
 * @constructor
 */
THINK.done = function (http) {
    let status = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];
    let msg = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
    let type = arguments[3];

    type = type || http.runType;
    //错误输出
    msg && THINK.error(msg, false);

    //控制台输出
    THINK.log(`${ http.req.method.toUpperCase() }  ${ status }  ${ http.url || '/' }`, type, http.startTime);
    if (!http.isend) {
        http.isend = true;
        !http.isWebSocket && http.res.end();
    }
    //清除动态配置
    THINK.loadCache(THINK.CACHES.CONF, null);
    //释放模板变量
    THINK.ViewVar = null;
    //释放http对象
    http = null;
    return THINK.getDefer().promise;
};
_objDefinePropertyNoWrite.push('done');
/**
 * 抛出异常,当isbreak为true时中断执行
 * @param msg
 * @param isbreak
 * @returns {type[]}
 * @constructor
 */
THINK.error = function (msg, isbreak) {
    'use strict';

    if (THINK.isPromise(msg)) {
        return msg.catch(e => {
            return THINK.error(e);
        });
    }
    if (isbreak === undefined || isbreak === true) {
        isbreak = true;
    } else {
        isbreak = false;
    }
    msg = msg || '';
    if (!THINK.isError(msg)) {
        if (!THINK.isString(msg)) {
            msg = (0, _stringify2.default)(msg);
        }
        msg = new Error(msg);
    }
    if (isbreak === true) {
        return _promise2.default.reject(msg);
    } else {
        THINK.log(msg); //console print
        return msg;
    }
};
THINK.E = function (msg, isbreak) {
    THINK.log('function THINK.E is pending deprecation, please use THINK.error', 'WARNING');
    return THINK.error(msg, isbreak);
};
_objDefinePropertyNoWrite.push('error');
/**
 * 加载框架扩展类
 * @param name
 * @constructor
 */
THINK.Ext = function (name) {
    return THINK.require(name, 'Ext');
};
_objDefinePropertyNoWrite.push('Ext');
/**
 * 中间件挂载机制
 * @param args
 * @returns {*}
 */
THINK.hook = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
    }

    let name = args[0];
    let type = args[1];
    let append = args[2];

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
_objDefinePropertyNoWrite.push('hook');
/**
 * 多语言输出
 * @param name
 * @param value
 * @returns {*}
 * @constructor
 */
THINK.lang = function (name, value) {
    if (THINK.config('language')) {
        name = name ? `${ THINK.config('language') }.${ name }` : name;
    }
    //获取所有的语言
    if (THINK.isEmpty(name) && THINK.isEmpty(value)) {
        return THINK.LANGUAGE;
    } else if (name === null) {
        //清除所有的语言
        THINK.LANGUAGE = {};
        return;
    }
    if (THINK.isString(name)) {
        //name里不含. 一级
        if (name.indexOf('.') === -1) {
            if (value === undefined) {
                return THINK.LANGUAGE[name];
            } else {
                if (value === null) {
                    THINK.LANGUAGE[name] && delete THINK.LANGUAGE[name];
                } else {
                    THINK.LANGUAGE[name] = THINK.LANGUAGE[name] || {};
                    THINK.LANGUAGE[name] = value;
                }
                return;
            }
        } else {
            //name中含有. 二级
            name = name.split('.');
            if (value === undefined) {
                value = THINK.LANGUAGE[name[0]] || {};
                return value[name[1]];
            } else {
                THINK.LANGUAGE[name[0]] = THINK.LANGUAGE[name[0]] || {};
                if (value === null) {
                    THINK.LANGUAGE[name[0]][name[1]] && delete THINK.LANGUAGE[name[0]][name[1]];
                } else {
                    THINK.LANGUAGE[name[0]][name[1]] = value;
                }
                return;
            }
        }
    } else {
        THINK.LANGUAGE = THINK.extend(false, THINK.LANGUAGE, name);
        return;
    }
};
THINK.L = function (name, value) {
    THINK.log('function THINK.L is pending deprecation, please use THINK.lang', 'WARNING');
    return THINK.lang(name, value);
};
_objDefinePropertyNoWrite.push('lang');
/**
 * 控制台打印并记录错误和警告日志
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
THINK.log = function (msg, type, showTime) {
    'use strict';

    let d = new Date();
    let date = d.Format('yyyy-mm-dd');
    let time = d.Format('hh:mi:ss');
    let dateTime = `[${ date } ${ time }] `;

    let message = msg;
    if (THINK.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        console.error(msg);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        console.warn(msg);
    } else {
        if (!THINK.isString(msg)) {
            message = (0, _stringify2.default)(msg);
        }
        if (THINK.isNumber(showTime)) {
            let _time = Date.now() - showTime;
            message += '  ' + `${ _time }ms`;
        }
        type = type || 'INFO';
    }
    console.log(`${ dateTime }[${ type }] ${ message }`);
    return;
};
_objDefinePropertyNoWrite.push('log');
/**
 * 加载/挂载/运行一个Middleware
 * @param name
 * @param type
 * @param append
 * @returns {*}
 */
THINK.middleware = function (name, type, append) {
    try {
        if (!name && !type) {
            return THINK.Middleware;
        }
        if (type !== undefined) {
            if (THINK.isHttp(type)) {
                return THINK.use(name, type, append);
            } else {
                return THINK.hook(name, type, append);
            }
        }
        let cls;
        if (!THINK.isString(name) && name.__filename) {
            cls = THINK.require(name.__filename, 'Middleware');
        } else {
            cls = THINK.require(name, 'Middleware');
        }
        if (!cls) {
            return THINK.error(`Middleware ${ name } is undefined`);
        }
        return cls;
    } catch (e) {
        return THINK.error(e);
    }
};
_objDefinePropertyNoWrite.push('middleware');
/**
 * 加载/实例化一个Model
 * @param name
 * @param config
 * @param layer
 * @returns {*}
 * @constructor
 */
THINK.model = function (name, config) {
    try {
        if (!name && !config) {
            return THINK.Model;
        }
        let cls;
        if (!THINK.isString(name) && name.__filename) {
            cls = THINK.require(name.__filename, 'Model');
            name = name.modelName;
        } else {
            cls = THINK.require(name, 'Model');
            let tempName = name.split('/');
            tempName[1] ? name = tempName[1] : name = tempName[0];
        }
        if (!cls) {
            return THINK.error(`Model ${ name } is undefined`);
        }
        if (config !== undefined) {
            config = THINK.extend(false, {}, config);
            return new cls(name, config);
        }
        return cls;
    } catch (e) {
        return THINK.error(e);
    }
};
THINK.M = function (name, config) {
    THINK.log('function THINK.M is pending deprecation, please use THINK.model', 'WARNING');
    return THINK.model(name, config);
};
_objDefinePropertyNoWrite.push('model');
/**
 * http参数获取,支持get和post方式
 * @param name
 * @param cls
 * @param method
 * @param defaultValue
 * @returns {*}
 * @constructor
 */
THINK.param = function (name, cls, method) {
    let defaultValue = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

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
THINK.I = function (name, cls, method) {
    let defaultValue = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

    THINK.log('function THINK.I is pending deprecation, please use THINK.param', 'WARNING');
    return THINK.param(name, cls, method, defaultValue = '');
};
_objDefinePropertyNoWrite.push('param');
/**
 * 并行处理
 * @param  {String}   key      []
 * @param  {Mixed}   data     []
 * @param  {Function} callback []
 * @return {}            []
 */
THINK.parallelLimit = function (key, data, callback) {
    let options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

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
        options = { limit: options };
    }

    let flag = !THINK.isArray(data) || options.array;
    if (!flag) {
        key = '';
    }

    //get parallel limit class
    let Limit = THINK.loadCache(THINK.CACHES.COLLECTION, 'limit');
    if (!Limit) {
        Limit = THINK.require('ParallelLimit');
        THINK.loadCache(THINK.CACHES.COLLECTION, 'limit', Limit);
    }

    let instance;
    if (key) {
        instance = THINK.loadCache(THINK.CACHES.LIMIT, key);
        if (!instance) {
            instance = new Limit(options.limit, callback);
            THINK.loadCache(THINK.CACHES.LIMIT, key, instance);
        }
    } else {
        instance = new Limit(options.limit, callback);
    }

    if (flag) {
        return instance.add(data);
    }
    return instance.addMany(data, options.ignoreError);
};
_objDefinePropertyNoWrite.push('parallelLimit');
/**
 * 运行挂载点挂载的中间件链
 * @param name
 * @param http
 * @param data
 * @returns {Promise.<*>}
 * @constructor
 */
THINK.run = function (name, http, data) {
    let list = THINK.HOOK[name] || [];
    let runItemMiddleware = function runItemMiddleware(list, index, http, data) {
        let item = list[index];
        if (!item) {
            return _promise2.default.resolve(data);
        }
        return THINK.use(item, http, data).then(result => {
            if (result === null) {
                return _promise2.default.resolve(data);
            } else if (result !== undefined) {
                data = result;
            }
            return runItemMiddleware(list, index + 1, http, data);
        }).catch(err => {
            return THINK.error(err);
        });
    };

    if (!list || list.length === 0) {
        return _promise2.default.resolve(data);
    }
    return runItemMiddleware(list, 0, http, data);
};
THINK.R = function (name, http, data) {
    THINK.log('function THINK.R is pending deprecation, please use THINK.run', 'WARNING');
    return THINK.run(name, http, data);
};
_objDefinePropertyNoWrite.push('run');
/**
 * 加载/实例化一个Service
 * @param name
 * @param arg
 * @param config
 * @param layer
 * @returns {*}
 * @constructor
 */
THINK.service = function (name, arg, config) {
    try {
        if (!name && !arg && !config) {
            return THINK.Service;
        }
        let cls;
        if (!THINK.isString(name) && name.__filename) {
            cls = THINK.require(name.__filename, 'Service');
        } else {
            cls = THINK.require(name, 'Service');
        }
        if (!cls) {
            return THINK.error(`Service ${ name } is undefined`);
        }
        if (arg !== undefined || config !== undefined) {
            return new cls(arg, config);
        }
        return cls;
    } catch (e) {
        return THINK.error(e);
    }
};
THINK.X = function (name, arg, config) {
    THINK.log('function THINK.X is pending deprecation, please use THINK.service', 'WARNING');
    return THINK.service(name, arg, config);
};
_objDefinePropertyNoWrite.push('service');
/**
 * 当系统出现异常时，显示对应的页面
 * @param http
 * @param status
 * @param msg
 * @param type
 * @returns {*|{path, filename}}
 */
THINK.statusAction = function (http) {
    let status = arguments.length <= 1 || arguments[1] === undefined ? 400 : arguments[1];
    let msg = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
    let type = arguments[3];

    if (!http || !http.res) {
        //错误输出
        msg && THINK.error(msg, false);
        return THINK.getDefer().promise;
    }
    let _write = (http, status, msg) => {
        let content = '';
        let message = THINK.isError(msg) ? msg.message : msg;
        if (http._sendType === THINK.config('json_content_type')) {
            content = `{"status": 0,"${ THINK.config('error_no_key') }": 500,"${ THINK.config('error_msg_key') }":"${ message }","data":{}}`;
        } else if (http._sendType === THINK.config('tpl_content_type')) {
            content = `<html><head><title>ThinkNode Error</title></head><body>
        <div id="wrapper"><h2>ThinkNode</h2><h2><em>${ status }  ${ THINK.lang(status) || '' }</em></h2>
        <ul><li><pre>${ message }</pre></li></ul></div></body></html>`;
        } else {
            content = `ThinkNode Error: ${ status }  ${ THINK.lang(status) || '' } \n ${ message }`;
        }
        !http.isWebSocket && http.res.write(content, THINK.config('encoding'));
    };
    //输出http状态
    http._status = status;
    if (!http.res.headersSent) {
        http.res.statusCode = status;
        if (!http.typesend) {
            http.typesend = true;
            http.res.setHeader('Content-Type', `${ THINK.config('tpl_content_type') }; charset=${ THINK.config('encoding') }`);
        }
    }
    if (!http.isend && status > 399) {
        http._endError = msg;

        let tplFlag = THINK.config('tpl_custom_error');
        if (tplFlag === true) {
            if (!THINK.isFile(`${ THINK.APP_PATH }/Common/View/${ THINK.config('tpl_default_theme') }/${ status }${ THINK.config('tpl_file_suffix') }`)) {
                tplFlag = false;
            }
        }
        //自定义错误模板输出
        if (tplFlag && http.loaded) {
            let cls = http.view();
            cls.assign('status', status);
            cls.assign('statusName', THINK.lang(status) || '');
            cls.assign('msg', msg);
            return cls.display(`${ THINK.APP_PATH }/Common/View/${ THINK.config('tpl_default_theme') }/${ status }${ THINK.config('tpl_file_suffix') }`).catch(err => {
                _write(http, status, err);
                return THINK.done(http, status, err, type);
            });
        } else {
            _write(http, status, msg);
        }
    }
    return THINK.done(http, status, msg, type);
};
_objDefinePropertyNoWrite.push('statusAction');
/**
 * 中间件执行机制
 * @param args
 * @returns {*}
 */
THINK.use = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
    }

    let name = args[0];
    let http = args[1];
    let data = args[2];

    if (THINK.isString(name)) {
        if (!name) {
            return data;
        }
        let fn = THINK.middleware(name);
        if (!fn) {
            return THINK.error(`Middlewate ${ name } is undefined`);
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
_objDefinePropertyNoWrite.push('use');
/**
 * URL格式化 输出带伪静态支持的标准url
 * @param urls URL表达式，格式：'模块[/控制器/操作]'
 * @param http http对象
 * @param vars 传入的参数，支持对象和字符串 {var1: "aa", var2: "bb"}
 * @return string
 */
THINK.url = function (urls, http) {
    let vars = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

    if (!urls) {
        return '';
    }
    let bCamelReg = function bCamelReg(s) {
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
        retUrl = bCamelReg(http.group || THINK.config('default_group'));
    }
    if (temp[1]) {
        retUrl = `${ retUrl }/${ bCamelReg(temp[1]) }`;
    } else {
        retUrl = `${ retUrl }/${ bCamelReg(http.controller || THINK.config('default_controller')) }`;
    }
    if (temp[2]) {
        retUrl = `${ retUrl }/${ bCamelReg(temp[2]) }`;
    } else {
        retUrl = `${ retUrl }/${ bCamelReg(http.action || THINK.config('default_action')) }`;
    }

    retUrl = `${ retUrl }${ THINK.config('url_pathname_suffix') }`;
    if (!THINK.isEmpty(vars)) {
        if (THINK.isString(vars)) {
            retUrl = `${ retUrl }?${ vars }`;
        } else if (THINK.isObject(vars)) {
            retUrl = `${ retUrl }?${ querystring.stringify(vars) }`;
        }
    }

    return retUrl;
};
_objDefinePropertyNoWrite.push('url');
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
_objDefinePropertyNoWrite.push('walkFilter');

/**
 * 设置函数库为只读属性
 */
(function () {
    for (let n in _objDefinePropertyNoWrite) {
        (0, _defineProperty2.default)(THINK, _objDefinePropertyNoWrite[n], {
            writable: false
        });
    }
})();