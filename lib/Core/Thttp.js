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

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

    var length = pathname.length;
    var i = 0,
        chr = void 0,
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
var splitPathName = function splitPathName(pathname) {
    'use strict';

    var ret = [];
    var j = 0;
    pathname = pathname.split('/');
    for (var i = 0, length = pathname.length, item; i < length; i++) {
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
    var str = _crypto2.default.randomBytes(Math.ceil(length * 0.75)).toString('base64').slice(0, length);
    return str.replace(/[\+\/]/g, '_');
}

/**
 * 生成cookie签名
 * @param  string val
 * @param  string secret
 * @return string
 */
function cookieSign(val) {
    var secret = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

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
    var str = val.slice(0, val.lastIndexOf('.'));
    return this.cookieSign(str, secret) === val ? str : '';
}

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(req, res) {
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

    }, {
        key: 'run',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var _this2 = this;

                var type = arguments.length <= 0 || arguments[0] === undefined ? 'HTTP' : arguments[0];
                var timeout;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.prev = 0;
                                _context.next = 3;
                                return this.bind();

                            case 3:
                                //http runtype
                                this.http.runType = type;
                                //auto send header
                                if (!this.http.res.headersSent) {
                                    this.http.res.setHeader('X-Powered-By', 'ThinkNode');
                                    //Security
                                    this.http.res.setHeader('X-Content-Type-Options', 'nosniff');
                                    this.http.res.setHeader('X-XSS-Protection', '1;mode=block');
                                }
                                timeout = THINK.config('http_timeout');

                                if (timeout) {
                                    this.http.res.setTimeout(timeout * 1000, function () {
                                        return THINK.statusAction(_this2.http, 504);
                                    });
                                }
                                _context.next = 9;
                                return THINK.run('request_begin', this.http);

                            case 9:
                                if (!this.http.hasPayload()) {
                                    _context.next = 14;
                                    break;
                                }

                                _context.next = 12;
                                return THINK.run('payload_parse', this.http);

                            case 12:
                                _context.next = 14;
                                return THINK.run('payload_check', this.http);

                            case 14:
                                _context.next = 16;
                                return THINK.run('route_parse', this.http);

                            case 16:
                                this.http.loaded = true;
                                return _context.abrupt('return', this.http);

                            case 20:
                                _context.prev = 20;
                                _context.t0 = _context['catch'](0);
                                return _context.abrupt('return', THINK.statusAction(this.http, 500, _context.t0));

                            case 23:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[0, 20]]);
            }));

            function run(_x3) {
                return _ref.apply(this, arguments);
            }

            return run;
        }()

        /**
         * bind props & methods to http
         * @return {} []
         */

    }, {
        key: 'bind',
        value: function bind() {
            var http = this.http;
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

            var urlInfo = _url2.default.parse('//' + http.headers.host + http.req.url, true, true);
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

    }, {
        key: 'isGet',
        value: function isGet() {
            return this.method === 'GET';
        }

        /**
         * check http method is post
         * @return {Boolean} []
         */

    }, {
        key: 'isPost',
        value: function isPost() {
            return this.method === 'POST';
        }

        /**
         * is ajax request
         * @param  {String}  method []
         * @return {Boolean}        []
         */

    }, {
        key: 'isAjax',
        value: function isAjax(method) {
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

    }, {
        key: 'isJsonp',
        value: function isJsonp(name) {
            name = name || THINK.config('url_callback_name');
            return !!this.get(name);
        }

        /**
         * get user agent
         * @return {String} []
         */

    }, {
        key: 'userAgent',
        value: function userAgent() {
            return this.headers['user-agent'] || '';
        }

        /**
         * get page request referrer
         * @param  {String} host [only get referrer host]
         * @return {String}      []
         */

    }, {
        key: 'referrer',
        value: function referrer(host) {
            var ref = this.headers.referer || this.headers.referrer || '';
            if (!ref || !host) {
                return ref;
            }
            var info = _url2.default.parse(ref);
            return info.hostname;
        }

        /**
         * get or set get params
         * @param  {String} name []
         * @return {Object | String}      []
         */

    }, {
        key: 'get',
        value: function get(name, value) {
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

    }, {
        key: 'post',
        value: function post(name, value) {
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

    }, {
        key: 'param',
        value: function param(name) {
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

    }, {
        key: 'file',
        value: function file(name, value) {
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

    }, {
        key: 'header',
        value: function header(name, value) {
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

    }, {
        key: 'type',
        value: function type(contentType, encoding) {
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

    }, {
        key: 'status',
        value: function status() {
            var _status = arguments.length <= 0 || arguments[0] === undefined ? 200 : arguments[0];

            var res = this.res;
            if (!res.headersSent) {
                this._status = _status;
                res.statusCode = _status;
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

    }, {
        key: 'cookie',
        value: function cookie(name, value, options) {
            //send cookies
            if (name === true) {
                if (THINK.isEmpty(this._sendCookie)) {
                    return;
                }
                var cookies = (0, _values2.default)(this._sendCookie).map(function (item) {
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

    }, {
        key: 'redirect',
        value: function redirect(url, code) {
            this.header('Location', url || '/');
            return THINK.statusAction(this, 302);
        }

        /**
         *
         * @private
         */

    }, {
        key: 'sendTime',
        value: function sendTime(name) {
            var time = Date.now() - this.startTime;
            this.header('X-' + (name || 'EXEC-TIME'), time + 'ms');
            return;
        }

        /**
         * get uesr ip
         * @return {String} [ip4 or ip6]
         */

    }, {
        key: 'ip',
        value: function ip(forward) {
            var proxy = THINK.config('use_proxy') || this.host === this.hostname;
            var _ip = void 0;
            if (proxy) {
                if (forward) {
                    return (this.req.headers['x-forwarded-for'] || '').split(',').filter(function (item) {
                        item = item.trim();
                        if (THINK.isIP(item)) {
                            return item;
                        }
                    });
                }
                _ip = this.req.headers['x-real-ip'];
            } else {
                var connection = this.req.connection;
                var socket = this.req.socket;
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

    }, {
        key: 'expires',
        value: function expires(time) {
            time = time * 1000;
            var date = new Date(Date.now() + time);
            this.header('Cache-Control', 'max-age=' + time);
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

    }, {
        key: 'session',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(name, value, timeout) {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.sessionStore(this);

                            case 2:
                                if (this._session) {
                                    _context2.next = 4;
                                    break;
                                }

                                return _context2.abrupt('return', null);

                            case 4:
                                if (!(name === undefined)) {
                                    _context2.next = 6;
                                    break;
                                }

                                return _context2.abrupt('return', this._session.rm());

                            case 6:
                                _context2.prev = 6;

                                if (!(value !== undefined)) {
                                    _context2.next = 12;
                                    break;
                                }

                                timeout = THINK.isNumber(timeout) ? timeout : THINK.config('session_timeout');
                                return _context2.abrupt('return', this._session.set(name, value, timeout));

                            case 12:
                                return _context2.abrupt('return', this._session.get(name));

                            case 13:
                                _context2.next = 18;
                                break;

                            case 15:
                                _context2.prev = 15;
                                _context2.t0 = _context2['catch'](6);
                                return _context2.abrupt('return', null);

                            case 18:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this, [[6, 15]]);
            }));

            function session(_x6, _x7, _x8) {
                return _ref2.apply(this, arguments);
            }

            return session;
        }()

        /**
         *
         * @param obj
         * @param encoding
         * @returns {type[]}
         * @private
         */

    }, {
        key: 'write',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(obj, encoding) {
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                if (this.res.connection) {
                                    _context3.next = 2;
                                    break;
                                }

                                return _context3.abrupt('return');

                            case 2:
                                _context3.next = 4;
                                return this.cookie(true);

                            case 4:
                                if (!(obj === undefined || obj === null || THINK.isPromise(obj))) {
                                    _context3.next = 6;
                                    break;
                                }

                                return _context3.abrupt('return');

                            case 6:
                                if (THINK.isArray(obj) || THINK.isObject(obj)) {
                                    obj = (0, _stringify2.default)(obj);
                                }
                                if (!THINK.isString(obj) && !THINK.isBuffer(obj)) {
                                    obj += '';
                                }

                                if (!THINK.isBuffer(obj)) {
                                    _context3.next = 13;
                                    break;
                                }

                                if (this.isend) {
                                    _context3.next = 11;
                                    break;
                                }

                                return _context3.abrupt('return', this.res.write(obj));

                            case 11:
                                _context3.next = 15;
                                break;

                            case 13:
                                if (this.isend) {
                                    _context3.next = 15;
                                    break;
                                }

                                return _context3.abrupt('return', this.res.write(obj, encoding || THINK.config('encoding')));

                            case 15:
                                return _context3.abrupt('return');

                            case 16:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function write(_x9, _x10) {
                return _ref3.apply(this, arguments);
            }

            return write;
        }()

        /**
         *
         * @private
         */

    }, {
        key: 'end',
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(obj, encoding) {
                var key, path, fn;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.prev = 0;
                                _context4.next = 3;
                                return this.write(obj, encoding);

                            case 3:
                                if (THINK.config('post_file_autoremove') && !THINK.isEmpty(this.file)) {
                                    key = void 0, path = void 0, fn = function fn() {};

                                    for (key in this.file) {
                                        path = this.file[key].path;
                                        if (THINK.isFile(path)) {
                                            _fs2.default.unlink(path, fn);
                                        }
                                    }
                                }
                                return _context4.abrupt('return', this._endError ? THINK.done(this, this._status, this._endError) : THINK.done(this, 200));

                            case 7:
                                _context4.prev = 7;
                                _context4.t0 = _context4['catch'](0);
                                return _context4.abrupt('return', THINK.statusAction(this, 500, _context4.t0));

                            case 10:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this, [[0, 7]]);
            }));

            function end(_x11, _x12) {
                return _ref4.apply(this, arguments);
            }

            return end;
        }()

        /**
         * get view instance
         * @return {Object} []
         */

    }, {
        key: 'view',
        value: function view() {
            if (!this._views) {
                this._views = new THINK.View(this);
            }
            return this._views;
        }

        /**
         * check request has post data
         * @return {Boolean} []
         */

    }, {
        key: 'hasPayload',
        value: function hasPayload() {
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

    }, {
        key: 'getPayload',
        value: function getPayload() {
            var _this3 = this;

            var encoding = arguments.length <= 0 || arguments[0] === undefined ? 'utf8' : arguments[0];

            var _getPayload = function _getPayload() {
                if (_this3.payload) {
                    return _promise2.default.resolve(_this3.payload);
                }
                if (!_this3.req.readable) {
                    return _promise2.default.resolve(new Buffer(0));
                }
                var buffers = [];
                var deferred = THINK.getDefer();
                _this3.req.on('data', function (chunk) {
                    buffers.push(chunk);
                });
                _this3.req.on('end', function () {
                    _this3.payload = Buffer.concat(buffers);
                    deferred.resolve(_this3.payload);
                });
                _this3.req.on('error', function () {
                    return THINK.statusAction(_this3, 400);
                });
                return deferred.promise;
            };

            return _getPayload().then(function (buffer) {
                return encoding === true ? buffer : buffer.toString(encoding);
            });
        }

        /**
         * session驱动
         * @private
         */

    }, {
        key: 'sessionStore',
        value: function sessionStore(http) {
            //if session is init, return
            if (http._session) {
                return http._session;
            }
            var sessionName = THINK.config('session_name');
            var sessionSign = THINK.config('session_sign');

            //validate cookie sign
            var cookie = http.cookie(sessionName);
            if (cookie && sessionSign) {
                cookie = this.cookieUnsign(cookie, sessionSign);
                //set cookie to http._cookie
                if (cookie) {
                    http._cookie[sessionName] = cookie;
                }
            }

            var sessionCookie = cookie;
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
            var driver = THINK.ucFirst(THINK.config('session_type'));
            var cls = THINK.adapter(driver + 'Session');
            http._session = new cls({
                cache_path: THINK.isEmpty(THINK.config('session_path')) ? THINK.CACHE_PATH : THINK.config('session_path'),
                cache_key_prefix: sessionCookie,
                cache_timeout: THINK.config('session_timeout')
            });

            return http._session;
        }
    }]);
    return _class;
}(_Base2.default);

exports.default = _class;