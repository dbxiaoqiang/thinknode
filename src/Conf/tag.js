/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
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
    app_init: ['Dispather'],
    //路由检测
    route_parse: ['CheckResource','CheckRoute'],
    //应用开始
    app_begin: [],
    //模版解析初始化
    view_init: ['LocateTemplate'],
    //模版解析
    view_parse: ['ParseTemplate'],
    //模版内容过滤
    view_filter: ['Token'],
    //模版解析结束
    view_end: [],
    //应用结束
    app_end: [closeDbConnect]
}