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

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _http2 = require('http');

var _http3 = _interopRequireDefault(_http2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
/**
 * 小驼峰命名正则转换
 * @type {RegExp}
 */
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
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
/**
 * 解析pathname获取group
 * @param group
 * @param defaultValue
 * @returns {*}
 */
var parseGroup = function parseGroup(group) {
    var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? 'Home' : arguments[1];

    if (!group) {
        return defaultValue;
    } else if (!nameReg(group)) {
        return null;
    }
    return bCamelReg(group);
};
/**
 * 解析pathname获取controller
 * @param controller
 * @param defaultValue
 * @returns {*}
 */
var parseController = function parseController(controller) {
    var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? 'Index' : arguments[1];

    if (!controller) {
        return defaultValue;
    } else if (!nameReg(controller)) {
        return null;
    }
    return bCamelReg(controller);
};
/**
 * 解析pathname获取action
 * @param action
 * @param defaultValue
 * @returns {*}
 */
var parseAction = function parseAction(action) {
    var defaultValue = arguments.length <= 1 || arguments[1] === undefined ? 'Index' : arguments[1];

    if (!action) {
        return defaultValue;
    } else if (!nameReg(action)) {
        return null;
    }
    return sCamelReg(action);
};

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.run = function run() {
        var clusterNums = THINK.config('use_cluster');
        //不使用cluster
        if (!clusterNums) {
            return this.createServer();
        } else {
            //使用cpu的个数
            if (clusterNums === true) {
                clusterNums = _os2.default.cpus().length;
            }
            if (_cluster2.default.isMaster) {
                for (var i = 0; i < clusterNums; i++) {
                    _cluster2.default.fork();
                }
                _cluster2.default.on('exit', function (worker) {
                    THINK.log(new Error('worker ' + worker.process.pid + ' died'));
                    process.nextTick(function () {
                        return _cluster2.default.fork();
                    });
                });
            } else {
                this.createServer();
            }
        }
    };

    /**
     *  创建HTTP服务
     */


    _class.createServer = function createServer() {
        var _http = void 0;
        var server = _http3.default.createServer(function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(req, res) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return THINK.Http.run(req, res);

                            case 3:
                                _http = _context.sent;
                                _context.next = 6;
                                return new THINK.App().exec(_http);

                            case 6:
                                return _context.abrupt('return', THINK.statusAction(_http, 200));

                            case 9:
                                _context.prev = 9;
                                _context.t0 = _context['catch'](0);
                                return _context.abrupt('return', THINK.statusAction(_http, 500, _context.t0));

                            case 12:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 9]]);
            }));

            return function (_x4, _x5) {
                return _ref.apply(this, arguments);
            };
        }());
        //websocket
        if (THINK.config('use_websocket')) {
            try {
                var instance = new (THINK.adapter('WebSocket'))({ server: server, app: new this() });
                instance.run();
            } catch (e) {
                THINK.log('Initialize WebSocket error: ' + e.stack, 'ERROR');
                process.exit();
            }
        }
        var host = THINK.config('app_host');
        var port = THINK.config('app_port');
        if (host) {
            server.listen(port, host);
        } else {
            server.listen(port);
        }

        THINK.log('====================================', 'THINK');
        THINK.log('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/', 'THINK');
        THINK.log('ThinkNode Version: ' + THINK.THINK_VERSION, 'THINK');
        THINK.log('App Cluster Status: ' + (THINK.config('use_cluster') ? 'open' : 'closed'), 'THINK');
        THINK.log('WebSocket Status: ' + (THINK.config('use_websocket') ? 'open' : 'closed'), 'THINK');
        //THINK.log(`File Auto Compile: ${(THINK.config('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        THINK.log('App File Auto Reload: ' + (THINK.APP_DEBUG ? 'open' : 'closed'), 'THINK');
        THINK.log('App Enviroment: ' + (THINK.APP_DEBUG ? 'debug mode' : 'stand mode'), 'THINK');
        THINK.log('====================================', 'THINK');
        THINK.APP_DEBUG && THINK.log('Currently running in the debug mode, if it is the production environment, please close the APP_DEBUG', 'WARNING');
    };

    /**
     *
     * @param http
     * @returns {*}
     */


    _class.prototype.exec = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(http, pathname) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!THINK.config('use_proxy')) {
                                _context2.next = 3;
                                break;
                            }

                            if (!(http.host !== http.hostname && !http.isWebSocket)) {
                                _context2.next = 3;
                                break;
                            }

                            return _context2.abrupt('return', THINK.statusAction(http, 403));

                        case 3:
                            _context2.next = 5;
                            return this.getController(http, pathname);

                        case 5:
                            http = _context2.sent;
                            return _context2.abrupt('return', this.execController(http));

                        case 7:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function exec(_x6, _x7) {
            return _ref2.apply(this, arguments);
        }

        return exec;
    }();

    /**
     * 根据pathname解析定位分组/控制器/方法
     * @param http
     */


    _class.prototype.getController = function getController(http, pathname) {
        if (pathname || !http.group) {
            pathname = cleanPathname(pathname || http.pathname);
            //去除pathname后缀
            var suffix = THINK.config('url_pathname_suffix');
            if (suffix && pathname.substr(0 - suffix.length) === suffix) {
                pathname = pathname.substr(0, pathname.length - suffix.length);
            }
            var paths = http.splitPathName(pathname);
            var groupList = THINK.config('app_group_list');
            var group = '';
            if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
                group = paths.shift();
            }
            var controller = paths.shift();
            var action = paths.shift();
            //解析剩余path的参数
            if (paths.length) {
                for (var i = 0, length = Math.ceil(paths.length) / 2; i < length; i++) {
                    http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
                }
            }
            http.group = parseGroup(group, THINK.config('default_group'));
            http.controller = parseController(controller, THINK.config('default_controller'));
            http.action = parseAction(action, THINK.config('default_action'));
        }
        return http;
    };

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */


    _class.prototype.execController = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(http) {
            var controller, instance;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return THINK.run('app_begin', http);

                        case 2:
                            if (http.controller) {
                                _context3.next = 4;
                                break;
                            }

                            return _context3.abrupt('return', THINK.statusAction(http, 404, 'Controller not found.'));

                        case 4:
                            //controller instance
                            controller = void 0;
                            _context3.prev = 5;
                            instance = THINK.controller(http.group + '/' + http.controller);

                            controller = new instance(http);
                            _context3.next = 13;
                            break;

                        case 10:
                            _context3.prev = 10;
                            _context3.t0 = _context3['catch'](5);
                            return _context3.abrupt('return', THINK.statusAction(http, 404, 'Controller ' + http.group + '/' + http.controller + ' not found.'));

                        case 13:
                            _context3.next = 15;
                            return this.execAction(controller, http);

                        case 15:
                            return _context3.abrupt('return', THINK.run('app_end', http));

                        case 16:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[5, 10]]);
        }));

        function execController(_x8) {
            return _ref3.apply(this, arguments);
        }

        return execController;
    }();

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param http
     */


    _class.prototype.execAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(controller, http) {
            var act, call, flag, commonBefore, before;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            act = '' + http.action + THINK.config('action_suffix');
                            call = THINK.config('empty_method');
                            flag = false;
                            //action不存在时执行空方法

                            if (!controller[act]) {
                                if (call && controller[call]) {
                                    flag = true;
                                    act = call;
                                }
                            }
                            //action不存在

                            if (!(!controller[act] && !flag)) {
                                _context4.next = 6;
                                break;
                            }

                            return _context4.abrupt('return', THINK.statusAction(http, 404, 'action ' + http.action + ' not found.'));

                        case 6:
                            //action前置操作
                            commonBefore = THINK.config('common_before_action');
                            before = THINK.config('before_action');

                            //公共action前置操作

                            if (!(commonBefore && controller[commonBefore])) {
                                _context4.next = 11;
                                break;
                            }

                            _context4.next = 11;
                            return controller[commonBefore]();

                        case 11:
                            if (!(before && controller['' + before + http.action])) {
                                _context4.next = 14;
                                break;
                            }

                            _context4.next = 14;
                            return controller['' + before + http.action]();

                        case 14:
                            return _context4.abrupt('return', controller[act]());

                        case 15:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function execAction(_x9, _x10) {
            return _ref4.apply(this, arguments);
        }

        return execAction;
    }();

    return _class;
}(_Base2.default);

exports.default = _class;