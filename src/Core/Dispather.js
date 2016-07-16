/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
/**
 * 小驼峰命名正则转换
 * @type {RegExp}
 */
let sCamelReg = function (str) {
    let re = /_(\w)/g;
    return str.replace(re, function (all, letter) {
        return letter.toUpperCase();
    });
};
/**
 * 大驼峰命名正则转换
 * @type {RegExp}
 */
let bCamelReg = function (str) {
    let re = /_(\w)/g;
    let rstr = str.slice(1).replace(re, function (all, letter) {
        return letter.toUpperCase();
    });
    return str[0].toUpperCase() + rstr;
};
/**
 * 检测Group,Controller和Action是否合法
 * @type {RegExp}
 */
let nameReg = function (str) {
    if((/^[A-Za-z\_]\w*$/).test(str)){
        return true;
    }
    return false;
};

import base from './Base';

export default class extends base {
    init(http) {
        this.http = http;
        Object.defineProperties(http, {
            "getGroup": {
                value: this.getGroup,
                writable: false
            },
            "getController": {
                value: this.getController,
                writable: false
            },
            "getAction": {
                value: this.getAction,
                writable: false
            }
        });
    }

    async run(content) {
        try{
            await this.preParePathName();
            await this.parsePathName();
            return this.http;
        }catch (err){
            return THINK.statusAction(this.http, 400, err);
        }
    }

    /**
     * 准备pathanem
     * @return {[type]} [description]
     */
    preParePathName() {
        let pathname = this.cleanPathname();
        //去除pathname后缀
        let suffix = THINK.C('url_pathname_suffix');
        if (suffix && pathname.substr(0 - suffix.length) === suffix) {
            pathname = pathname.substr(0, pathname.length - suffix.length);
        }
        this.http.pathname =  pathname;
        return;
    }

    /**
     * remove / start | end of pathname
     * @return {} []
     */
    cleanPathname(){
        let pathname = this.http.pathname;
        if(pathname === '/'){
            return '';
        }
        if (pathname[0] === '/') {
            pathname = pathname.slice(1);
        }
        if (pathname.slice(-1) === '/') {
            pathname = pathname.slice(0, -1);
        }
        return pathname;
    }

    /**
     * 解析pathname
     * @return {[type]} [description]
     */
    async parsePathName() {
        if(!this.http.group){
            let paths = this.http.splitPathName(this.http.pathname);
            let groupList = THINK.C('app_group_list');
            let group = '';
            if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
                group = paths.shift();
            }
            let controller = paths.shift();
            let action = paths.shift();
            //解析剩余path的参数
            if (paths.length) {
                for(let i = 0,length = Math.ceil(paths.length) / 2; i < length; i++){
                    this.http._get[paths[i * 2]] = paths[i * 2 + 1] || '';
                }
            }
            this.http.group = await this.getGroup(group, this.http);
            this.http.controller = await this.getController(controller, this.http);
            this.http.action = await this.getAction(action, this.http);
        }
        return;
    }

    getGroup(group, http){
        if(!group){
            return THINK.C('default_group');
        } else if(!nameReg(group)){
            return THINK.E('Group name is not specification');
        }
        return bCamelReg(group);
    }

    getController(controller, http){
        if(!controller){
            return THINK.C('default_controller');
        } else if(!nameReg(controller)){
            return THINK.E('Controller name is not specification');
        }
        return bCamelReg(controller);
    }

    getAction(action, http){
        if(!action){
            return THINK.C('default_action');
        } else if(!nameReg(action)){
            return THINK.E('Action name is not specification');
        }
        return sCamelReg(action);
    }
}
