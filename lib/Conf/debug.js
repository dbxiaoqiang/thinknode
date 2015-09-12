/**
 * debug模式下的配置
 * @type {Object}
 */
module.exports = {
    debug_retain_files: ['/node_modules/'], //这些文件在debug模式下不清除缓存
    use_cluster: false, //不使用cluster
    html_cache_on: false, //关闭html静态化缓存
    clear_require_cache: true //清除require的缓存文件
};