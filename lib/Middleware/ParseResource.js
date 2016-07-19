'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

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

var _class = function (_THINK$Middleware) {
    (0, _inherits3.default)(_class, _THINK$Middleware);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(http) {
            this.http = http;
            this.options = {
                'url_resource_on': THINK.config('url_resource_on'),
                'url_resource_reg': THINK.config('url_resource_reg')
            };
        }
    }, {
        key: 'run',
        value: function run(data) {
            if (!this.options.url_resource_on || !this.http.pathname || this.http.pathname === '/') {
                return _promise2.default.resolve();
            }
            var pathname = this.http.pathname;
            //通过正则判断是否是静态资源请求
            if (!this.options.url_resource_reg.test(pathname)) {
                return _promise2.default.resolve();
            }
            pathname = _path2.default.normalize(pathname);
            var file = THINK.RESOURCE_PATH + '/' + decodeURIComponent(pathname);
            //正则判断是否文件
            //let urlReg = new RegExp(/[^\/]+\/([^\.]*)\/([^\/]+\.[^\/\.]+)$/);
            //if (!!file.match(urlReg)) {
            if (THINK.isFile(file)) {
                var contentType = _mime2.default.lookup(file);
                this.http.header('Content-Type', contentType + '; charset=' + THINK.config('encoding'));
                this.http.typesend = true;

                var range = this.http.header('range');
                if (range) {
                    return this.outputRange(file, range);
                } else {
                    return this.outputNormal(file);
                }
            } else {
                return THINK.statusAction(this.http, 404);
            }
        }
        /**
         * output normal file
         * @param  {String} file []
         * @return {Promise}      []
         */

    }, {
        key: 'outputNormal',
        value: function outputNormal(file) {
            var _this2 = this;

            var fileStream = _fs2.default.createReadStream(file);
            fileStream.pipe(this.http.res);
            fileStream.on('end', function () {
                return THINK.statusAction(_this2.http, 200);
            });
            fileStream.on('error', function () {
                return THINK.statusAction(_this2.http, 404);
            });
            return THINK.getDefer().promise;
        }
        /**
         * output range file
         * @param  {String} file  []
         * @param  {String} range []
         * @return {Promise}       []
         */

    }, {
        key: 'outputRange',
        value: function outputRange(file, range) {
            //request has range header
            var size = _fs2.default.statSync(file).size;
            var match = range.match(/bytes=(\d+)\-(\d*)/);
            var slice = 1 * 1024 * 1024;
            var from = parseInt(match[1]) || 0;
            var to = parseInt(match[2]) || 0;
            if (!to) {
                to = from + slice - 1;
            }
            to = Math.min(to, size - 1);

            this.http.status(206);
            this.http.header('Accept-Ranges', 'bytes');
            this.http.header('Content-Range', 'bytes ' + from + '-' + to + '/' + size);

            var fd = _fs2.default.openSync(file, 'r');
            var buffer = new Buffer(to - from + 1);
            _fs2.default.readSync(fd, buffer, 0, to - from, from);
            _fs2.default.closeSync(fd);
            return this.http.end(buffer);
        }
    }]);
    return _class;
}(THINK.Middleware); /**
                      *
                      * @author     richen
                      * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                      * @license    MIT
                      * @version    15/11/19
                      */

exports.default = _class;