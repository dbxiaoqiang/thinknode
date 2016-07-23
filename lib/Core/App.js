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
                                return THINK.CACHES.HTTP.run(req, res);

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

            return function (_x, _x2) {
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
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(http) {
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
                            return THINK.CACHES.DISPATHER.run(http);

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

        function exec(_x3) {
            return _ref2.apply(this, arguments);
        }

        return exec;
    }();

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

        function execController(_x4) {
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

        function execAction(_x5, _x6) {
            return _ref4.apply(this, arguments);
        }

        return execAction;
    }();

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/26
                    */


exports.default = _class;