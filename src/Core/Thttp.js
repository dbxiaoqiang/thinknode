/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import querystring from 'querystring';
import url from 'url';
import multiparty from 'multiparty';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import base from './Base';

const PAYLOAD_METHODS = ['POST', 'PUT', 'PATCH'];

export default class extends base {

    init(req, res) {
        this.req = req;
        this.res = res;
        this.http = {};
        this.http.req = req;
        this.http.res = res;
        //set http start time
        this.http.startTime = Date.now();
    }

    /**
     * 执行
     * @param  {Function} callback [description]
     * @return Promise            [description]
     */
    run() {
        try{
            //bind props & methods to http
            this.bind();
            //auto send header
            if (!this.res.headersSent) {
                this.res.setHeader('X-Powered-By', 'ThinkNode');
            }
            //array indexOf is faster than string
            if (PAYLOAD_METHODS.indexOf(this.req.method) > -1) {
                return this.getPostData();
            } else {
                return Promise.resolve(this.http);
            }
        }catch (err){
            return THINK.O(this.http, 500, err, this.http.isWebSocket ? 'SOCKET' : 'HTTP');
        }
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
        http.pathname = this._normalizePathname(decodeURIComponent(urlInfo.pathname));
        //query只记录?后面的参数
        http.query = urlInfo.query;
        //主机名，带端口
        http.host = urlInfo.host;
        //主机名，不带端口
        http.hostname = urlInfo.hostname;

        http._get = urlInfo.query || {};
        http._post = {};
        http._file = {};
        http._payload = null;//request payload, Buffer
        http._cookie = {};
        http._status = null;
        http._tplfile = null;
        http._sendCookie = {};//需要发送的cookie
        http._type = (http.headers['content-type'] || '').split(';')[0].trim();

        http.isRestful = false;
        http.isWebSocket = false;

        http.isGet = this.isGet;
        http.isPost = this.isPost;
        http.isAjax = this.isAjax;
        http.isJsonp = this.isJsonp;

        http.userAgent = this.userAgent;
        http.referrer = this.referrer;
        http.get = this.get;
        http.post = this.post;
        http.param = this.param;
        http.file = this.file;
        http.header = this.header;
        http.status = this.status;
        http.ip = this.ip;
        http.cookieStf = this._cookieStringify;
        http.cookieParse = this._cookieParse;
        http.cookieUid = this._cookieUid;
        http.cookieSign = this._cookieSign;
        http.cookieUnsign = this._cookieUnsign;
        http.cookie = this.cookie;
        http.redirect = this.redirect;
        http.write = this.write;
        http.sendTime = this.sendTime;
        http.type = this.type;
        http.expires = this.expires;
        http.end = this.end;
        http.sessionStore = this._sessionStore;
        http.session = this.session;
        http.view = this.view;
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
        name = name || THINK.C('url_callback_name');
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
        let ref = this.headers.referer || this.headers.referrer || '';
        if (!ref || !host) {
            return ref;
        }
        let info = url.parse(ref);
        return info.hostname;
    }
    /**
     * get payload data
     * @param  {String} encoding [payload data encoding]
     * @return {}          []
     */
    getPayload(encoding = 'utf8'){
        let getData = () => {
            if(this._payload){
                return Promise.resolve(this._payload);
            }
            if(!this.req.readable){
                return Promise.resolve(new Buffer(0));
            }
            let buffers = [];
            let deferred = THINK.getDefer();
            this.req.on('data', chunk => {
                buffers.push(chunk);
            });
            this.req.on('end', () => {
                this._payload = Buffer.concat(buffers);
                deferred.resolve(this._payload);
            });
            this.req.on('error', () => THINK.O(this, 400));
            return deferred.promise;
        }
        return getData.then(buffer => (encoding === undefined ? buffer : buffer.toString(encoding)));
    }

    /**
     * get or set get params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    get(name, value) {
        if(!this._nGet){
            this._nGet = THINK.walkFilter(THINK.extend({}, this._get));
        }
        if (value === undefined) {
            if (name === undefined) {
                return this._nGet;
            }
            if (THINK.isString(name)) {
                return this._nGet[name] || '';
            }
            this._nGet = name;
        } else {
            this._nGet[name] = value;
        }
    }

    /**
     * get or set post params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    post(name, value) {
        if(!this._nPost){
            this._nPost = THINK.walkFilter(THINK.extend({}, this._post));
        }
        if (value === undefined) {
            if (name === undefined) {
                return this._nPost;
            }
            if (THINK.isString(name)) {
                return this._nPost[name] || '';
            }
            this._nPost = name;
        } else {
            this._nPost[name] = value;
        }
    }

    /**
     * get post or get params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    param(name) {
        if(!this._nGet){
            this._nGet = THINK.walkFilter(THINK.extend({}, this._get));
        }
        if(!this._nPost){
            this._nPost = THINK.walkFilter(THINK.extend({}, this._post));
        }
        if (name === undefined) {
            return THINK.extend(this._nGet, this._nPost);
        }
        return this._nPost[name] || this._nGet[name] || '';
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
        return;
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
            contentType += '; charset=' + (encoding || THINK.C('encoding'));
        }
        this.header('Content-Type', contentType);
        this.typesend = true;
        return;
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
        return;
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
            if (THINK.isEmpty(this._sendCookie)) {
                return;
            }
            let cookieStringify = this.cookieStf;
            let cookies = Object.values(this._sendCookie).map(function (item) {
                return cookieStringify(item.name, item.value, item);
            });
            this.header('Set-Cookie', cookies);
            this._sendCookie = {};
            return;
        }

        //parse cookie
        if(THINK.isEmpty(this._cookie) && this.headers.cookie){
            this._cookie = this.cookieParse(this.headers.cookie);
        }
        if (name === undefined) {
            return this._cookie;
        } else if (value === undefined) {
            return this._cookie[name] || '';
        }
        //set cookie
        if (typeof options === 'number') {
            options = {timeout: options};
        }
        options = THINK.extend(false, {
            domain: THINK.C('cookie_domain'), //cookie有效域名
            path: THINK.C('cookie_path'), //cookie路径
            timeout: THINK.C('cookie_timeout'), //cookie失效时间，0为浏览器关闭，单位：秒
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
        return;
    }

    /**
     * redirect
     * @param  {String} url  [redirect url]
     * @param  {Number} code []
     * @return {}      []
     */
    redirect(url, code) {
        this.header('Location', url || '/');
        return THINK.O(this, 302);
    }

    /**
     *
     * @private
     */
    sendTime(name) {
        let time = Date.now() - this.startTime;
        this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
        return;
    }

    /**
     * get uesr ip
     * @return {String} [ip4 or ip6]
     */
    ip(forward) {
        let proxy = THINK.C('use_proxy') || this.host === this.hostname;
        let _ip;
        if (proxy) {
            if (forward) {
                return (this.req.headers['x-forwarded-for'] || '').split(',').filter(item => {
                    item = item.trim();
                    if (THINK.isIP(item)) {
                        return item;
                    }
                });
            }
            _ip = this.req.headers['x-real-ip'];
        } else {
            let connection = this.req.connection;
            let socket = this.req.socket;
            if (connection && connection.remoteAddress !== '127.0.0.1') {
                _ip = connection.remoteAddress;
            } else if (socket && socket.remoteAddress !== '127.0.0.1') {
                _ip = socket.remoteAddress;
            }
        }
        if (!_ip) {
            return '127.0.0.1';
        }
        if (_ip.indexOf(':') > -1) {
            _ip = _ip.split(':').slice(-1)[0];
        }
        if (!THINK.isIP(_ip)) {
            return '127.0.0.1';
        }
        return _ip;
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
        return;
    }

    /**
     * get or set session
     * @param  {String} name  [session name]
     * @param  {mixed} value [session value]
     * @param  {Integer} timeout [session timeout]
     * @return {Promise}       []
     */
    session(name, value, timeout) {
        this.sessionStore(this);
        if(!this._session){
            return null;
        }
        if (name === undefined) {
            return this._session.rm();
        }
        try{
            if (value !== undefined) {
                timeout = THINK.isNumber(timeout) ? timeout : THINK.C('session_timeout');
                return this._session.set(name, value, timeout);
            } else {
                return this._session.get(name);
            }
        }catch (e){
            return null;
        }
    }

    /**
     *
     * @param obj
     * @param encoding
     * @returns {type[]}
     * @private
     */
    write(obj, encoding) {
        if (!this.res.connection) {
            return;
        }
        this.cookie(true);
        if (obj === undefined || obj === null || THINK.isPromise(obj)) {
            return;
        }
        if (THINK.isArray(obj) || THINK.isObject(obj)) {
            obj = JSON.stringify(obj);
        }
        if (!THINK.isString(obj) && !THINK.isBuffer(obj)) {
            obj += '';
        }
        if (THINK.isBuffer(obj)) {
            if (!this.isend) {
                return this.res.write(obj);
            }
        } else {
            if (!this.isend) {
                return this.res.write(obj, encoding || THINK.C('encoding'));
            }
        }
        return;
    }

    /**
     *
     * @private
     */
    end(obj, encoding) {
        try{
            this.write(obj, encoding);
            this.isend = true;
            this.res.end();
            if (THINK.C('post_file_autoremove') && !THINK.isEmpty(this.file)) {
                let key, path, fn = function () {
                };
                for (key in this.file) {
                    path = this.file[key].path;
                    if (THINK.isFile(path)) {
                        fs.unlink(path, fn);
                    }
                }
            }
            return THINK.O(this, 200, '', this.isWebSocket ? 'SOCKET' : 'HTTP');
        } catch (e){
            return THINK.O(this, 500, e, this.isWebSocket ? 'SOCKET' : 'HTTP');
        }
    }

    /**
     * get view instance
     * @return {Object} []
     */
    view() {
        if (!this._views) {
            this._views = new THINK.View(this);
        }
        return this._views;
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
                return Promise.resolve(this.http);
            }
            let multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
            //file upload by form or FormData
            if (multiReg.test(this.req.headers['content-type'])) {
                return this._filePost();
            } else if (this.req.headers[THINK.C('post_ajax_filename_header')]) {//通过ajax上传文件
                return this._ajaxFilePost();
            } else {
                return this._commonPost();
            }
        } else {
            return Promise.resolve(this.http);
        }
    }

    /**
     * 含有文件的表单上传
     * @private
     */
    _filePost() {
        let deferred = THINK.getDefer();
        let uploadDir = THINK.C('post_file_temp_path');
        if (!THINK.isDir(uploadDir)) {
            THINK.mkDir(uploadDir);
        }
        let form = new multiparty.Form({
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
        form.on('error', (err) => deferred.reject(err));
        form.on('close', () => {
            deferred.resolve(this.http);
        });

        form.parse(this.req);
        return deferred.promise;
    }

    /**
     * 通过ajax上传文件
     * @return {[type]} [description]
     */
    _ajaxFilePost() {
        let filename = this.req.headers[THINK.C('post_ajax_filename_header')];
        let deferred = THINK.getDefer();
        let filepath = THINK.C('post_file_temp_path') || (THINK.RUNTIME_PATH + '/Temp');
        let name = crypto.randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');
        if (!THINK.isDir(filepath)) {
            THINK.mkDir(filepath);
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
        let buffers = [], length = 0, deferred = THINK.getDefer();
        this.req.on('data', chunk => {
            buffers.push(chunk);
            length += chunk.length;
        });
        this.req.on('end', () => {
            this.http.payload = Buffer.concat(buffers).toString();
            //解析提交的json数据
            this._jsonParse();
            //默认使用querystring.parse解析
            if (THINK.isEmpty(this.http._post) && this.http.payload) {
                this.http._post = querystring.parse(this.http.payload);
            }
            let post = this.http._post;
            let length = Object.keys(post).length;
            //最大表单数超过限制
            if (length > THINK.C('post_max_fields')) {
                deferred.reject('exceed the limit on the form fields');
            }
            for (let name in post) {
                //单个表单值长度超过限制
                //if (post[name].length > THINK.C('post_max_fields_size')) {
                if (post[name] && post[name].length > THINK.C('post_max_fields_size')) {
                    deferred.reject('exceed the limit on the form length');
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
        let types = THINK.C('post_json_content_type');
        if (types.indexOf(this.http._type) === -1) {
            return;
        }
        if (this.http.payload && types.indexOf(this.http._type) > -1) {
            try {
                this.http._post = JSON.parse(this.http.payload);
            } catch (e) {}
        }
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
    _cookieParse(str = '') {
        'use strict';
        let data = {};
        str.split(/; */).forEach(function (item) {
            let pos = item.indexOf('=');
            if (pos === -1) {
                return;
            }
            let key = item.substr(0, pos).trim();
            let val = item.substr(pos + 1).trim();
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
    _cookieStringify(name, value, options) {
        'use strict';
        options = options || {};
        let item = [name + '=' + encodeURIComponent(value)];
        if (options.maxage) {
            item.push('Max-Age=' + options.maxage);
        }
        if (options.domain) {
            item.push('Domain=' + options.domain);
        }
        if (options.path) {
            item.push('Path=' + options.path);
        }
        let expires = options.expires;
        if (expires) {
            if (!THINK.isDate(expires)) {
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

    /**
     * 生成uid
     * @param  int length
     * @return string
     */
    _cookieUid(length){
        let str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
        return str.replace(/[\+\/]/g, '_');
    }

    /**
     * 生成cookie签名
     * @param  string val
     * @param  string secret
     * @return string
     */
    _cookieSign(val, secret = '') {
        secret = crypto.createHmac('sha256', secret).update(val).digest('base64');
        secret = secret.replace(/\=+$/, '');
        return val + '.' + secret;
    }

    /**
     * 解析cookie签名
     * @param  {[type]} val
     * @param  {[type]} secret
     * @return {[type]}
     */
    _cookieUnsign(val, secret){
        let str = val.slice(0, val.lastIndexOf('.'));
        return this.cookieSign(str, secret) === val ? str : '';
    }

    /**
     * session驱动
     * @private
     */
    _sessionStore(http){
        //if session is init, return
        if (http._session) {
            return http._session;
        }
        let sessionName = THINK.C('session_name');
        let sessionSign = THINK.C('session_sign');

        //validate cookie sign
        let cookie = http.cookie(sessionName);
        if (cookie && sessionSign) {
            cookie = this.cookieUnsign(cookie, sessionSign);
            //set cookie to http._cookie
            if (cookie) {
                http._cookie[sessionName] = cookie;
            }
        }

        let sessionCookie = cookie;
        //generate session cookie when cookie is not set
        if (!cookie) {
            cookie = this.cookieUid(32);
            sessionCookie = cookie;
            //sign cookie
            if (sessionSign) {
                cookie = this.cookieSign(cookie, sessionSign);
            }
            //将生成的sessionCookie放在http._cookie对象上，方便程序内读取
            http._cookie[sessionName] = sessionCookie;
            http.cookie(sessionName, cookie, {length: 32, httponly: true});
        }

        //sessionStore
        let driver = THINK.ucFirst(THINK.C('session_type'));
        let cls = THINK.thinkRequire(`${driver}Session`);
        http._session = new cls({
            cache_path: THINK.isEmpty(THINK.C('session_path')) ? THINK.CACHE_PATH : THINK.C('session_path'),
            cache_key_prefix: sessionCookie,
            cache_timeout: THINK.C('session_timeout')
        });

        return http._session;
    }

}
