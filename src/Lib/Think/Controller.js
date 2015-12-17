/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
import base from './Base';
import filter_tool from '../Util/Filter';
import valid from '../Util/Valid';

export default class extends base {

    init(http) {
        this.http = http;
        //assign别名
        this.set = this.assign;
        //success别名
        this.ok = this.success;
        //error别名
        this.fail = this.error;
    }

    /**
     * init view instance
     * @return {Object} []
     */
    view() {
        return this.http.view();
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
     * 是否是命令行模式
     * @return {Boolean} [description]
     */
    isCli() {
        return this.http.isCli();
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
    async token(token) {
        let tokenName = C('token_name');
        let value = await this.session(tokenName);
        if (token) {
            if (value !== token) {
                return true;
            } else {
                //匹配完成后清除token
                this.session(tokenName, null);
                return false;
            }
        } else {
            if (value) {
                return value;
            }
            value = this.http._session.uid(32);
            await this.session(tokenName, value);
            return value;
        }
    }

    /**
     * 获取QUERY参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    get(name, value) {
        return this.http.get(name, value);
    }

    /**
     * 获取POST参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    post(name, value) {
        return this.http.post(name, value);
    }

    /**
     * 获取参数
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    param(name) {
        return this.http.param(name);
    }

    /**
     * 获取上传的文件
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
     * session
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
        return this.view().assign(name, value);
    }

    /**
     * 获取解析后的模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    fetch(templateFile){
        return this.view().fetch(templateFile);
    }

    /**
     * 输出模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    display(templateFile, charset, contentType){
        return this.view().display(templateFile, charset, contentType);
    }
    /**
     * 设置http响应状态码
     * @param  {Number} status [status code]
     * @return {}        []
     */
    status(status = 404) {
        this.http.status(status);
        return this;
    }
    /**
     * 阻止访问
     * @param  {Number} status [status code]
     * @return {[type]}        []
     */
    deny(status = 403){
        this.status(status);
        this.end();
    }
    /**
     * 设置Cache-Control及失效时间
     * @param  {Number} time []
     * @return {}      []
     */
    expires(time){
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
    type(ext, encoding){
        return this.http.type(ext, encoding);
    }

    /**
     * 发送执行时间
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    sendTime(){
        return this.http.sendTime();
    }

    /**
     * json格式输出
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    json(data){
        this.type(C('json_content_type'));
        return this.echo(data);
    }

    /**
     * jsonp格式输出
     * @param  {[type]} data  [description]
     * @param  {[type]} jsonp [description]
     * @return {[type]}       [description]
     */
    jsonp(data){
        this.type(C('json_content_type'));
        let callback = this.get(C('url_callback_name'));
        //过滤callback值里的非法字符
        callback = callback.replace(/[^\w\.]/g, '');
        if (callback) {
            data = `${callback}(${(data !== undefined ? JSON.stringify(data) : '')})`;
        }
        return this.echo(data);
    }

    /**
     * 正常json数据输出
     * @param  {[type]} errmsg [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    success(errmsg, data){
        let obj = getObject([C('error_no_key'), C('error_msg_key')], [0, errmsg || '']);
        if (data !== undefined) {
            obj.data = data;
        } else {
            obj.data = {};
        }
        this.type(C('json_content_type'));
        return this.end(obj);
    }

    /**
     * 异常json数据数据
     * @param  {[type]} errmsg [description]
     * @param  {[type]} data [description]
     * @return {[type]}        [description]
     */
    error(errmsg, data){
        let obj = getObject([C('error_no_key'), C('error_msg_key')], [500, errmsg || 'error']);
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
    echo(obj, encoding){
        //自动发送Content-Type的header
        if (C('auto_send_content_type')) {
            this.type(C('tpl_content_type'));
        }
        return this.http.echo(obj, encoding);
    }

    /**
     * 结束输出
     * @param  {[type]} obj [description]
     * @return {[type]}     [description]
     */
    async end(obj, encoding){
        if (obj !== undefined) {
            await this.echo(obj, encoding);
        }
        return O(this.http, '', 200);
    }

    /**
     * 对数据进行过滤
     * @param  {[type]} data [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    filter(){
        let _filter = filter_tool.filter;
        return _filter.apply(null, arguments);
    }

    /**
     * 校验一个值是否合法
     * @param  {[type]} data      [description]
     * @param  {[type]} validType [description]
     * @return {[type]}           [description]
     */
    valid(data, validType){
        //单个值检测，只返回是否正常
        if (validType !== undefined) {
            data = [{
                value: data,
                valid: validType
            }];
            let result = valid(data);
            return isEmpty(result);
        }
        return valid(data);
    }

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Miex} data  []
     * @return {}       []
     */
    emit(event, data){
        if(!this.http.isWebSocket){
            throw new Error('emit method can only used in websocket request');
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
    broadcast(event, data, containSelf){
        if(!this.http.isWebSocket){
            throw new Error('broadcast method can only used in websocket request');
        }
        return this.http.socketBroadcast(event, data, containSelf);
    }
}