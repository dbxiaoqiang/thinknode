'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

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

var _Thttp = require('./Thttp');

var _Thttp2 = _interopRequireDefault(_Thttp);

var _Dispather = require('./Dispather');

var _Dispather2 = _interopRequireDefault(_Dispather);

var _WebSocket = require('../Adapter/Socket/WebSocket');

var _WebSocket2 = _interopRequireDefault(_WebSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'exec',


        /**
         *
         * @param http
         * @returns {*}
         */
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(http) {
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!THINK.config('use_proxy')) {
                                    _context.next = 3;
                                    break;
                                }

                                if (!(http.host !== http.hostname && !http.isWebSocket)) {
                                    _context.next = 3;
                                    break;
                                }

                                return _context.abrupt('return', THINK.statusAction(http, 403));

                            case 3:
                                _context.next = 5;
                                return _Dispather2.default.run(http);

                            case 5:
                                http = _context.sent;
                                return _context.abrupt('return', this.execController(http));

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function exec(_x) {
                return _ref.apply(this, arguments);
            }

            return exec;
        }()

        /**
         * 执行
         * @param  {[type]} http [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'execController',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(http) {
                var controller, instance;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return THINK.run('app_init', http);

                            case 2:
                                _context2.next = 4;
                                return THINK.run('app_begin', http);

                            case 4:
                                if (http.controller) {
                                    _context2.next = 6;
                                    break;
                                }

                                return _context2.abrupt('return', THINK.statusAction(http, 404, 'Controller not found.'));

                            case 6:
                                //controller instance
                                controller = void 0;
                                _context2.prev = 7;
                                instance = THINK.require(http.group + '/' + http.controller, 'Controller');

                                controller = new instance(http);
                                _context2.next = 15;
                                break;

                            case 12:
                                _context2.prev = 12;
                                _context2.t0 = _context2['catch'](7);
                                return _context2.abrupt('return', THINK.statusAction(http, 404, 'Controller ' + http.group + '/' + http.controller + ' not found.'));

                            case 15:
                                _context2.next = 17;
                                return this.execAction(controller, http);

                            case 17:
                                return _context2.abrupt('return', THINK.run('app_end', http));

                            case 18:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[7, 12]]);
            }));

            function execController(_x2) {
                return _ref2.apply(this, arguments);
            }

            return execController;
        }()

        /**
         * 执行具体的action，调用前置和后置操作
         * @param controller
         * @param http
         */

    }, {
        key: 'execAction',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(controller, http) {
                var act, call, flag, commonBefore, before;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
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
                                    _context3.next = 6;
                                    break;
                                }

                                return _context3.abrupt('return', THINK.statusAction(http, 404, 'action ' + http.action + ' not found.'));

                            case 6:
                                //action前置操作
                                commonBefore = THINK.config('common_before_action');
                                before = THINK.config('before_action');

                                //公共action前置操作

                                if (!(commonBefore && controller[commonBefore])) {
                                    _context3.next = 11;
                                    break;
                                }

                                _context3.next = 11;
                                return controller[commonBefore]();

                            case 11:
                                if (!(before && controller['' + before + http.action])) {
                                    _context3.next = 14;
                                    break;
                                }

                                _context3.next = 14;
                                return controller['' + before + http.action]();

                            case 14:
                                return _context3.abrupt('return', controller[act]());

                            case 15:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function execAction(_x3, _x4) {
                return _ref3.apply(this, arguments);
            }

            return execAction;
        }()
    }], [{
        key: 'run',
        value: function run() {
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
        }

        /**
         *  创建HTTP服务
         */

    }, {
        key: 'createServer',
        value: function createServer() {
            var httpCls = void 0;
            var server = _http3.default.createServer(function () {
                var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
                    var _http;

                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                        while (1) {
                            switch (_context4.prev = _context4.next) {
                                case 0:
                                    _context4.prev = 0;

                                    httpCls = new _Thttp2.default(req, res);
                                    _context4.next = 4;
                                    return httpCls.run();

                                case 4:
                                    _http = _context4.sent;
                                    _context4.next = 7;
                                    return new THINK.App().exec(_http);

                                case 7:
                                    return _context4.abrupt('return', THINK.statusAction(_http, 200));

                                case 10:
                                    _context4.prev = 10;
                                    _context4.t0 = _context4['catch'](0);
                                    return _context4.abrupt('return', THINK.statusAction(_http3.default.loaded ? _http3.default : httpCls.http, 500, _context4.t0));

                                case 13:
                                case 'end':
                                    return _context4.stop();
                            }
                        }
                    }, _callee4, this, [[0, 10]]);
                }));

                return function (_x5, _x6) {
                    return _ref4.apply(this, arguments);
                };
            }());
            //websocket
            if (THINK.config('use_websocket')) {
                try {
                    var instance = new _WebSocket2.default({ server: server, app: this });
                    instance.run();
                } catch (e) {
                    THINK.error('Initialize WebSocket error: ' + e.stack);
                    return _promise2.default.reject(e);
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
        }
    }]);
    return _class;
}(_Base2.default);

exports.default = _class;