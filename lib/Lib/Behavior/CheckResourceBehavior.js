'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_THINK$Behavior) {
    (0, _inherits3.default)(_class, _THINK$Behavior);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Behavior.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.options = {
            'url_resource_on': C('url_resource_on'),
            'url_resource_reg': C('url_resource_reg')
        };
    };

    _class.prototype.run = function run(data) {
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
        pathname = _path2.default.normalize(pathname);
        var file = THINK.RESOURCE_PATH + '/' + decodeURI(pathname);
        //正则判断是否文件
        //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
        //if (!!file.match(urlReg)) {
        var self = this;
        if (isFile(file)) {
            var contentType = _mime2.default.lookup(file);
            self.http.header('Content-Type', contentType + '; charset=' + C('encoding'));
            self.http.typesend = true;
            var fileStream = _fs2.default.createReadStream(file);
            fileStream.pipe(self.http.res);
            fileStream.on('end', function () {
                O(self.http, 200);
            });
        } else {
            O(self.http, 404);
        }
        return getDefer().promise;
    };

    return _class;
}(THINK.Behavior); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/19
                    */

exports.default = _class;