/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$values = require('babel-runtime/core-js/object/values')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

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

var _path2 = require('path');

var _path3 = _interopRequireDefault(_path2);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Session = require('./Session');

var _Session2 = _interopRequireDefault(_Session);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init(req, res) {
        this.req = req;
        this.res = res;
        //http对象为EventEmitter的实例
        this.http = new _events.EventEmitter();
        this.http.req = req;
        this.http.res = res;
        //记录当前请求的开始时间
        this.http.startTime = Date.now();
    };

    /**
     * 执行
     * @param  {Function} callback [description]
     * @return Promise            [description]
     */

    _default.prototype.run = function run() {
        var methods;
        return _regeneratorRuntime.async(function run$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    //bind props & methods to http
                    this.bind();

                    //自动发送thinknode和版本的header
                    if (!this.res.headersSent) {
                        this.res.setHeader('X-Powered-By', 'ThinkNode');
                    }

                    //array indexOf is faster than string
                    methods = ['POST', 'PUT', 'PATCH'];

                    if (!(methods.indexOf(this.req.method) > -1)) {
                        context$2$0.next = 7;
                        break;
                    }

                    context$2$0.next = 6;
                    return _regeneratorRuntime.awrap(this.getPostData());

                case 6:
                    this.http = context$2$0.sent;

                case 7:
                    return context$2$0.abrupt('return', getPromise(this.http));

                case 8:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * bind props & methods to http
     * @return {} []
     */

    _default.prototype.bind = function bind() {
        var http = this.http;
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

        var urlInfo = _url2['default'].parse('//' + http.headers.host + this.req.url, true, true);
        var pathname = decodeURIComponent(urlInfo.pathname);
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
    };

    /**
     * is cli mode
     * @returns {boolean}
     */

    _default.prototype.isCli = function isCli() {
        return THINK.APP_MODE === 'cli';
    };

    /**
     * check http method is get
     * @return {Boolean} []
     */

    _default.prototype.isGet = function isGet() {
        return this.method === 'GET';
    };

    /**
     * check http method is post
     * @return {Boolean} []
     */

    _default.prototype.isPost = function isPost() {
        return this.method === 'POST';
    };

    /**
     * is ajax request
     * @param  {String}  method []
     * @return {Boolean}        []
     */

    _default.prototype.isAjax = function isAjax(method) {
        if (method && this.method !== method.toUpperCase()) {
            return false;
        }
        return this.headers['x-requested-with'] === 'XMLHttpRequest';
    };

    /**
     * is jsonp request
     * @param  {String}  name [callback name]
     * @return {Boolean}      []
     */

    _default.prototype.isJsonp = function isJsonp(name) {
        name = name || this.config('url_callback_name');
        return !!this.get(name);
    };

    /**
     * get user agent
     * @return {String} []
     */

    _default.prototype.userAgent = function userAgent() {
        return this.headers['user-agent'] || '';
    };

    /**
     * get page request referrer
     * @param  {String} host [only get referrer host]
     * @return {String}      []
     */

    _default.prototype.referrer = function referrer(host) {
        var referrer = this.headers.referer || this.headers.referrer || '';
        if (!referrer || !host) {
            return referrer;
        }
        var info = _url2['default'].parse(referrer);
        return info.hostname;
    };

    /**
     * get or set get params
     * @param  {String} name []
     * @return {Object | String}      []
     */

    _default.prototype.get = function get(name, value) {
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
    };

    /**
     * get or set post params
     * @param  {String} name []
     * @return {Object | String}      []
     */

    _default.prototype.post = function post(name, value) {
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
    };

    /**
     * get post or get params
     * @param  {String} name []
     * @return {Object | String}      []
     */

    _default.prototype.param = function param(name) {
        if (name === undefined) {
            return extend({}, this._get, this._post);
        }
        return this._post[name] || this._get[name] || '';
    };

    /**
     * get or set file data
     * @param  {String} name []
     * @return {Object}      []
     */

    _default.prototype.file = function file(name, value) {
        if (value === undefined) {
            if (name === undefined) {
                return this._file;
            }
            return this._file[name] || {};
        }
        this._file[name] = value;
    };

    /**
     * get or set header
     * @param  {String} name  [header name]
     * @param  {String} value [header value]
     * @return {}       []
     */

    _default.prototype.header = function header(name, value) {
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
    };

    /**
     * get or set content type
     * @param  {String} ext [file ext]
     * @return {}     []
     */

    _default.prototype.type = function type(contentType, encoding) {
        if (!contentType) {
            return this._type;
        }
        if (this.typesend) {
            return;
        }
        if (contentType.indexOf('/') === -1) {
            contentType = _mime2['default'].lookup(contentType);
        }
        if (encoding !== false && contentType.toLowerCase().indexOf('charset=') === -1) {
            contentType += '; charset=' + (encoding || C('encoding'));
        }
        this.header('Content-Type', contentType);
        this.typesend = true;
    };

    /**
     * set http status
     * @param  {Number} status []
     * @return {}        []
     */

    _default.prototype.status = function status() {
        var _status = arguments.length <= 0 || arguments[0] === undefined ? 200 : arguments[0];

        var res = this.res;
        if (!res.headersSent) {
            this._status = _status;
            res.statusCode = _status;
        }
        return this;
    };

    /**
     * get or set cookie
     * @param  {} name    []
     * @param  {} value   []
     * @param  {} options []
     * @return {}         []
     */

    _default.prototype.cookie = function cookie(name, value, options) {
        var _this = this;

        //send cookies
        if (name === true) {
            var _ret = (function () {
                if (isEmpty(_this._sendCookie)) {
                    return {
                        v: undefined
                    };
                }
                var cookieStringify = _this.cookiestf;
                var cookies = _Object$values(_this._sendCookie).map(function (item) {
                    return cookieStringify(item.name, item.value, item);
                });
                _this.header('Set-Cookie', cookies);
                _this._sendCookie = {};
                return {
                    v: undefined
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        } else if (name === undefined) {
            return this._cookie;
        } else if (value === undefined) {
            return this._cookie[name] || '';
        }
        //set cookie
        if (typeof options === 'number') {
            options = { timeout: options };
        }
        options = extend({}, {
            cookie_domain: C('cookie_domain'), //cookie有效域名
            cookie_path: C('cookie_path'), //cookie路径
            cookie_timeout: C('cookie_timeout') }, //cookie失效时间，0为浏览器关闭，单位：秒
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
    };

    /**
     * redirect
     * @param  {String} url  [redirect url]
     * @param  {Number} code []
     * @return {}      []
     */

    _default.prototype.redirect = function redirect(url, code) {
        this.header('Location', url || '/');
        O(this, 302);
    };

    /**
     *
     * @private
     */

    _default.prototype.sendTime = function sendTime() {
        var time = Date.now() - this.startTime;
        this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
    };

    /**
     * set cache-control and expires header
     * @return {} []
     */

    _default.prototype.expires = function expires(time) {
        time = time * 1000;
        var date = new Date(Date.now() + time);
        this.header('Cache-Control', 'max-age=' + time);
        this.header('Expires', date.toUTCString());
    };

    /**
     * get or set session
     * @param  {String} name  [session name]
     * @param  {mixed} value [session value]
     * @return {Promise}       []
     */

    _default.prototype.session = function session(name, value) {
        if (!this._session) {
            var driver = ucfirst(C('session_type'));
            if (driver === 'Memory') {
                //session驱动为内存,在debug模式和cluster下需要改为文件
                if (THINK.APP_DEBUG || C('use_cluster')) {
                    driver = 'File';
                    C('session_type', 'File');
                    P('in debug or cluster mode, session can\'t use memory for storage, convert to File');
                }
            }
            var cls = thinkRequire(driver + 'Session');
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
    };

    /**
     *
     * @param obj
     * @param encoding
     * @returns {type[]}
     * @private
     */

    _default.prototype.echo = function echo(obj, encoding) {
        if (!this.res.connection) {
            return getPromise();
        }
        //send cookie
        this.cookie(true);

        if (obj === undefined || obj === '') {
            return getPromise();
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
    };

    /**
     *
     * @private
     */

    _default.prototype.end = function end() {
        //this.emit('beforeEnd', this);
        this.isend = true;
        this.cookie(true); //send cookie
        this.res.end();
        //this.emit('afterEnd', this);
        if (C('post_file_autoremove') && !isEmpty(this.file)) {
            var key = undefined,
                _path = undefined,
                fn = function fn() {};
            for (key in this.file) {
                _path = this.file[key].path;
                if (isFile(_path)) {
                    _fs2['default'].unlink(_path, fn);
                }
            }
        }
    };

    /**
     * get view instance
     * @return {Object} []
     */

    _default.prototype.view = function view() {
        if (!this._views) {
            var cls = thinkRequire('View');
            this._views = new cls(this);
        }
        return this._views;
    };

    /**
     * get tpl pase engine instance
     * @private
     */

    _default.prototype.tplengine = function tplengine() {
        if (!this._engines) {
            var engine = C('tpl_engine_type');
            var cls = thinkRequire(ucfirst(engine) + 'Template');
            this._engines = new cls(this);
        }
        return this._engines;
    };

    /**
     * 检测是否含有post数据
     * @return {Boolean} [description]
     */

    _default.prototype.hasPostData = function hasPostData() {
        if ('transfer-encoding' in this.req.headers) {
            return true;
        }
        return (this.req.headers['content-length'] | 0) > 0;
    };

    _default.prototype.getPostData = function getPostData() {
        if (this.hasPostData()) {
            if (!this.req.readable) {
                return getPromise(this.http);
            }
            var multiReg = /^multipart\/(form-data|related);\s*boundary=(?:"([^"]+)"|([^;]+))$/i;
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
            return getPromise(this.http);
        }
    };

    /**
     * 含有文件的表单上传
     * @private
     */

    _default.prototype._filePost = function _filePost() {
        var _this2 = this;

        var deferred = getDefer();
        var uploadDir = C('post_file_temp_path');
        if (!isDir(uploadDir)) {
            mkdir(uploadDir);
        }
        var form = new _multiparty2['default'].Form({
            maxFieldsSize: C('post_max_fields_size'),
            maxFields: C('post_max_fields'),
            maxFilesSize: C('post_max_file_size'),
            uploadDir: uploadDir
        });
        //support for file with multiple="multiple"
        var files = this.http._file;
        form.on('file', function (name, value) {
            if (name in files) {
                if (!isArray(files[name])) {
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
            deferred.resolve(_this2.http);
        });

        form.parse(this.req);
        return deferred.promise;
    };

    /**
     * 通过ajax上传文件
     * @return {[type]} [description]
     */

    _default.prototype._ajaxFilePost = function _ajaxFilePost() {
        var _this3 = this;

        var filename = this.req.headers[C('post_ajax_filename_header')];
        var deferred = getDefer();
        var filepath = C('post_file_temp_path') || THINK.RUNTIME_PATH + '/Temp';
        var name = _crypto2['default'].randomBytes(20).toString('base64').replace(/\+/g, '_').replace(/\//g, '_');
        if (!isDir(filepath)) {
            mkdir(filepath);
        }
        filepath += '/' + name + _path3['default'].extname(filename);
        var stream = _fs2['default'].createWriteStream(filepath);
        this.req.pipe(stream);
        stream.on('error', function (err) {
            return deferred.reject(err);
        });
        stream.on('close', function () {
            _this3.http._file = {
                fieldName: 'file',
                originalFilename: filename,
                path: filepath,
                size: _fs2['default'].statSync(filepath).size
            };
            deferred.resolve(_this3.http);
        });
        return deferred.promise;
    };

    /**
     * 普通的表单上传
     * @return {[type]} [description]
     */

    _default.prototype._commonPost = function _commonPost() {
        var _this4 = this;

        var buffers = [],
            length = 0,
            deferred = getDefer();
        this.req.on('data', function (chunk) {
            buffers.push(chunk);
            length += chunk.length;
        });
        this.req.on('end', function () {
            _this4.http.payload = Buffer.concat(buffers).toString();
            //解析提交的json数据
            _this4._jsonParse();
            //默认使用querystring.parse解析
            if (isEmpty(_this4.http._post) && _this4.http.payload) {
                _this4.http._post = _querystring2['default'].parse(_this4.http.payload);
            }
            var post = _this4.http._post;
            var length = _Object$keys(post).length;
            //最大表单数超过限制
            if (length > C('post_max_fields')) {
                deferred.reject('exceed the limit on the form fields');
            }
            for (var _name in post) {
                //单个表单值长度超过限制
                //if (post[name].length > C('post_max_fields_size')) {
                if (post[_name] && post[_name].length > C('post_max_fields_size')) {
                    deferred.reject('exceed the limit on the form length');
                }
            }
            deferred.resolve(_this4.http);
        });
        return deferred.promise;
    };

    /**
     * 解析提交的json数据
     * @param  {[type]} http [description]
     * @return {[type]}      [description]
     */

    _default.prototype._jsonParse = function _jsonParse() {
        var types = C('post_json_content_type');
        if (types.indexOf(this.http._type) === -1) {
            return;
        }
        if (this.http.payload && types.indexOf(this.http._type) > -1) {
            try {
                this.http._post = JSON.parse(this.http.payload);
            } catch (e) {}
        }
    };

    /**
     * get uesr ip
     * @return {String} [ip4 or ip6]
     */

    _default.prototype._ip = function _ip(forward) {
        var proxy = C('use_proxy') || this.http.host === this.http.hostname;
        var ip = undefined;
        if (proxy) {
            if (forward) {
                return (this.req.headers['x-forwarded-for'] || '').split(',').filter(function (item) {
                    item = item.trim();
                    if (isIP(item)) {
                        return item;
                    }
                });
            }
            ip = this.req.headers['x-real-ip'];
        } else {
            var connection = this.req.connection;
            var socket = this.req.socket;
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
    };

    /**
     * normalize pathname, remove hack chars
     * @param  {String} pathname []
     * @return {String}          []
     */

    _default.prototype._normalizePathname = function _normalizePathname(pathname) {
        var length = pathname.length;
        var i = 0,
            chr = undefined,
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
    };

    /**
     * 解析cookie
     * @param  {[type]} str [description]
     * @return {[type]}     [description]
     */

    _default.prototype._cookieParse = function _cookieParse() {
        'use strict';
        var str = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
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
    };

    /**
     * 格式化cookie
     * @param  {[type]} name    [description]
     * @param  {[type]} val     [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype.cookieStringify = function cookieStringify(name, value, options) {
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
    };

    _default.baseHttp = function baseHttp() {
        var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        if (isString(data)) {
            if (data[0] === '{') {
                data = JSON.parse(data);
            } else if (/^[\w]+\=/.test(data)) {
                data = _querystring2['default'].parse(data);
            } else {
                data = { url: data };
            }
        }
        var url = data.url || '';
        if (url.indexOf('/') !== 0) {
            url = '/' + url;
        }
        var req = {
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
        var empty = function empty() {};
        var res = {
            setTimeout: empty,
            end: data.end || data.close || empty,
            write: data.write || data.send || empty,
            setHeader: empty
        };
        return {
            req: req,
            res: res
        };
    };

    return _default;
})(_Base2['default']);

exports['default'] = _default;
module.exports = exports['default'];