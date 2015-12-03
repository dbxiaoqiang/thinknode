/**
 * 系统标签配置
 * 可以在App/Conf/tag.js里进行修改
 * @type {Object}
 */
/**
 * 命令行模式下执行后自动关闭数据库连接
 * @return {[type]} [description]
 */
let closeDbConnect = () => {
    'use strict';
    if (C('auto_close_db')) {
        new (THINK.Model)().close();
    }
};

export default {
    //应用初始化
    app_init: [],
    //静态资源请求检测
    route_init: ['CheckResource'],
    //路由检测
    route_parse: ['CheckRoute'],
    //应用开始
    app_begin: [],
    //模版解析初始化
    view_init: [],
    //定位模版文件
    view_template: ['LocateTemplate'],
    //模版解析
    view_parse: ['ParseTemplate', 'Token'],
    //模版内容过滤
    view_filter: [],
    //模版解析结束
    view_end: [],
    //应用结束
    app_end: [closeDbConnect]
}