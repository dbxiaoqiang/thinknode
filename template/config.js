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
    db_type: 'mysql', // 数据库类型
    db_host: '127.0.0.1', // 服务器地址
    db_port: '3306', // 端口
    db_name: '', // 数据库名
    db_user: '', // 用户名
    db_pwd: '', // 密码
    db_prefix: '', // 数据库表前缀

    /**Redis配置**/
    redis_host: '127.0.0.1', //redis host
    redis_port: 6379, // redis port
    redis_password: '', // redis password

    /**Cache配置**/
    cache_type: 'File', //数据缓存类型 File,Redis,Memcache
    cache_key_prefix: 'thinknode:', //缓存key前置(memcache和redis下有效)

    /*session设置*/
    session_type: 'File', //session存储类型 File,Redis,Memcache
    session_name: 'thinknode', //session对应的cookie名称

    /*token配置*/
    token_on: false, //是否开启表单令牌功能,需要自行在控制器内调用

    /*路由配置*/
    url_route_on: false, //是否开启自定义路由功能
    url_resource_on: true,  //是否监听静态资源类请求
    url_resource_reg: /^(Static\/|favicon\.ico|robot\.txt)/, //判断是否是静态资源的正则
    url_callback_name: 'jsonpcallback', //jsonp格式的callback名字

    /*项目其他设置*/


};