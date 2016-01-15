/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import fs from 'fs';
import cache from '../../Think/Cache';

export default class extends cache {

    init(options) {
        super.init(options);
        this.cachePath = `${this.options.cache_path}/${hash(this.options.cache_key_prefix)}`;
        isDir(this.cachePath) || mkdir(this.cachePath);
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    }

    getFilePath(name){
        let tmp = hash(name);
        tmp = tmp.slice(0, 1).split('').join('/');
        return `${this.cachePath}/${tmp}/${name}${this.options.cache_file_suffix}`;
    }

    /**
     *
     * @param name
     */
    getData(name){
        let file = this.getFilePath(name);
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
        let now = Date.now();
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
    setData(name, value, timeout){
        let file = this.getFilePath(name);
        if(timeout === undefined){
            timeout = this.options.cache_timeout;
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
    rmData(name){
        let file = this.getFilePath(name);
        try{
            fs.unlink(file);
            return getPromise();
        }catch (e){
            return getPromise();
        }
    }

    /**
     *
     * @param now
     */
    gcData(now = Date.now()){
        //缓存回收
        let path = this.cachePath;
        let files;
        try{
            files = fs.readdirSync(path);
        }catch (e){
            files = [];
        }
        let file, data;
        files.forEach(item => {
            file = this.getFilePath(item);
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