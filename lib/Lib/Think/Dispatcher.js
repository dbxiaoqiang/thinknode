/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _BaseJs = require('./Base.js');

var _BaseJs2 = _interopRequireDefault(_BaseJs);

/**
 * 小驼峰命名正则转换
 * @type {RegExp}
 */
var sCamelReg = function sCamelReg(str) {
    var re = /_(\w)/g;
    return str.replace(re, function (all, letter) {
        return letter.toUpperCase();
    });
};
/**
 * 大驼峰命名正则转换
 * @type {RegExp}
 */
var bCamelReg = function bCamelReg(str) {
    var re = /_(\w)/g;
    var rstr = str.slice(1).replace(re, function (all, letter) {
        return letter.toUpperCase();
    });
    return str[0].toUpperCase() + rstr;
};
/**
 * 检测Controller和Action是否合法的正则
 * @type {RegExp}
 */
var nameReg = /^[A-Za-z\_]\w*$/;
/**
 * 分割pathname
 * @param  {[type]} pathname [description]
 * @return {[type]}          [description]
 */
var splitPathName = function splitPathName(pathname) {
    'use strict';
    var ret = [];
    var j = 0;
    pathname = pathname.split('/');
    for (var i = 0, _length = pathname.length, item = undefined; i < _length; i++) {
        item = pathname[i].trim();
        if (item) {
            ret[j++] = item;
        }
    }
    return ret;
};

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        this.http = http;
        this.http.splitPathName = splitPathName;
        this.http.getGroup = this.getGroup;
        this.http.getController = this.getController;
        this.http.getAction = this.getAction;
    };

    _default.prototype.run = function run() {
        var _this = this;

        return T('route_init', this.http).then(function () {
            return _this.preparePathName();
        }).then(function () {
            return T('route_parse', _this.http);
        }).then(function () {
            return _this.parsePathName();
        });
    };

    /**
     * 准备pathanem
     * @return {[type]} [description]
     */

    _default.prototype.preparePathName = function preparePathName() {
        var pathname = this.http.splitPathName(this.http.pathname).join('/');
        //去除pathname前缀
        var prefix = C('url_pathname_prefix');
        if (prefix && pathname.indexOf(prefix) === 0) {
            pathname = pathname.substr(prefix.length);
        }
        //判断URL后缀
        var suffix = C('url_pathname_suffix');
        if (suffix && pathname.substr(0 - suffix.length) === suffix) {
            pathname = pathname.substr(0, pathname.length - suffix.length);
        }
        this.http.pathname = pathname;
    };

    /**
     * 解析pathname
     * @return {[type]} [description]
     */

    _default.prototype.parsePathName = function parsePathName() {
        if (this.http.group) {
            return;
        }
        var paths = this.http.splitPathName(this.http.pathname);
        var groupList = C('app_group_list');
        var group = '';
        if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
            group = paths.shift();
        }
        var controller = paths.shift();
        var action = paths.shift();
        //解析剩余path的参数
        if (paths.length) {
            for (var i = 0, _length2 = Math.ceil(paths.length) / 2; i < _length2; i++) {
                this.http.get[paths[i * 2]] = paths[i * 2 + 1] || '';
            }
        }
        this.http.group = this.getGroup(group, this.http);
        this.http.controller = this.getController(controller, this.http);
        this.http.action = this.getAction(action, this.http);

        return getPromise(this.http);
    };

    _default.prototype.getGroup = function getGroup(group, http) {
        if (!group) {
            return C('default_group');
        } else if (!nameReg.test(group)) {
            return E('Group\'s name is not specification');
        }
        return bCamelReg(group);
    };

    _default.prototype.getController = function getController(controller, http) {
        if (!controller) {
            return C('default_controller');
        } else if (!nameReg.test(controller)) {
            return E('Controller\'s name is not specification');
        }
        return bCamelReg(controller);
    };

    _default.prototype.getAction = function getAction(action, http) {
        if (!action) {
            return C('default_action');
        } else if (!nameReg.test(action)) {
            return E('Action\'s name is not specification');
        }
        return sCamelReg(action);
    };

    return _default;
})(_BaseJs2['default']);

exports['default'] = _default;
module.exports = exports['default'];