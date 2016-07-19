'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

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
 * 检测Group,Controller和Action是否合法
 * @type {RegExp}
 */
var nameReg = function nameReg(str) {
    if (/^[A-Za-z\_]\w*$/.test(str)) {
        return true;
    }
    return false;
};

var getGroup = function getGroup(group, http) {
    if (!group) {
        return THINK.config('default_group');
    } else if (!nameReg(group)) {
        return THINK.error('Group name is not specification');
    }
    return bCamelReg(group);
};

var getController = function getController(controller, http) {
    if (!controller) {
        return THINK.config('default_controller');
    } else if (!nameReg(controller)) {
        return THINK.error('Controller name is not specification');
    }
    return bCamelReg(controller);
};

var getAction = function getAction(action, http) {
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
var cleanPathname = function cleanPathname(pathname) {
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

var _class = function () {
    function _class() {
        (0, _classCallCheck3.default)(this, _class);
    }

    (0, _createClass3.default)(_class, null, [{
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(http) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;

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
                                _context.next = 4;
                                return this.preParePathName(http);

                            case 4:
                                http = _context.sent;
                                _context.next = 7;
                                return this.parsePathName(http);

                            case 7:
                                http = _context.sent;
                                return _context.abrupt('return', http);

                            case 11:
                                _context.prev = 11;
                                _context.t0 = _context['catch'](0);
                                return _context.abrupt('return', THINK.statusAction(http, 400, _context.t0));

                            case 14:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 11]]);
            }));

            function run(_x) {
                return _ref.apply(this, arguments);
            }

            return run;
        }()

        /**
         * 准备pathanem
         * @param http
         */

    }, {
        key: 'preParePathName',
        value: function preParePathName(http) {
            var pathname = cleanPathname(http.pathname);
            //去除pathname后缀
            var suffix = THINK.config('url_pathname_suffix');
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

    }, {
        key: 'parsePathName',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(http) {
                var paths, groupList, group, controller, action, i, length;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (http.group) {
                                    _context2.next = 17;
                                    break;
                                }

                                paths = http.splitPathName(http.pathname);
                                groupList = THINK.config('app_group_list');
                                group = '';

                                if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
                                    group = paths.shift();
                                }
                                controller = paths.shift();
                                action = paths.shift();
                                //解析剩余path的参数

                                if (paths.length) {
                                    for (i = 0, length = Math.ceil(paths.length) / 2; i < length; i++) {
                                        http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
                                    }
                                }
                                _context2.next = 10;
                                return getGroup(group, http);

                            case 10:
                                http.group = _context2.sent;
                                _context2.next = 13;
                                return getController(controller, http);

                            case 13:
                                http.controller = _context2.sent;
                                _context2.next = 16;
                                return getAction(action, http);

                            case 16:
                                http.action = _context2.sent;

                            case 17:
                                return _context2.abrupt('return', http);

                            case 18:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function parsePathName(_x2) {
                return _ref2.apply(this, arguments);
            }

            return parsePathName;
        }()
    }]);
    return _class;
}();

exports.default = _class;