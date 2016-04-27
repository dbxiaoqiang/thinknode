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

export default class extends THINK.Behavior {

    init(http){
        this.http = http;
        this.options = {
            'url_resource_on': C('url_resource_on'),
            'url_resource_reg': C('url_resource_reg')
        };
    }

    run(data){
        if (!this.options.url_resource_on || !this.http.pathname || this.http.pathname === '/') {
            return null;
        }

        let pathname = this.http.pathname;
        //通过正则判断是否是静态资源请求
        if (!this.options.url_resource_reg.test(pathname)) {
            return null;
        }
        pathname = path.normalize(pathname);
        let file = THINK.RESOURCE_PATH + '/' + decodeURIComponent(pathname);
        //正则判断是否文件
        //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
        //if (!!file.match(urlReg)) {
        if (isFile(file)) {
            let contentType = mime.lookup(file);
            this.http.header('Content-Type', contentType + '; charset=' + C('encoding'));
            this.http.typesend = true;
            let fileStream = fs.createReadStream(file);
            fileStream.pipe(this.http.res);
            fileStream.on('end', () => O(this.http, 200));
            return getDefer().promise;
        }else{
            return O(this.http, 404);
        }
    }
}
