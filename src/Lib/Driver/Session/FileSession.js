/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import os from 'os';
import fs from 'fs';
import session from '../../Think/Session';

export default class extends session {

    init(http) {
        super.init(http);
        this.options.session_path = this.options.session_path || (THINK.RUNTIME_PATH + '/Temp');
        isDir(this.options.session_path) || mkdir(this.options.session_path);
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    }

    /**
     *
     * @param name
     */
    get(name){
        let cookie = this.http.cookie(this.options.session_name);
        let file = `${this.options.session_path}/${cookie}.json`;
        if(!isFile(file)){
            return getPromise();
        }
        let content = getFileContent(file);
        let value = {};
        try{
            content = JSON.parse(content || '{}');
            value = content[name];
        }catch(e){
            try{
                fs.unlink(file);
            }catch (e){}
            value = {};
        }
        if(isEmpty(value)){
            return getPromise();
        }
        let now = Date.now();
        if(now > value.expire){
            fs.unlink(file);
            return getPromise();
        }
        if(this.updateExpire){
            value.expire = now + value.timeout * 1000;
            try{
                content[name] && delete content[name];
                content[name] = value;
                setFileContent(file, JSON.stringify(content));
            }catch (e){}
        }
        let data = value.data;
        //如果data是个对象或者数组，需要深度拷贝
        if(isObject(data)){
            data = extend({}, data);
        }else if(isArray(data)){
            data = extend([], data);
        }
        return getPromise(data);
    }

    /**
     *
     * @param name
     * @param vlaue
     * @param timeout
     */
    set(name, value, timeout){
        let cookie = this.http.cookie(this.options.session_name);
        let file = `${this.options.session_path}/${cookie}.json`;
        if(timeout === undefined){
            timeout = this.options.session_timeout;
        }
        //如果value是个对象或者数组，这里需要深度拷贝，防止程序里修改值导致缓存值被修改
        if(isObject(value)){
            value = extend({}, value);
        }else if(isArray(value)){
            value = extend([], value);
        }
        let data = {
            data: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        try{
            let content = JSON.parse(getFileContent(file) || '{}');
            content[name] = data;
            setFileContent(file, JSON.stringify(content));
            return getPromise();
        }catch (e){
            return getPromise();
        }
    }

    /**
     *
     * @param name
     */
    rm(){
        let cookie = this.http.cookie(this.options.session_name);
        try{
            let file = `${this.options.session_path}/${cookie}.json`;
            fs.unlink(file);
            return getPromise();
        }catch (e){
            return getPromise();
        }
    }

    /**
     *
     */
    gc(now = Date.now()){
        let ls, data;
        try{
            ls = fs.readdirSync(this.options.session_path);
        }catch (e){
            ls = [];
        }
        ls.forEach(item => {
            try{
                if(isFile(item)){
                    data = JSON.parse(getFileContent(item));
                    if(!isEmpty(data) && now > data.expire){
                        fs.unlink(file);
                    }
                }
            }catch (e){}
        });
    }
}