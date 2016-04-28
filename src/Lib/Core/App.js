/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import cluster from 'cluster';
import fs from 'fs';
import os from 'os';
import http from 'http';
import base from './Base';
import thttp from './Thttp';
import websocket from '../Driver/Socket/WebSocket';

export default class extends base {

    run() {
        let clusterNums = C('use_cluster');
        //不使用cluster
        if (!clusterNums) {
            return this.createServer();
        } else {
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
    }

    /**
     *  创建HTTP服务
     */
    createServer() {
        let server = http.createServer((req, res) => {
            let httpInstance = new thttp(req, res);
            return httpInstance.run().then(_http => {
                let timeout = C('http_timeout');
                if (timeout) {
                    _http.res.setTimeout(timeout * 1000, () => O(_http, 504));
                }
                return this.exec(_http);
            });
        });
        //websocket
        if (C('use_websocket')) {
            try {
                let instance = new websocket(server, this);
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
        P(`ThinkNode Version: ${THINK.THINK_VERSION}`, 'THINK');
        P(`App Cluster Status: ${(C('use_cluster') ? 'open' : 'closed')}`, 'THINK');
        P(`WebSocket Status: ${(C('use_websocket') ? 'open' : 'closed')}`, 'THINK');
        //P(`File Auto Compile: ${(C('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        P(`App File Auto Reload: ${(THINK.APP_DEBUG ? 'open' : 'closed')}`, 'THINK');
        P(`App Enviroment: ${(THINK.APP_DEBUG ? 'debug mode' : 'stand mode')}`, 'THINK');
        P('====================================', 'THINK');
    }

    /**
     *
     * @param http
     * @returns {*}
     */
    async exec(http) {
        //禁止远程直接用带端口的访问,websocket下允许
        if(C('use_proxy')){
            if(http.host !== http.hostname && !http.isWebSocket){
                return O(http, 403, '', http.isWebSocket ? 'SOCKET' : 'HTTP');
            }
        }
        try {
            await this.execController(http);
            return O(http, 200, '', http.isWebSocket ? 'SOCKET' : 'HTTP');
        } catch (err) {
            return O(http, 500, err, http.isWebSocket ? 'SOCKET' : 'HTTP');
        }
    }

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    async execController(http) {
        //app initialize
        await T('app_init', http);

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

        await this.execAction(controller, http);
        //app end
        return T('app_end', http);
    }

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param http
     */
    async execAction(controller, http) {
        let act = http.action + C('action_suffix');
        let call = C('empty_method');
        let flag = false;
        //action不存在时执行空方法
        if(!controller[act]){
            if (call && controller[call]) {
                flag = true;
                act = call;
            }
        }
        //action不存在
        if (!controller[act] && !flag) {
            return O(http, 404, `action ${http.action} not found.`);
        }
        //action前置操作
        let common_before = C('common_before_action');
        let before = C('before_action');

        //公共action前置操作
        if (common_before && controller[common_before]) {
            await controller[common_before]();
        }
        //当前action前置操作
        if (before && controller[`${before}${http.action}`]) {
            await controller[`${before}${http.action}`]();
        }
        return controller[act]();
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
}
