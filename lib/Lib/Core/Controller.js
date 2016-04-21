'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Filter = require('../Util/Filter');

var _Filter2 = _interopRequireDefault(_Filter);

var _Valid = require('../Util/Valid');

var _Valid2 = _interopRequireDefault(_Valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {

    init(http) {
        this.http = http;
        //assign别名
        this.set = this.assign;
        //success别名
        this.ok = this.success;
        //error别名
        this.fail = this.error;
        //display别名
        this.render = this.display;
        //init view instance
        this.viewInstance = new THINK.View(http);
    }

    /**
     * 是否是GET请求
     * @return {Boolean} [description]
     */
    isGet() {
        return this.http.isGet();
    }

    /**
     * 是否是POST请求
     * @return {Boolean} [description]
     */
    isPost() {
        return this.http.isPost();
    }

    /**
     * 是否是特定METHOD请求
     * @param  {[type]}  method [description]
     * @return {Boolean}        [description]
     */
    isMethod(method) {
        return this.http.method === method.toUpperCase();
    }

    /**
     * 是否是AJAX请求
     * @return {Boolean} [description]
     */
    isAjax(method) {
        return this.http.isAjax(method);
    }

    /**
     * 是否是websocket请求
     * @return {Boolean} [description]
     */
    isWebSocket() {
        return this.http.isWebSocket;
    }

    /**
     * 是否是restful请求
     */
    isRestful() {
        return this.http.isRestful;
    }

    /**
     * 是否是jsonp接口
     * @return {Boolean} [description]
     */
    isJsonp(name) {
        return this.http.isJsonp(name);
    }

    /**
     * token功能
     * @return {[type]} [description]
     */
    token(token) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let tokenName = C('token_name');
            let value = yield _this.session(tokenName);
            if (token) {
                if (value !== token) {
                    return true;
                } else {
                    //匹配完成后清除token
                    _this.session(tokenName, null);
                    return false;
                }
            } else {
                if (value) {
                    return value;
                }
                value = _this.http.cookieUid(32);
                yield _this.session(tokenName, value);
                return value;
            }
        })();
    }

    /**
     * 获取及构造QUERY参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get(name, value) {
        return this.http.get(name, value);
    }

    /**
     * 获取及构造POST参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    post(name, value) {
        return this.http.post(name, value);
    }

    /**
     * 获取post或get参数,post优先
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    param(name) {
        return this.http.param(name);
    }

    /**
     * 获取及构造上传的文件
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    file(name, value) {
        return this.http.file(name, value);
    }

    /**
     * header操作
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    header(name, value) {
        return this.http.header(name, value);
    }

    /**
     * 获取userAgent
     * @return {[type]} [description]
     */
    userAgent() {
        return this.http.userAgent();
    }

    /**
     * 获取referrer
     * @return {[type]} [description]
     */
    referer(host) {
        return this.http.referrer(host);
    }

    /**
     * cookie操作
     * @param  {[type]} name    [description]
     * @param  {[type]} value   [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    cookie(name, value, options) {
        return this.http.cookie(name, value, options);
    }

    /**
     * session操作
     * 如果是get操作，则返回一个promise
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    session(name, value) {
        return this.http.session(name, value);
    }

    /**
     * 赋值变量到模版
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    assign(name, value) {
        return this.viewInstance.assign(name, value);
    }

    /**
     * 获取模板引擎解析后的模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    fetch(templateFile) {
        return this.viewInstance.fetch(templateFile);
    }

    /**
     * 输出模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    display(templateFile, charset, contentType) {
        return this.viewInstance.display(templateFile, charset, contentType);
    }
    /**
     * 设置http响应状态码
     * @param  {Number} status [status code]
     * @return {}        []
     */
    status() {
        let status = arguments.length <= 0 || arguments[0] === undefined ? 404 : arguments[0];

        this.http.status(status);
        return this;
    }
    /**
     * 阻止访问
     * @param  {Number} status [status code]
     * @return {[type]}        []
     */
    deny() {
        let status = arguments.length <= 0 || arguments[0] === undefined ? 403 : arguments[0];

        return O(this.http, 403);
    }
    /**
     * 设置Cache-Control及失效时间
     * @param  {Number} time []
     * @return {}      []
     */
    expires(time) {
        this.http.expires(time);
        return this;
    }

    /**
     * url跳转
     * @param url
     * @param code
     * @returns {*}
     */
    redirect(url, code) {
        this.http.redirect(url, code);
        return getDefer().promise;
    }

    /**
     * 发送Content-Type
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    type(ext) {
        let encoding = arguments.length <= 1 || arguments[1] === undefined ? C('encoding') : arguments[1];

        return this.http.type(ext, encoding);
    }

    /**
     * 发送执行时间
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    sendTime() {
        return this.http.sendTime();
    }

    /**
     * json格式输出数据
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    json(data) {
        this.type(C('json_content_type'));
        return this.echo(data);
    }

    /**
     * jsonp格式输出数据
     * @param  {[type]} data  [description]
     * @param  {[type]} jsonp [description]
     * @return {[type]}       [description]
     */
    jsonp(data) {
        this.type(C('json_content_type'));
        let callback = this.get(C('url_callback_name'));
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = `${ callback }(${ data !== undefined ? (0, _stringify2.default)(data) : '' })`;
        }
        return this.echo(data);
    }

    /**
     * 操作成功后格式化的json数据输出
     * @param errmsg
     * @param data
     * @param code
     * @returns {type[]}
     */
    success(errmsg, data) {
        let code = arguments.length <= 2 || arguments[2] === undefined ? 200 : arguments[2];

        let obj = getObject(['status', C('error_no_key'), C('error_msg_key')], [1, code, errmsg || '']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(C('json_content_type'));
        return this.end(obj);
    }

    /**
     * 操作异常后格式化的json数据输出
     * @param errmsg
     * @param data
     * @param code
     * @returns {type[]}
     */
    error(errmsg, data) {
        let code = arguments.length <= 2 || arguments[2] === undefined ? 503 : arguments[2];

        let obj = getObject(['status', C('error_no_key'), C('error_msg_key')], [0, code, errmsg || 'error']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(C('json_content_type'));
        return this.end(obj);
    }

    /**
     * 输出内容
     * 自动JSON.stringify
     * 自定将数字等转化为字符串
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    echo(obj, encoding) {
        //自动发送Content-Type的header
        if (!this.http.typesend && C('auto_send_content_type')) {
            this.type(C('tpl_content_type'));
        }
        return this.http.echo(obj, encoding);
    }

    /**
     * 结束输出
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    end(obj, encoding) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (obj !== undefined) {
                yield _this2.echo(obj, encoding);
            }
            return O(_this2.http, 200);
        })();
    }

    /**
     * 对数据进行过滤
     * @param  {[type]} data [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    filter() {
        let _filter = _Filter2.default.filter;
        return _filter.apply(null, arguments);
    }

    /**
     * 校验一个值是否合法
     * @param  {[type]} data      [description]
     * @param  {[type]} validType [description]
     * @return {[type]}           [description]
     */
    valid(data, validType) {
        //单个值检测，只返回是否正常
        if (validType !== undefined) {
            data = [{
                value: data,
                valid: validType
            }];
            let result = (0, _Valid2.default)(data);
            return isEmpty(result);
        }
        return (0, _Valid2.default)(data);
    }

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Miex} data  []
     * @return {}       []
     */
    emit(event, data) {
        if (!this.http.isWebSocket) {
            return E('emit method can only used in websocket request');
        }
        return this.http.socketEmit(event, data);
    }
    /**
     * broadcast socket data
     * @param  {String} event       []
     * @param  {Mixed} data        []
     * @param  {Boolean} containSelf []
     * @return {}             []
     */
    broadcast(event, data, containSelf) {
        if (!this.http.isWebSocket) {
            return E('broadcast method can only used in websocket request');
        }
        return this.http.socketBroadcast(event, data, containSelf);
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/26
    */