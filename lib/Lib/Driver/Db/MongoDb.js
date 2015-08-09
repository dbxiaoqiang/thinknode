/**
 * mongodb数据库
 * @return {[type]} [description]
 */
var mongoSocket = thinkRequire('MongoSocket');
var MongoDb = module.exports = Class(function () {
    'use strict';
    //获取数据配置的基本信息
    var getDbItem = function (value, index) {
        value = value || "";
        if (isString(value)) {
            value = value.split(',');
        }
        return index !== undefined ? (value[index] || value[0]) : value;
    };

    return {
        // 数据库类型
        dbType: null,
        // 当前SQL指令
        sql: '',
        // 操作的sql列表
        modelSql: {},
        // 数据库连接参数配置
        config: '',
        // 事务次数
        transTimes: 0,
        //最后插入的id
        lastInsertId: 0,
        //where条件里的表达式
        comparison: {
            'EQ': '=',
            'NEQ': '!=',
            '<>': '!=',
            'GT': '>',
            'EGT': '>=',
            'LT': '<',
            'ELT': '<=',
            'NOTLIKE': 'NOT LIKE',
            'LIKE': 'LIKE',
            'IN': 'IN',
            'NOTIN': 'NOT IN'
        },
        /**
         * mongoSocket连接句柄
         * @type {[type]}
         */
        linkId: null,

        /**
         * 初始化
         * @param  {[type]} config         [description]
         * @param  {[type]} modelName      [description]
         * @param  {[type]} fields         [description]
         * @param  {[type]} schema_options [description]
         * @return {[type]}                [description]
         */
        init: function (config, modelName, fields, schema_options) {
            this.config = config;
            this.modelName = modelName;
            this.fields = fields;
            this.schema_options = schema_options;
        },
        /**
         * 初始化数据库连接
         * @param  {[type]} master [description]
         * @return {[type]}        [description]
         */
        initConnect: function () {
            var hosts = getDbItem(this.config.host);
            //单实例
            if (hosts.length === 1) {
                return this.getConnection(this.config);
            }
            return this.multiConnect(hosts);
        },
        /**
         * 分片集连接 Replication Sets
         * 'rs-1.com,rs-2.com,rs-3.com/mydb?slaveOk=true'
         * @return {[type]} [description]
         */
        multiConnect: function (hosts) {
            var self = this;
            this.config.db_dsn = 'mongodb://';
            var dbStr = '';
            hosts.forEach(function (v) {
                if(self.config.db_user){
                    dbStr += self.config.db_user + ':' + self.config.db_pwd + '@';
                }
                dbStr += v + ',';
            });
            this.config.db_dsn = dbStr.substr(0, dbStr.length - 1) + '/' + this.config.db_name;
            return this.getConnection(this.config);
        },
        /**
         * 获取数据连接句柄
         * @param  {[type]}   index    [description]
         * @param  {Function} callback [description]
         * @param  {[type]}   data     [description]
         * @return {[type]}            [description]
         */
        getConnection: function (config) {
            this.linkId = mongoSocket(config);
            return this.linkId.connect();
        },

        /**
         * 获取模型实例
         * @param  {[type]} modelName      [description]
         * @param  {[type]} fields         [description]
         * @param  {[type]} schema_options [description]
         * @return {[type]}                [description]
         */
        initModel: function(){
            var self = this;
            return this.initConnect().then(function(handle){
                var model;
                var schema = self.linkId.mongoose.Schema(self.fields, self.schema_options);
                try {
                    if (handle.model(self.modelName)) {
                        model = handle.model(self.modelName, schema, self.modelName);
                    }
                } catch(e) {
                    if (e.name === 'MissingSchemaError') {
                        model = handle.model(self.modelName, schema, self.modelName);
                    }
                }
                return model;
            });
        },

        /**
         * 获取上次的sql语句
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        getLastSql: function (model) {
            return model ? this.modelSql[model] : this.sql;
        },
        /**
         * 设置当前操作的sql
         * @param {[type]} sql [description]
         */
        setSql: function (sql) {
            if (C('db_log_sql')) {
                console.log('sql: ' + JSON.stringify(sql));
            }
            this.sql = sql;
            this.modelSql[this.modelName] = sql;
        },

        /**
         * 关闭连接
         * @return {[type]} [description]
         */
        close: function () {
            if (this.linkId) {
                this.linkId.close();
                this.linkId = null;
            }
        }
    }
});

/**
 * 解析配置
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
MongoDb.parseConfig = function (config) {
    'use strict';
    config = config || {};
    var conf = {
        type: config.db_type || C('db_type'),
        user: config.db_user || C('db_user'),
        password: config.db_pwd || C('db_pwd'),
        host: config.db_host || C('db_host'),
        port: config.db_port || C('db_port'),
        database: config.db_name || C('db_name'),
        charset: config.db_charset || C('db_charset')
    };
    conf = extend({}, C('db_ext_config'), config, conf);
    return conf;
};
/**
 * 根据配置获取对应的数据库实例
 * @param  {[type]} config [description]
 * @return {[type]}        [description]
 */
MongoDb.getInstance = function (config, modelName, fields, schema_options) {
    'use strict';
    var conf = this.parseConfig(config);
    var instance = MongoDb(conf, modelName, fields, schema_options);
    instance.dbType = conf.type.toUpperCase();
    return instance;
};