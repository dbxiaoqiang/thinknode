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

export default class extends base {

    static run() {
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
    static createServer() {
        let _http;
        let server = http.createServer(async function(req, res) {
            try{
                _http = await (THINK.CACHES.HTTP).run(req, res);
                await new (THINK.App)().exec(_http);
                return THINK.statusAction(_http, 200);
            }catch (err){
                return THINK.statusAction(_http, 500, err);
            }
        });
        //websocket
        if (THINK.config('use_websocket')) {
            try {
                let instance = new (THINK.adapter('WebSocket'))({server: server,app: new this()});
                instance.run();
            } catch (e) {
                THINK.log(`Initialize WebSocket error: ${e.stack}`, 'ERROR');
                process.exit();
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
        THINK.APP_DEBUG && THINK.log('Currently running in the debug mode, if it is the production environment, please close the APP_DEBUG', 'WARNING');
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
        http = await (THINK.CACHES.DISPATHER).run(http);
        return this.execController(http);
    }

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    async execController(http) {
        //app begin
        await THINK.run('app_begin', http);
        //http对象的controller不存在直接返回
        if (!http.controller) {
            return THINK.statusAction(http, 404, 'Controller not found.');
        }
        //controller instance
        let controller;
        try {
            let instance = THINK.controller(`${http.group}/${http.controller}`);
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
