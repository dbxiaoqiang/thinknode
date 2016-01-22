/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import cluster from 'cluster';
import fs from 'fs';
import domain from 'domain';
import os from 'os';
import http from 'http';
import base from './Base';
import thinkhttp from './Http';
import dispatcher from './Dispatcher';
import websocket from '../Driver/Socket/WebSocket';

export default class extends base {

    run() {
        let mode = `_${(THINK.APP_MODE).toLowerCase()}`;
        if (THINK.APP_MODE && this[mode]) {
            return this[mode]();
        } else {
            return this._http();
        }
    }

    //命令行模式
    _cli() {
        let baseHttp = thinkhttp.baseHttp(process.argv[2]);
        let callback = (req, res) => {
            let http = new thinkhttp(req, res);
            return http.run().then(http => {
                let timeout = C('cli_timeout');
                if (timeout) {
                    http.res.setTimeout(timeout * 1000, () => {
                        O(http, 504);
                    });
                }
                return this.listener(http);
            });
        };
        callback(baseHttp.req, baseHttp.res);
    }

    //HTTP模式
    _http() {
        let clusterNums = C('use_cluster');
        //不使用cluster
        if (!clusterNums) {
            return this.createServer();
        }
        //使用cpu的个数
        if (clusterNums === true) {
            clusterNums = os.cpus().length;
        }

        if (cluster.isMaster) {
            for (let i = 0; i < clusterNums; i++) {
                cluster.fork();
            }
            cluster.on('exit', worker => {
                P(new Error(`worker ${worker.process.pid} died`));
                process.nextTick(() => cluster.fork());
            });
        } else {
            this.createServer();
        }
    }

    /**
     *  创建HTTP服务
     */
    createServer() {
        //自定义创建server
        let handle = C('create_server_fn');
        let host = C('app_host');
        let port = process.argv[2] || C('app_port');
        //createServer callback
        let callback = (req, res) => {
            let http = new thinkhttp(req, res);
            return http.run().then(http => {
                let timeout = C('http_timeout');
                if (timeout) {
                    http.res.setTimeout(timeout * 1000, () => {
                        O(http, 504);
                    });
                }
                return this.listener(http);
            });
        };

        let server;
        //define createServer in application
        if (handle) {
            server = handle(callback, port, host, this);
        } else {
            //create server
            server = http.createServer(callback);
            server.listen(port, host);
        }
        //log process id
        this.logPid(port);

        //websocket
        if (C('use_websocket')) {
            let instance = new websocket(server, this);
            instance.run();
        }

        P('====================================', 'THINK');
        P('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/', 'THINK');
        P(`ThinkNode Version: ${THINK.THINK_VERSION}`, 'THINK');
        P(`App Cluster Status: ${(C('use_cluster') ? 'open' : 'closed')}`, 'THINK');
        P(`WebSocket Status: ${(C('use_websocket') ? 'open' : 'closed')}`, 'THINK');
        //P(`File Auto Compile: ${(C('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        P(`App File Auto Reload: ${(THINK.APP_DEBUG ? 'open' : 'closed')}`, 'THINK');
        P(`App Enviroment: ${(THINK.APP_DEBUG ? 'debug mode' : 'stand mode')}`, 'THINK');
        P('====================================', 'THINK');
    }

    /**
     * 记录当前进程的id
     */
    logPid(port) {
        if (!THINK.CONF.log_process_pid || !cluster.isMaster) {

            return;
        }
        try{
            THINK.RUNTIME_PATH && !isDir(THINK.RUNTIME_PATH) && mkdir(THINK.RUNTIME_PATH);
            let pidFile = THINK.RUNTIME_PATH + `/${port}.pid`;
            fs.writeFileSync(pidFile, process.pid);
            chmod(pidFile);
            //进程退出时删除该文件
            process.on('SIGTERM', () => {
                if (fs.existsSync(pidFile)) {
                    fs.unlinkSync(pidFile);
                }
                process.exit(0);
            });
        } catch (e) {
            E(e, false);
        }
    }

    /**
     *
     * @param http
     * @returns {*}
     */
    listener(http) {
        //禁止远程直接用带端口的访问,websocket下允许
        if (C('use_proxy') && http.host !== http.hostname && !http.isWebSocket) {
            return O(http, 403, '', http.isWebSocket ? 'SOCKET' : 'HTTP');
        }

        let domainInstance = domain.create();
        let self = this;
        domainInstance.on('error', err => O(http, 503, err, http.isWebSocket ? 'SOCKET' : 'HTTP'));
        domainInstance.run(async function () {
            try {
                await self.execController(http);
                return O(http, 200, '', http.isWebSocket ? 'SOCKET' : 'HTTP');
            } catch (err) {
                return O(http, 503, err, http.isWebSocket ? 'SOCKET' : 'HTTP');
            }
        });
    }

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    async execController(http) {
        //app initialize
        await T('app_init', http);
        let _http = await new dispatcher(http).run();
        http = _http;
        //app begin
        await T('app_begin', http);

        //http对象的controller不存在直接返回
        if (!http.controller) {
            return O(http, 404, `Controller not found.`);
        }
        //返回controller实例
        let controller;
        try{
            let instance = thinkRequire(http.group + '/' + http.controller + 'Controller');
            controller = new instance(http);
        } catch (e){
            //group禁用或不存在或者controller不存在
            return O(http, 404, `Controller ${http.group}/${http.controller} not found.`);
        }

        await this.execAction(controller, http, {}, true);
        //app end
        return T('app_end', http);
    }

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param action
     * @param data
     * @param callMethod
     */
    async execAction(controller, http, data, callMethod) {
        let act = http.action + C('action_suffix');
        let flag = false;
        //action不存在时执行空方法
        if (callMethod && !isFunction(controller[act])) {
            let call = C('empty_method');
            if (call && isFunction(controller[call])) {
                flag = true;
                act = call;
            }
        }
        //action不存在
        if (!isFunction(controller[act]) && !flag) {
            return O(http, 404, `action ${http.action} not found.`);
        }

        //action前置操作
        let common_before = C('common_before_action');
        let before = C('before_action');

        //公共action前置操作
        if (common_before && isFunction(controller[common_before])) {
            await getPromise(controller[common_before]());
        }
        //当前action前置操作
        if (before && isFunction(controller[`${before}${http.action}`])) {
            await getPromise(controller[`${before}${http.action}`]());
        }

        if (data) {
            return controller[act].apply(controller, data);
        } else {
            return controller[act]();
        }
    }
}