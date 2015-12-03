/**
 * 静态资源请求
 * @return {[type]} [description]
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

        if (!this.options.url_resource_on || !this.http.pathname) {
            return false;
        }
        let pathname = this.http.pathname;
        if (pathname.indexOf('/') === 0) {
            pathname = pathname.substr(1);
        }
        //通过正则判断是否是静态资源请求
        if (!this.options.url_resource_reg.test(pathname)) {
            return false;
        }
        pathname = path.normalize(pathname);
        let file = THINK.RESOURCE_PATH + '/' + decodeURI(pathname);
        //正则判断是否文件
        //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
        //if (!!file.match(urlReg)) {
        let self = this;
        if (isFile(file)) {
            let contentType = mime.lookup(file);
            self.http.header('Content-Type', contentType + '; charset=' + C('encoding'));
            self.http.typesend = true;
            let fileStream = fs.createReadStream(file);
            fileStream.pipe(self.http.res);
            fileStream.on('end', () => {
                O(self.http, '', 200);
            });
        }else{
            O(self.http, 'Not Found', 404);
        }
        return getDefer().promise;
    }
}