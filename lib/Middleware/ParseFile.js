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

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _multiparty = require('multiparty');

var _multiparty2 = _interopRequireDefault(_multiparty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
var MULTIPARTY_REG = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;

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
        }
    }, {
        key: 'run',
        value: function run(data) {
            if (!this.http.req.readable) {
                return _promise2.default.resolve();
            }
            //file upload by form or FormData
            //can not use http.type method
            if (MULTIPARTY_REG.test(this.http.headers['content-type'])) {
                return this.postFile();
            } else if (this.http.req.headers[THINK.config('post_ajax_filename_header')]) {
                return this.ajaxFile();
            }

            return _promise2.default.resolve();
        }
    }, {
        key: 'postFile',
        value: function postFile() {
            var _this2 = this;

            //make upload file path
            var uploadDir = THINK.config('post_file_temp_path');
            if (!THINK.isDir(uploadDir)) {
                THINK.mkDir(uploadDir);
            }
            var deferred = THINK.getDefer();

            var form = new _multiparty2.default.Form({
                maxFieldsSize: THINK.config('post_max_fields_size'),
                maxFields: THINK.config('post_max_fields'),
                maxFilesSize: THINK.config('post_max_file_size'),
                uploadDir: uploadDir
            });
            //support for file with multiple="multiple"
            var files = this.http._file;
            form.on('file', function (name, value) {
                if (name in files) {
                    if (!THINK.isArray(files[name])) {
                        files[name] = [files[name]];
                    }
                    files[name].push(value);
                } else {
                    files[name] = value;
                }
            });
            form.on('field', function (name, value) {
                _this2.http._post[name] = value;
            });
            //有错误后直接拒绝当前请求
            form.on('error', function (err) {
                return deferred.reject(err);
            });
            form.on('close', function () {
                deferred.resolve();
            });
            form.parse(this.http.req);

            return deferred.promise;
        }
    }, {
        key: 'ajaxFile',
        value: function ajaxFile() {
            var _this3 = this;

            var filename = this.http.header(THINK.config('post_ajax_filename_header'));
            var name = _crypto2.default.randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');

            //make upload file path
            var filepath = THINK.config('post_file_temp_path');
            if (!THINK.isDir(filepath)) {
                THINK.mkDir(filepath);
            }
            filepath += '/' + name + _path2.default.extname(filename).slice(0, 5);

            var deferred = THINK.getDefer();
            var stream = _fs2.default.createWriteStream(filepath);
            this.http.req.pipe(stream);
            stream.on('error', function (err) {
                return deferred.reject(err);
            });
            stream.on('close', function () {
                _this3.http._file = {
                    fieldName: 'file',
                    originalFilename: filename,
                    path: filepath,
                    size: _fs2.default.statSync(filepath).size
                };
                deferred.resolve();
            });

            return deferred.promise;
        }
    }]);
    return _class;
}(THINK.Middleware);

exports.default = _class;