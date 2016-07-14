/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import fs from 'fs';
import filecache from '../Cache/FileCache';

export default class extends filecache {
    init(options) {
        this.keyName = options.cache_key_prefix;
        super.init(options);
        this.cachePath = `${this.options.cache_path}/${THINK.C('cache_key_prefix')}/Session`;
        this.options.gctype = 'fileSession';
        THINK.GCTIMER(this);
    }

    getFilePath(){
        let tmp = THINK.hash(this.keyName).split('').slice(0, 1) || '';
        let dir = `${this.cachePath}/${tmp}`;
        THINK.isDir(dir) || THINK.mkDir(dir);
        return `${dir}/${this.keyName}${this.options.cache_file_suffix}`;
    }

    /**
     *
     * @param name
     */
    get(name){
        let file = this.getFilePath();
        if (!THINK.isFile(file)) {
            return Promise.resolve('');
        }
        let fn = THINK.promisify(fs.readFile, fs);
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
        let rfn = THINK.promisify(fs.readFile, fs);
        let wfn = THINK.promisify(fs.writeFile, fs);
        let content = {
            [name]: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        }, promise = Promise.resolve();
        if(THINK.isFile(file)) {
            promise = rfn(file, {encoding: 'utf8'});
        }
        try{
            return promise.then(rdata => {
                if(!THINK.isEmpty(rdata)){
                    rdata = JSON.parse(rdata);
                    content = THINK.extend(false, rdata, content);
                }
                return wfn(file, JSON.stringify(content)).then(() => {
                    //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
                    THINK.chmod(file);
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
        if (THINK.isFile(file)) {
            let fn = THINK.promisify(fs.unlink, fs);
            return fn(file);
        }
        return Promise.resolve();
    }
}
