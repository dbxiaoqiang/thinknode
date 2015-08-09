var util = require('util');
var querystring = require('querystring');
var Filter = thinkRequire('Filter');
var Valid = thinkRequire('Valid');

/**
 * Model类
 * @type {[type]}
 */
var baseModel = Class(function () {
    'use strict';

    return {
        // 当前数据库操作对象
        db: null,
        // 主键名称
        pk: 'id',
        // 数据库配置信息
        config: null,
        // 配置信息key
        configKey: '',
        // 模型名称
        name: '',
        // 数据表前缀
        tablePrefix: '',
        // 数据表名（不包含表前缀）
        tableName: '',
        // 实际数据表名（包含表前缀）
        trueTableName: '',
        // 数据表字段信息
        _fields: {},
        // 数据信息
        _data: {},
        // 参数
        _options: {},
        // 自定义字段信息，数据校验使用
        fields: {},
        /**
         * 初始化
         * @access public
         * @param string $name 模型名称
         * @param mixed config 数据库连接信息
         */
        init: function (name, config) {
            // 获取模型名称
            if (name) {
                this.name = name;
            }
            if (isString(config)) {
                config = {db_prefix: config};
            }
            this.config = extend(false,{
                db_type: C('db_type'),
                db_host: C('db_host'),
                db_port: C('db_port'),
                db_name: C('db_name'),
                db_user: C('db_user'),
                db_pwd: C('db_pwd'),
                db_prefix: C('db_prefix'),
                db_charset: C('db_charset'),
                db_ext_config: C('db_ext_config')
            },config);

            //如果Model设置了实际数据库名，则需要将数据库名进行设置
            if (this.dbName) {
                this.config.db_name = this.dbName;
            }

            //数据表前缀
            if(this.tablePrefix){
                this.config.db_prefix = this.tablePrefix;
            }else if (this.config.db_prefix) {
                this.tablePrefix = this.config.db_prefix;
            }else{
                this.tablePrefix = C('db_prefix');
            }
        }

    };
});

var Model = module.exports = Class(baseModel, function () {
    'use strict';
    return {
        init: function (name, config) {
            this.super("init",[name, config]);
            var _model = thinkRequire(ucfirst(this.config.db_type) + 'Model');
            return extend(this, _model());
        }
    }
});