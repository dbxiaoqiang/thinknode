'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _defineProperties = require('babel-runtime/core-js/object/define-properties');

var _defineProperties2 = _interopRequireDefault(_defineProperties);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * normalize pathname, remove hack chars
 * @param  {String} pathname []
 * @return {String}          []
 */
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
function normalizePathname(pathname) {
    'use strict';

    let length = pathname.length;
    let i = 0,
        chr,
        result = [],
        value = '';
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
let splitPathName = function splitPathName(pathname) {
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
function cookieParse() {
    'use strict';

    let str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
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
    let str = _crypto2.default.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
    return str.replace(/[\+\/]/g, '_');
}

/**
 * 生成cookie签名
 * @param  string val
 * @param  string secret
 * @return string
 */
function cookieSign(val) {
    let secret = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    secret = _crypto2.default.createHmac('sha256', secret).update(val).digest('base64');
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
    return this.cookieSign(str, secret) === val ? str : '';
}

exports.default = class extends _Base2.default {

    init(req, res) {
        this.http = {};
        this.http.req = req;
        this.http.res = res;
        //set http start time
        this.http.startTime = Date.now();
    }

    /**
     * 执行
     * @param run type
     * @returns {*}
     */
    run() {
        var _this = this;

        let type = arguments.length <= 0 || arguments[0] === undefined ? 'HTTP' : arguments[0];
        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //bind props & methods to http
                yield _this.bind();
                //http runtype
                _this.http.runType = type;
                //auto send header
                if (!_this.http.res.headersSent) {
                    _this.http.res.setHeader('X-Powered-By', 'ThinkNode');
                    //Security
                    _this.http.res.setHeader('X-Content-Type-Options', 'nosniff');
                    _this.http.res.setHeader('X-XSS-Protection', '1;mode=block');
                }
                let timeout = THINK.config('http_timeout');
                if (timeout) {
                    _this.http.res.setTimeout(timeout * 1000, function () {
                        return THINK.statusAction(_this.http, 504);
                    });
                }
                yield THINK.run('request_begin', _this.http);
                if (_this.http.hasPayload()) {
                    yield THINK.run('payload_parse', _this.http);
                    yield THINK.run('payload_check', _this.http);
                }
                yield THINK.run('route_parse', _this.http);
                _this.http.loaded = true;
                return _this.http;
            } catch (err) {
                return THINK.statusAction(_this.http, 500, err);
            }
        })();
    }

    /**
     * bind props & methods to http
     * @return {} []
     */
    bind() {
        let http = this.http;
        //set http end flag
        http.isend = false;
        //content type is send
        http.typesend = false;

        http._get = {};
        http._post = {};
        http._file = {};
        http._payload = null; //request payload, Buffer
        http._cookie = {}; //request cookie
        http._type = ''; //request content_type
        http._status = null; //输出的http状态
        http._tplfile = null; //输出模板定位的模板文件
        http._endError = null; //http输出结束时出错标志,防止循环输出
        http._sendCookie = {}; //需要发送的cookie
        http._sendType = ''; //输出的content_type

        http.isRestful = false;
        http.isWebSocket = false;
        http.runType = null;
        http.loaded = false;

        //url
        http.url = http.req.url;
        //http版本号
        http.version = http.req.httpVersion;
        //请求方式
        http.method = http.req.method;
        //请求头
        http.headers = http.req.headers;

        let urlInfo = _url2.default.parse('//' + http.headers.host + http.req.url, true, true);
        http.pathname = normalizePathname(urlInfo.pathname);
        //query只记录?后面的参数
        http.query = urlInfo.query;
        //主机名，带端口
        http.host = urlInfo.host;
        //主机名，不带端口
        http.hostname = urlInfo.hostname;
        http._get = urlInfo.query || {};
        http._type = (http.headers['content-type'] || '').split(';')[0].trim();
        http._sendType = THINK.config('tpl_content_type');

        (0, _defineProperties2.default)(http, {
            "isGet": {
                value: this.isGet,
                writable: false
            },
            "isPost": {
                value: this.isPost,
                writable: false
            },
            "isAjax": {
                value: this.isAjax,
                writable: false
            },
            "isJsonp": {
                value: this.isJsonp,
                writable: false
            },
            "userAgent": {
                value: this.userAgent,
                writable: false
            },
            "referrer": {
                value: this.referrer,
                writable: false
            },
            "get": {
                value: this.get,
                writable: false
            },
            "post": {
                value: this.post,
                writable: false
            },
            "param": {
                value: this.param,
                writable: false
            },
            "file": {
                value: this.file,
                writable: false
            },
            "header": {
                value: this.header,
                writable: false
            },
            "hasPayload": {
                value: this.hasPayload,
                writable: false
            },
            "getPayload": {
                value: this.getPayload,
                writable: false
            },
            "status": {
                value: this.status,
                writable: false
            },
            "ip": {
                value: this.ip,
                writable: false
            },
            "splitPathName": {
                value: splitPathName,
                writable: false
            },
            "cookieStringify": {
                value: cookieStringify,
                writable: false
            },
            "cookieParse": {
                value: cookieParse,
                writable: false
            },
            "cookieUid": {
                value: cookieUid,
                writable: false
            },
            "cookieSign": {
                value: cookieSign,
                writable: false
            },
            "cookieUnsign": {
                value: cookieUnsign,
                writable: false
            },
            "cookie": {
                value: this.cookie,
                writable: false
            },
            "sessionStore": {
                value: this.sessionStore,
                writable: false
            },
            "session": {
                value: this.session,
                writable: false
            },
            "redirect": {
                value: this.redirect,
                writable: false
            },
            "write": {
                value: this.write,
                writable: false
            },
            "sendTime": {
                value: this.sendTime,
                writable: false
            },
            "type": {
                value: this.type,
                writable: false
            },
            "expires": {
                value: this.expires,
                writable: false
            },
            "end": {
                value: this.end,
                writable: false
            },
            "view": {
                value: this.view,
                writable: false
            }
        });
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
        let info = _url2.default.parse(ref);
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
    status() {
        let status = arguments.length <= 0 || arguments[0] === undefined ? 200 : arguments[0];

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
            let cookies = (0, _values2.default)(this._sendCookie).map(function (item) {
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
            options = { timeout: options };
        }
        options = THINK.extend(false, {
            domain: THINK.config('cookie_domain'), //cookie有效域名
            path: THINK.config('cookie_path'), //cookie路径
            timeout: THINK.config('cookie_timeout') }, options);
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
        this.header('Cache-Control', `max-age=${ time }`);
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
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this2.sessionStore(_this2);
            if (!_this2._session) {
                return null;
            }
            if (name === undefined) {
                return _this2._session.rm();
            }
            try {
                if (value !== undefined) {
                    timeout = THINK.isNumber(timeout) ? timeout : THINK.config('session_timeout');
                    return _this2._session.set(name, value, timeout);
                } else {
                    return _this2._session.get(name);
                }
            } catch (e) {
                return null;
            }
        })();
    }

    /**
     *
     * @param obj
     * @param encoding
     * @returns {type[]}
     * @private
     */
    write(obj, encoding) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this3.res.connection) {
                return;
            }
            yield _this3.cookie(true);
            if (obj === undefined || obj === null || THINK.isPromise(obj)) {
                return;
            }
            if (THINK.isArray(obj) || THINK.isObject(obj)) {
                obj = (0, _stringify2.default)(obj);
            }
            if (!THINK.isString(obj) && !THINK.isBuffer(obj)) {
                obj += '';
            }
            if (THINK.isBuffer(obj)) {
                if (!_this3.isend) {
                    return _this3.res.write(obj);
                }
            } else {
                if (!_this3.isend) {
                    return _this3.res.write(obj, encoding || THINK.config('encoding'));
                }
            }
            return;
        })();
    }

    /**
     *
     * @private
     */
    end(obj, encoding) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                yield _this4.write(obj, encoding);
                if (THINK.config('post_file_autoremove') && !THINK.isEmpty(_this4.file)) {
                    let key,
                        path,
                        fn = function fn() {};
                    for (key in _this4.file) {
                        path = _this4.file[key].path;
                        if (THINK.isFile(path)) {
                            _fs2.default.unlink(path, fn);
                        }
                    }
                }
                return _this4._endError ? THINK.done(_this4, _this4._status, _this4._endError) : THINK.done(_this4, 200);
            } catch (e) {
                return THINK.statusAction(_this4, 500, e);
            }
        })();
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
    getPayload() {
        let encoding = arguments.length <= 0 || arguments[0] === undefined ? 'utf8' : arguments[0];

        let _getPayload = () => {
            if (this.payload) {
                return _promise2.default.resolve(this.payload);
            }
            if (!this.req.readable) {
                return _promise2.default.resolve(new Buffer(0));
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
            http.cookie(sessionName, cookie, { length: 32, httponly: true });
        }

        //sessionStore
        let driver = THINK.ucFirst(THINK.config('session_type'));
        let cls = THINK.adapter(`${ driver }Session`);
        http._session = new cls({
            cache_path: THINK.isEmpty(THINK.config('session_path')) ? THINK.CACHE_PATH : THINK.config('session_path'),
            cache_key_prefix: sessionCookie,
            cache_timeout: THINK.config('session_timeout')
        });

        return http._session;
    }

};