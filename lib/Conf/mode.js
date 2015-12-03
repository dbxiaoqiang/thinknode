/**
 * 不同模式下的配置文件
 * 由于每个模式下的配置可能都比较少，所以放在一个文件里
 * @type {Object}
 */
'use strict';

exports.__esModule = true;
exports['default'] = {
    cli: {
        use_cluster: false, //关闭cluster功能
        html_cache_on: false,
        log_process_pid: false,
        clear_require_cache: false,
        auto_close_db: true, //自动关闭数据库连接
        log_console: false
    },
    debug: {
        debug_retain_files: ['/node_modules/'], //这些文件在debug模式下不清除缓存
        use_cluster: false, //不使用cluster
        html_cache_on: false, //关闭html静态化缓存
        clear_require_cache: true, //清除require的缓存文件
        auto_close_db: false //自动关闭数据库连接
    }
};
module.exports = exports['default'];