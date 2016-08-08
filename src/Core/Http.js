/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import url from 'url';
import crypto from 'crypto';
import fs from 'fs';
import base from './Base';
/**
 * normalize pathname, remove hack chars
 * @param  {String} pathname []
 * @return {String}          []
 */
function normalizePathname(pathname) {
    'use strict';
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
 * 分割pathname
 * @param  {[type]} pathname [description]
 * @return {[type]}          [description]
 */
let splitPathName = function (pathname) {
    'use strict';
    let ret = [];
    let j = 0;
    pathname = pathname.split('/');
    for (let i = 0, length = pathname.length, item; i < length; i++) {
        item = pathname[i].trim();
        if (item) {
            ret[j++] = item;
        }
    }
    return ret;
};
/**
 * 解析cookie
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function cookieParse(str = '') {
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
function cookieStringify(name, value, options) {
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
function cookieUid(length) {
    let str = crypto.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
    return str.replace(/[\+\/]/g, '_');
}

/**
 * 生成cookie签名
 * @param  string val
 * @param  string secret
 * @return string
 */
function cookieSign(val, secret = '') {
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
function cookieUnsign(val, secret) {
    let str = val.slice(0, val.lastIndexOf('.'));
    return cookieSign(str, secret) === val ? str : '';
}

export default class extends base {

    init(req, res) {
        //bind request and response
        this.req = req;
        this.res = res;
        //set http end flag
        this.isend = false;
        //content type is send
        this.typesend = false;

        this._get = {};
        this._post = {};
        this._file = {};
        this._payload = null;//request payload, Buffer
        this._cookie = {};//request cookie
        this._type = '';//request content_type
        this._status = null;//输出的http状态
        this._tplfile = null;//输出模板定位的模板文件
        this._endError = null;//http输出结束时出错标志,防止循环输出
        this._sendCookie = {};//需要发送的cookie
        this._sendType = '';//输出的content_type

        this.isRestful = false;
        this.isWebSocket = false;
        this.runType = null;
        this.loaded = false;

        this.group = '';
        this.controller = '';
        this.action = '';

        this.splitPathName = splitPathName;
        this.cookieStringify = cookieStringify;
        this.cookieParse = cookieParse;
        this.cookieUid = cookieUid;
        this.cookieSign = cookieSign;
        this.cookieUnsign = cookieUnsign;
    }

    /**
     * 执行
     * @param run type
     * @returns {*}
     */
    static async run(req, res, type = 'HTTP') {
        //instance of http
        let http = new this(req, res);

        //http runtype
        http.runType = type;
        //set timeout
        let timeout = THINK.config('http_timeout');
        if (timeout) {
            res.setTimeout(timeout * 1000, () => THINK.statusAction(http, 504));
        }
        try {
            //set http start time
            http.startTime = Date.now();
            //url
            http.url = req.url;
            //http version
            http.version = req.httpVersion;
            //http method
            http.method = req.method;
            //http header
            http.headers = req.headers;

            let urlInfo = url.parse('//' + req.headers.host + req.url, true, true);
            http.pathname = normalizePathname(urlInfo.pathname);
            //querystring
            http.query = urlInfo.query;
            //hostname,contains port number
            http.host = urlInfo.host;
            //hostname, does not include port
            http.hostname = urlInfo.hostname;
            http._get = urlInfo.query || {};
            http._type = (req.headers['content-type'] || '').split(';')[0].trim();
            http._sendType = THINK.config('tpl_content_type');

            //auto send header
            if (!res.headersSent) {
                res.setHeader('X-Powered-By', 'ThinkNode');
                //Security
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('X-XSS-Protection', '1;mode=block');
            }
            //invoke middleware
            await THINK.run('request_begin', http);
            if (http.hasPayload()) {
                await THINK.run('payload_parse', http);
                await THINK.run('payload_check', http);
            }
            await THINK.run('route_parse', http);
            //http load success
            http.loaded = true;
            return http;
        } catch (err) {
            return THINK.statusAction(http, 500, err);
        }
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
        name = name || THINK.config('url_callback_name');
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
     * get or set get params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    get(name, value) {
        if (!this._nGet) {
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
        if (!this._nPost) {
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
        if (!this._nGet) {
            this._nGet = THINK.walkFilter(THINK.extend({}, this._get));
        }
        if (!this._nPost) {
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
        this._sendType = contentType;
        if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
            contentType += '; charset=' + (encoding || THINK.config('encoding'));
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
            let cookies = Object.values(this._sendCookie).map(function (item) {
                return cookieStringify(item.name, item.value, item);
            });
            this.header('Set-Cookie', cookies);
            this._sendCookie = {};
            return;
        }

        //parse cookie
        if (THINK.isEmpty(this._cookie) && this.headers.cookie) {
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
            domain: THINK.config('cookie_domain'), //cookie有效域名
            path: THINK.config('cookie_path'), //cookie路径
            timeout: THINK.config('cookie_timeout'), //cookie失效时间，0为浏览器关闭，单位：秒
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
        return THINK.statusAction(this, 302);
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
        let proxy = THINK.config('use_proxy') || this.host === this.hostname;
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
    async session(name, value, timeout) {
        await this.sessionStore(this);
        if (!this._session) {
            return null;
        }
        if (name === undefined) {
            return this._session.rm();
        }
        try {
            if (value !== undefined) {
                timeout = THINK.isNumber(timeout) ? timeout : THINK.config('session_timeout');
                return this._session.set(name, value, timeout);
            } else {
                return this._session.get(name);
            }
        } catch (e) {
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
    async write(obj, encoding) {
        if (!this.res.connection) {
            return;
        }
        await this.cookie(true);
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
                return this.res.write(obj, encoding || THINK.config('encoding'));
            }
        }
        return;
    }

    /**
     *
     * @private
     */
    async end(obj, encoding) {
        try {
            await this.write(obj, encoding);
            if (THINK.config('post_file_autoremove') && !THINK.isEmpty(this.file)) {
                let key, path, fn = function () {
                };
                for (key in this.file) {
                    path = this.file[key].path;
                    if (THINK.isFile(path)) {
                        fs.unlink(path, fn);
                    }
                }
            }
            return this._endError ? THINK.done(this, this._status, this._endError) : THINK.done(this, 200);
        } catch (e) {
            return THINK.statusAction(this, 500, e);
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
     * check request has post data
     * @return {Boolean} []
     */
    hasPayload() {
        if ('transfer-encoding' in this.req.headers) {
            return true;
        }
        return (this.req.headers['content-length'] | 0) > 0;
    }

    /**
     * get payload data
     * @param  {String} encoding [payload data encoding]
     * @return {}          []
     */
    getPayload(encoding = 'utf8') {
        let _getPayload = () => {
            if (this.payload) {
                return Promise.resolve(this.payload);
            }
            if (!this.req.readable) {
                return Promise.resolve(new Buffer(0));
            }
            let buffers = [];
            let deferred = THINK.getDefer();
            this.req.on('data', chunk => {
                buffers.push(chunk);
            });
            this.req.on('end', () => {
                this.payload = Buffer.concat(buffers);
                deferred.resolve(this.payload);
            });
            this.req.on('error', () => THINK.statusAction(this, 400));
            return deferred.promise;
        };

        return _getPayload().then(buffer => {
            return encoding === true ? buffer : buffer.toString(encoding);
        });
    }

    /**
     * session驱动
     * @private
     */
    sessionStore(http) {
        //if session is init, return
        if (http._session) {
            return http._session;
        }
        let sessionName = THINK.config('session_name');
        let sessionSign = THINK.config('session_sign');

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
        let driver = THINK.ucFirst(THINK.config('session_type'));
        let cls = THINK.adapter(`${driver}Session`);
        http._session = new cls({
            cache_path: THINK.isEmpty(THINK.config('session_path')) ? THINK.CACHE_PATH : THINK.config('session_path'),
            cache_key_prefix: sessionCookie,
            cache_timeout: THINK.config('session_timeout')
        });

        return http._session;
    }

}
