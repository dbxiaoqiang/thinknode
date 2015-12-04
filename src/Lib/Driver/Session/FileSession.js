/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/2
 */
import os from 'os';
import fs from 'fs';
import session from '../../Think/Session.js';

export default class extends session {

    init(http) {
        super.init(http);
        this.options.session_path = this.options.session_path || (os.tmpdir() + '/thinknode');
        isDir(this.options.session_path) || mkdir(this.options.session_path);
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    }

    /**
     *
     * @param name
     */
    get(name){
        let file = `${this.options.session_path}/${hash(name)}/${name}.json`;
        if(!isFile(file)){
            return getPromise();
        }
        let value = getFileContent(file);
        try{
            value = JSON.parse(value);
        }catch(e){
            try{
                fs.unlink(file);
            }catch (e){}
            value = '';
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
                fs.writeFile(file, JSON.stringify(value));
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
        let file = `${this.options.session_path}/${hash(name)}/${name}.json`;

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
            setFileContent(file, JSON.stringify(data));
            return getPromise();
        }catch (e){
            return getPromise();
        }
    }

    /**
     *
     * @param name
     */
    rm(name){
        let file = `${this.options.session_path}/${hash(name)}/${name}.json`;
        try{
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
        let ls, file, data;
        try{
            ls = fs.readdirSync(this.options.session_path);
        }catch (e){
            ls = [];
        }
        ls.forEach(item => {
            file = `${this.options.cache_path}/${hash(item)}/${item}.json`;
            data = getFileContent(file);
            try{
                data = JSON.parse(data);
                if(!isEmpty(data) && now > data.expire){
                    fs.unlink(file);
                }
            }catch (e){
                fs.unlink(file);
                data = '';
            }
        });
    }
}