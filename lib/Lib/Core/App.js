'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

var _WebSocket = require('../Driver/Socket/WebSocket');

var _WebSocket2 = _interopRequireDefault(_WebSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {

    run() {
        let clusterNums = C('use_cluster');
        //不使用cluster
        if (!clusterNums) {
            return this.createServer();
        } else {
            //使用cpu的个数
            if (clusterNums === true) {
                clusterNums = _os2.default.cpus().length;
            }
            if (_cluster2.default.isMaster) {
                for (let i = 0; i < clusterNums; i++) {
                    _cluster2.default.fork();
                }
                _cluster2.default.on('exit', worker => {
                    P(new Error(`worker ${ worker.process.pid } died`));
                    process.nextTick(() => _cluster2.default.fork());
                });
            } else {
                this.createServer();
            }
        }
    }

    /**
     *  创建HTTP服务
     */
    createServer() {
        var _this = this;

        let server = _http3.default.createServer((() => {
            var ref = (0, _asyncToGenerator3.default)(function* (req, res) {
                let _http;
                try {
                    _http = yield new _Thttp2.default(req, res).run();
                    return _this.exec(_http);
                } catch (err) {
                    return O(_http, 503, err);
                }
            });
            return function (_x, _x2) {
                return ref.apply(this, arguments);
            };
        })());
        //websocket
        if (C('use_websocket')) {
            try {
                let instance = new _WebSocket2.default(server, this);
                instance.run();
            } catch (e) {
                E(e);
            }
        }
        let host = C('app_host');
        let port = process.argv[2] || C('app_port');
        if (host) {
            server.listen(port, host);
        } else {
            server.listen(port);
        }

        P('====================================', 'THINK');
        P('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/', 'THINK');
        P(`ThinkNode Version: ${ THINK.THINK_VERSION }`, 'THINK');
        P(`App Cluster Status: ${ C('use_cluster') ? 'open' : 'closed' }`, 'THINK');
        P(`WebSocket Status: ${ C('use_websocket') ? 'open' : 'closed' }`, 'THINK');
        //P(`File Auto Compile: ${(C('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        P(`App File Auto Reload: ${ THINK.APP_DEBUG ? 'open' : 'closed' }`, 'THINK');
        P(`App Enviroment: ${ THINK.APP_DEBUG ? 'debug mode' : 'stand mode' }`, 'THINK');
        P('====================================', 'THINK');
    }

    /**
     *
     * @param http
     * @returns {*}
     */
    exec(http) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            //禁止远程直接用带端口的访问,websocket下允许
            if (C('use_proxy') && http.host !== http.hostname && !http.isWebSocket) {
                return O(http, 403, '', http.isWebSocket ? 'SOCKET' : 'HTTP');
            }
            try {
                yield _this2.execController(http);
                return O(http, 200, '', http.isWebSocket ? 'SOCKET' : 'HTTP');
            } catch (err) {
                return O(http, 503, err, http.isWebSocket ? 'SOCKET' : 'HTTP');
            } finally {
                //清除模块配置
                thinkCache(THINK.CACHES.CONF, null);
            }
        })();
    }

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    execController(http) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            //app initialize
            yield T('app_init', http);

            //加载模块配置
            THINK.CONF[http.group] && C(THINK.CONF[http.group]);

            //app begin
            yield T('app_begin', http);

            //http对象的controller不存在直接返回
            if (!http.controller) {
                return O(http, 404, `Controller not found.`);
            }
            //返回controller实例
            let controller;
            try {
                let instance = thinkRequire(http.group + '/' + http.controller + 'Controller');
                controller = new instance(http);
            } catch (e) {
                //group禁用或不存在或者controller不存在
                return O(http, 404, `Controller ${ http.group }/${ http.controller } not found.`);
            }

            yield _this3.execAction(controller, http);
            //app end
            return T('app_end', http);
        })();
    }

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param http
     */
    execAction(controller, http) {
        return (0, _asyncToGenerator3.default)(function* () {
            let act = http.action + C('action_suffix');
            let call = C('empty_method');
            let flag = false;
            //action不存在时执行空方法
            if (!controller[act]) {
                if (call && controller[call]) {
                    flag = true;
                    act = call;
                }
            }
            //action不存在
            if (!controller[act] && !flag) {
                return O(http, 404, `action ${ http.action } not found.`);
            }
            //action前置操作
            let common_before = C('common_before_action');
            let before = C('before_action');

            //公共action前置操作
            if (common_before && controller[common_before]) {
                yield controller[common_before]();
            }
            //当前action前置操作
            if (before && controller[`${ before }${ http.action }`]) {
                yield controller[`${ before }${ http.action }`]();
            }
            return controller[act]();
        })();
    }

    /**
     * 记录当前进程的id
     */
    logPid(port) {
        if (!THINK.CONF.log_process_pid || !_cluster2.default.isMaster) {
            return;
        }
        try {
            THINK.RUNTIME_PATH && !isDir(THINK.RUNTIME_PATH) && mkdir(THINK.RUNTIME_PATH);
            let pidFile = THINK.RUNTIME_PATH + `/${ port }.pid`;
            _fs2.default.writeFileSync(pidFile, process.pid);
            chmod(pidFile);
            //进程退出时删除该文件
            process.on('SIGTERM', () => {
                if (_fs2.default.existsSync(pidFile)) {
                    _fs2.default.unlinkSync(pidFile);
                }
                process.exit(0);
            });
        } catch (e) {
            E(e, false);
        }
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/26
    */