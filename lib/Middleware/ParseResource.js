'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends THINK.Middleware {

    init(http) {
        this.http = http;
        this.options = {
            'url_resource_on': THINK.C('url_resource_on'),
            'url_resource_reg': THINK.C('url_resource_reg')
        };
    }

    run(data) {
        if (!this.options.url_resource_on || !this.http.pathname || this.http.pathname === '/') {
            return _promise2.default.resolve();
        }
        let pathname = this.http.pathname;
        //通过正则判断是否是静态资源请求
        if (!this.options.url_resource_reg.test(pathname)) {
            return _promise2.default.resolve();
        }
        pathname = _path2.default.normalize(pathname);
        let file = `${ THINK.RESOURCE_PATH }/${ decodeURIComponent(pathname) }`;
        //正则判断是否文件
        //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
        //if (!!file.match(urlReg)) {
        if (THINK.isFile(file)) {
            let contentType = _mime2.default.lookup(file);
            this.http.header('Content-Type', `${ contentType }; charset=${ THINK.C('encoding') }`);
            this.http.typesend = true;

            let range = this.http.header('range');
            if (range) {
                return this.outputRange(file, range);
            } else {
                return this.outputNormal(file);
            }
        } else {
            return THINK.O(this.http, 404);
        }
    }
    /**
     * output normal file
     * @param  {String} file []
     * @return {Promise}      []
     */
    outputNormal(file) {
        let fileStream = _fs2.default.createReadStream(file);
        fileStream.pipe(this.http.res);
        fileStream.on('end', () => THINK.O(this.http, 200));
        fileStream.on('error', () => THINK.O(this.http, 404));
        return THINK.getDefer().promise;
    }
    /**
     * output range file
     * @param  {String} file  []
     * @param  {String} range []
     * @return {Promise}       []
     */
    outputRange(file, range) {
        //request has range header
        let size = _fs2.default.statSync(file).size;
        let match = range.match(/bytes=(\d+)\-(\d*)/);
        let slice = 1 * 1024 * 1024;
        let from = parseInt(match[1]) || 0;
        let to = parseInt(match[2]) || 0;
        if (!to) {
            to = from + slice - 1;
        }
        to = Math.min(to, size - 1);

        this.http.status(206);
        this.http.header('Accept-Ranges', 'bytes');
        this.http.header('Content-Range', `bytes ${ from }-${ to }/${ size }`);

        let fd = _fs2.default.openSync(file, 'r');
        let buffer = new Buffer(to - from + 1);
        _fs2.default.readSync(fd, buffer, 0, to - from, from);
        _fs2.default.closeSync(fd);
        return this.http.end(buffer);
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/19
    */