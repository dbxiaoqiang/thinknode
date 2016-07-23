/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multiparty from 'multiparty';

const MULTIPARTY_REG = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;

export default class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run(data) {
        if (!this.http.req.readable) {
            return Promise.resolve();
        }
        //file upload by form or FormData
        //can not use http.type method
        if (MULTIPARTY_REG.test(this.http.headers['content-type'])) {
            return this.postFile();
        } else if (this.http.req.headers[THINK.config('post_ajax_filename_header')]) {
            return this.ajaxFile();
        }

        return Promise.resolve();
    }

    postFile(){
        //make upload file path
        let uploadDir = THINK.config('post_file_temp_path');
        if (!THINK.isDir(uploadDir)) {
            THINK.mkDir(uploadDir);
        }
        let deferred = THINK.getDefer();

        let form = new multiparty.Form({
            maxFieldsSize: THINK.config('post_max_fields_size'),
            maxFields: THINK.config('post_max_fields'),
            maxFilesSize: THINK.config('post_max_file_size'),
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
        form.on('error', (err) => deferred.reject(err));
        form.on('close', () => {
            deferred.resolve();
        });
        form.parse(this.http.req);

        return deferred.promise;
    }

    ajaxFile(){
        let filename = this.http.header(THINK.config('post_ajax_filename_header'));
        let name = crypto.randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');

        //make upload file path
        let filepath = THINK.config('post_file_temp_path');
        if (!THINK.isDir(filepath)) {
            THINK.mkDir(filepath);
        }
        filepath += `/${name}${path.extname(filename).slice(0, 5)}`;

        let deferred = THINK.getDefer();
        let stream = fs.createWriteStream(filepath);
        this.http.req.pipe(stream);
        stream.on('error', (err) => deferred.reject(err));
        stream.on('close', () => {
            this.http._file = {
                fieldName: 'file',
                originalFilename: filename,
                path: filepath,
                size: fs.statSync(filepath).size
            };
            deferred.resolve();
        });

        return deferred.promise;
    }

}
