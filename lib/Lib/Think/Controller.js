'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Filter = require('../Util/Filter');

var _Filter2 = _interopRequireDefault(_Filter);

var _Valid = require('../Util/Valid');

var _Valid2 = _interopRequireDefault(_Valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        //assign别名
        this.set = this.assign;
        //success别名
        this.ok = this.success;
        //error别名
        this.fail = this.error;
    };

    /**
     * init view instance
     * @return {Object} []
     */

    _class.prototype.view = function view() {
        return this.http.view();
    };

    /**
     * 是否是GET请求
     * @return {Boolean} [description]
     */

    _class.prototype.isGet = function isGet() {
        return this.http.isGet();
    };

    /**
     * 是否是POST请求
     * @return {Boolean} [description]
     */

    _class.prototype.isPost = function isPost() {
        return this.http.isPost();
    };

    /**
     * 是否是特定METHOD请求
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */

    _class.prototype.isMethod = function isMethod(method) {
        return this.http.method === method.toUpperCase();
    };

    /**
     * 是否是AJAX请求
     * @return {Boolean} [description]
     */

    _class.prototype.isAjax = function isAjax(method) {
        return this.http.isAjax(method);
    };

    /**
     * 是否是websocket请求
     * @return {Boolean} [description]
     */

    _class.prototype.isWebSocket = function isWebSocket() {
        return this.http.isWebSocket;
    };

    /**
     * 是否是restful请求
     */

    _class.prototype.isRestful = function isRestful() {
        return this.http.isRestful;
    };

    /**
     * 是否是命令行模式
     * @return {Boolean} [description]
     */

    _class.prototype.isCli = function isCli() {
        return this.http.isCli();
    };

    /**
     * 是否是jsonp接口
     * @return {Boolean} [description]
     */

    _class.prototype.isJsonp = function isJsonp(name) {
        return this.http.isJsonp(name);
    };

    /**
     * token功能
     * @return {[type]} [description]
     */

    _class.prototype.token = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(_token) {
            var tokenName, value;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            tokenName = C('token_name');
                            _context.next = 3;
                            return this.session(tokenName);

                        case 3:
                            value = _context.sent;

                            if (!_token) {
                                _context.next = 13;
                                break;
                            }

                            if (!(value !== _token)) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt('return', true);

                        case 9:
                            //匹配完成后清除token
                            this.session(tokenName, null);
                            return _context.abrupt('return', false);

                        case 11:
                            _context.next = 19;
                            break;

                        case 13:
                            if (!value) {
                                _context.next = 15;
                                break;
                            }

                            return _context.abrupt('return', value);

                        case 15:
                            value = this.http._session.uid(32);
                            _context.next = 18;
                            return this.session(tokenName, value);

                        case 18:
                            return _context.abrupt('return', value);

                        case 19:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function token(_x) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 获取QUERY参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _class.prototype.get = function get(name, value) {
        return this.http.get(name, value);
    };

    /**
     * 获取POST参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _class.prototype.post = function post(name, value) {
        return this.http.post(name, value);
    };

    /**
     * 获取参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _class.prototype.param = function param(name) {
        return this.http.param(name);
    };

    /**
     * 获取上传的文件
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _class.prototype.file = function file(name, value) {
        return this.http.file(name, value);
    };

    /**
     * header操作
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */

    _class.prototype.header = function header(name, value) {
        return this.http.header(name, value);
    };

    /**
     * 获取userAgent
     * @return {[type]} [description]
     */

    _class.prototype.userAgent = function userAgent() {
        return this.http.userAgent();
    };

    /**
     * 获取referrer
     * @return {[type]} [description]
     */

    _class.prototype.referer = function referer(host) {
        return this.http.referrer(host);
    };

    /**
     * cookie操作
     * @param  {[type]} name    [description]
     * @param  {[type]} value   [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _class.prototype.cookie = function cookie(name, value, options) {
        return this.http.cookie(name, value, options);
    };

    /**
     * session
     * 如果是get操作，则返回一个promise
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */

    _class.prototype.session = function session(name, value) {
        return this.http.session(name, value);
    };

    /**
     * 赋值变量到模版
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */

    _class.prototype.assign = function assign(name, value) {
        return this.view().assign(name, value);
    };

    /**
     * 获取解析后的模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */

    _class.prototype.fetch = function fetch(templateFile) {
        return this.view().fetch(templateFile);
    };

    /**
     * 输出模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */

    _class.prototype.display = function display(templateFile, charset, contentType) {
        return this.view().display(templateFile, charset, contentType);
    };
    /**
     * 设置http响应状态码
     * @param  {Number} status [status code]
     * @return {}        []
     */

    _class.prototype.status = function status() {
        var _status = arguments.length <= 0 || arguments[0] === undefined ? 404 : arguments[0];

        this.http.status(_status);
        return this;
    };
    /**
     * 阻止访问
     * @param  {Number} status [status code]
     * @return {[type]}        []
     */

    _class.prototype.deny = function deny() {
        var status = arguments.length <= 0 || arguments[0] === undefined ? 403 : arguments[0];

        return O(this.http, 403);
    };
    /**
     * 设置Cache-Control及失效时间
     * @param  {Number} time []
     * @return {}      []
     */

    _class.prototype.expires = function expires(time) {
        this.http.expires(time);
        return this;
    };

    /**
     * url跳转
     * @param url
     * @param code
     * @returns {*}
     */

    _class.prototype.redirect = function redirect(url, code) {
        this.http.redirect(url, code);
        return getDefer().promise;
    };

    /**
     * 发送Content-Type
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */

    _class.prototype.type = function type(ext) {
        var encoding = arguments.length <= 1 || arguments[1] === undefined ? C('encoding') : arguments[1];

        return this.http.type(ext, encoding);
    };

    /**
     * 发送执行时间
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _class.prototype.sendTime = function sendTime() {
        return this.http.sendTime();
    };

    /**
     * json格式输出
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */

    _class.prototype.json = function json(data) {
        this.type(C('json_content_type'));
        return this.echo(data);
    };

    /**
     * jsonp格式输出
     * @param  {[type]} data  [description]
     * @param  {[type]} jsonp [description]
     * @return {[type]}       [description]
     */

    _class.prototype.jsonp = function jsonp(data) {
        this.type(C('json_content_type'));
        var callback = this.get(C('url_callback_name'));
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = callback + '(' + (data !== undefined ? (0, _stringify2.default)(data) : '') + ')';
        }
        return this.echo(data);
    };

    /**
     * 正常json数据输出
     * @param errmsg
     * @param data
     * @param code
     * @returns {type[]}
     */

    _class.prototype.success = function success(errmsg, data) {
        var code = arguments.length <= 2 || arguments[2] === undefined ? 200 : arguments[2];

        var obj = getObject(['status', C('error_no_key'), C('error_msg_key')], [1, code, errmsg || '']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(C('json_content_type'));
        return this.end(obj);
    };

    /**
     * 异常json数据输出
     * @param errmsg
     * @param data
     * @param code
     * @returns {type[]}
     */

    _class.prototype.error = function error(errmsg, data) {
        var code = arguments.length <= 2 || arguments[2] === undefined ? 500 : arguments[2];

        var obj = getObject(['status', C('error_no_key'), C('error_msg_key')], [0, code, errmsg || 'error']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(C('json_content_type'));
        return this.end(obj);
    };

    /**
     * 输出内容
     * 自动JSON.stringify
     * 自定将数字等转化为字符串
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */

    _class.prototype.echo = function echo(obj, encoding) {
        //自动发送Content-Type的header
        if (!this.http.typesend && C('auto_send_content_type')) {
            this.type(C('tpl_content_type'));
        }
        return this.http.echo(obj, encoding);
    };

    /**
     * 结束输出
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */

    _class.prototype.end = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(obj, encoding) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(obj !== undefined)) {
                                _context2.next = 3;
                                break;
                            }

                            _context2.next = 3;
                            return this.echo(obj, encoding);

                        case 3:
                            return _context2.abrupt('return', O(this.http, 200));

                        case 4:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
        return function end(_x7, _x8) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 对数据进行过滤
     * @param  {[type]} data [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */

    _class.prototype.filter = function filter() {
        var _filter = _Filter2.default.filter;
        return _filter.apply(null, arguments);
    };

    /**
     * 校验一个值是否合法
     * @param  {[type]} data      [description]
     * @param  {[type]} validType [description]
     * @return {[type]}           [description]
     */

    _class.prototype.valid = function valid(data, validType) {
        //单个值检测，只返回是否正常
        if (validType !== undefined) {
            data = [{
                value: data,
                valid: validType
            }];
            var result = (0, _Valid2.default)(data);
            return isEmpty(result);
        }
        return (0, _Valid2.default)(data);
    };

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Miex} data  []
     * @return {}       []
     */

    _class.prototype.emit = function emit(event, data) {
        if (!this.http.isWebSocket) {
            throw new Error('emit method can only used in websocket request');
        }
        return this.http.socketEmit(event, data);
    };
    /**
     * broadcast socket data
     * @param  {String} event       []
     * @param  {Mixed} data        []
     * @param  {Boolean} containSelf []
     * @return {}             []
     */

    _class.prototype.broadcast = function broadcast(event, data, containSelf) {
        if (!this.http.isWebSocket) {
            throw new Error('broadcast method can only used in websocket request');
        }
        return this.http.socketBroadcast(event, data, containSelf);
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/26
                    */

exports.default = _class;