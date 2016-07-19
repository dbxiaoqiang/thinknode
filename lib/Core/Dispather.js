'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
/**
 * 小驼峰命名正则转换
 * @type {RegExp}
 */
let sCamelReg = function sCamelReg(str) {
    let re = /_(\w)/g;
    return str.replace(re, function (all, letter) {
        return letter.toUpperCase();
    });
};
/**
 * 大驼峰命名正则转换
 * @type {RegExp}
 */
let bCamelReg = function bCamelReg(str) {
    let re = /_(\w)/g;
    let rstr = str.slice(1).replace(re, function (all, letter) {
        return letter.toUpperCase();
    });
    return str[0].toUpperCase() + rstr;
};
/**
 * 检测Group,Controller和Action是否合法
 * @type {RegExp}
 */
let nameReg = function nameReg(str) {
    if (/^[A-Za-z\_]\w*$/.test(str)) {
        return true;
    }
    return false;
};

let getGroup = function getGroup(group, http) {
    if (!group) {
        return THINK.config('default_group');
    } else if (!nameReg(group)) {
        return THINK.error('Group name is not specification');
    }
    return bCamelReg(group);
};

let getController = function getController(controller, http) {
    if (!controller) {
        return THINK.config('default_controller');
    } else if (!nameReg(controller)) {
        return THINK.error('Controller name is not specification');
    }
    return bCamelReg(controller);
};

let getAction = function getAction(action, http) {
    if (!action) {
        return THINK.config('default_action');
    } else if (!nameReg(action)) {
        return THINK.error('Action name is not specification');
    }
    return sCamelReg(action);
};

/**
 * remove / start | end of pathname
 * @return {} []
 */
let cleanPathname = function cleanPathname(pathname) {
    if (pathname === '/') {
        return '';
    }
    if (pathname[0] === '/') {
        pathname = pathname.slice(1);
    }
    if (pathname.slice(-1) === '/') {
        pathname = pathname.slice(0, -1);
    }
    return pathname;
};

exports.default = class {

    static run(http) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                (0, _defineProperties2.default)(http, {
                    "getGroup": {
                        value: getGroup,
                        writable: false
                    },
                    "getController": {
                        value: getController,
                        writable: false
                    },
                    "getAction": {
                        value: getAction,
                        writable: false
                    }
                });
                http = yield _this.preParePathName(http);
                http = yield _this.parsePathName(http);
                return http;
            } catch (err) {
                return THINK.statusAction(http, 400, err);
            }
        })();
    }

    /**
     * 准备pathanem
     * @param http
     */
    static preParePathName(http) {
        let pathname = cleanPathname(http.pathname);
        //去除pathname后缀
        let suffix = THINK.config('url_pathname_suffix');
        if (suffix && pathname.substr(0 - suffix.length) === suffix) {
            pathname = pathname.substr(0, pathname.length - suffix.length);
        }
        http.pathname = pathname;
        return http;
    }

    /**
     * 解析pathname
     * @param http
     */
    static parsePathName(http) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (!http.group) {
                let paths = http.splitPathName(http.pathname);
                let groupList = THINK.config('app_group_list');
                let group = '';
                if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
                    group = paths.shift();
                }
                let controller = paths.shift();
                let action = paths.shift();
                //解析剩余path的参数
                if (paths.length) {
                    for (let i = 0, length = Math.ceil(paths.length) / 2; i < length; i++) {
                        http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
                    }
                }
                http.group = yield getGroup(group, http);
                http.controller = yield getController(controller, http);
                http.action = yield getAction(action, http);
            }
            return http;
        })();
    }
};