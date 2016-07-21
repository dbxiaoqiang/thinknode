'use strict';

exports.__esModule = true;
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

exports.default = {
    //http请求处理开始
    request_begin: ['ParseResource'],
    //http数据解析
    payload_parse: ['ParseFile', 'ParseForm'],
    //http数据验证
    payload_check: ['PayloadCheck'],
    //路由检测
    route_parse: ['ParseRoute', 'SubDomain', 'MultiLang'],
    //应用开始
    app_begin: ['Token'],
    //模版解析初始化
    view_init: ['LocateTemplate'],
    //内容过滤
    view_filter: [],
    //模版渲染
    view_parse: ['ParseTemplate'],
    //应用结束
    app_end: []
};