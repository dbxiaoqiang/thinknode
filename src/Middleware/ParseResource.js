/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

import fs from 'fs';
import path from 'path';
import mime from 'mime';

export default class extends THINK.Middleware {

    init(http){
        this.http = http;
        this.options = {
            'url_resource_on': THINK.config('url_resource_on'),
            'url_resource_reg': THINK.config('url_resource_reg')
        };
    }

    run(data){
        if (!this.options.url_resource_on || !this.http.pathname || this.http.pathname === '/') {
            return Promise.resolve();
        }
        let pathname = this.http.pathname;
        //通过正则判断是否是静态资源请求
        if (!this.options.url_resource_reg.test(pathname)) {
            return Promise.resolve();
        }
        pathname = path.normalize(pathname);
        let file = `${THINK.RESOURCE_PATH}/${decodeURIComponent(pathname)}`;
        //正则判断是否文件
        //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
        //if (!!file.match(urlReg)) {
        if (THINK.isFile(file)) {
            let contentType = mime.lookup(file);
            this.http.header('Content-Type', `${contentType}; charset=${THINK.config('encoding')}`);
            this.http.typesend = true;

            let range = this.http.header('range');
            if(range){
                return this.outputRange(file, range);
            } else {
                return this.outputNormal(file);
            }
        }else{
            return THINK.statusAction(this.http, 404);
        }
    }
    /**
     * output normal file
     * @param  {String} file []
     * @return {Promise}      []
     */
    outputNormal(file){
        let fileStream = fs.createReadStream(file);
        fileStream.pipe(this.http.res);
        fileStream.on('end', () => THINK.statusAction(this.http, 200));
        fileStream.on('error', () => THINK.statusAction(this.http, 404));
        return THINK.getDefer().promise;
    }
    /**
     * output range file
     * @param  {String} file  []
     * @param  {String} range []
     * @return {Promise}       []
     */
    outputRange(file, range){
        //request has range header
        let size = fs.statSync(file).size;
        let match = range.match(/bytes=(\d+)\-(\d*)/);
        let slice = 1 * 1024 * 1024;
        let from = parseInt(match[1]) || 0;
        let to = parseInt(match[2]) || 0;
        if(!to){
            to = from + slice - 1;
        }
        to = Math.min(to, size - 1);

        this.http.status(206);
        this.http.header('Accept-Ranges', 'bytes');
        this.http.header('Content-Range', `bytes ${from}-${to}/${size}`);

        let fd = fs.openSync(file, 'r');
        let buffer = new Buffer(to - from + 1);
        fs.readSync(fd, buffer, 0, to - from, from);
        fs.closeSync(fd);
        return this.http.end(buffer);
    }
}
