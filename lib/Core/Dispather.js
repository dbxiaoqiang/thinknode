"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _defineProperties = require("babel-runtime/core-js/object/define-properties");

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _Base = require("./Base");

var _Base2 = _interopRequireDefault(_Base);

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

exports.default = class extends _Base2.default {
    init(http) {
        this.http = http;
        (0, _defineProperties2.default)(http, {
            "getGroup": {
                value: this.getGroup,
                writable: false
            },
            "getController": {
                value: this.getController,
                writable: false
            },
            "getAction": {
                value: this.getAction,
                writable: false
            }
        });
    }

    run(content) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                yield _this.preParePathName();
                yield _this.parsePathName();
                return _this.http;
            } catch (err) {
                return THINK.statusAction(_this.http, 404, err);
            }
        })();
    }

    /**
     * 准备pathanem
     * @return {[type]} [description]
     */
    preParePathName() {
        let pathname = this.cleanPathname();
        //去除pathname后缀
        let suffix = THINK.C('url_pathname_suffix');
        if (suffix && pathname.substr(0 - suffix.length) === suffix) {
            pathname = pathname.substr(0, pathname.length - suffix.length);
        }
        this.http.pathname = pathname;
    }

    /**
     * remove / start | end of pathname
     * @return {} []
     */
    cleanPathname() {
        let pathname = this.http.pathname;
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
    }

    /**
     * 解析pathname
     * @return {[type]} [description]
     */
    parsePathName() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let paths = _this2.http.splitPathName(_this2.http.pathname);
            let groupList = THINK.C('app_group_list');
            let group = '';
            if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
                group = paths.shift();
            }
            let controller = paths.shift();
            let action = paths.shift();
            //解析剩余path的参数
            if (paths.length) {
                for (let i = 0, length = Math.ceil(paths.length) / 2; i < length; i++) {
                    _this2.http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
                }
            }
            _this2.http.group = yield _this2.getGroup(group, _this2.http);
            _this2.http.controller = yield _this2.getController(controller, _this2.http);
            _this2.http.action = yield _this2.getAction(action, _this2.http);
        })();
    }

    getGroup(group, http) {
        if (!group) {
            return THINK.C('default_group');
        } else if (!nameReg(group)) {
            return THINK.E('Group name is not specification');
        }
        return bCamelReg(group);
    }

    getController(controller, http) {
        if (!controller) {
            return THINK.C('default_controller');
        } else if (!nameReg(controller)) {
            return THINK.E('Controller name is not specification');
        }
        return bCamelReg(controller);
    }

    getAction(action, http) {
        if (!action) {
            return THINK.C('default_action');
        } else if (!nameReg(action)) {
            return THINK.E('Action name is not specification');
        }
        return sCamelReg(action);
    }
};