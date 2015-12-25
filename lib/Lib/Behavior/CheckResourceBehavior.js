/**
 * 静态资源请求
 * @return {[type]} [description]
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _default = (function (_THINK$Behavior) {
    _inherits(_default, _THINK$Behavior);

    function _default() {
        _classCallCheck(this, _default);

        _THINK$Behavior.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        this.http = http;
        this.options = {
            'url_resource_on': C('url_resource_on'),
            'url_resource_reg': C('url_resource_reg')
        };
    };

    _default.prototype.run = function run(data) {

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
        pathname = _path2['default'].normalize(pathname);
        var file = THINK.RESOURCE_PATH + '/' + decodeURI(pathname);
        //正则判断是否文件
        //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
        //if (!!file.match(urlReg)) {
        var self = this;
        if (isFile(file)) {
            var contentType = _mime2['default'].lookup(file);
            self.http.header('Content-Type', contentType + '; charset=' + C('encoding'));
            self.http.typesend = true;
            var fileStream = _fs2['default'].createReadStream(file);
            fileStream.pipe(self.http.res);
            fileStream.on('end', function () {
                O(self.http, 200);
            });
        } else {
            O(self.http, 404);
        }
        return getDefer().promise;
    };

    return _default;
})(THINK.Behavior);

exports['default'] = _default;
module.exports = exports['default'];