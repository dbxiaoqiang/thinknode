/**
 * config
 */
export default {
    /**App属性**/
    app_version: '1.0',
    app_version_code: '1',
    app_title: 'thinknode',
    app_keywords: 'thinknode',
    app_description: 'thinknode,node.js mvc framework',
    app_port: 3000,
    app_group_list: ['Admin', 'Home'], //分组列表
    default_group: 'Home',//默认分组
    /**数据库配置**/
    db_type: 'mongo', // 数据库类型
    db_host: '192.168.99.100', // 服务器地址
    db_port: '27017', // 端口
    db_name: 'test', // 数据库名
    db_user: '', // 用户名
    db_pwd: '', // 密码
    db_prefix: 'think_', // 数据库表前缀

    url_route_on: true, //是否开启自定义路由功能
};