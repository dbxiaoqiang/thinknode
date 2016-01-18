/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import waterline from 'waterline';
import base from './Base';
import Valid from '../Util/Valid';

export default class extends base {

    init(name, config = {}) {
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
        this.safe = false;
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

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.trueTableName = '_temp';
        }

        if(isEmpty(config)){
            config.default = true;
        } else if (config.default === true){
            config.default = true;
        } else {
            config.default = false;
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
            db_ext_config: C('db_ext_config'),
        }, config);

        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {
            this.tablePrefix = C('db_prefix');
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //配置hash
        let hashStr = `${this.config.db_type}_${this.config.db_host}_${this.config.db_port}_${this.config.db_name}`;
        if (!this.config.default) {
            hashStr = `${hashStr}_${this.trueTableName}`;
        }
        this.adapterKey = hash(hashStr);
        //数据源
        this.dbOptions = {
            adapters: {
                'mysql': thinkRequire('sails-mysql')
            },
            connections: {}
        };
        /**
         * 数据源驱动,默认为mysql
         * 使用其他数据库,需要自定安装相应的adapter,例如 sails-mongo
         */
        if(!this.dbOptions.adapters[this.config.db_type]){
            this.dbOptions.adapters[this.config.db_type] = thinkRequire(`sails-${this.config.db_type}`);
        }
        //数据源链接配置
        this.dbOptions.connections[this.adapterKey] = {
            adapter: this.config.db_type,
            host: this.config.db_host,
            port: this.config.db_port,
            database: this.config.db_name,
            user: this.config.db_user,
            password: this.config.db_pwd,
            wtimeout: 30,
            auto_reconnect: true,
            pool: true,
            connectionLimit: 2,
            waitForConnections: true
        };
    }

    /**
     * 初始化数据模型
     * @returns {*|Promise.<T>}
     */
    async initDb() {
        try{
            let instances = THINK.INSTANCES.DB[this.adapterKey];
            if(!instances){
                if(!this.dbOptions.adapters[this.config.db_type]){
                    return this.error(`adapters is not installed. please run 'npm install sails-${this.config.db_type}'`);
                }
                await this.setCollections();
                let schema = THINK.ORM[this.adapterKey]['thinkschema'];
                for( let v in schema){
                    THINK.ORM[this.adapterKey].loadCollection(schema[v]);
                }
                let inits = promisify(THINK.ORM[this.adapterKey].initialize, THINK.ORM[this.adapterKey]);
                THINK.INSTANCES.DB[this.adapterKey] = await inits(this.dbOptions).catch(e => {
                    return this.error('connection initialize faild. please check the model property');
                });
                instances = THINK.INSTANCES.DB[this.adapterKey];
            }
            this._relationLink = THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName];
            this.model = instances.collections[this.trueTableName];
            return this.model;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 加载collections
     * @returns {*}
     */
    setCollections(){
        //fields filter
        let allowAttr = {type: 1, defaultsTo:1, unique:1, index:1, size:1, columnName:1};
        for(let f in this.fields){
            (k => {
                for(let arr in this.fields[k]){
                    if (!allowAttr[arr]) {
                        delete this.fields[k][arr];
                    }
                }
            })(f)
        }
        if(!THINK.ORM[this.adapterKey]){
            THINK.ORM[this.adapterKey] = new waterline();
            THINK.ORM[this.adapterKey]['thinkschema'] = {};
            THINK.ORM[this.adapterKey]['thinkfields'] = {};
            THINK.ORM[this.adapterKey]['thinkrelation'] = {};
        }
        //表关联关系
        if (!isEmpty(this.relation)) {
            let _config = extend(false, {}, this.config);
            _config.default = true;
            THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName] = this.setRelation(this.trueTableName, this.relation, _config) || [];
        }
        if(THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName]){
            THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = extend(false, THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName], this.fields);
        } else {
            THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = extend(false, {}, this.fields);
        }
        THINK.ORM[this.adapterKey]['thinkschema'][this.trueTableName] = this.setSchema(this.trueTableName, THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName]);
        return THINK.ORM[this.adapterKey];
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
            connection: this.adapterKey,
            //migrate: 'safe',
            schema: true,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            attributes: fields
        };
        //安全模式下ORM不会实时映射修改数据库表
        if (this.safe || this.config.db_ext_config.safe || !THINK.APP_DEBUG) {
            schema.migrate = 'safe';
        }
        return waterline.Collection.extend(schema);
    }

    /**
     * 设置relation
     * @param table
     * @param relation
     * @param config
     * * 关联定义
     * relation: [{
     *           type: 1, //类型 1 one2one 2 one2many 3 many2many
     *           model: 'Home/Profile', //对应的模型名
     *       }]
     * @returns {Array}
     */
    setRelation(table, relation, config){
        let relationObj = {}, relationList = [];
        if(!isArray(relation)){
            relation = Array.of(relation);
        }
        relation.forEach( rel => {
            let type = rel.type;
            if(!isEmpty(type)){
                if(['1','2','3'].indexOf(type.toString()) < 0){
                    switch (type.toUpperCase()){
                        case 'HASONE':
                            type = 1;
                            break;
                        case 'HASMANY':
                            type = 2;
                            break;
                        case 'MANYTOMANY':
                            type = 3;
                            break;
                        default:
                            type = 1;
                            break;
                    }
                }
                switch (type) {
                    case 1:
                        relationObj = this._getHasOneRelation(table, this.fields, rel, config);
                        break;
                    case 2:
                        relationObj = this._getHasManyRelation(table, this.fields, rel, config);
                        break;
                    case 3:
                        relationObj = this._getManyToManyRelation(table, this.fields, rel, config);
                        break;
                    default:
                        relationObj = this._getHasOneRelation(table, this.fields, rel, config);
                        break;
                }
                relationList.push({table: relationObj.table});
                if(THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table]){
                    THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table] = extend(false, THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table], relationObj.fields);
                } else {
                    THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table] = extend(false, {}, relationObj.fields);
                }
                THINK.ORM[this.adapterKey]['thinkschema'][relationObj.table] = this.setSchema(relationObj.table, THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table]);
            }
        });
        return relationList;
    }

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @param config
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */
    _getHasOneRelation(table, fields, relation, config) {
        let relationModel = M(relation.model, config);
        let relationTableName = relationModel.trueTableName;
        this.fields[relationTableName] = {
            model : relationTableName
        };
        return {table: relationTableName, relfields: relationModel.fields};
    }
    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @param config
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */
    _getHasManyRelation(table, fields, relation, config) {
        let relationModel = M(relation.model, config);
        let relationTableName = relationModel.trueTableName;
        this.fields[relationTableName] = {
            collection : relationTableName,
            via: table
        };
        relationModel.fields[table] = {
            model: table
        };
        return {table: relationTableName, fields: relationModel.fields};
    }
    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @param config
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */
    _getManyToManyRelation(table, fields, relation, config) {
        let relationModel = M(relation.model, config);
        let relationTableName = relationModel.trueTableName;
        this.fields[relationTableName] = {
            collection : relationTableName,
            via: table,
            dominant: true
        };
        relationModel.fields[table] = {
            collection: table,
            via: relationTableName
        };
        return {table: relationTableName, fields: relationModel.fields};
    }

    /**
     * 错误封装
     * @param err
     */
    error(err = ''){
        let stack = isError(err) ? err.message : err.toString();
        // connection error
        if(stack.indexOf('connection') > -1 || stack.indexOf('ECONNREFUSED') > -1){
            this.close(this.adapterKey);
        }
        return E(err);
    }

    /**
     * 关闭数据链接
     * @returns {Promise}
     */
    close(adapter) {
        let adapters = this.dbOptions.adapters || {};
        if(adapter){
            if(THINK.INSTANCES.DB[adapter]){
                THINK.INSTANCES.DB[adapter] = null;
                THINK.ORM[adapter] = null;
            }
            let promise =  new Promise(resolve => {
                if(this.dbOptions.connections[adapter] && this.dbOptions.connections[adapter].adapter){
                    adapters[this.dbOptions.connections[adapter].adapter].teardown(null, resolve);
                }
                resolve(null);
            });
            return promise;
        } else {
            let promises = [];
            THINK.INSTANCES.DB = {};
            THINK.ORM = {};
            Object.keys(adapters).forEach(function (adp) {
                if (adapters[adp].teardown) {
                    let promise = new Promise(function (resolve) {
                        adapters[adp].teardown(null, resolve);
                    });
                    promises.push(promise);
                }
            });
            return Promise.all(promises);
        }
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

        return options;
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
        return this.error(result);
    }

    /**
     * 解构参数
     * @param options
     */
    parseDeOptions(options) {
        let parsedOptions = extend({}, options);
        parsedOptions.hasOwnProperty('tableName') ? delete parsedOptions.tableName : '';
        parsedOptions.hasOwnProperty('tablePrefix') ? delete parsedOptions.tablePrefix : '';
        parsedOptions.hasOwnProperty('modelName') ? delete parsedOptions.modelName : '';
        parsedOptions.hasOwnProperty('page') ? delete parsedOptions.page : '';
        parsedOptions.hasOwnProperty('rel') ? delete parsedOptions.rel : '';
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
    rel(table = false){
        if(isBoolean(table)){
            if(table === false){
                this._options.rel = [];
            }else{
                this._options.rel = true;
            }
        }else{
            if(isString(table)){
                table = table.replace(/ +/g, "").split(',');
            }
            this._options.rel = isArray(table) ? table : [];
        }

        return this;
    }

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */
    field(field) {
        if (isEmpty(field)) {
            return this;
        }
        if (isString(field)) {
            field = field.replace(/ +/g, "").split(',');
        }
        this._options.select = field;
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
    async add(data, options) {
        try {
            if (isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            // init model
            let model = await this.initDb();
            //copy data
            this._data = {};

            //解析后的选项
            let parsedOptions = this.parseOptions(options);
            this._data = await this._beforeAdd(data, parsedOptions);
            //解析后的数据
            let parsedData = this.parseData(this._data);
            let result = await model.create(parsedData);
            let pk = await this.getPk();
            parsedData[pk] = parsedData[pk] ? parsedData[pk] : result[pk];
            await this._afterAdd(parsedData, parsedOptions);
            return parsedData[pk];
        }catch (e){
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
        return getPromise(data);
    }

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */
    async addAll(data, options) {
        try{
            if (!isArray(data) || !isObject(data[0])) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            // init model
            let model = await this.initDb();
            //copy data
            this._data = {};

            let parsedOptions = this.parseOptions(options);
            let promiseso = data.map(item => {
                return this._beforeAdd(item, parsedOptions);
            });
            this._data = await Promise.all(promiseso);
            let promisesd = this._data.map(item => {
                return this.parseData(item);
            });
            let parsedData = await Promise.all(promisesd);

            let result = await model.createEach(parsedData);
            if (!isEmpty(result) && isArray(result)) {
                let pk = await this.getPk(), resData = [], self = this;
                result.forEach(function (v) {
                    resData.push(self._afterAdd(v[pk], parsedOptions).then(function () {
                        return v[pk];
                    }));
                });
                return Promise.all(resData);
            } else {
                return [];
            }
        }catch (e){
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
        return getPromise(options);
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    async delete(options) {
        try{
            // init model
            let model = await this.initDb();
            //copy data
            this._data = {};

            let parsedOptions = this.parseOptions(options);
            await this._beforeDelete(parsedOptions);
            let result = await model.destroy(this.parseDeOptions(parsedOptions));
            await this._afterDelete(parsedOptions.where || {});
            if (!isEmpty(result) && isArray(result)) {
                let pk = await this.getPk(), affectedRows = [];
                result.forEach(function (v) {
                    affectedRows.push(v[pk]);
                });
                return affectedRows;
            } else {
                return [];
            }
        }catch (e){
            return this.error(e);
        }
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
    async update(data, options) {
        try{
            if (isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            // init model
            let model = await this.initDb();
            //copy data
            this._data = {};

            let parsedOptions = this.parseOptions(options);
            this._data = await this._beforeUpdate(data, parsedOptions);
            let parsedData = this.parseData(this._data);
            let pk = await this.getPk();
            if (isEmpty(parsedOptions.where)) {
                // 如果存在主键数据 则自动作为更新条件
                if (!isEmpty(parsedData[pk])) {
                    parsedOptions.where = getObject(pk, data[pk]);
                    delete parsedData[pk];
                } else {
                    return self.error('_OPERATION_WRONG_');
                }
            } else {
                if (!isEmpty(parsedData[pk])) {
                    delete parsedData[pk];
                }
            }
            let result = await model.update(parsedOptions, parsedData);
            await this._afterUpdate(parsedData, parsedOptions);
            let affectedRows = [];
            if (!isEmpty(result) && isArray(result)) {
                result.forEach(function (v) {
                    affectedRows.push(v[pk]);
                });
                return affectedRows;
            } else {
                return [];
            }
        }catch (e){
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
        return getPromise(data);
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    async find(options) {
        try{
            // init model
            let model = await this.initDb();

            let parsedOptions = this.parseOptions(options, {limit: 1});
            let result = {};
            if (!isEmpty(this.relation)) {
                let process = model.find(this.parseDeOptions(parsedOptions));
                if (!isEmpty(this._relationLink) && !isEmpty(parsedOptions.rel)) {
                    this._relationLink.forEach(function (v) {
                        if(parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1){
                            process = process.populate(v.table);
                        }
                    });
                }
                result = await process;
            } else {
                result = await model.find(this.parseDeOptions(parsedOptions));
            }
            result = isArray(result) ? result[0] : result;
            return this._afterFind(result || {}, parsedOptions);
        }catch (e){
            return this.error(e);
        }
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
    async count(options) {
        try{
            // init model
            let model = await this.initDb();

            let parsedOptions = this.parseOptions(options);
            return model.count(this.parseDeOptions(parsedOptions));
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    async select(options) {
        try{
            // init model
            let model = await this.initDb();

            let parsedOptions = this.parseOptions(options);
            let result = {};
            if (!isEmpty(this.relation)) {
                let process = model.find(this.parseDeOptions(parsedOptions));
                if (!isEmpty(this._relationLink) && !isEmpty(parsedOptions.rel)) {
                    this._relationLink.forEach(function (v) {
                        if(parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1){
                            process = process.populate(v.table);
                        }
                    });
                }
                result = await process;
            } else {
                result = await model.find(this.parseDeOptions(parsedOptions));
            }
            return this._afterSelect(result || {}, parsedOptions);
        }catch (e){
            return this.error(e);
        }
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
    async countSelect(options, pageFlag) {
        try{
            if (isBoolean(options)) {
                pageFlag = options;
                options = {};
            }
            // init model
            let model = await this.initDb();

            let parsedOptions = this.parseOptions(options);
            let count = await this.count(options);
            let pageOptions = this.parsePage(parsedOptions);
            let totalPage = Math.ceil(count / pageOptions.num);
            if (isBoolean(pageFlag)) {
                if (pageOptions.page > totalPage) {
                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                }
                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
            }
            //传入分页参数
            this.limit((pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
            let result = extend({count: count, total: totalPage}, pageOptions);
            if (!parsedOptions.page) {
                parsedOptions.page = pageOptions.page;
            }
            result.data = await this.select(parsedOptions);
            return result;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 原生语句查询
     * mysql  M('Test',[config]).query('select * from test');
     * mongo  M('Test',[config]).query('db.test.find()');
     * @param sqlStr
     */
    async query(sqlStr) {
        try{
            //safe mode
            this.config.db_ext_config.safe = true;
            // init model
            let model = await this.initDb();
            let result = null;
            if (this.config.db_type === 'mongo') {
                let quer = sqlStr.split('.');
                if(isEmpty(quer) || isEmpty(quer[0]) || quer[0] !== 'db' || isEmpty(quer[1])){
                    return this.error('query language error');
                }
                quer.shift();
                let tableName = quer.shift();
                if(tableName !== this.trueTableName){
                    return this.error('table name error');
                }
                if(!THINK.INSTANCES.DB[this.adapterKey] || !THINK.INSTANCES.DB[this.adapterKey].collections || !THINK.INSTANCES.DB[this.adapterKey].collections[tableName]){
                    return this.error('model init error');
                }
                model = THINK.INSTANCES.DB[this.adapterKey].collections[tableName];
                let cls = promisify(model.native, model);
                let process = await cls();

                let func = new Function('process', 'return process.' + quer.join('.') + ';');
                process = func(process);
                result = new Promise(function (reslove, reject) {
                    process.toArray(function (err, results) {
                        if (err) reject(err);
                        reslove(results);
                    });
                });
                return result;
            } else if (this.config.db_type === 'mysql' || this.config.db_type === 'postgresql'){
                result = promisify(model.query, this);
                return result(sqlStr);
            }else{
                return this.error('adapter not supported this method');
            }
        }catch (e){
            return this.error(e);
        }
    }
}