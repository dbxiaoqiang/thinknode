/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
import cluster from 'cluster';
import fs from 'fs';
import domain from 'domain';
import os from 'os';
import http from 'http';
import base from './Base.js';
import thinkhttp from './Http.js';
import dispatcher from './Dispatcher.js';
import controller from './Controller.js';
import model from './Model.js';
import service from './Service.js';
import logic from './Logic.js';
import behavior from './Behavior.js';
import view from './View.js';

export default class extends base{

    init(){
        //挂载核心类
        THINK.Behavior = behavior;
        THINK.Controller = controller;
        THINK.Service = service;
        THINK.Logic = logic;
        THINK.Model = model;
        THINK.View = view;
    }

    run(){
        let mode = `_${(THINK.APP_MODE).toLowerCase()}`;
        if(THINK.APP_MODE && this.hasOwnProperty(mode)){
            return this[mode]();
        }else{
            return this._http();
        }
    }

    //命令行模式
    _cli(){
        let baseHttp = thinkhttp.baseHttp(process.argv[2]);
        let callback = (req, res) => {
            let http = new thinkhttp(req, res);
            return http.run().then(http => {
                let timeout = C('cli_timeout');
                if(timeout){
                    http.res.setTimeout(timeout * 1000, () => {
                        O(http, 'Gateway Time-out', 504);
                    });
                }
                return this.listener(http);
            });
        };
        callback(baseHttp.req, baseHttp.res);
    }
    //HTTP模式
    _http(){
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
        }else{
            this.createServer();
        }
    }

    /**
     *  创建HTTP服务
     */
    createServer(){
        //自定义创建server
        let handle = C('create_server_fn');
        let host = C('app_host');
        let port = process.argv[2] || C('app_port');
        //createServer callback
        let callback = (req, res) => {
            let http = new thinkhttp(req, res);
            return http.run().then(http => {
                let timeout = C('http_timeout');
                if(timeout){
                    http.res.setTimeout(timeout * 1000, () => {
                        O(http, 'Gateway Time-out', 504);
                    });
                }
                return this.listener(http);
            });
        };

        let server;
        //define createServer in application
        if (handle) {
            server = handle(callback, port, host, this);
        }else{
            //create server
            server = http.createServer(callback);
            server.listen(port, host);
        }

        this.logPid(port);

        if (C('use_websocket')) {
            let websocket = new (thinkRequire('WebSocket'))(server, this);
            websocket.run();
        }

        P('Server running at http://' + (host || '127.0.0.1') + ':' + port + '/', 'THINK');
        P(`ThinkNode Version: ${THINK.THINK_VERSION}`, 'THINK');
        P(`Cluster Status: ${(C('use_cluster') ? 'open' : 'closed')}`, 'THINK');
        //P(`File Auto Compile: ${(C('auto_compile') ? 'open' : 'closed')}`, 'THINK');
        P(`File Auto Reload: ${(THINK.APP_DEBUG ? 'open' : 'closed')}`, 'THINK');
        P(`App Enviroment: ${(THINK.APP_DEBUG ? 'debug mode' : 'stand mode')}`, 'THINK');
    }

    /**
     * 记录当前进程的id
     */
    logPid(port) {
        if (!THINK.CONF.log_process_pid || !cluster.isMaster) {
            return;
        }
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
    }

    /**
     *
     * @param http
     * @returns {*}
     */
    listener(http){
        //禁止远程直接用带端口的访问,websocket下允许
        if (C('use_proxy') && http.host !== http.hostname && !http.isWebSocket) {
            return O(http, 'Forbidden', 403);
        }

        let domainInstance = domain.create();
        let deferred = getDefer();
        let self = this;

        domainInstance.on('error', err => O(http, err, 500));
        domainInstance.run(async function () {
            try {
                await T('app_init', http);
                let _http = await new dispatcher(http).run();
                http = _http;
                await T('app_begin', http);
                await self.exec(http);
                await T('app_end', http);
                O(http, '', 200);
                deferred.resolve();
            }catch (e){
                O(http, e, 500);
                deferred.reject(e);
            }

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
        });

        return deferred.promise;
    }

    /**
     * 执行
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    exec(http){
        let controller = this.getController(http);
        //group禁用或不存在或者controller不存在
        if (!controller) {
            return O(http, `Controller ${http.group}/${http.controller} not found.`, 404);
        }
        return this.execAction(controller, http, {}, true);
    }

    /**
     * 根据http里的group和controller获取对应的controller实例
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    getController(http){
        //如果是RESTFUL API则调用RestController
        if (http.isRestful) {
            try{
                return new (thinkRequire('RestController'))(http);
            }catch (e){
                return;
            }
        }
        //http对象的controller不存在直接返回
        if (!http.controller) {
            return;
        }
        //返回controller实例
        try{
            let gc = http.group + '/' + http.controller + 'Controller';
            let instance = new (thinkRequire(gc))(http);
            return instance;
        }catch (e){
            return;
        }
    }

    /**
     * 执行具体的action，调用前置和后置操作
     * @param controller
     * @param action
     * @param data
     * @param callMethod
     */
    async execAction(controller, http, data, callMethod){
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
            return O(http, `action ${http.action} not found.`, 404);
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
        }else{
            return controller[act]();
        }

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
    }
}