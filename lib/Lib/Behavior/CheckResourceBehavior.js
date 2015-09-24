var mime = require('mime');
var path = require('path');
var fs = require('fs');
/**
 * 静态资源请求
 * @return {[type]} [description]
 */
module.exports = Behavior(function () {
    'use strict';
    return {
        options: {
            'url_resource_on': C('url_resource_on'),
            'url_resource_reg': C('url_resource_reg')
        },
        run: function () {
            if (!this.options.url_resource_on || !this.http.pathname) {
                return false;
            }
            var pathname = this.http.pathname;
            if (pathname.indexOf('/') === 0) {
                pathname = pathname.substr(1);
            }
            //通过正则判断是否是静态资源请求
            if (!this.options.url_resource_reg.test(pathname)) {
                return false;
            }
            pathname = path.normalize(pathname);
            var file = THINK.RESOURCE_PATH + '/' + decodeURI(pathname);
            //正则判断是否文件
            //var urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
            //if (!!file.match(urlReg)) {
            var self = this, res = this.http.res;
            if (isFile(file)) {
                var contentType = mime.lookup(file);
                res.setHeader('Content-Type', contentType + '; charset=' + C('encoding'));
                var fileStream = fs.createReadStream(file);
                fileStream.pipe(res);
                fileStream.on('end', function () {
                    if(self.http.endProcess === 0){
                        self.http.endProcess = 1;
                        self.http.end();
                    }
                });
            }else{
                res.statusCode = 404;
                this.http.end();
            }
            //返回一个pendding promise, 不让后续执行
            return getDefer().promise;
        }
    };
});