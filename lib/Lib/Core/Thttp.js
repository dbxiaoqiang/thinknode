'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _events = require('events');

var _multiparty = require('multiparty');

var _multiparty2 = _interopRequireDefault(_multiparty);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {

    init(req, res) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            _this.req = req;
            _this.res = res;
            //http对象为EventEmitter的实例
            _this.http = new _events.EventEmitter();
            _this.http.req = req;
            _this.http.res = res;
            //记录当前请求的开始时间
            _this.http.startTime = Date.now();
        })();
    }

    /**
     * 执行
     * @param  {Function} callback [description]
     * @return Promise            [description]
     */
    run() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //bind props & methods to http
                _this2.bind();
                //sessionStore
                yield _this2._sessionStore();
                //自动发送thinknode和版本的header
                if (!_this2.res.headersSent) {
                    _this2.res.setHeader('X-Powered-By', 'ThinkNode');
                }
                //array indexOf is faster than string
                let methods = ['POST', 'PUT', 'PATCH'];
                if (methods.indexOf(_this2.req.method) > -1) {
                    return _this2.getPostData();
                } else {
                    return _this2.http;
                }
            } catch (err) {
                if (!_this2.res.headersSent) {
                    _this2.http._status = 500;
                    _this2.res.statusCode = 500;
                }
                _this2.http.isend = true;
                _this2.res.end();
                return E(err);
            }
        })();
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

        let urlInfo = _url2.default.parse('//' + http.headers.host + this.req.url, true, true);
        http.pathname = this._normalizePathname(decodeURIComponent(urlInfo.pathname));
        //query只记录?后面的参数
        http.query = urlInfo.query;
        //主机名，带端口
        http.host = urlInfo.host;
        //主机名，不带端口
        http.hostname = urlInfo.hostname;

        http._get = extend(false, {}, urlInfo.query);
        http._post = {};
        http._file = {};
        http._cookie = this._cookieParse(http.headers.cookie); //接收到的cookie
        http._status = null;
        http._tplfile = null;
        http._tagdata = {};
        http._sendCookie = {}; //需要发送的cookie
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
        http.cookieUid = this._cookieUid;
        http.cookieSign = this._cookieSign;
        http.cookieUnsign = this._cookieUnsign;
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
        return;
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
        return;
    }

    /**
     * get post or get params
     * @param  {String} name []
     * @return {Object | String}      []
     */
    param(name) {
        if (name === undefined) {
            return walkFilter(extend(false, this._get, this._post));
        }
        return walkFilter(this._post[name]) || walkFilter(this._get[name]) || '';
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
        return;
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
            contentType = _mime2.default.lookup(contentType);
        }
        if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
            contentType += '; charset=' + (encoding || C('encoding'));
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
            if (isEmpty(this._sendCookie)) {
                return;
            }
            let cookieStringify = this.cookieStf;
            let cookies = (0, _values2.default)(this._sendCookie).map(function (item) {
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
            options = { timeout: options };
        }
        options = extend(false, {
            domain: C('cookie_domain'), //cookie有效域名
            path: C('cookie_path'), //cookie路径
            timeout: C('cookie_timeout') }, //cookie失效时间，0为浏览器关闭，单位：秒
        options);
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
        return O(this, 302);
    }

    /**
     *
     * @private
     */
    sendTime() {
        let time = Date.now() - this.startTime;
        this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
        return;
    }

    /**
     * get uesr ip
     * @return {String} [ip4 or ip6]
     */
    ip(forward) {
        let proxy = C('use_proxy') || this.host === this.hostname;
        let _ip;
        if (proxy) {
            if (forward) {
                return (this.req.headers['x-forwarded-for'] || '').split(',').filter(item => {
                    item = item.trim();
                    if (isIP(item)) {
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
        if (!isIP(_ip)) {
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
     * @return {Promise}       []
     */
    session(name, value) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!_this3._session) {
                return null;
            }
            if (name === undefined) {
                return _this3._session.rm();
            }
            try {
                if (value !== undefined) {
                    return _this3._session.set(name, value);
                } else {
                    return _this3._session.get(name);;
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
    echo(obj, encoding) {
        if (!this.res.connection) {
            return _promise2.default.resolve();
        }
        if (obj === undefined || obj === '') {
            return _promise2.default.resolve();
        }
        if (isArray(obj) || isObject(obj)) {
            obj = (0, _stringify2.default)(obj);
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
        return _promise2.default.resolve(obj);
    }

    /**
     *
     * @private
     */
    end() {
        //this.emit('beforeEnd', this);
        this.cookie(true);
        this.isend = true;
        this.res.end();
        //this.emit('afterEnd', this);
        if (C('post_file_autoremove') && !isEmpty(this.file)) {
            let key,
                path,
                fn = function fn() {};
            for (key in this.file) {
                path = this.file[key].path;
                if (isFile(path)) {
                    _fs2.default.unlink(path, fn);
                }
            }
        }
        return this;
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
            let cls = thinkRequire(`${ ucfirst(engine) }Template`);
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
                return _promise2.default.resolve(this.http);
            }
            let multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
            //file upload by form or FormData
            if (multiReg.test(this.req.headers['content-type'])) {
                return this._filePost();
            } else if (this.req.headers[C('post_ajax_filename_header')]) {
                //通过ajax上传文件
                return this._ajaxFilePost();
            } else {
                return this._commonPost();
            }
        } else {
            return _promise2.default.resolve(this.http);
        }
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
        let form = new _multiparty2.default.Form({
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
        //有错误后直接拒绝当前请求
        form.on('error', err => deferred.reject(err));
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
        let filename = this.req.headers[C('post_ajax_filename_header')];
        let deferred = getDefer();
        let filepath = C('post_file_temp_path') || THINK.RUNTIME_PATH + '/Temp';
        let name = _crypto2.default.randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');
        if (!isDir(filepath)) {
            mkdir(filepath);
        }
        filepath += `/${ name }${ _path2.default.extname(filename) }`;
        let stream = _fs2.default.createWriteStream(filepath);
        this.req.pipe(stream);
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

    /**
     * 普通的表单上传
     * @return {[type]} [description]
     */
    _commonPost() {
        let buffers = [],
            length = 0,
            deferred = getDefer();
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
                this.http._post = _querystring2.default.parse(this.http.payload);
            }
            let post = this.http._post;
            let length = (0, _keys2.default)(post).length;
            //最大表单数超过限制
            if (length > C('post_max_fields')) {
                deferred.reject('exceed the limit on the form fields');
            }
            for (let name in post) {
                //单个表单值长度超过限制
                //if (post[name].length > C('post_max_fields_size')) {
                if (post[name] && post[name].length > C('post_max_fields_size')) {
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
        let types = C('post_json_content_type');
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
     * 解析cookie
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */
    _cookieParse() {
        'use strict';

        let str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
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
    _cookieStringify(name, value, options) {
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

    /**
     * 生成uid
     * @param  int length
     * @return string
     */
    _cookieUid(length) {
        let str = _crypto2.default.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
        return str.replace(/[\+\/]/g, '_');
    }

    /**
     * 生成cookie签名
     * @param  string val
     * @param  string secret
     * @return string
     */
    _cookieSign(val) {
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
    _cookieUnsign(val, secret) {
        let str = val.slice(0, val.lastIndexOf('.'));
        return this._cookieSign(str, secret) === val ? str : '';
    }

    /**
     * session驱动
     * @private
     */
    _sessionStore() {
        let sessionCookie = this.http._cookie[C('session_name')];
        //是否使用签名
        let sessionName = C('session_name');
        let sessionSign = C('session_sign');
        if (!sessionCookie) {
            sessionCookie = this._cookieUid(32);
            if (this.sessionSign) {
                sessionCookie = this._cookieSign(sessionCookie, sessionSign);
            }
            //将生成的sessionCookie放在http._cookie对象上，方便程序内读取
            this.http._cookie[sessionName] = sessionCookie;
            this.http.cookie(sessionName, sessionCookie);
        } else {
            //是否使用签名
            if (sessionSign) {
                sessionCookie = this._cookieUnsign(sessionCookie, sessionSign);
                if (sessionCookie) {
                    this.http._cookie[sessionName] = sessionCookie;
                }
            }
        }
        if (!this.http._session) {
            let driver = ucfirst(C('session_type'));
            let cls = thinkRequire(`${ driver }Session`);
            this.http._session = new cls({ cache_path: C('session_path'), cache_key_prefix: sessionCookie, cache_timeout: C('session_timeout') });
        }

        return this.http._session;
    }

}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/26
    */