'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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


const MULTIPARTY_REG = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;

exports.default = class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run(data) {
        if (!this.http.req.readable) {
            return;
        }
        //file upload by form or FormData
        //can not use http.type method
        if (MULTIPARTY_REG.test(this.http.headers['content-type'])) {
            //make upload file path
            let uploadDir = THINK.C('post_file_temp_path');
            if (!THINK.isDir(uploadDir)) {
                THINK.mkDir(uploadDir);
            }
            let deferred = THINK.getDefer();

            let form = new _multiparty2.default.Form({
                maxFieldsSize: THINK.C('post_max_fields_size'),
                maxFields: THINK.C('post_max_fields'),
                maxFilesSize: THINK.C('post_max_file_size'),
                uploadDir: uploadDir
            });
            //support for file with multiple="multiple"
            let files = this.http._file;
            form.on('file', (name, value) => {
                if (name in files) {
                    if (!THINK.isArray(files[name])) {
                        files[name] = [files[name]];
                    }
                    files[name].push(value);
                } else {
                    files[name] = value;
                }
            });
            form.on('field', (name, value) => {
                this.http._post[name] = value;
            });
            //有错误后直接拒绝当前请求
            form.on('error', err => deferred.reject(err));
            form.on('close', () => {
                deferred.resolve(this.http);
            });
            form.parse(this.http.req);

            return deferred.promise;
        } else if (this.http.header(THINK.C('post_ajax_filename_header'))) {
            let filename = this.http.header(THINK.C('post_ajax_filename_header'));
            let name = _crypto2.default.randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');
            //make upload file path
            let filepath = THINK.C('post_file_temp_path');
            if (!THINK.isDir(filepath)) {
                THINK.mkDir(filepath);
            }
            filepath += `/${ name }${ _path2.default.extname(filename).slice(0, 5) }`;

            let deferred = THINK.getDefer();
            let stream = _fs2.default.createWriteStream(filepath);
            this.http.req.pipe(stream);
            stream.on('error', err => deferred.reject(err));
            stream.on('close', () => {
                this.http._file = {
                    fieldName: 'file',
                    originalFilename: filename,
                    path: filepath,
                    size: _fs2.default.statSync(filepath).size
                };
                deferred.resolve(this.http);
            });

            return deferred.promise;
        }

        return;
    }

};