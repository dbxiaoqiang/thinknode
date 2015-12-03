/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/2
 */
import fs from 'fs';
import cache from '../../Think/Cache.js';

export default class extends cache {

    init(options) {
        super.init(options);
        isDir(this.options.cache_path) || mkdir(this.options.cache_path);
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    }

    /**
     *
     * @param name
     */
    get(name){
        let file = `${this.options.cache_path}/${hash(name)}/${name}.json`;
        if(!isFile(file)){
            return getPromise();
        }
        let value = getFileContent(file);
        try{
            value = JSON.parse(value);
        }catch(e){
            fs.unlink(file);
            value = '';
        }
        if(isEmpty(value)){
            return getPromise();
        }
        let now = Data.now();
        if(now > value.expire){
            fs.unlink(file);
            return getPromise();
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
     * @param value
     * @param timeout
     */
    set(name, value, timeout){
        let file = `${this.options.cache_path}/${hash(name)}/${name}.json`;
        if(timeout === undefined){
            timeout = this.options.cache_timeout;
        }
        //如果value是个对象或者数组，这里需要深度拷贝，防止程序里修改值导致缓存值被修改
        if(isObject(value)){
            value = extend({}, value);
        }else if(isArray(value)){
            value = extend([], value);
        }
        let data = {
            data: value,
            expire: Data.now() + timeout * 1000
        };
        fs.writeFile(file, JSON.stringify(data));
        return getPromise();
    }

    /**
     *
     * @param name
     */
    rm(name){
        let file = `${this.options.cache_path}/${hash(name)}/${name}.json`;
        fs.unlink(file);
        return getPromise();
    }

    /**
     *
     * @param now
     */
    gc(now = Date.now()){
        let path = this.options.cache_path;
        let files;
        try{
            files = fs.readdirSync(path);
        }catch (e){
            files = [];
        }
        let file, data;
        files.forEach(item => {
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