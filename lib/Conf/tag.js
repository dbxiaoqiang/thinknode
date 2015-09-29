/**
 * 系统标签配置
 * 可以在App/Conf/tag.js里进行修改
 * @type {Object}
 */

/**
 * 设置HTTP res.end状态，防止异常
 * @param http
 */
var setProcessEndStatus = function (http) {
    http.endProcess = 0;
};
/**
 * 应用执行完毕
 */
var processEnd = function (http) {
    if(THINK.APP_DEBUG){
        console.log(new Date().Format('yyyy-mm-dd hh:mi:ss') + ': ' + http.res.statusCode + '   ' + http.req.url);
    }
    if(http.endProcess === 0){
        http.endProcess = 1;
        http.end();
    }
};
/**
 * 命令行模式下执行后自动关闭数据库连接
 * @return {[type]} [description]
 */
var closeDbConnect = function () {
    'use strict';
    if (C('auto_close_db')) {
        thinkRequire('Model')().close();
    }
};
/**
 * 解析提交的json数据
 * @param  {[type]} http [description]
 * @return {[type]}      [description]
 */
var jsonParse = function (http) {
    'use strict';
    var jsonContentType = C('post_json_content_type');
    if (!isArray(jsonContentType)) {
        jsonContentType = [jsonContentType];
    }
    if (http.payload && jsonContentType.indexOf(http.contentType) > -1) {
        try {
            http.post = JSON.parse(http.payload);
        } catch (e) {}
    }
};

module.exports = {
    //应用初始化
    app_init: [setProcessEndStatus],
    //表单数据解析
    form_parse: [jsonParse],
    //静态资源请求检测
    resource_check: ['CheckResource'],
    //路由检测
    route_check: ['CheckRoute'],
    //应用开始
    app_begin: [],
    //模版解析初始化
    view_init: ['ReadHtmlCache'],
    //定位模版文件
    view_template: ['LocateTemplate'],
    //模版解析
    view_parse: ['ParseTemplate', 'Token'],
    //模版内容过滤
    view_filter: [],
    //模版解析结束
    view_end: ['WriteHtmlCache'],
    //应用结束
    app_end: [processEnd, closeDbConnect]
};