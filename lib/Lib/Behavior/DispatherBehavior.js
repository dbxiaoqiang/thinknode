'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

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
    for (var i = 0, length = pathname.length, item; i < length; i++) {
        item = pathname[i].trim();
        if (item) {
            ret[j++] = item;
        }
    }
    return ret;
};

var _class = function (_THINK$Behavior) {
    (0, _inherits3.default)(_class, _THINK$Behavior);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Behavior.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.http.splitPathName = splitPathName;
        this.http.getGroup = this.getGroup;
        this.http.getController = this.getController;
        this.http.getAction = this.getAction;
    };

    _class.prototype.run = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(content) {
            var _parseData;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return this.preparePathName();

                        case 2:
                            _context.next = 4;
                            return T('route_parse', this.http);

                        case 4:
                            _parseData = _context.sent;

                            this.http = isEmpty(_parseData) || isEmpty(_initData.group) ? this.http : _parseData;
                            return _context.abrupt('return', this.parsePathName());

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function run(_x) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 准备pathanem
     * @return {[type]} [description]
     */

    _class.prototype.preparePathName = function preparePathName() {
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

    _class.prototype.parsePathName = function parsePathName() {
        if (isEmpty(this.http.group)) {
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
                for (var i = 0, length = Math.ceil(paths.length) / 2; i < length; i++) {
                    this.http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
                }
            }
            this.http.group = this.getGroup(group, this.http);
            this.http.controller = this.getController(controller, this.http);
            this.http.action = this.getAction(action, this.http);
        }

        return getPromise(this.http);
    };

    _class.prototype.getGroup = function getGroup(group, http) {
        if (!group) {
            return C('default_group');
        } else if (!nameReg.test(group)) {
            return E('Group\'s name is not specification');
        }
        return bCamelReg(group);
    };

    _class.prototype.getController = function getController(controller, http) {
        if (!controller) {
            return C('default_controller');
        } else if (!nameReg.test(controller)) {
            return E('Controller\'s name is not specification');
        }
        return bCamelReg(controller);
    };

    _class.prototype.getAction = function getAction(action, http) {
        if (!action) {
            return C('default_action');
        } else if (!nameReg.test(action)) {
            return E('Action\'s name is not specification');
        }
        return sCamelReg(action);
    };

    return _class;
}(THINK.Behavior);

exports.default = _class;