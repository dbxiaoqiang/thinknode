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
import dispather from './Dispather';
import websocket from '../Adapter/Socket/WebSocket';

export default class extends base {

    run() {
        let clusterNums = THINK.config('use_cluster');
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
                    THINK.log(new Error(`worker ${worker.process.pid} died`));
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
        let self = this, httpCls;
        let server = http.createServer(async function(req, res) {
            try{
                httpCls = new thttp(req, res);
                let _http = await httpCls.run();
                await self.exec(_http);
                return THINK.statusAction(_http, 200);
            }catch (err){
                return THINK.statusAction(http.loaded ? http : httpCls.http, 500, err);
            }
        });
        //websocket
        if (THINK.config('use_websocket')) {
            try {
                let instance = new websocket({server: server,app: this});
                instance.run();
            } catch (e) {
                THINK.error(`Initialize WebSocket error: ${e.stack}`);
                return Promise.reject(e);
            }
        }
        let host = THINK.config('app_host');
        let port = THINK.config('app_port');
        if (host) {
            server.listen(port, host);
        } else {
            server.listen(port);
        }

        THINK.log('====================================', 'THINK');
        THINK.log(`Server running at http://${(host || '127.0.0.1')}:${port}/`, 'THINK');
        THINK.log(`ThinkNode Version: ${THINK.THINK_VERSION}`, 'THINK');
        THINK.log(`App Cluster Status: ${(THINK.config('use_cluster') ? 'open' : 'closed')}`, 'THINK');
        THINK.log(`WebSocket Status: ${(THINK.config('use_websocket') ? 'open' : 'closed')}`, 'THINK');
        //THINK.log(`File Auto Compile: ${(THINK.config('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        THINK.log(`App File Auto Reload: ${(THINK.APP_DEBUG ? 'open' : 'closed')}`, 'THINK');
        THINK.log(`App Enviroment: ${(THINK.APP_DEBUG ? 'debug mode' : 'stand mode')}`, 'THINK');
        THINK.log('====================================', 'THINK');
    }

    /**
     * 记录当前进程的id
     */
    logPid(port) {
        if (!THINK.CONF.log_process_pid || !cluster.isMaster) {
            return;
        }
        try {
            THINK.RUNTIME_PATH && !THINK.isDir(THINK.RUNTIME_PATH) && THINK.mkDir(THINK.RUNTIME_PATH);
            let pidFile = `${THINK.RUNTIME_PATH}/${port}.pid`;
            fs.writeFileSync(pidFile, process.pid);
            THINK.chmod(pidFile);
            //进程退出时删除该文件
            process.on('SIGTERM', () => {
                if (fs.existsSync(pidFile)) {
                    fs.unlinkSync(pidFile);
                }
                process.exit(0);
            });
        } catch (e) {
            THINK.log(e);
        }
    }

    /**
     *
     * @param http
     * @returns {*}
     */
    async exec(http) {
        //禁止远程直接用带端口的访问,websocket下允许
        if (THINK.config('use_proxy')) {
            if (http.host !== http.hostname && !http.isWebSocket) {
                return THINK.statusAction(http, 403);
            }
        }
        let dispCls = new dispather(http);
        http = await dispCls.run();
        return this.execController(http);
    }

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    async execController(http) {
        //app initialize
        await THINK.run('app_init', http);
        //app begin
        await THINK.run('app_begin', http);
        //http对象的controller不存在直接返回
        if (!http.controller) {
            return THINK.statusAction(http, 404, 'Controller not found.');
        }
        //controller instance
        let controller;
        try {
            let instance = THINK.require(`${http.group}/${http.controller}`, 'Controller');
            controller = new instance(http);
        } catch (e) {
            return THINK.statusAction(http, 404, `Controller ${http.group}/${http.controller} not found.`);
        }
        await this.execAction(controller, http);
        //app end
        return THINK.run('app_end', http);
    }

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param http
     */
    async execAction(controller, http) {
        let act = `${http.action}${THINK.config('action_suffix')}`;
        let call = THINK.config('empty_method');
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
            return THINK.statusAction(http, 404, `action ${http.action} not found.`);
        }
        //action前置操作
        let commonBefore = THINK.config('common_before_action');
        let before = THINK.config('before_action');


        //公共action前置操作
        if (commonBefore && controller[commonBefore]) {
            await controller[commonBefore]();
        }
        //当前action前置操作
        if (before && controller[`${before}${http.action}`]) {
            await controller[`${before}${http.action}`]();
        }
        return controller[act]();
    }
}
