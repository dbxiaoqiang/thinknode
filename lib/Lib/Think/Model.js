var Waterline = require('waterline');
THINK.dbClient = new Waterline();
var mongoAdapter = require('sails-mongo'),
    mysqlAdapter = require('sails-mysql');
//数据库实例化对象
THINK.dbInstances = {};
/**
 * Model类
 * @type {[type]}
 */
var Model = module.exports = Class(function () {
    'use strict';

    return {
        // 当前数据库操作对象
        db: null,
        // 主键名称
        pk: 'id',
        // 数据库配置信息
        config: null,
        // 模型
        model: {},
        // 模型名称
        modelName: '',
        // 数据表前缀
        tablePrefix: '',
        // 数据表名（不包含表前缀）
        tableName: '',
        // 实际数据表名（包含表前缀）
        trueTableName: '',
        //schema
        schema: {},
        // 数据源适配器
        adapter: 'default',
        // 数据源配置
        dbOptions: {},
        // 数据表字段信息
        fields: {},
        // 关联关系
        relation: {},
        // 关联表名
        relationTableName: '',
        // 参数
        _options: {},
        // 数据
        _data: {},
        /**
         * 初始化
         * @access public
         * @param string $name 模型名称
         * @param mixed config 数据库连接信息
         */
        init: function (name, config) {
            // 获取模型名称
            if (name) {
                this.modelName = name;
            }else{
                //空模型创建临时表
                this.modelName = '_empty';
            }
            if (isString(config)) {
                config = {db_prefix: config};
            }
            this.config = extend(false, {
                db_type: C('db_type'),
                db_host: C('db_host'),
                db_port: C('db_port'),
                db_name: C('db_name'),
                db_user: C('db_user'),
                db_pwd: C('db_pwd'),
                db_prefix: C('db_prefix'),
                db_charset: C('db_charset'),
                db_ext_config: C('db_ext_config')
            }, config);

            //数据表前缀
            if (this.tablePrefix) {
                this.config.db_prefix = this.tablePrefix;
            } else if (this.config.db_prefix) {
                this.tablePrefix = this.config.db_prefix;
            } else {
                this.tablePrefix = C('db_prefix');
            }
            //数据源
            this.dbOptions = {
                adapters: {
                    'mongo': mongoAdapter,
                    'mysql': mysqlAdapter
                },
                connections: {
                    default: {
                        adapter: this.config.db_type,
                        host: this.config.db_host,
                        port: this.config.db_port,
                        database: this.config.db_name,
                        user: this.config.db_user,
                        password: this.config.db_pwd
                    }
                }
            };
            //初始化attributes
            if (isEmpty(this.fields)) {
                this.fields[this.pk] = {
                    type: 'integer',
                    primaryKey: true,
                    autoIncrement: true,
                    required: true
                }
            }
        },

        /**
         * 初始化数据库
         * @return {[type]} [description]
         */
        initDb: function (table) {
            if (this.db) {
                return getPromise(this.db);
            }
            var self = this;
            table = table || this.getTableName();
            var promises;
            var configKey = md5(JSON.stringify([this.config,table]));
            if (!THINK.dbInstances[configKey]) {
                if (THINK.dbClient.collections && THINK.dbClient.collections.hasOwnProperty(table)) {
                    promises = getPromise(THINK.dbClient);
                } else {
                    if (isEmpty(self.schema[table])) {
                        self.schema[table] = self.setSchema(table, self.fields);
                    }
                    THINK.dbClient.loadCollection(self.schema[table]);
                    promises = new Promise(function (fulfill, reject) {
                        THINK.dbClient.initialize(self.dbOptions, function (err, ontology) {
                            if (err) reject(err);
                            else fulfill(ontology);
                        });
                    });
                }
                THINK.dbInstances[configKey] = promises.then(function (client) {
                    self.model = client.collections[table];
                    return self.model;
                });
            }
            this.db = THINK.dbInstances[configKey];
            return getPromise(this.db);
        },
        /**
         * 生成schema
         * @param table
         * @param fields
         * @returns {void|type[]}
         */
        setSchema: function (table, fields) {
            var _schema =  Waterline.Collection.extend({
                identity: table,
                tableName: table,
                connection: this.adapter,
                //migrate: 'safe',
                schema: true,
                autoCreatedAt: false,
                autoUpdatedAt: false,
                attributes: fields
            });
            return _schema;
        },
        /**
         * 获取表名
         * @return {[type]} [description]
         */
        getTableName: function () {
            if (!this.trueTableName) {
                var tableName = this.config.db_prefix || '';
                tableName += this.tableName || this.parseName(this.getModelName());
                this.trueTableName = tableName.toLowerCase();
            }
            return this.trueTableName;
        },
        /**
         * 获取模型名
         * @access public
         * @return string
         */
        getModelName: function () {
            if (this.modelName) {
                return this.modelName;
            }
            var filename = this.__filename || __filename;
            var last = filename.lastIndexOf('/');
            this.modelName = filename.substr(last + 1, filename.length - last - 9);
            return this.modelName;
        },
        /**
         * 获取主键名称
         * @access public
         * @return string
         */
        getPk: function () {
            if (!isEmpty(this.fields)) {
                for (var v in this.fields) {
                    if (this.fields[v].hasOwnProperty("primaryKey") && this.fields[v].primaryKey === true) {
                        this.pk = v;
                    }
                }
            }
            return this.pk;
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
        /**
         * 解析参数
         * @param  {[type]} options [description]
         * @return promise         [description]
         */
        parseOptions: function (oriOpts, extraOptions) {
            var self = this;
            var options;
            if (isScalar(oriOpts)) {
                options = extend({}, this._options);
            } else {
                options = extend({}, this._options, oriOpts, extraOptions);
            }
            //查询过后清空sql表达式组装 避免影响下次查询
            this._options = {};
            //获取表名
            options.tableName = options.tableName || this.getTableName();
            //表前缀，Db里会使用
            options.tablePrefix = this.tablePrefix;
            options.modelName = this.getModelName();

            return getPromise(options);
        },
        /**
         * 解构参数
         * @param options
         */
        parseDeOptions: function (options) {
            var parsedOptions = extend({}, options);
            parsedOptions.hasOwnProperty("tableName") ? delete parsedOptions.tableName : '';
            parsedOptions.hasOwnProperty("tablePrefix") ? delete parsedOptions.tablePrefix : '';
            parsedOptions.hasOwnProperty("modelName") ? delete parsedOptions.modelName : '';
            parsedOptions.hasOwnProperty("page") ? delete parsedOptions.page : '';
            return parsedOptions;
        },
        /**
         * 解析page参数
         * @param options
         * @returns {*}
         */
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
         * 指定查询数量
         * @param  {[type]} offset [description]
         * @param  {[type]} length [description]
         * @return {[type]}        [description]
         */
        limit: function (offset, length) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            if (offset === undefined) {
                return this;
            }
            if (length === undefined) {
                this._options.skip = 0;
                this._options.limit = offset;
            } else {
                this._options.skip = offset;
                this._options.limit = length;
            }
            return this;
        },
        /**
         * 排序
         * @param order
         * @returns {exports}
         */
        order: function (order) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            if (order === undefined) {
                return this;
            }
            if (isString(order) && order.indexOf(',')) {
                var strToObj = function (_str) {
                    return _str.replace(/^ +/, "").replace(/ +$/, "")
                        .replace(/( +, +)+|( +,)+|(, +)/, ",")
                        .replace(/ +/g, "-").replace(/,-/g, ",").replace(/-/g, ":")
                        .replace(/^/, "{\"").replace(/$/, "\"}")
                        .replace(/:/g, "\":\"").replace(/,/g, "\",\"");
                };
                this._options.sort = strToObj(order);
            } else {
                this._options.sort = order;
            }
            return this;
        },
        /**
         * 根据查询结果生成分页
         * @return {[type]} [description]
         */
        page: function (page, listRows) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            if (page === undefined) {
                return this;
            }
            this._options.page = listRows === undefined ? page : page + ',' + listRows;
            return this;
        },
        /**
         * 要查询的字段
         * @param  {[type]} field   [description]
         * @return {[type]}         [description]
         */
        field: function (field) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            if (isString(field)) {
                field = field.split(',');
            }
            this._options.select = field;
            return this;
        },
        /**
         * 设置表名
         * @param  {[type]} table [description]
         * @return {[type]}       [description]
         */
        table: function (table, hasPrefix) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            if (!table) {
                return this;
            }
            table = table.trim();
            if (table.indexOf(' ') > -1) {
                hasPrefix = true;
            }
            this._fields = {};
            this._options.tableName = hasPrefix ? table : this.tablePrefix + table;
            return this;
        },
        /**
         * where条件
         * @return {[type]} [description]
         */
        where: function (where) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            if (!where) {
                return this;
            }
            this._options.where = extend(this._options.where || {}, where);
            return this;
        },
        /**
         * 查询一条数据
         * @return 返回一个promise
         */
        find: function (options) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            var self = this;
            var parsedOptions = {};
            return this.parseOptions(options, {limit: 1}).then(function (options) {
                parsedOptions = options;
                return self.initDb(options.tableName);
            }).then(function (model) {
                if(!isEmpty(self.relation)){
                    return model.find(self.parseDeOptions(parsedOptions)).populate(self.relationTableName);
                }else{
                    return model.find(self.parseDeOptions(parsedOptions));
                }
            }).then(function (data) {
                return self._afterFind(data[0] || {}, parsedOptions);
            });
        },
        /**
         * find查询后置操作
         * @return {[type]} [description]
         */
        _afterFind: function (result, options) {
            return getPromise(result);
        },
        /**
         * 查询数据条数
         * @return 返回一个promise
         */
        count: function (options) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            var self = this;
            var parsedOptions = {};
            return this.parseOptions(options).then(function (options) {
                parsedOptions = options;
                return self.initDb(options.tableName);
            }).then(function (model) {
                return model.count(self.parseDeOptions(parsedOptions));
            });
        },
        /**
         * 查询数据
         * @return 返回一个promise
         */
        select: function (options) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            var self = this;
            var parsedOptions = {};
            return this.parseOptions(options).then(function (options) {
                parsedOptions = options;
                return self.initDb(options.tableName);
            }).then(function (model) {
                if(!isEmpty(self.relation)){
                    return model.find(self.parseDeOptions(parsedOptions)).populate(self.relationTableName);
                }else{
                    return model.find(self.parseDeOptions(parsedOptions));
                }
            }).then(function (data) {
                return self._afterSelect(data || {}, parsedOptions);
            });
        },
        /**
         * 查询后置操作
         * @param  {[type]} result  [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterSelect: function (result, options) {
            return getPromise(result);
        },
        /**
         * 返回数据里含有count信息的查询
         * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
         * @return promise
         */
        countSelect: function (options, pageFlag) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            var self = this;
            if (isBoolean(options)) {
                pageFlag = options;
                options = {};
            }
            //解析后的options
            var parsedOptions = {};
            var result = {};
            return this.parseOptions().then(function (options) {
                parsedOptions = options;
                return self.count(options);
            }).then(function (count) {
                var pageOptions = self.parsePage(parsedOptions);
                var totalPage = Math.ceil(count / pageOptions.num);
                if (isBoolean(pageFlag)) {
                    if (pageOptions.page > totalPage) {
                        pageOptions.page = pageFlag === true ? 1 : totalPage;
                    }
                    parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                }
                result = extend({count: count, total: totalPage}, pageOptions);
                if (!parsedOptions.page) {
                    parsedOptions.page = pageOptions.page;
                }
                return self.select(parsedOptions);
            }).then(function (data) {
                result.data = data;
                return result;
            });
        },
        /**
         * 数据插入之前操作，可以返回一个promise
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _beforeAdd: function (data, options) {
            return getPromise(data);
        },
        /**
         * 添加一条数据
         * @param {[type]} data    [description]
         * @param {[type]} options [description]
         * @param int 返回插入的id
         */
        add: function (data, options) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            //copy data
            data = extend({}, this._data, data);
            this._data = {};

            if (isEmpty(data)) {
                return E('_DATA_TYPE_INVALID_');
            }
            var self = this;
            //解析后的选项
            var parsedOptions = {};
            //解析后的数据
            var parsedData = {};
            return this.parseOptions(options).then(function (options) {
                parsedOptions = options;
                return self._beforeAdd(data, parsedOptions);
            }).then(function (data) {
                parsedData = data;
                return self.initDb(parsedOptions.tableName);
            }).then(function (model) {
                return model.create(parsedData);
            }).then(function (result) {
                var pk = self.getPk();
                parsedData[pk] = parsedData[pk] ? parsedData[pk] : result[pk];
                return self._afterAdd(parsedData, parsedOptions);
            }).then(function () {
                return parsedData[self.getPk()];
            }).catch(function (e) {
                return E(e);
            });
        },
        /**
         * 数据插入之后操作，可以返回一个promise
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterAdd: function (data, options) {
            return getPromise(data);
        },
        /**
         * 插入多条数据
         * @param {[type]} data    [description]
         * @param {[type]} options [description]
         * @param {[type]} replace [description]
         */
        addAll: function (data, options) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            if (!isArray(data) || !isObject(data[0])) {
                return E('_DATA_TYPE_INVALID_');
            }
            var self = this;
            var parsedOptions = {};
            var promises = data.map(function (item) {
                return self._beforeAdd(item);
            });
            return Promise.all(promises).then(function () {
                return self.parseOptions(options);
            }).then(function (options) {
                parsedOptions = options;
                return self.initDb(parsedOptions.tableName);
            }).then(function (model) {
                return model.createEach(data);
            }).then(function (result) {
                if (!isEmpty(result) && isArray(result)) {
                    var pk = self.getPk();
                    var parsedData = [];
                    result.forEach(function (v) {
                        parsedData.push(self._afterAdd(v[pk], parsedOptions).then(function () {
                            return v[pk];
                        }));
                    });
                    return Promise.all(parsedData);
                } else {
                    return [];
                }
            });
        },
        /**
         * 数据删除之前操作，可以返回一个promise
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _beforeDelete: function (options) {
            return getPromise(options);
        },
        /**
         * 删除数据
         * @return {[type]} [description]
         */
        delete: function (options) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            var self = this;
            var parsedOptions = {};
            var parsedData = [], affectedRows = [];
            return this.parseOptions(options).then(function (options) {
                parsedOptions = options;
                return self._beforeDelete(parsedOptions);
            }).then(function () {
                return self.initDb(parsedOptions.tableName);
            }).then(function (model) {
                return model.destroy(self.parseDeOptions(parsedOptions));
            }).then(function (result) {
                parsedData = result;
                return self._afterDelete(parsedOptions.where || {});
            }).then(function () {
                if (!isEmpty(parsedData) && isArray(parsedData)) {
                    var pk = self.getPk();
                    parsedData.forEach(function (v) {
                        affectedRows.push(v[pk]);
                    });
                    return affectedRows;
                } else {
                    return [];
                }
            })
        },
        /**
         * 删除后续操作
         * @return {[type]} [description]
         */
        _afterDelete: function (options) {
            return getPromise(options);
        },
        /**
         * 更新前置操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _beforeUpdate: function (data, options) {
            return getPromise(data);
        },
        /**
         * 更新数据
         * @return {[type]} [description]
         */
        update: function (data, options) {
            if(this.modelName == '_empty'){
                return E("This method is not support empty model");
            }
            data = extend({}, this._data, data);
            this._data = {};
            if (isEmpty(data)) {
                return E('_DATA_TYPE_INVALID_');
            }
            var self = this;
            var parsedOptions = {};
            var parsedData = [], result = [], affectedRows = [];
            var pk = null;
            return this.parseOptions(options).then(function (options) {
                parsedOptions = options;
                return self._beforeUpdate(data, options);
            }).then(function (data) {
                parsedData = data;
                return self.initDb(parsedOptions.tableName);
            }).then(function (model) {
                pk = self.getPk();
                if (isEmpty(parsedOptions.where)) {
                    // 如果存在主键数据 则自动作为更新条件
                    if (!isEmpty(parsedData[pk])) {
                        parsedOptions.where = getObject(pk, data[pk]);
                        delete parsedData[pk];
                    } else {
                        return E('_OPERATION_WRONG_');
                    }
                } else {
                    if (!isEmpty(parsedData[pk])) {
                        delete parsedData[pk];
                    }
                }
                return model.update(parsedOptions, parsedData);
            }).then(function (rows) {
                result = rows;
                return self._afterUpdate(parsedData, parsedOptions);
            }).then(function () {
                if (!isEmpty(result) && isArray(result)) {
                    result.forEach(function (v) {
                        affectedRows.push(v[pk]);
                    });
                    return affectedRows;
                } else {
                    return [];
                }
            });
        },
        /**
         * 更新后置操作
         * @param  {[type]} data    [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        _afterUpdate: function (data, options) {
            return getPromise(data);
        },
        /**
         * 更新某个字段的值
         * @param  {[type]} field [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        updateField: function (field, value) {
            var data = {};
            if (isObject(field)) {
                data = field;
            } else {
                data[field] = value;
            }
            return this.update(data);
        },
        /**
         * Mysql、PostgreSql原生语句查询
         * @param sqlStr
         */
        query: function (sqlStr, model) {
            var self = this;
            var supportDb = ['mysql', 'postgresql'];
            if (supportDb.toString().indexOf(this.config.db_type) > -1) {
                var promises;
                return this.parseOptions().then(function (options) {
                    if (model) {
                        promises = getPromise(model);
                    } else {
                        promises = self.initDb(options.tableName);
                    }
                    return promises.then(function (model) {
                        return new Promise(function (fulfill, reject) {
                            model.query(sqlStr, function (err, results) {
                                if (err) reject(err);
                                else fulfill(results);
                            });
                        });
                    });
                });
            } else {
                return E('Adapter does not support this method');
            }
        },

    };
});