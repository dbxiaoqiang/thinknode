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

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _BaseJs = require('./Base.js');

var _BaseJs2 = _interopRequireDefault(_BaseJs);

var _UtilFilterJs = require('../Util/Filter.js');

var _UtilFilterJs2 = _interopRequireDefault(_UtilFilterJs);

var _UtilValidJs = require('../Util/Valid.js');

var _UtilValidJs2 = _interopRequireDefault(_UtilValidJs);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
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

    _default.prototype.view = function view() {
        return this.http.view();
    };

    /**
     * 是否是GET请求
     * @return {Boolean} [description]
     */

    _default.prototype.isGet = function isGet() {
        return this.http.isGet();
    };

    /**
     * 是否是POST请求
     * @return {Boolean} [description]
     */

    _default.prototype.isPost = function isPost() {
        return this.http.isPost();
    };

    /**
     * 是否是特定METHOD请求
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */

    _default.prototype.isMethod = function isMethod(method) {
        return this.http.method === method.toUpperCase();
    };

    /**
     * 是否是AJAX请求
     * @return {Boolean} [description]
     */

    _default.prototype.isAjax = function isAjax(method) {
        return this.http.isAjax(method);
    };

    /**
     * 是否是websocket请求
     * @return {Boolean} [description]
     */

    _default.prototype.isWebSocket = function isWebSocket() {
        return this.http.isWebSocket;
    };

    /**
     * 是否是restful请求
     */

    _default.prototype.isRestful = function isRestful() {
        return this.http.isRestful;
    };

    /**
     * 是否是命令行模式
     * @return {Boolean} [description]
     */

    _default.prototype.isCli = function isCli() {
        return this.http.isCli();
    };

    /**
     * 是否是jsonp接口
     * @return {Boolean} [description]
     */

    _default.prototype.isJsonp = function isJsonp(name) {
        return this.http.isJsonp(name);
    };

    /**
     * token功能
     * @return {[type]} [description]
     */

    _default.prototype.token = function token(_token) {
        var tokenName, value;
        return _regeneratorRuntime.async(function token$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    tokenName = C('token_name');
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap(this.session(tokenName));

                case 3:
                    value = context$2$0.sent;

                    if (!_token) {
                        context$2$0.next = 13;
                        break;
                    }

                    if (!(value !== _token)) {
                        context$2$0.next = 9;
                        break;
                    }

                    return context$2$0.abrupt('return', true);

                case 9:
                    //匹配完成后清除token
                    this.session(tokenName, null);
                    return context$2$0.abrupt('return', false);

                case 11:
                    context$2$0.next = 19;
                    break;

                case 13:
                    if (!value) {
                        context$2$0.next = 15;
                        break;
                    }

                    return context$2$0.abrupt('return', value);

                case 15:
                    value = this.http._session.uid(32);
                    context$2$0.next = 18;
                    return _regeneratorRuntime.awrap(this.session(tokenName, value));

                case 18:
                    return context$2$0.abrupt('return', value);

                case 19:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * 获取QUERY参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _default.prototype.get = function get(name, value) {
        return this.http.get(name, value);
    };

    /**
     * 获取POST参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _default.prototype.post = function post(name, value) {
        return this.http.post(name, value);
    };

    /**
     * 获取参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _default.prototype.param = function param(name) {
        return this.http.param(name);
    };

    /**
     * 获取上传的文件
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _default.prototype.file = function file(name, value) {
        return this.http.file(name, value);
    };

    /**
     * header操作
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */

    _default.prototype.header = function header(name, value) {
        return this.http.header(name, value);
    };

    /**
     * 获取userAgent
     * @return {[type]} [description]
     */

    _default.prototype.userAgent = function userAgent() {
        return this.http.userAgent();
    };

    /**
     * 获取referrer
     * @return {[type]} [description]
     */

    _default.prototype.referer = function referer(host) {
        return this.http.referrer(host);
    };

    /**
     * cookie操作
     * @param  {[type]} name    [description]
     * @param  {[type]} value   [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype.cookie = function cookie(name, value, options) {
        return this.http.cookie(name, value, options);
    };

    /**
     * session
     * 如果是get操作，则返回一个promise
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */

    _default.prototype.session = function session(name, value) {
        return this.http.session(name, value);
    };

    /**
     * 赋值变量到模版
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */

    _default.prototype.assign = function assign(name, value) {
        return this.view().assign(name, value);
    };

    /**
     * 获取解析后的模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */

    _default.prototype.fetch = function fetch(templateFile) {
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

    _default.prototype.display = function display(templateFile, charset, contentType) {
        return this.view().display(templateFile, charset, contentType);
    };

    /**
     * 设置http响应状态码
     * @param  {Number} status [status code]
     * @return {}        []
     */

    _default.prototype.status = function status() {
        var _status = arguments.length <= 0 || arguments[0] === undefined ? 404 : arguments[0];

        this.http.status(_status);
        return this;
    };

    /**
     * 阻止访问
     * @param  {Number} status [status code]
     * @return {[type]}        []
     */

    _default.prototype.deny = function deny() {
        var status = arguments.length <= 0 || arguments[0] === undefined ? 403 : arguments[0];

        this.status(status);
        this.end();
    };

    /**
     * 设置Cache-Control及失效时间
     * @param  {Number} time []
     * @return {}      []
     */

    _default.prototype.expires = function expires(time) {
        this.http.expires(time);
        return this;
    };

    /**
     * url跳转
     * @param url
     * @param code
     * @returns {*}
     */

    _default.prototype.redirect = function redirect(url, code) {
        this.http.redirect(url, code);
        return getDefer().promise;
    };

    /**
     * 发送Content-Type
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */

    _default.prototype.type = function type(ext, encoding) {
        return this.http.type(ext, encoding);
    };

    /**
     * 发送执行时间
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */

    _default.prototype.sendTime = function sendTime() {
        return this.http.sendTime();
    };

    /**
     * json格式输出
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */

    _default.prototype.json = function json(data) {
        this.type(C('json_content_type'));
        return this.echo(data);
    };

    /**
     * jsonp格式输出
     * @param  {[type]} data  [description]
     * @param  {[type]} jsonp [description]
     * @return {[type]}       [description]
     */

    _default.prototype.jsonp = function jsonp(data) {
        this.type(C('json_content_type'));
        var callback = this.get(C('url_callback_name'));
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = callback + '(' + (data !== undefined ? JSON.stringify(data) : '') + ')';
        }
        return this.echo(data);
    };

    /**
     * 正常json数据输出
     * @param  {[type]} errmsg [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */

    _default.prototype.success = function success(errmsg, data) {
        var obj = getObject([C('error_no_key'), C('error_msg_key')], [0, errmsg || '']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(C('json_content_type'));
        return this.end(obj);
    };

    /**
     * 异常json数据数据
     * @param  {[type]} errmsg [description]
     * @param  {[type]} data [description]
     * @return {[type]}        [description]
     */

    _default.prototype.error = function error() {
        var obj = getObject([C('error_no_key'), C('error_msg_key')], [500, errmsg || 'error']);
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

    _default.prototype.echo = function echo(obj, encoding) {
        //自动发送Content-Type的header
        if (C('auto_send_content_type')) {
            this.type(C('tpl_content_type'));
        }
        return this.http.echo(obj, encoding);
    };

    /**
     * 结束输出
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */

    _default.prototype.end = function end(obj, encoding) {
        return _regeneratorRuntime.async(function end$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    if (!(obj !== undefined)) {
                        context$2$0.next = 3;
                        break;
                    }

                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap(this.echo(obj, encoding));

                case 3:
                    return context$2$0.abrupt('return', this.http.end());

                case 4:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * 对数据进行过滤
     * @param  {[type]} data [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */

    _default.prototype.filter = function filter() {
        var _filter = _UtilFilterJs2['default'].filter;
        return _filter.apply(null, arguments);
    };

    /**
     * 校验一个值是否合法
     * @param  {[type]} data      [description]
     * @param  {[type]} validType [description]
     * @return {[type]}           [description]
     */

    _default.prototype.valid = function valid(data, validType) {
        //单个值检测，只返回是否正常
        if (validType !== undefined) {
            data = [{
                value: data,
                valid: validType
            }];
            var result = _UtilValidJs2['default'](data);
            return isEmpty(result);
        }
        return _UtilValidJs2['default'](data);
    };

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Miex} data  []
     * @return {}       []
     */

    _default.prototype.emit = function emit(event, data) {
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

    _default.prototype.broadcast = function broadcast(event, data, containSelf) {
        if (!this.http.isWebSocket) {
            throw new Error('broadcast method can only used in websocket request');
        }
        return this.http.socketBroadcast(event, data, containSelf);
    };

    return _default;
})(_BaseJs2['default']);

exports['default'] = _default;
module.exports = exports['default'];