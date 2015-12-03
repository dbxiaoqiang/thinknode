/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
import Waterline from 'waterline';
import mongoAdapter from 'sails-mongo';
import mysqlAdapter from 'sails-mysql';
import base from './Base.js';
import Valid from '../Util/Valid.js';

export default class extends base {

    init(name, config = {}) {
        // 当前数据库操作对象
        this.db = null;
        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
        // 配置hash
        this.configKey = '';
        // 模型
        this.model = {};
        // 模型名称
        this.modelName = '';
        // 数据表前缀
        this.tablePrefix = '';
        // 数据表名（不包含表前缀）
        this.tableName = '';
        // 实际数据表名（包含表前缀）
        this.trueTableName = '';
        //schema
        this.schema = {};
        // 数据源适配器
        this.adapter = 'default';
        // 数据源配置
        this.dbOptions = {};
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
        // 关联链接
        this._relationLink = [];
        // 参数
        this._options = {};
        // 数据
        this._data = {};

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_empty';
            this.trueTableName = '_empty';
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

        //初始化attributes
        if (isEmpty(this.fields) && this.modelName != '_empty') {
            return E("Model's attributes is undefined");
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //配置hash
        this.configKey = md5(JSON.stringify([this.config, this.trueTableName]));

        //数据源
        this.dbOptions = {
            adapters: {
                'mongo': mongoAdapter,
                'mysql': mysqlAdapter
            },
            connections: {}
        };
        this.dbOptions.connections[this.configKey] = {
            adapter: this.config.db_type,
            host: this.config.db_host,
            port: this.config.db_port,
            database: this.config.db_name,
            user: this.config.db_user,
            password: this.config.db_pwd
        };
    }

    /**
     * 初始化数据模型
     * @returns {type[]}
     */
    initDb() {
        this.adapter = this.configKey;
        if (!isEmpty(this.relation)) {
            this._relationLink = this.setRelation(this.trueTableName, this.relation);
        }
        if (!THINK.INSTANCES.DB[this.configKey]) {
            let promise, dbClient = new Waterline();
            if (dbClient.collections && dbClient.collections.hasOwnProperty(this.trueTableName)) {
                promise = getPromise(dbClient);
            } else {
                if (!isEmpty(this._relationLink)) {
                    this._relationLink.forEach(function (rel) {
                        dbClient.loadCollection(this.schema[rel.table]);
                    });
                    dbClient.loadCollection(this.schema[this.trueTableName]);
                } else {
                    if (isEmpty(this.schema[this.trueTableName])) {
                        this.schema[this.trueTableName] = this.setSchema(this.trueTableName, this.fields);
                    }
                    dbClient.loadCollection(this.schema[this.trueTableName]);
                }
                promise = new Promise((fulfill, reject) => {
                    dbClient.initialize(this.dbOptions, function (err, ontology) {
                        if (err) reject(err);
                        else fulfill(ontology);
                    });
                });
            }
            THINK.INSTANCES.DB[this.configKey] = promise.then(client => {
                this.model = client.collections[this.trueTableName];
                return this.model;
            });
        }
        return getPromise(THINK.INSTANCES.DB[this.configKey]);
    }

    /**
     * 生成schema
     * @param table
     * @param fields
     * @returns {type[]|void}
     */
    setSchema(table, fields) {
        let schema = {
            identity: table,
            tableName: table,
            connection: this.adapter,
            //migrate: 'safe',
            schema: true,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            attributes: fields
        };
        //安全模式下ORM不会实时映射修改数据库表
        if (this.config.db_ext_config.safe || !THINK.APP_DEBUG) {
            schema.migrate = 'safe'
        }
        return Waterline.Collection.extend(schema);
    }

    /**
     * 关闭数据链接
     * @returns {Promise}
     */
    close() {
        let adapters = this.dbOptions.adapters || {};
        let promises = [];
        THINK.INSTANCES.DB = {};
        Object.keys(adapters).forEach(function (adapter) {
            if (adapters[adapter].teardown) {
                let promise = new Promise(function (resolve) {
                    adapters[adapter].teardown(null, resolve);
                });
                promises.push(promise);
            }
        });
        return Promise.all(promises);
    }

    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        if (!this.trueTableName) {
            let tableName = this.config.db_prefix || '';
            tableName += this.tableName || this.parseName(this.getModelName());
            this.trueTableName = tableName.toLowerCase();
        }
        return this.trueTableName;
    }

    /**
     * 获取模型名
     * @access public
     * @return string
     */
    getModelName() {
        if (this.modelName) {
            return this.modelName;
        }
        let filename = this.__filename || __filename;
        let last = filename.lastIndexOf('/');
        this.modelName = filename.substr(last + 1, filename.length - last - 9);
        return this.modelName;
    }

    /**
     * 获取主键名称
     * @access public
     * @return string
     */
    getPk() {
        if (!isEmpty(this.fields)) {
            for (let v in this.fields) {
                if (this.fields[v].hasOwnProperty("primaryKey") && this.fields[v].primaryKey === true) {
                    this.pk = v;
                }
            }
        }
        return this.pk;
    }

    /**
     * 字符串命名风格转换
     * @param  {[type]} name [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    parseName(name) {
        name = name.trim();
        if (!name) {
            return name;
        }
        //首字母如果是大写，不转义为_x
        name = name[0].toLowerCase() + name.substr(1);
        return name.replace(/[A-Z]/g, function (a) {
            return '_' + a.toLowerCase();
        });
    }

    /**
     * 解析参数
     * @param  {[type]} options [description]
     * @return promise         [description]
     */
    parseOptions(oriOpts, extraOptions) {
        let self = this;
        let options;
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
    }

    /**
     * 检测数据是否合法
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    parseData(data) {
        //因为会对data进行修改，所以这里需要深度拷贝
        data = extend({}, data);
        if (isEmpty(this.validations) || isEmpty(data)) {
            return data;
        }
        let field, value, checkData = [];
        for (field in data) {
            if (field in this.validations) {
                value = extend({}, this.validations[field], {name: field, value: data[field]});
                checkData.push(value);
            }
        }
        if (isEmpty(checkData)) {
            return data;
        }
        let result = Valid(checkData);
        if (isEmpty(result)) {
            return data;
        }
        return E(result);
    }

    /**
     * 解构参数
     * @param options
     */
    parseDeOptions(options) {
        let parsedOptions = extend({}, options);
        parsedOptions.hasOwnProperty("tableName") ? delete parsedOptions.tableName : '';
        parsedOptions.hasOwnProperty("tablePrefix") ? delete parsedOptions.tablePrefix : '';
        parsedOptions.hasOwnProperty("modelName") ? delete parsedOptions.modelName : '';
        parsedOptions.hasOwnProperty("page") ? delete parsedOptions.page : '';
        return parsedOptions;
    }

    /**
     * 解析page参数
     * @param options
     * @returns {*}
     */
    parsePage(options) {
        if ('page' in options) {
            let page = options.page + '';
            let num = 0;
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
    }

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */
    limit(offset, length) {
        if (this.modelName == '_empty') {
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
    }

    /**
     * 排序
     * @param order
     * @returns {exports}
     */
    order(order) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        if (order === undefined) {
            return this;
        }
        if (isObject(order)) {
            order = extend({}, order);
            let _order = {};
            for (let v in order) {
                if (isNumber(order[v])) {
                    _order[v] = order[v];
                } else {
                    if (order[v].toLowerCase() === 'desc') {
                        _order[v] = 0;
                    } else if (order[v].toLowerCase() === 'asc') {
                        _order[v] = 1;
                    }
                }
            }
            if (!isEmpty(_order)) {
                this._options.sort = _order;
            }
        } else if (isString(order)) {
            if (order.indexOf(',')) {
                let strToObj = function (_str) {
                    return _str.replace(/^ +/, "").replace(/ +$/, "")
                        .replace(/( +, +)+|( +,)+|(, +)/, ",")
                        .replace(/ +/g, "-").replace(/,-/g, ",").replace(/-/g, ":")
                        .replace(/^/, "{\"").replace(/$/, "\"}")
                        .replace(/:/g, "\":\"").replace(/,/g, "\",\"")
                        .replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
                };
                this._options.sort = JSON.parse(strToObj(order));
            } else {
                this._options.sort = order;
            }
        }
        return this;
    }

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */
    page(page, listRows) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        if (page === undefined) {
            return this;
        }
        this._options.page = listRows === undefined ? page : page + ',' + listRows;
        return this;
    }

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */
    field(field) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        if (isEmpty(field)) {
            return this;
        }
        if (isString(field)) {
            field = field.split(',');
        }
        this._options.select = field;
        return this;
    }

    /**
     * where条件
     * @return {[type]} [description]
     */
    where(where) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        if (!where) {
            return this;
        }
        this._options.where = extend(this._options.where || {}, where);
        return this;
    }

    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeAdd(data, options) {
        return getPromise(data);
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        //copy data
        data = extend({}, this._data, data);
        this._data = {};

        if (isEmpty(data)) {
            return E('_DATA_TYPE_INVALID_');
        }
        let self = this;
        //解析后的选项
        let parsedOptions = {};
        //解析后的数据
        let parsedData = {};
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            return self._beforeAdd(data, parsedOptions);
        }).then(function (data) {
            return self.parseData(data);
        }).then(function (data) {
            parsedData = data;
            return self.initDb();
        }).then(function (model) {
            return model.create(parsedData);
        }).then(function (result) {
            let pk = self.getPk();
            parsedData[pk] = parsedData[pk] ? parsedData[pk] : result[pk];
            return self._afterAdd(parsedData, parsedOptions);
        }).then(function () {
            return parsedData[self.getPk()];
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterAdd(data, options) {
        return getPromise(data);
    }

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */
    addAll(data, options) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        if (!isArray(data) || !isObject(data[0])) {
            return E('_DATA_TYPE_INVALID_');
        }
        let self = this;
        let parsedOptions = {}, parsedData = [];
        let promises;
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            promises = data.map(function (item) {
                return self._beforeAdd(item, parsedOptions);
            });
            return Promise.all(promises);
        }).then(function (data) {
            promises = data.map(function (item) {
                return self.parseData(item);
            });
            return Promise.all(promises);
        }).then(function (data) {
            parsedData = data;
            return self.initDb();
        }).then(function (model) {
            return model.createEach(parsedData);
        }).then(function (result) {
            if (!isEmpty(result) && isArray(result)) {
                let pk = self.getPk();
                let resData = [];
                result.forEach(function (v) {
                    resData.push(self._afterAdd(v[pk], parsedOptions).then(function () {
                        return v[pk];
                    }));
                });
                return Promise.all(resData);
            } else {
                return [];
            }
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeDelete(options) {
        return getPromise(options);
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        let self = this;
        let parsedOptions = {};
        let parsedData = [], affectedRows = [];
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            return self._beforeDelete(parsedOptions);
        }).then(function () {
            return self.initDb();
        }).then(function (model) {
            return model.destroy(self.parseDeOptions(parsedOptions));
        }).then(function (result) {
            parsedData = result;
            return self._afterDelete(parsedOptions.where || {});
        }).then(function () {
            if (!isEmpty(parsedData) && isArray(parsedData)) {
                let pk = self.getPk();
                parsedData.forEach(function (v) {
                    affectedRows.push(v[pk]);
                });
                return affectedRows;
            } else {
                return [];
            }
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */
    _afterDelete(options) {
        return getPromise(options);
    }

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeUpdate(data, options) {
        return getPromise(data);
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        data = extend({}, this._data, data);
        this._data = {};
        if (isEmpty(data)) {
            return E('_DATA_TYPE_INVALID_');
        }
        let self = this;
        let parsedOptions = {};
        let parsedData = [], result = [], affectedRows = [];
        let pk = null;
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            return self._beforeUpdate(data, options);
        }).then(function (data) {
            return self.parseData(data);
        }).then(function (data) {
            parsedData = data;
            return self.initDb();
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
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterUpdate(data, options) {
        return getPromise(data);
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        let self = this;
        let parsedOptions = {};
        return this.parseOptions(options, {limit: 1}).then(function (options) {
            parsedOptions = options;
            return self.initDb();
        }).then(function (model) {
            if (!isEmpty(self.relation)) {
                let process = model.find(self.parseDeOptions(parsedOptions));
                if (!isEmpty(self._relationLink)) {
                    self._relationLink.forEach(function (v) {
                        process = process.populate(v.table);
                    });
                }
                return process;
            } else {
                return model.find(self.parseDeOptions(parsedOptions));
            }
        }).then(function (data) {
            return self._afterFind(data[0] || {}, parsedOptions);
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */
    _afterFind(result, options) {
        return getPromise(result);
    }

    /**
     * 查询数据条数
     * @return 返回一个promise
     */
    count(options) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        let self = this;
        let parsedOptions = {};
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            return self.initDb();
        }).then(function (model) {
            return model.count(self.parseDeOptions(parsedOptions));
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        let self = this;
        let parsedOptions = {};
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            return self.initDb();
        }).then(function (model) {
            if (!isEmpty(self.relation)) {
                let process = model.find(self.parseDeOptions(parsedOptions));
                if (!isEmpty(self._relationLink)) {
                    self._relationLink.forEach(function (v) {
                        process = process.populate(v.table);
                    });
                }
                return process;
            } else {
                return model.find(self.parseDeOptions(parsedOptions));
            }
        }).then(function (data) {
            return self._afterSelect(data || {}, parsedOptions);
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterSelect(result, options) {
        return getPromise(result);
    }

    /**
     * 返回数据里含有count信息的查询
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */
    countSelect(options, pageFlag) {
        if (this.modelName == '_empty') {
            return E("This method is not support empty model");
        }
        let self = this;
        if (isBoolean(options)) {
            pageFlag = options;
            options = {};
        }
        //解析后的options
        let parsedOptions = {};
        let result = {};
        return this.parseOptions().then(function (options) {
            parsedOptions = options;
            return self.count(options);
        }).then(function (count) {
            let pageOptions = self.parsePage(parsedOptions);
            let totalPage = Math.ceil(count / pageOptions.num);
            if (isBoolean(pageFlag)) {
                if (pageOptions.page > totalPage) {
                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                }
                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
            }
            //传入分页参数
            self.limit((pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
            result = extend({count: count, total: totalPage}, pageOptions);
            if (!parsedOptions.page) {
                parsedOptions.page = pageOptions.page;
            }
            return self.select(parsedOptions);
        }).then(function (data) {
            result.data = data;
            return result;
        }).catch(function (e) {
            return E(e);
        });
    }

    /**
     * Mysql、PostgreSql原生语句查询
     * @param sqlStr
     */
    query(sqlStr, model) {
        let self = this;
        let promises;
        return this.parseOptions().then(function (options) {
            if (model) {
                promises = getPromise(model);
            } else {
                promises = self.initDb();
            }
            return promises.then(function (model) {
                return new Promise(function (fulfill, reject) {
                    if (self.config.db_type == 'mongo') {
                        //model.native(sqlStr, function (err, results) {
                        //    if (err) reject(err);
                        //    else fulfill(results);
                        //});
                        reject('not supported');
                    } else {
                        model.query(sqlStr, function (err, results) {
                            if (err) reject(err);
                            else fulfill(results);
                        });
                    }
                });
            });
        }).catch(function (e) {
            return E(e);
        });
    }
}