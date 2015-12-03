/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
import base from './Base.js';
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
 * 检测Controller和Action是否合法的正则
 * @type {RegExp}
 */
let nameReg = /^[A-Za-z\_]\w*$/;
/**
 * 分割pathname
 * @param  {[type]} pathname [description]
 * @return {[type]}          [description]
 */
let splitPathName = function (pathname) {
    'use strict';
    let ret = [];
    let j = 0;
    pathname = pathname.split('/');
    for (let i = 0, length = pathname.length, item; i < length; i++) {
        item = pathname[i].trim();
        if (item) {
            ret[j++] = item;
        }
    }
    return ret;
};

export default class extends base{

    init(http){
        this.http = http;
        this.http.splitPathName = splitPathName;
        this.http.getGroup = this.getGroup;
        this.http.getController = this.getController;
        this.http.getAction = this.getAction;
    }

    run(){
        return T('route_init', this.http).then(() => {
            return this.preparePathName();
        }).then(() => {
            return T('route_parse', this.http);
        }).then(() => {
            return this.parsePathName();
        });
    }
    /**
     * 准备pathanem
     * @return {[type]} [description]
     */
    preparePathName() {
        let pathname = this.http.splitPathName(this.http.pathname).join('/');
        //去除pathname前缀
        let prefix = C('url_pathname_prefix');
        if (prefix && pathname.indexOf(prefix) === 0) {
            pathname = pathname.substr(prefix.length);
        }
        //判断URL后缀
        let suffix = C('url_pathname_suffix');
        if (suffix && pathname.substr(0 - suffix.length) === suffix) {
            pathname = pathname.substr(0, pathname.length - suffix.length);
        }
        this.http.pathname = pathname;
    }
    /**
     * 解析pathname
     * @return {[type]} [description]
     */
    parsePathName() {
        if (this.http.group) {
            return;
        }
        let paths = this.http.splitPathName(this.http.pathname);
        let groupList = C('app_group_list');
        let group = '';
        if (groupList.length && paths[0] && groupList.indexOf(paths[0].toLowerCase()) > -1) {
            group = paths.shift();
        }
        let controller = paths.shift();
        let action = paths.shift();
        //解析剩余path的参数
        if (paths.length) {
            for(let i = 0,length = Math.ceil(paths.length) / 2; i < length; i++){
                this.http.get[paths[i * 2]] = paths[i * 2 + 1] || '';
            }
        }
        this.http.group = this.getGroup(group, this.http);
        this.http.controller = this.getController(controller, this.http);
        this.http.action = this.getAction(action, this.http);

        return getPromise(this.http);
    }

    getGroup(group, http){
        if(!group){
            return C('default_group');
        } else if(!nameReg.test(group)){
            return O(http, 'Group\'s name is not specification');
        }
        return bCamelReg(group);
    }

    getController(controller, http){
        if(!controller){
            return C('default_controller');
        } else if(!nameReg.test(controller)){
            return O(http, 'Controller\'s name is not specification');
        }
        return bCamelReg(controller);
    }

    getAction(action, http){
        if(!action){
            return C('default_action');
        } else if(!nameReg.test(action)){
            return O(http, 'Action\'s name is not specification');
        }
        return sCamelReg(action);
    }

}