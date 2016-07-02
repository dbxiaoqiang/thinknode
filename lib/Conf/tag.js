'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
/**
 * 自动关闭数据库连接
 * @return {[type]} [description]
 */
let closeDbConnect = () => {
    'use strict';

    if (THINK.C('auto_close_db')) {
        new THINK.Model().close();
    }
};

exports.default = {
    //应用初始化
    app_init: ['Dispather'],
    //路由检测
    route_parse: ['CheckResource', 'CheckRoute', 'SubDomain'],
    //应用开始
    app_begin: ['Token'],
    //模版解析初始化
    view_init: ['LocateTemplate'],
    //内容过滤
    view_filter: [],
    //模版渲染
    view_parse: ['ParseTemplate'],
    //模版解析结束
    view_end: [],
    //应用结束
    app_end: [closeDbConnect]
};