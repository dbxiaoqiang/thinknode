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

var _domain = require('domain');

var _domain2 = _interopRequireDefault(_domain);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _http2 = require('http');

var _http3 = _interopRequireDefault(_http2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Http = require('./Http');

var _Http2 = _interopRequireDefault(_Http);

var _WebSocket = require('../Driver/Socket/WebSocket');

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
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.run = function run() {
        var mode = '_' + THINK.APP_MODE.toLowerCase();
        if (THINK.APP_MODE && this[mode]) {
            return this[mode]();
        } else {
            return this._http();
        }
    };

    //命令行模式

    _class.prototype._cli = function _cli() {
        var _this2 = this;

        var baseHttp = _Http2.default.baseHttp(process.argv[2]);
        var callback = function callback(req, res) {
            var http = new _Http2.default(req, res);
            return http.run().then(function (http) {
                var timeout = C('cli_timeout');
                if (timeout) {
                    http.res.setTimeout(timeout * 1000, function () {
                        O(http, 504);
                    });
                }
                return _this2.listener(http);
            });
        };
        callback(baseHttp.req, baseHttp.res);
    };

    //HTTP模式

    _class.prototype._http = function _http() {
        var clusterNums = C('use_cluster');
        //不使用cluster
        if (!clusterNums) {
            return this.createServer();
        }
        //使用cpu的个数
        if (clusterNums === true) {
            clusterNums = _os2.default.cpus().length;
        }

        if (_cluster2.default.isMaster) {
            for (var i = 0; i < clusterNums; i++) {
                _cluster2.default.fork();
            }
            _cluster2.default.on('exit', function (worker) {
                P(new Error('worker ' + worker.process.pid + ' died'));
                process.nextTick(function () {
                    return _cluster2.default.fork();
                });
            });
        } else {
            this.createServer();
        }
    };

    /**
     *  创建HTTP服务
     */

    _class.prototype.createServer = function createServer() {
        var _this3 = this;

        //自定义创建server
        var handle = C('create_server_fn');
        var host = C('app_host');
        var port = process.argv[2] || C('app_port');
        //createServer callback
        var callback = function callback(req, res) {
            var http = new _Http2.default(req, res);
            return http.run().then(function (http) {
                var timeout = C('http_timeout');
                if (timeout) {
                    http.res.setTimeout(timeout * 1000, function () {
                        O(http, 504);
                    });
                }
                return _this3.listener(http);
            });
        };

        var server = undefined;
        //define createServer in application
        if (handle) {
            server = handle(callback, port, host, this);
        } else {
            //create server
            server = _http3.default.createServer(callback);
            server.listen(port, host);
        }
        //log process id
        this.logPid(port);

        //websocket
        if (C('use_websocket')) {
            try {
                var instance = new _WebSocket2.default(server, this);
                instance.run();
            } catch (e) {
                E(e);
            }
        }

        P('====================================', 'THINK');
        P('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/', 'THINK');
        P('ThinkNode Version: ' + THINK.THINK_VERSION, 'THINK');
        P('App Cluster Status: ' + (C('use_cluster') ? 'open' : 'closed'), 'THINK');
        P('WebSocket Status: ' + (C('use_websocket') ? 'open' : 'closed'), 'THINK');
        //P(`File Auto Compile: ${(C('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        P('App File Auto Reload: ' + (THINK.APP_DEBUG ? 'open' : 'closed'), 'THINK');
        P('App Enviroment: ' + (THINK.APP_DEBUG ? 'debug mode' : 'stand mode'), 'THINK');
        P('====================================', 'THINK');
    };

    /**
     * 记录当前进程的id
     */

    _class.prototype.logPid = function logPid(port) {
        if (!THINK.CONF.log_process_pid || !_cluster2.default.isMaster) {
            return;
        }
        try {
            (function () {
                THINK.RUNTIME_PATH && !isDir(THINK.RUNTIME_PATH) && mkdir(THINK.RUNTIME_PATH);
                var pidFile = THINK.RUNTIME_PATH + ('/' + port + '.pid');
                _fs2.default.writeFileSync(pidFile, process.pid);
                chmod(pidFile);
                //进程退出时删除该文件
                process.on('SIGTERM', function () {
                    if (_fs2.default.existsSync(pidFile)) {
                        _fs2.default.unlinkSync(pidFile);
                    }
                    process.exit(0);
                });
            })();
        } catch (e) {
            E(e, false);
        }
    };

    /**
     *
     * @param http
     * @returns {*}
     */

    _class.prototype.listener = function listener(http) {
        //禁止远程直接用带端口的访问,websocket下允许
        if (C('use_proxy') && http.host !== http.hostname && !http.isWebSocket) {
            return O(http, 403, '', http.isWebSocket ? 'SOCKET' : 'HTTP');
        }

        var domainInstance = _domain2.default.create();
        var self = this;
        domainInstance.on('error', function (err) {
            return O(http, 503, err, http.isWebSocket ? 'SOCKET' : 'HTTP');
        });
        domainInstance.run((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _context.next = 3;
                            return self.execController(http);

                        case 3:
                            return _context.abrupt('return', O(http, 200, '', http.isWebSocket ? 'SOCKET' : 'HTTP'));

                        case 6:
                            _context.prev = 6;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', O(http, 503, _context.t0, http.isWebSocket ? 'SOCKET' : 'HTTP'));

                        case 9:
                            _context.prev = 9;

                            //清除模块配置
                            thinkCache(THINK.CACHES.CONF, null);
                            return _context.finish(9);

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 6, 9, 12]]);
        })));
    };

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */

    _class.prototype.execController = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(http) {
            var controller, instance;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return T('app_init', http);

                        case 2:

                            //加载模块配置
                            THINK.CONF[http.group] && C(THINK.CONF[http.group]);

                            //app begin
                            _context2.next = 5;
                            return T('app_begin', http);

                        case 5:
                            if (http.controller) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.abrupt('return', O(http, 404, 'Controller not found.'));

                        case 7:
                            //返回controller实例
                            controller = undefined;
                            _context2.prev = 8;
                            instance = thinkRequire(http.group + '/' + http.controller + 'Controller');

                            controller = new instance(http);
                            _context2.next = 16;
                            break;

                        case 13:
                            _context2.prev = 13;
                            _context2.t0 = _context2['catch'](8);
                            return _context2.abrupt('return', O(http, 404, 'Controller ' + http.group + '/' + http.controller + ' not found.'));

                        case 16:
                            _context2.next = 18;
                            return this.execAction(controller, http, {}, true);

                        case 18:
                            return _context2.abrupt('return', T('app_end', http));

                        case 19:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[8, 13]]);
        }));
        return function execController(_x) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param action
     * @param data
     * @param callMethod
     */

    _class.prototype.execAction = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(controller, http, data, callMethod) {
            var act, flag, call, common_before, before;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            act = http.action + C('action_suffix');
                            flag = false;
                            //action不存在时执行空方法

                            if (callMethod && !isFunction(controller[act])) {
                                call = C('empty_method');

                                if (call && isFunction(controller[call])) {
                                    flag = true;
                                    act = call;
                                }
                            }
                            //action不存在

                            if (!(!isFunction(controller[act]) && !flag)) {
                                _context3.next = 5;
                                break;
                            }

                            return _context3.abrupt('return', O(http, 404, 'action ' + http.action + ' not found.'));

                        case 5:

                            //action前置操作
                            common_before = C('common_before_action');
                            before = C('before_action');

                            //公共action前置操作

                            if (!(common_before && isFunction(controller[common_before]))) {
                                _context3.next = 10;
                                break;
                            }

                            _context3.next = 10;
                            return getPromise(controller[common_before]());

                        case 10:
                            if (!(before && isFunction(controller['' + before + http.action]))) {
                                _context3.next = 13;
                                break;
                            }

                            _context3.next = 13;
                            return getPromise(controller['' + before + http.action]());

                        case 13:
                            if (!data) {
                                _context3.next = 17;
                                break;
                            }

                            return _context3.abrupt('return', controller[act].apply(controller, data));

                        case 17:
                            return _context3.abrupt('return', controller[act]());

                        case 18:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));
        return function execAction(_x2, _x3, _x4, _x5) {
            return ref.apply(this, arguments);
        };
    }();

    return _class;
}(_Base2.default);

exports.default = _class;