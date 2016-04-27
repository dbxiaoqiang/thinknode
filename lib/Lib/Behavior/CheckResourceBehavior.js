'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends THINK.Behavior {

    init(http) {
        this.http = http;
        this.options = {
            'url_resource_on': C('url_resource_on'),
            'url_resource_reg': C('url_resource_reg')
        };
    }

    run(data) {
        if (!this.options.url_resource_on || !this.http.pathname || this.http.pathname === '/') {
            return null;
        }

        let pathname = this.http.pathname;
        //通过正则判断是否是静态资源请求
        if (!this.options.url_resource_reg.test(pathname)) {
            return null;
        }
        pathname = _path2.default.normalize(pathname);
        let file = THINK.RESOURCE_PATH + '/' + decodeURIComponent(pathname);
        //正则判断是否文件
        //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
        //if (!!file.match(urlReg)) {
        if (isFile(file)) {
            let contentType = _mime2.default.lookup(file);
            this.http.header('Content-Type', contentType + '; charset=' + C('encoding'));
            this.http.typesend = true;
            let fileStream = _fs2.default.createReadStream(file);
            fileStream.pipe(this.http.res);
            fileStream.on('end', () => O(this.http, 200));
            return getDefer().promise;
        } else {
            return O(this.http, 404);
        }
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/19
    */