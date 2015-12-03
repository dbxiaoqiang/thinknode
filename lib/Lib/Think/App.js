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

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

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

var _BaseJs = require('./Base.js');

var _BaseJs2 = _interopRequireDefault(_BaseJs);

var _HttpJs = require('./Http.js');

var _HttpJs2 = _interopRequireDefault(_HttpJs);

var _DispatcherJs = require('./Dispatcher.js');

var _DispatcherJs2 = _interopRequireDefault(_DispatcherJs);

var _ControllerJs = require('./Controller.js');

var _ControllerJs2 = _interopRequireDefault(_ControllerJs);

var _ModelJs = require('./Model.js');

var _ModelJs2 = _interopRequireDefault(_ModelJs);

var _ServiceJs = require('./Service.js');

var _ServiceJs2 = _interopRequireDefault(_ServiceJs);

var _LogicJs = require('./Logic.js');

var _LogicJs2 = _interopRequireDefault(_LogicJs);

var _BehaviorJs = require('./Behavior.js');

var _BehaviorJs2 = _interopRequireDefault(_BehaviorJs);

var _ViewJs = require('./View.js');

var _ViewJs2 = _interopRequireDefault(_ViewJs);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init() {
        //挂载核心类
        THINK.Behavior = _BehaviorJs2['default'];
        THINK.Controller = _ControllerJs2['default'];
        THINK.Service = _ServiceJs2['default'];
        THINK.Logic = _LogicJs2['default'];
        THINK.Model = _ModelJs2['default'];
        THINK.View = _ViewJs2['default'];
    };

    _default.prototype.run = function run() {
        var mode = '_' + THINK.APP_MODE.toLowerCase();
        if (THINK.APP_MODE && this.hasOwnProperty(mode)) {
            return this[mode]();
        } else {
            return this._http();
        }
    };

    //命令行模式

    _default.prototype._cli = function _cli() {
        var _this = this;

        var baseHttp = _HttpJs2['default'].baseHttp(process.argv[2]);
        var callback = function callback(req, res) {
            var http = new _HttpJs2['default'](req, res);
            return http.run().then(function (http) {
                var timeout = C('cli_timeout');
                if (timeout) {
                    http.res.setTimeout(timeout * 1000, function () {
                        O(http, 'Gateway Time-out', 504);
                    });
                }
                return _this.listener(http);
            });
        };
        callback(baseHttp.req, baseHttp.res);
    };

    //HTTP模式

    _default.prototype._http = function _http() {
        var clusterNums = C('use_cluster');
        //不使用cluster
        if (!clusterNums) {
            return this.createServer();
        }
        //使用cpu的个数
        if (clusterNums === true) {
            clusterNums = _os2['default'].cpus().length;
        }

        if (_cluster2['default'].isMaster) {
            for (var i = 0; i < clusterNums; i++) {
                _cluster2['default'].fork();
            }
            _cluster2['default'].on('exit', function (worker) {
                P(new Error('worker ' + worker.process.pid + ' died'));
                process.nextTick(function () {
                    return _cluster2['default'].fork();
                });
            });
        } else {
            this.createServer();
        }
    };

    /**
     *  创建HTTP服务
     */

    _default.prototype.createServer = function createServer() {
        var _this2 = this;

        //自定义创建server
        var handle = C('create_server_fn');
        var host = C('app_host');
        var port = process.argv[2] || C('app_port');
        //createServer callback
        var callback = function callback(req, res) {
            var http = new _HttpJs2['default'](req, res);
            return http.run().then(function (http) {
                var timeout = C('http_timeout');
                if (timeout) {
                    http.res.setTimeout(timeout * 1000, function () {
                        O(http, 'Gateway Time-out', 504);
                    });
                }
                return _this2.listener(http);
            });
        };

        var server = undefined;
        //define createServer in application
        if (handle) {
            server = handle(callback, port, host, this);
        } else {
            //create server
            server = _http3['default'].createServer(callback);
            server.listen(port, host);
        }

        this.logPid(port);

        if (C('use_websocket')) {
            var websocket = new (thinkRequire('WebSocket'))(server, this);
            websocket.run();
        }

        P('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/', 'THINK');
        P('ThinkNode Version: ' + THINK.THINK_VERSION, 'THINK');
        P('Cluster Status: ' + (C('use_cluster') ? 'open' : 'closed'), 'THINK');
        //P(`File Auto Compile: ${(C('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        P('File Auto Reload: ' + (THINK.APP_DEBUG ? 'open' : 'closed'), 'THINK');
        P('App Enviroment: ' + (THINK.APP_DEBUG ? 'debug mode' : 'stand mode'), 'THINK');
    };

    /**
     * 记录当前进程的id
     */

    _default.prototype.logPid = function logPid(port) {
        if (!THINK.CONF.log_process_pid || !_cluster2['default'].isMaster) {
            return;
        }
        THINK.RUNTIME_PATH && !isDir(THINK.RUNTIME_PATH) && mkdir(THINK.RUNTIME_PATH);
        var pidFile = THINK.RUNTIME_PATH + ('/' + port + '.pid');
        _fs2['default'].writeFileSync(pidFile, process.pid);
        chmod(pidFile);
        //进程退出时删除该文件
        process.on('SIGTERM', function () {
            if (_fs2['default'].existsSync(pidFile)) {
                _fs2['default'].unlinkSync(pidFile);
            }
            process.exit(0);
        });
    };

    /**
     *
     * @param http
     * @returns {*}
     */

    _default.prototype.listener = function listener(http) {
        var _this3 = this;

        //禁止远程直接用带端口的访问,websocket下允许
        if (C('use_proxy') && http.host !== http.hostname && !http.isWebSocket) {
            return O(http, 'Forbidden', 403);
        }

        var domainInstance = _domain2['default'].create();
        var deferred = getDefer();

        domainInstance.on('error', function (err) {
            return O(http, err, 500);
        });
        domainInstance.run(function callee$2$0() {
            var _http;

            return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                while (1) switch (context$3$0.prev = context$3$0.next) {
                    case 0:
                        context$3$0.prev = 0;
                        context$3$0.next = 3;
                        return _regeneratorRuntime.awrap(T('app_init', http));

                    case 3:
                        context$3$0.next = 5;
                        return _regeneratorRuntime.awrap(new _DispatcherJs2['default'](http).run());

                    case 5:
                        _http = context$3$0.sent;

                        http = _http;
                        context$3$0.next = 9;
                        return _regeneratorRuntime.awrap(T('app_begin', http));

                    case 9:
                        context$3$0.next = 11;
                        return _regeneratorRuntime.awrap(this.exec(http));

                    case 11:
                        context$3$0.next = 13;
                        return _regeneratorRuntime.awrap(T('app_end', http));

                    case 13:
                        O(http, '', 200);
                        deferred.resolve();
                        context$3$0.next = 21;
                        break;

                    case 17:
                        context$3$0.prev = 17;
                        context$3$0.t0 = context$3$0['catch'](0);

                        O(http, context$3$0.t0, 500);
                        deferred.reject(context$3$0.t0);

                    case 21:
                    case 'end':
                        return context$3$0.stop();
                }
            }, null, _this3, [[0, 17]]);
        });

        //promise
        //return T('app_init', http).then(() => {
        //    return new dispatcher(http).run();
        //}).then(_http => {
        //    http = _http;
        //    return T('app_begin', http);
        //}).then(() => {
        //    return this.exec(http);
        //}).then(() => {
        //    return T('app_end', http);
        //}).then(() => {
        //    O(http, '', 200);
        //    deferred.resolve();
        //}).catch((err) => {
        //    O(http, isError(err) ? err : new Error(err), 500);
        //    deferred.reject(err);
        //});
        return deferred.promise;
    };

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */

    _default.prototype.exec = function exec(http) {
        var controller = this.getController(http);
        //group禁用或不存在或者controller不存在
        if (!controller) {
            return O(http, 'Controller ' + http.group + '/' + http.controller + ' not found.', 404);
        }
        return this.execAction(controller, http, {}, true);
    };

    /**
     * 根据http里的group和controller获取对应的controller实例
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */

    _default.prototype.getController = function getController(http) {
        //如果是RESTFUL API则调用RestController
        if (http.isRestful) {
            try {
                return new (thinkRequire('RestController'))(http);
            } catch (e) {
                return;
            }
        }
        //http对象的controller不存在直接返回
        if (!http.controller) {
            return;
        }
        //返回controller实例
        try {
            var gc = http.group + '/' + http.controller + 'Controller';
            var instance = new (thinkRequire(gc))(http);
            return instance;
        } catch (e) {
            return;
        }
    };

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param action
     * @param data
     * @param callMethod
     */

    _default.prototype.execAction = function execAction(controller, http, data, callMethod) {
        var act, flag, call, common_before, before;
        return _regeneratorRuntime.async(function execAction$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
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
                        context$2$0.next = 5;
                        break;
                    }

                    return context$2$0.abrupt('return', O(http, 'action ' + http.action + ' not found.', 404));

                case 5:
                    common_before = C('common_before_action');
                    before = C('before_action');

                    if (!(common_before && isFunction(controller[common_before]))) {
                        context$2$0.next = 10;
                        break;
                    }

                    context$2$0.next = 10;
                    return _regeneratorRuntime.awrap(getPromise(controller[common_before]()));

                case 10:
                    if (!(before && isFunction(controller['' + before + http.action]))) {
                        context$2$0.next = 13;
                        break;
                    }

                    context$2$0.next = 13;
                    return _regeneratorRuntime.awrap(getPromise(controller['' + before + http.action]()));

                case 13:
                    if (!data) {
                        context$2$0.next = 17;
                        break;
                    }

                    return context$2$0.abrupt('return', controller[act].apply(controller, data));

                case 17:
                    return context$2$0.abrupt('return', controller[act]());

                case 18:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    return _default;
})(_BaseJs2['default']);

exports['default'] = _default;
module.exports = exports['default'];

//action前置操作

//公共action前置操作

//当前action前置操作

//promise
//let promise = getPromise();
////公共action前置操作
//if (common_before && isFunction(controller[common_before])) {
//    promise = getPromise(controller[common_before](http.action));
//}
////当前action前置操作
//if (before && isFunction(controller[before + act])) {
//    promise = promise.then(function () {
//        return getPromise(controller[before + act](http.action));
//    });
//}
//promise = promise.then(() => {
//    //action空方法只传递action参数
//    if (flag) {
//        return controller[act](http.action);
//    }
//    if (data) {
//        return controller[act].apply(controller, data);
//    }else{
//        return controller[act]();
//    }
//});
//return promise;