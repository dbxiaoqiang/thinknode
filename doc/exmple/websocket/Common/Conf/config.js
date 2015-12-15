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

    /*websocket设置*/
    use_websocket: false, //是否使用websocket
    websocket_path: '',//为空默认为 /socket.io
    websocket_timeout: 0, //超时时间，默认不超时，单位为秒
    websocket_sub_protocal: '', //websocket子协议，可以是个字符串也可以是回调函数
    websocket_allow_origin: '', //允许从那里发送过来的websocket，可以是字符串、数组、回调函数，为空表示不检测
    websocket_messages: {
        open: '/websocket/index/open',
        close: '/websocket/index/close',
        chat: '/websocket/index/chat',
        typing: '/websocket/index/typing',
        stoptyping: '/websocket/index/stoptyping',
        adduser: '/websocket/index/adduser'
    }
};