/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
import querystring from 'querystring';
import url from 'url';
import {EventEmitter} from 'events';
import multiparty from 'multiparty';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import base from './Base.js';
import session from './Session.js';

export default class extends base {

    init(req, res) {
        this.req = req;
        this.res = res;
        //http对象为EventEmitter的实例
        this.http = new EventEmitter();
        this.http.req = req;
        this.http.res = res;
        //记录当前请求的开始时间
        this.http.startTime = Date.now();
    }

    /**
     * 执行
     * @param  {Function} callback [description]
     * @return Promise            [description]
     */
    run() {
        //bind props & methods to http
        this.bind();

        //自动发送thinknode和版本的header
        if (!this.res.headersSent) {
            this.res.setHeader('X-Powered-By', 'ThinkNode-' + THINK.THINK_VERSION);
        }

        //array indexOf is faster than string
        let methods = ['POST', 'PUT', 'PATCH'];
        if (methods.indexOf(this.req.method) > -1) {
            return this.getPostData();
        }

        return getPromise(this.http);
    }

    /**
     * bind props & methods to http
     * @return {} []
     */
    bind() {
        let http = this.http;
        http.url = this.req.url;
        //http版本号
        http.version = this.req.httpVersion;
        //请求方式
        http.method = this.req.method;
        //请求头
        http.headers = this.req.headers;
        //set http end flag
        http.isend = false;
        //content type is send
        http.typesend = false;

        let urlInfo = url.parse('//' + http.headers.host + this.req.url, true, true);
        let pathname = decodeURIComponent(urlInfo.pathname);
        http.pathname = this._normalizePathname(pathname);
        //query只记录?后面的参数
        http.query = urlInfo.query;
        //主机名，带端口
        http.host = urlInfo.host;
        //主机名，不带端口
        http.hostname = urlInfo.hostname;

        http._get = extend({}, urlInfo.query);
        http._post = {};
        http._file = {};
        http._cookie = this._cookieParse(http.headers.cookie);
        http._status = null;
        http._tplfile = null;
        http._tagdata = {};
        http._sendCookie = {};
        http._type = (http.headers['content-type'] || '').split(';')[0].trim();

        http.isRestful = false;
        http.isWebSocket = false;

        http.isGet = this.isGet;
        http.isPost = this.isPost;
        http.isAjax = this.isAjax;
        http.isJsonp = this.isJsonp;
        http.isCli = this.isCli;

        http.userAgent = this.userAgent;
        http.referrer = this.referrer;
        http.get = this.get;
        http.post = this.post;
        http.param = this.param;
        http.file = this.file;
        http.header = this.header;
        http.status = this.status;
        http.ip = this.ip;
        http.cookie = this.cookie;
        http.redirect = this.redirect;
        http.echo = this.echo;
        http.end = this.end;
        http.sendTime = this.sendTime;
        http.type = this.type;
        http.expires = this.expires;
        http.session = this.session;
        http.view = this.view;
        http.tplengine = this.tplengine;
        http.cookiestf = this.cookieStringify;
    }

    /**
     * is cli mode
     * @returns {boolean}
     */
    isCli() {
        return THINK.APP_MODE === 'cli';
    }

    /**
     * check http method is get
     * @return {Boolean} []
     */
    isGet() {
        return this.method === 'GET';
    }

    /**
     * check http method is post
     * @return {Boolean} []
     */
    isPost() {
        return this.method === 'POST';
    }

    /**
     * is ajax request
     * @param  {String}  method []
     * @return {Boolean}        []
     */
    isAjax(method) {
        if (method && this.method !== method.toUpperCase()) {
            return false;
        }
        return this.headers['x-requested-with'] === 'XMLHttpRequest';
    }

    /**
     * is jsonp request
     * @param  {String}  name [callback name]
     * @return {Boolean}      []
     */
    isJsonp(name) {
        name = name || this.config('url_callback_name');
        return !!this.get(name);
    }

    /**
     * get user agent
     * @return {String} []
     */
    userAgent() {
        return this.headers['user-agent'] || '';
    }

    /**
     * get page request referrer
     * @param  {String} host [only get referrer host]
     * @return {String}      []
     */
    referrer(host) {
        let referrer = this.headers.referer || this.headers.referrer || '';
        if (!referrer || !host) {
            return referrer;
        }
        let info = url.parse(referrer);
        return info.hostname;
    }

    /**
     * get or set get params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    get(name, value) {
        if (value === undefined) {
            if (name === undefined) {
                return walkFilter(this._get);
            } else if (isString(name)) {
                return walkFilter(this._get[name]) || '';
            }
            this._get = name;
        } else {
            this._get[name] = value;
        }
    }

    /**
     * get or set post params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    post(name, value) {
        if (value === undefined) {
            if (name === undefined) {
                return walkFilter(this._post);
            } else if (isString(name)) {
                return walkFilter(this._post[name]) || '';
            }
            this._post = name;
        } else {
            this._post[name] = value;
        }
    }

    /**
     * get post or get params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    param(name) {
        if (name === undefined) {
            return extend({}, this._get, this._post);
        }
        return this._post[name] || this._get[name] || '';
    }

    /**
     * get or set file data
     * @param  {String} name []
     * @return {Object}      []
     */
    file(name, value) {
        if (value === undefined) {
            if (name === undefined) {
                return this._file;
            }
            return this._file[name] || {};
        }
        this._file[name] = value;
    }

    /**
     * get or set header
     * @param  {String} name  [header name]
     * @param  {String} value [header value]
     * @return {}       []
     */
    header(name, value) {
        if (name === undefined) {
            return this.headers;
        } else if (value === undefined) {
            return this.headers[name] || '';
        }
        //check content type is send
        if (name.toLowerCase() === 'content-type') {
            if (this.typesend) {
                return;
            }
            this.typesend = true;
        }
        //set header
        if (!this.res.headersSent) {
            this.res.setHeader(name, value);
        }
    }

    /**
     * get or set content type
     * @param  {String} ext [file ext]
     * @return {}     []
     */
    type(contentType, encoding) {
        if (!contentType) {
            return this._type;
        }
        if (this.typesend) {
            return;
        }
        if (contentType.indexOf('/') === -1) {
            contentType = mime.lookup(contentType);
        }
        if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
            contentType += '; charset=' + (encoding || C('encoding'));
        }
        this.header('Content-Type', contentType);
        this.typesend = true;
    }

    /**
     * set http status
     * @param  {Number} status []
     * @return {}        []
     */
    status(status = 200) {
        let res = this.res;
        if (!res.headersSent) {
            this._status = status;
            res.statusCode = status;
        }
        return this;
    }

    /**
     * get or set cookie
     * @param  {} name    []
     * @param  {} value   []
     * @param  {} options []
     * @return {}         []
     */
    cookie(name, value, options) {
        //send cookies
        if (name === true) {
            if (isEmpty(this._sendCookie)) {
                return;
            }
            let cookieStringify = this.cookiestf;
            let cookies = Object.values(this._sendCookie).map(function (item) {
                return cookieStringify(item.name, item.value, item);
            });
            this.header('Set-Cookie', cookies);
            this._sendCookie = {};
            return;
        } else if (name === undefined) {
            return this._cookie;
        } else if (value === undefined) {
            return this._cookie[name] || '';
        }
        //set cookie
        if (typeof options === 'number') {
            options = {timeout: options};
        }
        options = extend({}, {
            cookie_domain: C('cookie_domain'), //cookie有效域名
            cookie_path: C('cookie_path'), //cookie路径
            cookie_timeout: C('cookie_timeout'), //cookie失效时间，0为浏览器关闭，单位：秒
        }, options);
        if (value === null) {
            options.timeout = -1000;
        }
        if (options.timeout !== 0) {
            options.expires = new Date(Date.now() + options.timeout * 1000);
        }
        if (options.timeout > 0) {
            options.maxage = options.timeout;
        }
        options.name = name;
        options.value = value;
        this._sendCookie[name] = options;
    }

    /**
     * redirect
     * @param  {String} url  [redirect url]
     * @param  {Number} code []
     * @return {}      []
     */
    redirect(url, code) {
        this.header('Location', url || '/');
        O(this, '', 302);
    }

    /**
     *
     * @private
     */
    sendTime() {
        let time = Date.now() - this.startTime;
        this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
    }

    /**
     * set cache-control and expires header
     * @return {} []
     */
    expires(time) {
        time = time * 1000;
        let date = new Date(Date.now() + time);
        this.header('Cache-Control', `max-age=${time}`);
        this.header('Expires', date.toUTCString());
    }

    /**
     * get or set session
     * @param  {String} name  [session name]
     * @param  {mixed} value [session value]
     * @return {Promise}       []
     */
    session(name, value) {
        if (!this._session) {
            let driver = C('session_type');
            if (driver === 'Memory') {//session驱动为内存,在debug模式和cluster下需要改为文件
                if (THINK.APP_DEBUG || C('use_cluster')) {
                    driver = 'File';
                    C('session_type', 'File');
                    P('in debug or cluster mode, session can\'t use memory for storage, convert to File');
                }
            }
            let cls = thinkRequire(`${driver}Session`);
            this._session = new cls(this);
        }
        this._session.start();

        if (name === undefined) {
            return this._session.rm();
        }
        if (value !== undefined) {
            return this._session.set(name, value);
        }
        return this._session.get(name);
    }

    /**
     *
     * @param obj
     * @param encoding
     * @returns {type[]}
     * @private
     */
    echo(obj, encoding) {
        if (!this.res.connection) {
            return;
        }
        //send cookie
        this.cookie(true);

        if (obj === undefined || obj === '') {
            return;
        }
        if (isArray(obj) || isObject(obj)) {
            obj = JSON.stringify(obj);
        }
        if (!isString(obj) && !isBuffer(obj)) {
            obj += '';
        }
        if (isBuffer(obj)) {
            if (!this.isend) {
                this.res.write(obj);
            }
        } else {
            if (!this.isend) {
                this.res.write(obj, encoding || C('encoding'));
            }
        }
        return getPromise(obj);
    }

    /**
     *
     * @private
     */
    end() {
        this.emit('beforeEnd', this);
        this.cookie(true);//send cookie
        O(this, '', 200);
        this.emit('afterEnd', this);
        if (C('post_file_autoremove') && !isEmpty(this.file)) {
            let key, path, fn = function () {
            };
            for (key in this.file) {
                path = this.file[key].path;
                if (isFile(path)) {
                    fs.unlink(path, fn);
                }
            }
        }
    }

    /**
     * get view instance
     * @return {Object} []
     */
    view() {
        if (!this._views) {
            let cls = thinkRequire('View');
            this._views = new cls(this);
        }
        return this._views;
    }

    /**
     * get tpl pase engine instance
     * @private
     */
    tplengine() {
        if (!this._engines) {
            let engine = C('tpl_engine_type');
            let cls = thinkRequire(`${ucfirst(engine)}Template`);
            this._engines = new cls(this);
        }
        return this._engines;
    }

    /**
     * 检测是否含有post数据
     * @return {Boolean} [description]
     */
    hasPostData() {
        if ('transfer-encoding' in this.req.headers) {
            return true;
        }
        return (this.req.headers['content-length'] | 0) > 0;
    }

    getPostData() {
        if (this.hasPostData()) {
            if (!this.req.readable) {
                return;
            }
            let multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
            //file upload by form or FormData
            if (multiReg.test(this.req.headers['content-type'])) {
                return this._filePost();
            } else if (this.req.headers[C('post_ajax_filename_header')]) {//通过ajax上传文件
                return this._ajaxFilePost();
            } else {
                return this._commonPost();
            }
        }
        return getPromise(this.http);
    }

    /**
     * 含有文件的表单上传
     * @private
     */
    _filePost() {
        let deferred = getDefer();
        let uploadDir = C('post_file_temp_path');
        if (!isDir(uploadDir)) {
            mkdir(uploadDir);
        }
        let form = new multiparty.Form({
            maxFieldsSize: C('post_max_fields_size'),
            maxFields: C('post_max_fields'),
            maxFilesSize: C('post_max_file_size'),
            uploadDir: uploadDir
        });
        //support for file with multiple="multiple"
        let files = this.http._file;
        form.on('file', (name, value) => {
            if (name in files) {
                if (!isArray(files[name])) {
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
        form.on('close', () => {
            deferred.resolve(this.http);
        });
        //有错误后直接拒绝当前请求
        form.on('error', () => {
            O(this.http, '', 413);
        });
        form.parse(this.req);
        return deferred.promise;
    }

    /**
     * 通过ajax上传文件
     * @return {[type]} [description]
     */
    _ajaxFilePost() {
        let filename = this.req.headers[C('post_ajax_filename_header')];
        let deferred = getDefer();
        let filepath = C('post_file_temp_path') || (THINK.RUNTIME_PATH + '/Temp');
        let name = crypto.randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');
        if (!isDir(filepath)) {
            mkdir(filepath);
        }
        filepath += `/${name}${path.extname(filename)}`;
        let stream = fs.createWriteStream(filepath);
        this.req.pipe(stream);
        stream.on('error', (err) => deferred.reject(err));
        stream.on('close', () => {
            this.http._file = {
                fieldName: 'file',
                originalFilename: filename,
                path: filepath,
                size: fs.statSync(filepath).size
            };
            deferred.resolve(this.http);
        });
        return deferred.promise;
    }

    /**
     * 普通的表单上传
     * @return {[type]} [description]
     */
    _commonPost() {
        let buffers = [], length = 0, deferred = getDefer();
        this.req.on('data', chunk => {
            buffers.push(chunk);
            length += chunk.length;
        });
        this.req.on('end', () => {
            this.http.payload = Buffer.concat(buffers).toString();
            //解析提交的json数据
            this._jsonParse();
            //默认使用querystring.parse解析
            if (isEmpty(this.http._post) && this.http.payload) {
                this.http._post = querystring.parse(this.http.payload);
            }
            let post = this.http._post;
            let length = Object.keys(post).length;
            //最大表单数超过限制
            if (length > C('post_max_fields')) {
                O(this.http, '', 413);
                return;
            }
            for (let name in post) {
                //单个表单值长度超过限制
                //if (post[name].length > C('post_max_fields_size')) {
                if (post[name] && post[name].length > C('post_max_fields_size')) {
                    O(this.http, '', 413);
                    return;
                }
            }
            deferred.resolve(this.http);
        });
        return deferred.promise;
    }

    /**
     * 解析提交的json数据
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */
    _jsonParse() {
        let types = C('post_json_content_type');
        if (types.indexOf(this.http._type) === -1) {
            return;
        }
        if (this.http.payload && types.indexOf(this.http._type) > -1) {
            try {
                this.http._post = JSON.parse(this.http.payload);
            } catch (e) {
            }
        }
    }

    /**
     * get uesr ip
     * @return {String} [ip4 or ip6]
     */
    _ip(forward) {
        let proxy = C('use_proxy') || this.http.host === this.http.hostname;
        let ip;
        if (proxy) {
            if (forward) {
                return (this.req.headers['x-forwarded-for'] || '').split(',').filter(item => {
                    item = item.trim();
                    if (isIP(item)) {
                        return item;
                    }
                });
            }
            ip = this.req.headers['x-real-ip'];
        } else {
            let connection = this.req.connection;
            let socket = this.req.socket;
            if (connection && connection.remoteAddress !== '127.0.0.1') {
                ip = connection.remoteAddress;
            } else if (socket && socket.remoteAddress !== '127.0.0.1') {
                ip = socket.remoteAddress;
            }
        }
        if (!ip) {
            return '127.0.0.1';
        }
        if (ip.indexOf(':') > -1) {
            ip = ip.split(':').slice(-1)[0];
        }
        if (!isIP(ip)) {
            return '127.0.0.1';
        }
        return ip;
    }


    /**
     * normalize pathname, remove hack chars
     * @param  {String} pathname []
     * @return {String}          []
     */
    _normalizePathname(pathname) {
        let length = pathname.length;
        let i = 0, chr, result = [], value = '';
        while (i < length) {
            chr = pathname[i++];
            if (chr === '/' || chr === '\\') {
                if (value && value[0] !== '.') {
                    result.push(value);
                }
                value = '';
            } else {
                value += chr;
            }
        }
        if (value && value[0] !== '.') {
            result.push(value);
        }
        return result.join('/');
    }

    /**
     * 解析cookie
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    _cookieParse(str) {
        'use strict';
        var data = {};
        str.split(/; */).forEach(function (item) {
            var pos = item.indexOf('=');
            if (pos === -1) {
                return;
            }
            var key = item.substr(0, pos).trim();
            var val = item.substr(pos + 1).trim();
            if ('"' === val[0]) {
                val = val.slice(1, -1);
            }
            // only assign once
            if (undefined === data[key]) {
                try {
                    data[key] = decodeURIComponent(val);
                } catch (e) {
                    data[key] = val;
                }
            }
        });
        return data;
    }

    /**
     * 格式化cookie
     * @param  {[type]} name    [description]
     * @param  {[type]} val     [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    cookieStringify(name, value, options) {
        'use strict';
        options = options || {};
        var item = [name + '=' + encodeURIComponent(value)];
        if (options.maxage) {
            item.push('Max-Age=' + options.maxage);
        }
        if (options.domain) {
            item.push('Domain=' + options.domain);
        }
        if (options.path) {
            item.push('Path=' + options.path);
        }
        var expires = options.expires;
        if (expires) {
            if (!isDate(expires)) {
                expires = new Date(expires);
            }
            item.push('Expires=' + expires.toUTCString());
        }
        if (options.httponly) {
            item.push('HttpOnly');
        }
        if (options.secure) {
            item.push('Secure');
        }
        return item.join('; ');
    }

    static baseHttp(data = {}) {
        if (isString(data)) {
            if (data[0] === '{') {
                data = JSON.parse(data);
            } else if (/^[\w]+\=/.test(data)) {
                data = querystring.parse(data);
            } else {
                data = {url: data};
            }
        }
        let url = data.url || '';
        if (url.indexOf('/') !== 0) {
            url = '/' + url;
        }
        let req = {
            httpVersion: '1.1',
            method: (data.method || 'GET').toUpperCase(),
            url: url,
            headers: extend({
                host: data.host || '127.0.0.1'
            }, data.headers),
            connection: {
                remoteAddress: data.ip || '127.0.0.1'
            }
        };
        let empty = () => {
        };
        let res = {
            setTimeout: empty,
            end: data.end || data.close || empty,
            write: data.write || data.send || empty,
            setHeader: empty
        };
        return {
            req: req,
            res: res
        };
    }

}