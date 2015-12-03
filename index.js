/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/19
 */
var fs = require('fs');
var path = require('path');
var think = require('./lib/think.js');

if(!global.THINK){
    global.THINK = {};
}

//项目根目录
if(!THINK.ROOT_PATH){
    throw new Error('global.THINK.ROOT_PATH must be defined');
}

//静态资源目录
if (THINK.RESOURCE_PATH === undefined) {
    THINK.RESOURCE_PATH = THINK.ROOT_PATH + '/www';
}

//应用目录
if (THINK.APP_PATH === undefined) {
    THINK.APP_PATH = THINK.ROOT_PATH + '/App';
}

//框架目录
if (THINK.THINK_PATH === undefined) {
    THINK.THINK_PATH = __dirname + '/lib';
}
//DEBUG模式
if (THINK.APP_DEBUG === undefined) {
    THINK.APP_DEBUG = false;
}
//框架核心目录
if (THINK.CORE_PATH === undefined) {
    THINK.CORE_PATH = THINK.THINK_PATH + '/Lib/Think';
}
//运行缓存目录
if (THINK.RUNTIME_PATH === undefined) {
    THINK.RUNTIME_PATH = THINK.ROOT_PATH + '/Runtime';
}

//日志目录
if (THINK.LOG_PATH === undefined) {
    THINK.LOG_PATH = THINK.RUNTIME_PATH + '/Logs';
}

//缓存目录
if (THINK.TEMP_PATH === undefined) {
    THINK.TEMP_PATH = THINK.RUNTIME_PATH + '/Temp';
}

if (THINK.DATA_PATH === undefined) {
    THINK.DATA_PATH = THINK.RUNTIME_PATH + '/Data';
}

if (THINK.CACHE_PATH === undefined) {
    THINK.CACHE_PATH = THINK.RUNTIME_PATH + '/Cache';
}

//运行模式
THINK.APP_MODE = THINK.APP_MODE || '';

//node --debug index.js 来启动服务自动开启APP_DEBUG
if (THINK.APP_DEBUG || process.execArgv.indexOf('--debug') > -1) {
    THINK.APP_DEBUG = true;
    THINK.APP_MODE = 'debug';
    //waterline打印sql设置
    process.env.LOG_QUERIES = 'true';
}
//命令行模式
if (process.argv[2] && !(/^\d+$/.test(process.argv[2]))) {
    THINK.APP_MODE = 'cli';
}

//连接池
THINK.INSTANCES = {"DB": {}, 'MEMCACHE': {}, "REDIS": {}};

//Cache定时器
THINK.GC = {};
THINK.GCTIMER = instance => {
    if (THINK.APP_DEBUG || THINK.APP_MODE === 'cli' || THINK.GC[instance.options.gctype]) {
        return;
    }
    THINK.GC[instance.options.gctype] = setInterval(() => {
        var hour = new Date().getHours();
        if (C('cache_gc_hour').indexOf(hour) === -1) {
            return;
        }
        return instance.gc && instance.gc(Date.now());
    }, 3600 * 1000);
};

//初始化
var thinknode = new think();
//启动应用
thinknode.run();