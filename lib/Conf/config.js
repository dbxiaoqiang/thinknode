'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2014- <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/1/15
 */
exports.default = {
    /*系统参数*/
    app_port: 3000, //监听端口
    app_host: '', //监听的host

    encoding: 'utf-8', //输出数据的编码
    language: 'zh-cn', //默认语言设置 zh-cn en

    use_cluster: true, //是否使用cluster，默认不使用,开启为cpu的数量，可以自定义值
    use_proxy: false, //是否使用代理访问,如：nginx。开启后不能通过ip+端口直接访问

    http_timeout: 30, //http模式超时时间,30 seconds

    /*URI路由*/
    url_route_on: false, //是否开启自定义路由功能
    url_pathname_prefix: '', //不解析的pathname前缀
    url_pathname_suffix: '.shtml', //不解析的pathname后缀，这样利于seo
    url_resource_on: true, //是否监听静态资源类请求
    url_resource_reg: /^(Static\/|favicon\.ico|robot\.txt)/, //判断是否是静态资源的正则
    url_callback_name: 'jsonpcallback', //jsonp格式的callback名字

    /*日志配置*/
    log_process_pid: true, //记录进程的id,方便其他脚本处理。
    log_loged: true, //是否记录日志
    log_type: 'File', //日志存储类型, File
    log_itemtype: console, //日志类型,console console输出的日志 | memory 内存使用和负载日志 | custom 自定义日志
    log_console_type: ['warn', 'error'], //默认只接管console.error日志, console类型日志有效
    log_interval: 60 * 1000, //一分钟记录一次, memory类型日志有效

    /*错误信息*/
    error_code: 503, //报错时的状态码
    error_no_key: 'errno', //错误号的key
    error_msg_key: 'errmsg', //错误消息的key

    /*cookie配置*/
    cookie_domain: '', //cookie有效域名
    cookie_path: '/', //cookie路径
    cookie_timeout: 0, //cookie失效时间，0为浏览器关闭，单位：秒

    /*session配置*/
    session_name: 'thinknode', //session对应的cookie名称
    session_type: 'File', //session存储类型 File,Redis,Memcache
    session_path: '', //File类型下文件存储位置，默认为Temp目录
    session_options: {}, //session对应的cookie选项
    session_sign: '', //session对应的cookie使用签名
    session_timeout: 24 * 3600, //服务器上session失效时间，单位：秒

    /*缓存配置*/
    cache_type: 'File', //数据缓存类型 File,Redis,Memcache
    cache_key_prefix: 'ThinkNode:', //缓存key前置
    cache_timeout: 6 * 3600, //数据缓存有效期，单位: 秒
    cache_file_suffix: '.json', //File缓存方式下文件后缀名
    cache_gc_hour: [4], //缓存清除的时间点，数据为小时

    /*token配置*/
    token_on: false, //是否开启表单令牌功能,需要自行在控制器内调用
    token_name: '__token__', //token name
    token_key: '{__TOKEN__}', //记录token在模版中的位置替换用。默认自动查找<form和</head>标签替换

    /*模板配置*/
    tpl_content_type: 'text/html', //模版输出类型
    tpl_file_suffix: '.html', //模版文件名后缀
    tpl_file_depr: '_', //controller和action之间的分隔符
    tpl_default_theme: 'default', //默认模板主题
    tpl_engine_type: 'ejs', //模版引擎名称
    tpl_engine_config: { cache: true },
    show_exec_time: false, //发送应用执行时间到header
    json_content_type: 'application/json', //发送json时的content-type
    auto_send_content_type: true, //是否自动发送Content-Type,默认值为`tpl_content_type`配置值

    /*模板缓存*/
    html_cache_on: false, //HTML静态缓存,需要纯静态化可以开启,交互网站建议关闭
    html_cache_timeout: 3600, //缓存时间，单位为秒
    html_cache_path: THINK.TEMP_PATH,
    html_cache_file_suffix: '.html', //缓存文件后缀名

    /*分组及控制器*/
    app_group_list: ['Home', 'Admin', 'Restful'], //分组列表
    deny_group_list: ['Common'], //禁止访问分组
    restful_group: 'Restful', //RESTFUL API默认分组
    default_group: 'Home', //默认分组
    default_controller: 'Index', //默认模块
    default_action: 'index', //默认Action
    empty_method: '__empty', //当找不到方法时调用此方法，这个方法存在时才有效
    common_before_action: '__before', //公共action前置方法
    before_action: '_before_', //action前置方法前缀
    action_suffix: 'Action', //action后缀

    /*文件上传*/
    post_json_content_type: ['application/json'], //post数据为json时的content-type
    post_max_file_size: 300 * 1024 * 1024, //上传文件大小限制，默认300M
    post_max_fields: 100, //最大表单数，默认为100
    post_max_fields_size: 2 * 1024 * 1024, //单个表单长度最大值，默认为2MB
    post_ajax_filename_header: 'x-filename', //通过ajax上传文件时文件名对应的header，如果有这个header表示是文件上传
    post_file_temp_path: THINK.RUNTIME_PATH + '/Temp', //文件上传的临时目录
    post_file_autoremove: true, //请求完成时，自动删除未处理的上传缓存文件
    post_file_allow_type: 'jpg|jpeg|png|bmp|gif|xls|doc|docx|zip|rar|ipa|apk', //允许上传的文件类型
    post_file_save_path: THINK.RESOURCE_PATH + '/Static/uploads/', //上传文件保存目录
    post_file_save_url: '/Static/uploads/', //上传文件目录访问URL

    /*数据库设置*/
    db_type: 'mysql', // 数据库类型,支持mysql,mongo,postgressql
    db_host: '127.0.0.1', // 服务器地址
    db_port: '', // 端口
    db_name: '', // 数据库名
    db_user: '', // 用户名
    db_pwd: '', // 密码
    db_prefix: 'think_', // 数据库表前缀
    db_charset: 'utf8', // 数据库编码默认采用utf8
    db_nums_per_page: 20, //查询分页每页显示的条数
    db_ext_config: { safe: true }, //数据库连接时候额外的参数,safe安全模式下ORM不会实时映射修改数据库表,默认为true
    auto_close_db: false, //自动关闭数据库连接

    /*redis配置*/
    redis_host: '127.0.0.1', //redis host
    redis_port: 6379, // redis port
    redis_password: '', // redis password

    /*memcache配置*/
    memcache_host: '127.0.0.1', //memcache host
    memcache_port: 11211, //memecache端口

    /*websocket设置*/
    use_websocket: false, //是否使用websocket
    websocket_path: '', //为空默认为 /socket.io
    websocket_timeout: 0, //超时时间，默认不超时，单位为秒
    websocket_sub_protocal: '', //websocket子协议，可以是个字符串也可以是回调函数
    websocket_allow_origin: '', //允许从那里发送过来的websocket，可以是字符串、数组、回调函数，为空表示不检测
    websocket_messages: {
        // open: 'home/websocket/open',
    } };