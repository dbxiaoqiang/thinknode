/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import fs from 'fs';
import cache from '../Cache/Cache';

export default class extends cache {
    init(options) {
        this.keyName = options.cache_key_prefix;
        super.init(options);
        this.cachePath = `${this.options.cache_path}/${C('cache_key_prefix')}/Session`;
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    }

    getFilePath(){
        let tmp = hash(this.keyName).split('').slice(0, 1) || '';
        let dir = `${this.cachePath}/${tmp}`;
        isDir(dir) || mkdir(dir);
        return `${dir}/${this.keyName}${this.options.cache_file_suffix}`;
    }

    /**
     *
     * @param name
     */
    get(name){
        let file = this.getFilePath();
        if (!isFile(file)) {
            return Promise.resolve('');
        }
        let fn = promisify(fs.readFile, fs);
        return fn(file, {encoding: 'utf8'}).then(data => {
            if(!data){
                return '';
            }
            try{
                data = JSON.parse(data);
                if(data.expire && Date.now() > data.expire){
                    fs.unlink(file, function () {});
                    return '';
                }else{
                    return data[name];
                }
            }catch(e){
                fs.unlink(file, function () {});
                return '';
            }
        }).catch(() => '');
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout){
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
        }, promise = Promise.resolve();
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
     * @param path
     */
    gc(now = Date.now(), path){
        //缓存回收
        path = path || this.cachePath;
        let files = fs.readdirSync(path);
        files.forEach(item => {
            let file = path + '/' + item;
            if (isDir(file)) {
                this.gc(now, file);
            } else {
                let data = getFileContent(file);
                try {
                    data = JSON.parse(data);
                    if (now > data.expire) {
                        fs.unlink(file, function () {});
                    }
                } catch (e) {}
            }
        });
    }
}
