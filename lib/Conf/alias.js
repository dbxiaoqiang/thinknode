/**
 * 模块别名，模块名到具体的路径，模块名不能有重复
 * 使用thinkRequire加载模块时有效
 * @type {Object}
 */
module.exports = {
    Log: THINK.THINK_PATH + '/Lib/Util/Log.js',
    Session: THINK.THINK_PATH + '/Lib/Util/Session.js',
    Cookie: THINK.THINK_PATH + '/Lib/Util/Cookie.js',
    Filter: THINK.THINK_PATH + '/Lib/Util/Filter.js',
    Valid: THINK.THINK_PATH + '/Lib/Util/Valid.js'
};