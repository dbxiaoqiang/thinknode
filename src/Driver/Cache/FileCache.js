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
        this.cachePath = `${this.options.cache_path}/${this.options.cache_key_prefix}/Cache`;
        this.options.gctype = 'fileCache';
        THINK.GCTIMER(this);
    }

    getFilePath(name) {
        let tmp = hash(name).split('').slice(0, 1) || '';
        let dir = `${this.cachePath}/${tmp}`;
        isDir(dir) || mkdir(dir);
        return `${dir}/${name}${this.options.cache_file_suffix}`;
    }

    /**
     *
     * @param name
     */
    get(name) {
        let file = this.getFilePath(name);
        if (!isFile(file)) {
            return Promise.resolve('');
        }
        let fn = promisify(fs.readFile, fs);
        return fn(file, {encoding: 'utf8'}).then(data => {
            if (!data) {
                return '';
            }
            try {
                data = JSON.parse(data);
                if (Date.now() > (data.expire || 0)) {
                    fs.unlink(file, function () {
                    });
                    return '';
                } else {
                    return data.data;
                }
            } catch (e) {
                fs.unlink(file, function () {
                });
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
    set(name, value, timeout) {
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }
        let file = this.getFilePath(name);
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
    rm(name) {
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
     * @param path
     */
    gc(now = Date.now(), path) {
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
                        fs.unlink(file, function () {
                        });
                    }
                } catch (e) {
                }
            }
        });
    }
}
