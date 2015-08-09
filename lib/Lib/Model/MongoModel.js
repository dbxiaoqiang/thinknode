/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/7/13
 */
var util = require('util');
var querystring = require('querystring');
var Filter = thinkRequire('Filter');
var Valid = thinkRequire('Valid');
var mongoDb = thinkRequire('mongoDb');
//数据库实例化对象
var dbInstances = {};

var MongoModel = module.exports = Class(function () {
    'use strict';

    return {
        // 主键名称
        pk: '_id',
        // fields
        fields: {},
        // schema
        schema_options: {},

        /**
         * 初始化数据库连接
         * @return {[type]} [description]
         */
        initDb: function () {
            var self = this;
            if (this.db) {
                return this.db;
            }
            var config = this.config;
            var modelName = this.getTableName();
            var configKey = md5(JSON.stringify([config.db_type,config.db_host,config.db_port,config.db_name,modelName]));
            self.configKey = configKey;
            if (!dbInstances[configKey]) {
                dbInstances[configKey] = mongoDb.getInstance(config, modelName, this.fields, this.schema_options);
            }
            this.db = dbInstances[configKey];
            this.configKey = configKey;
            return this.db;
        },
        /**
         * 获取model
         * @return {[type]} [description]
         */
        model: function () {
            if(this.fields){
                this._fields = this.fields;
            }
            return this.initDb().initModel();
        },
        /**
         * 关闭数据库连接
         * @return {[type]} [description]
         */
        close: function () {
            delete dbInstances[this.configKey];
            if (this.db) {
                this.db.close();
                this.db = null;
            }
        },
        /**
         * 获取模型名
         * @access public
         * @return string
         */
        getModelName: function () {
            if (this.name) {
                return this.name;
            }
            var filename = this.__filename || __filename;
            var last = filename.lastIndexOf('/');
            this.name = filename.substr(last + 1, filename.length - last - 9);
            return this.name;
        },
        /**
         * 字符串命名风格转换
         * @param  {[type]} name [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        parseName: function (name) {
            name = name.trim();
            if (!name) {
                return name;
            }
            //首字母如果是大写，不转义为_x
            name = name[0].toLowerCase() + name.substr(1);
            return name.replace(/[A-Z]/g, function (a) {
                return '_' + a.toLowerCase();
            });
        },
        //解析page参数
        parsePage: function (options) {
            if ('page' in options) {
                var page = options.page + '';
                var num = 0;
                if (page.indexOf(',') > -1) {
                    page = page.split(',');
                    num = parseInt(page[1], 10);
                    page = page[0];
                }
                num = num || C('db_nums_per_page');
                page = parseInt(page, 10) || 1;
                return {
                    page: page,
                    num: num
                };
            }
            return {
                page: 1,
                num: C('db_nums_per_page')
            };
        },
        /**
         * 解析where
         * @param  {[type]} model [description]
         * @return {[type]}       [description]
         */
        parseWhere: function () {
            this._options.where = extend({}, this._options.where);
            return this._options.where;
        },
        /**
         * 获取表名
         * @return {[type]} [description]
         */
        getTableName: function () {
            if (!this.trueTableName) {
                var tableName = this.tablePrefix || '';
                tableName += this.tableName || this.parseName(this.getModelName());
                this.trueTableName = tableName.toLowerCase();
            }
            return this.trueTableName;
        },
        /**
         * 获取上一次操作的sql
         * @return {[type]} [description]
         */
        getLastSql: function () {
            return this.initDb().then(function (db) {
                return db.getLastSql();
            });
        },
        /**
         * 获取主键名称
         * @access public
         * @return string
         */
        getPk: function () {
            return this.fields._pk || this.pk;
        },
        /**
         * 缓存
         * @param  {[type]} key    [description]
         * @param  {[type]} expire [description]
         * @param  {[type]} type   [description]
         * @return {[type]}        [description]
         */
        cache: function (key, timeout) {
            if (key === undefined) {
                return this;
            }
            var options = this._getCacheOptions(key, timeout);
            this._options.cache = options;
            return this;
        },
        /**
         * 获取缓存的选项
         * @param  {[type]} key     [description]
         * @param  {[type]} timeout [description]
         * @return {[type]}         [description]
         */
        _getCacheOptions: function (key, timeout, type) {
            if (isObject(key)) {
                return key;
            }
            if (isNumber(key)) {
                timeout = key;
                key = '';
            }
            //如果key为true，那么使用sql的md5值
            if (key === true) {
                key = '';
            }
            var cacheType = type === undefined ? C('db_cache_type') : type;
            var options = {
                key: key,
                timeout: timeout || C('db_cache_timeout'),
                type: cacheType,
                gcType: 'dbCache'
            };
            if (cacheType === 'File') {
                options.cache_path = C('db_cache_path');
            }
            return options;
        },
        /**
         * 查询条件
         * @param  {[type]} where [description]
         * @return {[type]}       [description]
         */
        where: function (where) {
            if (!where) {
                return this;
            }
            this._options.where = extend(this._options.where || {}, where);
            return this;
        },
        /**
         * 字段
         * @param  {[type]} field   [description]
         * @param  {[type]} reverse [description]
         * @return {[type]}         [description]
         */
        field: function (field) {
            if (!field) {
                return this;
            }
            if (isArray(field)) {
                field = field.join(' ');
            }
            this._options.field = field;
            return this;
        },
        /**
         * 查询数据
         * @return {[type]} [description]
         */
        find: function () {
            var self = this;
            return this.model().then(function(model){
                self.db.setSql({table: self.trueTableName, data: '', where: self._options.where, field: self._options.field});
                var deferred = getDefer();
                model.findOne(self._options.where, self._options.field, function (err, data) {
                    if (err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve(data);
                    }
                });
                return deferred.promise;
            })
            //    .then(function (data) {
            //    return self._afterFind(data || {}, self.parseWhere());
            //});
        }
    }
});