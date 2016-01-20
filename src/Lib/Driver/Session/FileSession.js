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

        this.cachePath = `${this.options.cache_path}/Session/${C('session_name')}`;
        isDir(this.cachePath) || mkdir(this.cachePath);
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    }

    getFilePath(){
        return `${this.cachePath}/${this.options.cache_key_prefix}${this.options.cache_file_suffix}`;
    }

    /**
     *
     * @param name
     */
    get(name){
        let file = this.getFilePath();
        if (!isFile(file)) {
            return Promise.resolve();
        }
        let fn = promisify(fs.readFile, fs);
        return fn(file, {encoding: 'utf8'}).then(data => {
            if(!data){
                return;
            }
            try{
                data = JSON.parse(data);
                if(data.expire && Date.now() > data.expire){
                    fs.unlink(file, function () {
                        return;
                    });
                }else{
                    return data[name];
                }
            }catch(e){
                fs.unlink(file, function () {
                    return;
                });
            }
        }).catch(() => {});
    }
    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout){
        let key = name;
        if (isObject(name)) {
            timeout = value;
            key = Object.keys(name)[0];
        }
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        let file = this.getFilePath();
        let rfn = promisify(fs.readFile, fs);
        let wfn = promisify(fs.writeFile, fs);
        let content = {
            [name]: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        }, promise = getPromise();
        if(isFile(file)) {
            promise = rfn(file, {encoding: 'utf8'});
        }
        try{
            return promise.then(rdata => {
                if(!isEmpty(rdata)){
                    rdata = JSON.parse(rdata);
                    content = extend(false, rdata, content);
                }
                return wfn(file, JSON.stringify(content)).then(() => {
                    //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
                    chmod(file);
                });
            });
        }catch(e){
            return Promise.resolve();
        }
    }

    /**
     *
     * @param
     */
    rm(){
        let file = this.getFilePath();
        if (isFile(file)) {
            let fn = promisify(fs.unlink, fs);
            return fn(file);
        }
        return Promise.resolve();
    }

    /**
     *
     * @param now
     */
    gc(now = Date.now()){
        //缓存回收
        let path = this.cachePath;
        let files = fs.readdirSync(path);
        files.forEach(function (item) {
            let file = path + '/' + item;
            try {
                let data = getFileContent(file);
                data = JSON.parse(data);
                if(data.expire && now > data.expire){
                    fs.unlink(file, function () {
                    });
                }
            } catch (e) {
            }
        });
    }
}