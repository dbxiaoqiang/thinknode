/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import base from './Base';
import Valid from '../Util/Valid';

export default class extends base {
    init(name = '', config = {}) {
        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
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
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = [];
        // 关联链接
        this._relationLink = [];
        // 参数
        this._options = {};
        // 数据
        this._data = {};
        // 验证规则
        this._valid = Valid;

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.trueTableName = '_temp';
        }

        this.config = THINK.extend(false, {
            db_type: THINK.C('db_type'),
            db_host: THINK.C('db_host'),
            db_port: THINK.C('db_port'),
            db_name: THINK.C('db_name'),
            db_user: THINK.C('db_user'),
            db_pwd: THINK.C('db_pwd'),
            db_prefix: THINK.C('db_prefix'),
            db_charset: THINK.C('db_charset'),
            db_ext_config: THINK.C('db_ext_config'),
            buffer_tostring: true
        }, config);

        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {
            this.tablePrefix = THINK.C('db_prefix');
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
    }

    /**
     * 获取表模型
     * @param table
     */
    async getSchema(table) {
        table = table || this.getTableName();
        let storeKey = `${this.config.db_type}_${table}_schema`;
        let schema = {};
        if (this.config.schema_force_update) {
            schema = await this.db().getSchema(table);
        } else {
            schema = THINK.CACHES.Schema[storeKey];
            if (!schema) {
                schema = await this.db().getSchema(table);
                THINK.CACHES.Schema[storeKey] = schema;
            }
        }
        if (table !== this.getTableName()) {
            return schema;
        }
        //get primary key
        for (let name in schema) {
            if (schema[name].primary) {
                this.pk = name;
                break;
            }
        }
        //merge user set schema config
        this.schema = THINK.extend({}, schema, this.fields);
        return this.schema;
    }

    /**
     *  获取DB单例
     */
    db() {
        if (this._db)return this._db;
        let DB = THINK.require(this.config.db_type || 'mysql', 'Db');
        this._db = new DB(this.config);
        return this._db;
    }


    /**
     * 错误封装
     * @param err
     */
    error(err) {
        let msg = err || '';
        if (!THINK.isError(msg)) {
            if (!THINK.isString(msg)) {
                msg = JSON.stringify(msg);
            }
            msg = new Error(msg);
        }

        let stack = msg.message;
        // connection error
        if (~stack.indexOf('connect') || ~stack.indexOf('ECONNREFUSED')) {
            this.close(this.adapterKey);
        }
        return Promise.reject(msg);
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
        if (!THINK.isEmpty(this.fields)) {
            for (let v in this.fields) {
                if (this.fields[v].hasOwnProperty('primaryKey') && this.fields[v].primaryKey === true) {
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
        let options;
        if (THINK.isScalar(oriOpts)) {
            options = THINK.extend({}, this._options);
        } else {
            options = THINK.extend({}, this._options, oriOpts, extraOptions);
        }
        //查询过后清空sql表达式组装 避免影响下次查询
        this._options = {};
        //获取表名
        options.table = options.table || this.getTableName();
        //表前缀，Db里会使用
        options.tablePrefix = this.tablePrefix;
        options.model = this.getModelName();
        //解析field,根据model的fields进行过滤
        let field = [];
        if (THINK.isEmpty(options.field) && !THINK.isEmpty(options.fields)) options.field = options.fields;
        return options;
    }

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @returns {*}
     */
    async parseData(data, options, preCheck = true, option = 1) {
        if (preCheck) {
            if (THINK.isEmpty(data)) {
                return data;
            }
            //根据模型定义字段类型进行数据检查
            let result = [], fields = await this.getSchema();
            for (let field in data) {
                if (fields[field] && fields[field].type) {
                    switch (fields[field].type) {
                        case 'integer':
                        case 'int':
                            (!THINK.isNumber(data[field]) && !THINK.isNumberString(data[field])) && result.push(`${ field }值类型错误`);
                            break;
                        case 'float':
                            (!THINK.isNumber(data[field]) && !THINK.isNumberString(data[field])) && result.push(`${ field }值类型错误`);
                            break;
                        case 'boolean':
                            !THINK.isBoolean(data[field]) && result.push(`${ field }值类型错误`);
                            break;
                        case 'array':
                            !THINK.isArray(data[field]) && result.push(`${ field }值类型错误`);
                            break;
                        default:
                            break;
                    }
                    if (result.length > 0) {
                        return this.error(result[0]);
                    }
                }

            }
            //自动添加defaultsTo字段
            switch (option) {
                case 1://新增
                    for (let key in fields) {
                        if (THINK.isFunction(fields[key].defaultsTo)) {
                            data[key] = fields[key].defaultsTo()
                        } else if (!THINK.isEmpty(fields[key].defaultsTo)) {
                            data[key] = fields[key].defaultsTo

                        }
                    }
                    break;
                case 2://更新
                case 3://新增且更新
            }
            //根据规则自动验证数据
            if (options.verify) {
                if (THINK.isEmpty(this.validations)) {
                    return data;
                }
                let field, value, checkData = [];
                for (field in this.validations) {
                    value = THINK.extend(this.validations[field], {name: field, value: data[field]});
                    checkData.push(value);
                }
                if (THINK.isEmpty(checkData)) {
                    return data;
                }
                result = {};
                result = this._valid(checkData);
                if (THINK.isEmpty(result)) {
                    return data;
                }
                return this.error(Object.values(result)[0]);
            }

            return data;
        } else {
            if (THINK.isJSONObj(data)) {
                return data;
            } else {
                return JSON.parse(JSON.stringify(data));
            }
        }
    }

    /**
     * 解构参数
     * @param options
     */
    parseDeOptions(options) {
        let parsedOptions = THINK.extend({}, options);
        parsedOptions.hasOwnProperty('tableName') ? delete parsedOptions.tableName : '';
        parsedOptions.hasOwnProperty('tablePrefix') ? delete parsedOptions.tablePrefix : '';
        parsedOptions.hasOwnProperty('modelName') ? delete parsedOptions.modelName : '';
        parsedOptions.hasOwnProperty('page') ? delete parsedOptions.page : '';
        parsedOptions.hasOwnProperty('rel') ? delete parsedOptions.rel : '';
        parsedOptions.hasOwnProperty('verify') ? delete parsedOptions.verify : '';
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
            num = num || THINK.C('db_nums_per_page');
            page = parseInt(page, 10) || 1;
            return {
                page: page,
                num: num
            };
        }
        return {
            page: 1,
            num: THINK.C('db_nums_per_page')
        };
    }

    /**
     * 自动验证开关
     * @param data
     */
    verify(flag = false) {
        this._options.verify = !!flag;
        return this;
    }

    /**
     * set having options
     * @param  {String} value []
     * @return {}       []
     */
    having(value) {
        this._options.having = value;
        return this;
    }

    /**
     * 分组
     * @param value
     */
    group(value) {
        this._options.group = value;
        return this;
    }

    /**
     * .join({
   *   'xxx': {
   *     join: 'left',
   *     as: 'c',
   *     on: ['id', 'cid']
   *   }
   * })
     * @param  {[type]} join [description]
     * @return {[type]}      [description]
     */
    join(join) {
        if (!join) {
            return this;
        }
        if (!this._options.join) {
            this._options.join = [];
        }
        if (THINK.isArray(join)) {
            this._options.join = this._options.join.concat(join);
        } else {
            this._options.join.push(join);
        }
        return this;
    }

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */
    limit(offset, length) {
        if (offset === undefined) {
            return this;
        }
        if (THINK.isArray(offset)) {
            length = offset[1] || length;
            offset = offset[0];
        }
        offset = Math.max(parseInt(offset) || 0, 0);
        if (length) {
            length = Math.max(parseInt(length) || 0, 0);
        }
        this._options.limit = [offset, length];
        return this;
    }

    /**
     * 排序
     * @param order
     * @returns {exports}
     */
    order(order) {
        if (order === undefined) {
            return this;
        }
        if (THINK.isObject(order)) {
            order = THINK.extend(false, {}, order);
            let _order = {};
            for (let v in order) {
                if (THINK.isNumber(order[v])) {
                    _order[v] = order[v];
                } else {
                    if (order[v].toLowerCase() === 'desc') {
                        _order[v] = 0;
                    } else if (order[v].toLowerCase() === 'asc') {
                        _order[v] = 1;
                    }
                }
            }
            if (!THINK.isEmpty(_order)) {
                this._options.sort = _order;
            }
        } else if (THINK.isString(order)) {
            if (order.indexOf(',') > -1) {
                let strToObj = function (_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '')
                        .replace(/( +, +)+|( +,)+|(, +)/, ',')
                        .replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':')
                        .replace(/^/, '{"').replace(/$/, '"}')
                        .replace(/:/g, '":"').replace(/,/g, '","')
                        .replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
                };
                this._options.order = JSON.parse(strToObj(order));
            } else {

                this._options.order = order;
            }
        }
        return this;
    }

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */
    page(page, listRows) {
        if (page === undefined) {
            return this;
        }
        this._options.page = listRows === undefined ? page : page + ',' + listRows;
        return this;
    }

    /**
     * 指定关联操作的表
     * @param table
     */
    rel(table = false) {
        //if (THINK.isBoolean(table)) {
        //    if (table === false) {
        //        this._options.rel = [];
        //    } else {
        //        this._options.rel = true;
        //    }
        //} else {
        //    if (THINK.isString(table)) {
        //        table = table.replace(/ +/g, '').split(',');
        //    }
        //    this._options.rel = THINK.isArray(table) ? table : [];
        //}
        this._options.rel = !THINK.isEmpty(this.relation) ? table : false;
        return this;
    }

    /**
     * 要查询的字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */
    field(fields) {
        if (THINK.isEmpty(fields)) {
            return this;
        }
        if (THINK.isString(fields)) {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this._options.fields = fields;
        return this;
    }

    /**
     * where条件
     * @return {[type]} [description]
     */
    where(where) {
        if (!where) {
            return this;
        }
        this._options.where = THINK.extend(false, this._options.where || {}, where);
        return this;
    }

    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeAdd(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    async add(data, options) {
        try {
            if (THINK.isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            //parse options
            let parsedOptions = this.parseOptions(options);
            //copy data
            this._data = THINK.extend({}, data);
            this._data = await this._beforeAdd(this._data, parsedOptions);
            this._data = await this.parseData(this._data, parsedOptions);
            let result = await this.db().add(this._data, parsedOptions).catch(e => this.error(`${this.modelName}:${e.message}`));
            this._data[this.pk] = this.db().getLastInsertId();
            if (!THINK.isEmpty(this.relation)) {
                await this.__postRelationData(this._data[this.pk], this._data, 'ADD', parsedOptions);
            }
            let pk = await this.getPk();
            this._data[pk] = this._data[pk] ? this._data[pk] : result[pk];
            await this._afterAdd(this._data, parsedOptions);
            return this._data[pk];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterAdd(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */
    async addAll(data, options) {
        try {
            if (!THINK.isArray(data) || !THINK.isObject(data[0])) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            //parse options
            let parsedOptions = this.parseOptions(options);
            //copy data
            this._data = THINK.extend([], data);

            let promisesd = this._data.map(item => {
                return this._beforeAdd(item, parsedOptions);
            });
            this._data = await Promise.all(promisesd);

            let promiseso = this._data.map(item => {
                return this.parseData(item, parsedOptions);
            });
            this._data = await Promise.all(promiseso);

            let result = await this.db().addAll(this._data, parsedOptions).catch(e => this.error(`${this.modelName}:${e.message}`));
            return result;
        } catch (e) {
            return this.error(e);
        }
    }


    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeDelete(options) {
        return Promise.resolve(options);
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    async delete(options) {
        try {
            //parse options
            let parsedOptions = this.parseOptions(options);
            // init model
            await this._beforeDelete(parsedOptions);
            let result = await this.db().delete(parsedOptions).catch(e => this.error(`${this.modelName}:${e.message}`));
            await this._afterDelete(parsedOptions.where || {});
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */
    _afterDelete(options) {
        return Promise.resolve(options);
    }

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeUpdate(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    async update(data, options) {
        try {
            if (THINK.isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            //parse options
            let parsedOptions = this.parseOptions(options);
            //copy data
            this._data = THINK.extend({}, data);

            this._data = await this._beforeUpdate(this._data, parsedOptions);
            this._data = await this.parseData(this._data, parsedOptions, true, 2);
            let pk = await this.getPk();
            if (THINK.isEmpty(parsedOptions.where)) {
                // 如果存在主键数据 则自动作为更新条件
                if (!THINK.isEmpty(this._data[pk])) {
                    parsedOptions.where = THINK.getObject(pk, this._data[pk]);
                    delete this._data[pk];
                } else {
                    return this.error('_OPERATION_WRONG_');
                }
            } else {
                if (!THINK.isEmpty(this._data[pk])) {
                    delete this._data[pk];
                }
            }
            let result = await this.db().update(parsedOptions, this._data).catch(e => this.error(`${this.modelName}:${e.message}`));
            if (!THINK.isEmpty(this.relation)) {
                await this.__postRelationData(result, this._data, 'UPDATE', parsedOptions);
            }
            await this._afterUpdate(this._data, parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterUpdate(data, options) {
        return Promise.resolve(data);
    }

    _beforeFind(options) {
        return options;
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    async find(options) {
        options = await this.parseOptions(options, {limit: 1});
        options = await this._beforeFind(options);
        let result = await this.db().select(options);
        if (options.rel && !THINK.isEmpty(result)) {//查询关联关系
            await this.__getRelationData(result[0], options);
        }
        result = await this.parseData(result[0] || {}, options, false);
        return this._afterSelect(result, options);
    }

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */
    _afterFind(result, options) {
        return Promise.resolve(result);
    }

    /**
     * 查询数据条数
     * @param options
     * @returns {*}
     */
    async count(field, options) {
        try {
            let pk = await this.getPk();
            field = field || pk;
            this._options.field = `count('${field}') AS Count`;
            //parse options
            let parsedOptions = this.parseOptions(options);
            let result = await this.db().select(parsedOptions);
            //Formatting Data
            result = await this.parseData(result, parsedOptions, false);
            return result[0].Count || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    async sum(field, options) {
        try {
            let pk = await this.getPk();
            field = field || pk;
            this._options.field = 'SUM(`' + field + '`) AS Sum';
            //parse options
            let parsedOptions = this.parseOptions(options);
            let result = await this.db().select(parsedOptions);
            //Formatting Data
            result = await this.parseData(result, parsedOptions, false);
            return result[0].Sum || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    async max(field, options) {
        try {
            let pk = await this.getPk();
            field = field || pk;
            this._options.field = 'MAX(`' + field + '`) AS Max';
            //parse options
            let parsedOptions = this.parseOptions(options);
            let result = await this.db().select(parsedOptions);
            //Formatting Data
            result = await this.parseData(result, parsedOptions, false);
            return result[0].Max || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    async min(field, options) {
        try {
            let pk = await this.getPk();
            field = field || pk;
            this._options.field = 'MIN(`' + field + '`) AS Min';
            //parse options
            let parsedOptions = this.parseOptions(options);
            let result = await this.db().select(parsedOptions);
            //Formatting Data
            result = await this.parseData(result, parsedOptions, false);
            return result[0].Min || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    async avg(field, options) {
        try {
            let pk = await this.getPk();
            field = field || pk;
            this._options.field = 'AVG(`' + field + '`) AS Avg';
            //parse options
            let parsedOptions = this.parseOptions(options);
            let result = await this.db().select(parsedOptions);
            //Formatting Data
            result = await this.parseData(result, parsedOptions, false);
            return result[0].Avg || 0;
        } catch (e) {
            return this.error(e);
        }
    }


    async _beforeSelect(options) {
        return options;
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    async select(options) {
        options = await this.parseOptions(options);
        options = await this._beforeSelect(options);
        let result = await this.db().select(options);
        result = await this.parseData(result, options, false);
        return this._afterSelect(result, options);
    }

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterSelect(result, options) {
        return Promise.resolve(result);
    }

    /**
     * 返回数据里含有count信息的查询
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */
    async countSelect(options, pageFlag) {
        try {
            if (THINK.isBoolean(options)) {
                pageFlag = options;
                options = {};
            }
            //parse options
            let parsedOptions = this.parseOptions(options);

            let count = await this.count(parsedOptions);
            let pageOptions = this.parsePage(parsedOptions);
            let totalPage = Math.ceil(count / pageOptions.num);
            if (THINK.isBoolean(pageFlag)) {
                if (pageOptions.page > totalPage) {
                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                }
                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
            }
            //传入分页参数
            this.limit((pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
            let result = THINK.extend(false, {count: count, total: totalPage}, pageOptions);
            if (!parsedOptions.page) {
                parsedOptions.page = pageOptions.page;
            }
            result.data = await this.select(parsedOptions);
            //Formatting Data
            result = await this.parseData(result, parsedOptions, false);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 原生语句查询
     * mysql  THINK.M('Test',[config]).query('select * from test');
     * mongo  THINK.M('Test',[config]).query('db.test.find()');
     * @param sqlStr
     */
    async query(sqlStr) {
        try {
            //safe mode
            this.config.db_ext_config.safe = true;
            // init model
            let model = this.db();
            let process = null, result = [];
            if (this.config.db_type === 'mongo') {
                let quer = sqlStr.split('.');
                if (THINK.isEmpty(quer) || THINK.isEmpty(quer[0]) || quer[0] !== 'db' || THINK.isEmpty(quer[1])) {
                    return this.error('query language error');
                }
                quer.shift();
                let tableName = quer.shift();
                if (tableName !== this.trueTableName) {
                    return this.error('table name error');
                }
                if (!THINK.INSTANCES.DB[this.adapterKey] || !THINK.INSTANCES.DB[this.adapterKey].collections || !THINK.INSTANCES.DB[this.adapterKey].collections[tableName]) {
                    return this.error('model init error');
                }
                model = THINK.INSTANCES.DB[this.adapterKey].collections[tableName];
                let cls = THINK.promisify(model.native, model);
                process = await cls();

                let func = new Function('process', 'return process.' + quer.join('.') + ';');
                process = func(process);
                process = new Promise(function (reslove, reject) {
                    process.toArray(function (err, results) {
                        if (err) reject(err);
                        reslove(results);
                    });
                });

                result = await process;
            } else if (this.config.db_type === 'mysql') {
                result = await model.query(sqlStr)
            } else if (this.config.db_type === 'postgresql') {
                result = await model.query(sqlStr)
            } else {
                return this.error('adapter not supported this method');
            }
            //Formatting Data
            result = await this.parseData(result, {}, false);
            return result;

        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 添加关联关系数据
     * @param result 主表操作返回结果
     * @param data 主表数据
     * @private
     */
    async __postRelationData(result, data, postType, options) {
        let pk = await this.getPk();
        data[pk] = result;
        let caseList = {
            1: this.__postHasOneRelation,
            2: this.__postHasManyRelation,
            3: this.__postManyToManyRelation,
            4: this.__postBelongsToRealtion,
            HASONE: this.__postHasOneRelation,
            HASMANY: this.__postHasManyRelation,
            MANYTOMANY: this.__postManyToManyRelation,
            BELONGSTO: this.__postBelongsToRealtion,
        };
        let promises = Object.keys(this.relation).map(key=> {
            let item = this.relation[key];
            //主表数据没有存储关联字段数据,直接返回
            if (THINK.isEmpty(data[key])) return;
            let type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;
            if (type && type in caseList) {
                caseList[type](this, data, data[key], postType, item);
            }
        })
        await Promise.all(promises);
        return data;
    }

    /**
     * hasone子表数据新增更新
     * @param self
     * @param data
     * @param postType
     * @param item
     * @private
     */
    async __postHasOneRelation(self, data, childdata, postType, relation) {
        let model = THINK.M(relation.model);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        //子表外键数据
        childdata[fkey] = data[key];
        switch (postType) {
            case 'ADD':
                return await model.add(childdata);
                break;
            case 'UPDATE':
                delete childdata[fkey];
                return await model.where({[fkey]: data[key]}).update(childdata);
                break
        }
    }


    /**
     * hasmany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */
    async __postHasManyRelation(self, data, childdata, postType, relation) {
        let model = THINK.M(relation.model);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        //子表外键数据
        if (THINK.isArray(childdata)) {
            for (let [k,v] of childdata.entries()) {
                childdata[k][fkey] = data[key];
                switch (postType) {
                    case 'ADD':
                        await model.add(childdata[k]);
                        break;
                    case 'UPDATE':
                        delete childdata[fkey];
                        await model.where({[fkey]: data[key]}).update(childdata[k]);
                        break
                }
            }
        } else if (THINK.isObject(childdata)) {
            childdata[fkey] = data[key];
            switch (postType) {
                case 'ADD':
                    await model.add(childdata);
                    break;
                case 'UPDATE':
                    delete childdata[fkey];
                    await model.where({[fkey]: data[key]}).update(childdata);
                    break
            }
        }
        return;
    }

    /**
     * manytomany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */
    async __postManyToManyRelation(self, data, childdata, postType, relation) {
        let model = THINK.M(relation.model);
        let option = {};
        if (relation.relationtable) {
            option.table = relation.relationtable;
        } else {
            option.table = `${THINK.C('db_prefix')}${self.getModelName().toLowerCase()}_${model.getModelName().toLowerCase()}_map`;
        }
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        //需要取到对应model的关联key,fkey
        let rpk = model.getPk(), cid;
        let rkey = model.relation.key || rpk;
        let rfkey = model.relation.fkey || `${model.getModelName().toLowerCase()}_id`;
        if (THINK.isArray(childdata)) {
            for (let cdata of childdata) {
                switch (postType) {
                    case 'ADD':
                        //先写入关联表
                        cid = await model.add(cdata);
                        cdata[rpk] = cid;
                        //写入两个表关系表
                        await self.db().add({[fkey]: data[key], [rfkey]: cdata[rkey]}, option);
                        break;
                    case 'UPDATE':
                        //先从两表关系表查出对应关系表的外键
                        //option.where = {[fkey]: data[key]};
                        //option.field = rfkey;
                        //console.log(data);
                        //console.log(key);
                        //for (let m of await self.db().select(option)) {
                        //    if (!THINK.isEmpty(await model.where({[rkey]: m[rfkey]}).find())) {
                        //        //已存在对应数据,更新
                        //        await model.where({[rkey]: m[rfkey]}).update(cdata);
                        //    } else {
                        //        //无关联数据,新增
                        //        cid = await model.add(cdata);
                        //        cdata[rpk] = cid;
                        //        //写入两个表关系表
                        //        await self.db().add({[fkey]: data[key], [rfkey]: cdata[rkey]}, option);
                        //    }
                        //}
                        break;
                }
            }
        } else if (THINK.isObject(childdata)) {
            switch (postType) {
                case 'ADD':
                    //先写入关联表
                    cid = await model.add(childdata);
                    childdata[rpk] = cid;
                    await self.db().add({[fkey]: data[key], [rfkey]: childdata[rkey]}, option);
                    break;
                case 'UPDATE':
                    //先从两表关系表查出对应关系表的外键
                    //option.where = {[fkey]: data[key]};
                    //option.field = rfkey;
                    //for (let m of await self.db().select(option)) {
                    //    if (!THINK.isEmpty(await model.where({[rkey]: m[rfkey]}).find())) {
                    //        //已存在对应数据,更新
                    //        model.where({[rkey]: m[rfkey]}).update(childdata);
                    //    } else {
                    //        //无关联数据,新增
                    //        cid = await model.add(childdata);
                    //        childdata[rpk] = cid;
                    //        //写入两个表关系表
                    //        await self.db().add({[fkey]: data[key], [rfkey]: childdata[rkey]}, option);
                    //    }
                    //}
                    break;
            }

        }
        return;
    }

    /**
     * belongsto 无需写入父表数据
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */
    __postBelongsToRealtion(self, data, childdata, postType, relation) {
        return;
    }


    /**
     * 获取关联数据
     * @param result
     * @param options
     * @private
     */
    async __getRelationData(result, options) {
        let o;
        if (THINK.isBoolean(options.rel)) {
            if (options.rel === false) {
                return result
            } else {
                o = true
            }
        } else if (THINK.isString(options.rel)) {
            o = options.rel.replace(/ +/g, '').split(',');
        } else {
            o = options.rel;
        }

        await this.__getRelationOptions(result, o);
    }

    /**
     *
     * @param option
     * @private
     */
    async __getRelationOptions(data, option) {
        let relation = {};
        if (option === true) {//查询全部关联关系,且无任何条件
            relation = this.relation;
        } else if (THINK.isObject(option)) {//指定查询对象
            for (let k of Object.keys(option)) {
                if (this.relation[k]) relation[k] = THINK.extend({}, option[k], this.relation[k]);
            }
        } else if (THINK.isArray(option)) {//关联多个模型,但未指定任何条件
            for (let k of option) {
                if (this.relation[k]) relation[k] = this.relation[k];
            }
        }

        //console.log(relation);
        //if (option === true) {//查询全部关联关系,且无任何条件
        //    relation = this.relation;
        //} else if (THINK.isObject(option)) {//查询指定一个关联对象,且指定条件
        //    for (let rel of this.relation) {
        //        if (option.model === rel.model) {
        //            relation.push(THINK.extend({}, option, rel));
        //            break;
        //        }
        //    }
        //} else if (THINK.isArray(option)) {
        //    for (let o of option) {
        //        if (THINK.isString(o)) {//关联多个模型,但未指定任何条件
        //            relation = this.relation.filter(item=> {
        //                if (item.model === o) return item
        //            })
        //        } else {//关联多个模型,且指定条件
        //            for (let rel of this.relation) {
        //                if (o.model === rel.model) {
        //                    relation.push(THINK.extend({}, o, rel));
        //                }
        //            }
        //        }
        //    }
        //}
        //
        let caseList = {
            1: this.__getHasOneRelation,
            2: this.__getHasManyRelation,
            3: this.__getManyToManyRelation,
            4: this.__getBelongsToRealtion,
            HASONE: this.__getHasOneRelation,
            HASMANY: this.__getHasManyRelation,
            MANYTOMANY: this.__getManyToManyRelation,
            BELONGSTO: this.__getBelongsToRealtion,
        };
        let relationObj = {}, item;
        for (let k in relation) {
            item = relation[k];
            item.name = k;
            let type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;
            if (type && type in caseList) {
                relationObj = await caseList[type](this, data, item);
            }
        }
        return relationObj;
    }

    /**
     * 获取一对一关联数据
     * 附属表中有主表的一个外键
     * @param relation
     * @param option
     * @private
     */
    async __getHasOneRelation(self, data, relation) {
        let model = THINK.M(relation.model);
        if (relation.field) model = model.field(relation.field);
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        if (THINK.isArray(data)) {
            for (let [k,v] of data.entries()) {
                where[fkey] = v[key]
                if (relation.where) where = THINK.extend({}, where, relation.where);
                data[k][relation.name] = await model.where(where).find();
            }
        } else {
            where[fkey] = data[key]
            if (relation.where) where = THINK.extend({}, where, relation.where);
            data[relation.name] = await model.where(where).find();
        }
        return data;
    }

    /**
     * 获取一对多
     * @param self
     * @param data
     * @param relation
     * @private
     */
    async __getHasManyRelation(self, data, relation) {
        let model = THINK.M(relation.model);
        if (relation.field) model = model.field(relation.field);
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        if (THINK.isArray(data)) {
            for (let [k,v] of data.entries()) {
                where[fkey] = v[key]
                if (relation.where) where = THINK.extend({}, where, relation.where);
                data[k][relation.name] = await model.where(where).select();
            }
        } else {
            where[fkey] = data[key]
            if (relation.where) where = THINK.extend({}, where, relation.where);
            data[relation.name] = await model.where(where).select();
        }
        return data;
    }

    /**
     * 获取多对多,需要一张关联关系表
     * @param self
     * @param data
     * @param relation
     * @private
     */
    async __getManyToManyRelation(self, data, relation) {
        let model = THINK.M(relation.model);
        let modelTableName = model.getTableName();
        let option = {where: {}};
        if (relation.field) {
            let field = []
            for (let f of relation.field.replace(/ +/g, '').split(',')) {
                field.push(`${modelTableName}.${f}`);
            }
            model = model.field(field);
        }
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        if (relation.relationtable) {
            option.table = relation.relationtable;
        } else {
            option.table = `${THINK.C('db_prefix')}${self.getModelName().toLowerCase()}_${model.getModelName().toLowerCase()}_map`;
        }
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        //let rkey = model.relation.key || model.getPk();
        let rfkey = model.relation.fkey || `${model.getModelName().toLowerCase()}_id`;
        if (THINK.isArray(data)) {
            for (let [k,v] of data.entries()) {
                option.where[`${option.table}.${fkey}`] = v[key];
                if (relation.where) option.where = THINK.extend({}, where, option.where);
                option.join = `${option.table} ON ${modelTableName}.${key} = ${option.table}.${rfkey}`;
                //data[k][relation.name] = await self.db().select(option);
                data[k][relation.name] = await model.where(option.where).join(option.join).select();
            }
        } else {
            option.where[`${option.table}.${fkey}`] = data[key];
            if (relation.where) option.where = THINK.extend({}, where, option.where);
            option.join = `${option.table} ON ${modelTableName}.${key} = ${option.table}.${rfkey}`;
            data[relation.name] = await model.where(option.where).join(option.join).select();
            //data[relation.name] = await await self.db().select(option);
        }
        return data;
    }

    /**
     * 获取属于关系
     * 附属表中有主表的一个外键
     * @private
     */
    async __getBelongsToRealtion(self, data, relation) {
        let model = THINK.M(relation.model);
        if (relation.field) model = model.field(relation.field);
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        if (THINK.isArray(data)) {
            for (let [k,v] of data.entries()) {
                where[key] = v[fkey]
                if (relation.where) where = THINK.extend({}, where, relation.where);
                data[k][relation.name] = await model.where(where).find();
            }
        } else {
            where[key] = data[fkey]
            if (relation.where) where = THINK.extend({}, where, relation.where);
            data[relation.name] = await model.where(where).find();
        }
        return data;
    }
}
