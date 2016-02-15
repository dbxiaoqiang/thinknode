/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import fs from 'fs';
import cache from './Cache';

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
        let dir = tmp.split('').slice(0, 2).join('/');
        return `${this.cachePath}/${tmp}/${name}${this.options.cache_file_suffix}`;
    }

    /**
     *
     * @param name
     */
    get(name){
        let file = this.getFilePath(name);
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
                    return data.data;
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
        let file = this.getFilePath(key);
        let data = {
            data: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        let fn = promisify(fs.writeFile, fs);
        return fn(file, JSON.stringify(data)).then(() => {
            //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
            chmod(file);
        });
    }

    /**
     *
     * @param name
     */
    rm(name){
        let file = this.getFilePath(name);
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
        let self = this;
        let files = fs.readdirSync(path);
        files.forEach(function (item) {
            var file = path + '/' + item;
            var stat = fs.statSync(file);
            if (stat.isDirectory()) {
                self.gc(now, file);
            } else if (stat.isFile()) {
                var data = getFileContent(file);
                try {
                    data = JSON.parse(data);
                    if (now > data.expire) {
                        fs.unlink(file, function () {
                        });
                    }
                } catch (e) {
                }
            }
        });
    }
}