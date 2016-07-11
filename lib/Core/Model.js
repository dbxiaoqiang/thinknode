'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _of = require('babel-runtime/core-js/array/of');

var _of2 = _interopRequireDefault(_of);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _waterline = require('waterline');

var _waterline2 = _interopRequireDefault(_waterline);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Valid = require('../Util/Valid');

var _Valid2 = _interopRequireDefault(_Valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {

    init(name) {
        let config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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
        this._valid = _Valid2.default;

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
            db_ext_config: THINK.C('db_ext_config')
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
        //安全模式
        this.safe = this.config.db_ext_config.safe === true ? true : false;
        //配置hash
        this.adapterKey = THINK.hash(`${ this.config.db_type }_${ this.config.db_host }_${ this.config.db_port }_${ this.config.db_name }`);
        //数据源
        this.dbOptions = {
            adapters: {
                'mysql': THINK.require('sails-mysql')
            },
            connections: {}
        };
        /**
         * 数据源驱动,默认为mysql
         * 使用其他数据库,需要自定安装相应的adapter,例如 sails-mongo
         */
        if (!this.dbOptions.adapters[this.config.db_type]) {
            this.dbOptions.adapters[this.config.db_type] = THINK.require(`sails-${ this.config.db_type }`);
        }
        //数据源链接配置
        this.dbOptions.connections[this.adapterKey] = {
            adapter: this.config.db_type,
            host: this.config.db_host,
            port: this.config.db_port,
            database: this.config.db_name,
            user: this.config.db_user,
            password: this.config.db_pwd,
            charset: this.config.db_charset,
            wtimeout: 10,
            auto_reconnect: true,
            pool: true,
            connectionLimit: 30,
            waitForConnections: true
        };
    }

    /**
     * 初始化数据模型
     * @returns {*|Promise.<T>}
     */
    initDb() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let instances = THINK.INSTANCES.DB[_this.adapterKey];
                if (!instances) {
                    instances = yield _this.setConnectionPool();
                } else {
                    if (!instances.collections[_this.trueTableName]) {
                        yield _this.setCollections();
                        instances = yield _this.setConnectionPool();
                    }
                }
                _this._relationLink = THINK.ORM[_this.adapterKey]['thinkrelation'][_this.trueTableName] || [];
                _this.model = instances.collections[_this.trueTableName];
                return _this.model || _this.error('connection initialize faild.');
            } catch (e) {
                return _this.error(e);
            }
        })();
    }

    /**
     * 连接池
     * @returns {*}
     */
    setConnectionPool() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //closed connect for init
                THINK.INSTANCES.DB[_this2.adapterKey] && (yield _this2.close(_this2.adapterKey));
                //check adapters
                if (!_this2.dbOptions.adapters[_this2.config.db_type]) {
                    return _this2.error(`adapters is not installed. please run 'npm install sails-${ _this2.config.db_type }@0.11.x'`);
                }
                //load collections
                if (THINK.isEmpty(THINK.ORM[_this2.adapterKey])) {
                    return _this2.error('orm initialize faild. please check db config.');
                }
                let schema = THINK.ORM[_this2.adapterKey]['thinkschema'];
                for (let v in schema) {
                    THINK.ORM[_this2.adapterKey].loadCollection(schema[v]);
                }
                //initialize
                let inits = THINK.promisify(THINK.ORM[_this2.adapterKey].initialize, THINK.ORM[_this2.adapterKey]);
                let instances = yield inits(_this2.dbOptions).catch(function (e) {
                    return _this2.error(e.message);
                });
                THINK.INSTANCES.DB[_this2.adapterKey] = instances;
                return instances;
            } catch (e) {
                return _this2.error(e);
            }
        })();
    }

    /**
     * 加载collections
     * @returns {*}
     */
    setCollections() {
        try {
            //fields filter
            let allowAttr = { type: 1, size: 1, defaultsTo: 1, required: 1, unique: 1, index: 1, columnName: 1 };
            for (let f in this.fields) {
                (k => {
                    for (let arr in this.fields[k]) {
                        if (!allowAttr[arr]) {
                            delete this.fields[k][arr];
                        }
                    }
                    if (THINK.isEmpty(this.fields[k])) {
                        delete this.fields[k];
                    }
                })(f);
            }
            if (!THINK.ORM[this.adapterKey]) {
                THINK.ORM[this.adapterKey] = new _waterline2.default();
                THINK.ORM[this.adapterKey]['thinkschema'] = {};
                THINK.ORM[this.adapterKey]['thinkfields'] = {};
                THINK.ORM[this.adapterKey]['thinkrelation'] = {};
            }
            //表关联关系
            if (!THINK.isEmpty(this.relation)) {
                let _config = THINK.extend({}, this.config);
                THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName] = this.setRelation(this.trueTableName, this.relation, _config) || [];
            }
            if (THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName]) {
                THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = THINK.extend(false, THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName], this.fields);
            } else {
                THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = THINK.extend(false, {}, this.fields);
            }
            THINK.ORM[this.adapterKey]['thinkschema'][this.trueTableName] = this.setSchema(this.trueTableName, THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName]);
            return THINK.ORM[this.adapterKey];
        } catch (e) {
            return this.error(e);
        }
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
            schema: true,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            attributes: fields,
            migrate: 'safe'
        };
        //安全模式下ORM不会实时映射修改数据库表
        if (!this.safe && THINK.APP_DEBUG) {
            THINK.cPrint('migrate is an experimental feature, you risk losing your data. please back up your data before use', 'WARNING');
            schema.migrate = 'alter';
        }
        return _waterline2.default.Collection.extend(schema);
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
    setRelation(table, relation, config) {
        let relationObj = {},
            relationList = [];
        if (!THINK.isArray(relation)) {
            relation = (0, _of2.default)(relation);
        }
        //类作用域
        let scope = this;
        let caseList = {
            1: this._getHasOneRelation,
            2: this._getHasManyRelation,
            3: this._getManyToManyRelation,
            HASONE: this._getHasOneRelation,
            HASMANY: this._getHasManyRelation,
            MANYTOMANY: this._getManyToManyRelation
        };
        relation.forEach(rel => {
            let type = rel.type && !~['1', '2', '3'].indexOf(rel.type + '') ? (rel.type + '').toUpperCase() : rel.type;
            if (type && type in caseList) {
                relationObj = caseList[type](scope, table, rel, config);
                if (relationObj.table) {
                    relationList.push({ table: relationObj.table, relfield: relationObj.relfield });
                    if (THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table]) {
                        THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table] = THINK.extend(false, THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table], relationObj.fields);
                    } else {
                        THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table] = THINK.extend(false, {}, relationObj.fields);
                    }
                    THINK.ORM[this.adapterKey]['thinkschema'][relationObj.table] = this.setSchema(relationObj.table, THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table]);
                }
            }
        });
        return relationList;
    }

    /**
     *
     * @param scope
     * @param table
     * @param relation
     * @param config
     * @returns {{table: (string|string|type[]|*), relfields: *}}
     * @private
     */
    _getHasOneRelation(scope, table, relation, config) {
        let relationModel = THINK.M(relation.model, config);
        if (relationModel.trueTableName) {
            let relationTableName = relationModel.trueTableName;
            let field = relation.field || relationTableName;
            if (scope.fields[field]) {
                throw new Error(`${ scope.modelName } Model class relation field or relation columnName duplicate definitions, check to ensure no repeat this.fields named above`);
            }
            scope.fields[field] = {
                model: relationTableName
            };
            return { table: relationTableName, relfield: field, fields: relationModel.fields };
        } else {
            return {};
        }
    }

    /**
     *
     * @param scope
     * @param table
     * @param relation
     * @param config
     * @returns {{table: (string|string|type[]|*), fields: *}}
     * @private
     */
    _getHasManyRelation(scope, table, relation, config) {
        let relationModel = THINK.M(relation.model, config);
        if (relationModel.trueTableName) {
            let relationTableName = relationModel.trueTableName;
            let field = relation.field || relationTableName;
            let columnName = relation.columnName || table;
            if (scope.fields[field] || relationModel.fields[columnName]) {
                throw new Error(`${ scope.modelName } or ${ relationModel.modelName } Model class relation field or relation columnName duplicate definitions, check to ensure no repeat this.fields named above`);
            }
            scope.fields[field] = {
                collection: relationTableName,
                via: columnName
            };
            relationModel.fields[columnName] = {
                model: table
            };
            return { table: relationTableName, relfield: field, fields: relationModel.fields };
        } else {
            return {};
        }
    }

    /**
     *
     * @param scope
     * @param table
     * @param relation
     * @param config
     * @returns {{table: (string|string|type[]|*), fields: *}}
     * @private
     */
    _getManyToManyRelation(scope, table, relation, config) {
        let relationModel = THINK.M(relation.model, config);
        if (relationModel.trueTableName) {
            let relationTableName = relationModel.trueTableName;
            let field = relation.field || relationTableName;
            let columnName = relation.columnName || table;
            if (scope.fields[field] || relationModel.fields[columnName]) {
                throw new Error(`${ scope.modelName } or ${ relationModel.modelName } Model class relation field or relation columnName duplicate definitions, check to ensure no repeat this.fields named above`);
            }
            scope.fields[field] = {
                collection: relationTableName,
                via: columnName,
                dominant: true
            };
            relationModel.fields[columnName] = {
                collection: table,
                via: field
            };
            return { table: relationTableName, relfield: field, fields: relationModel.fields };
        } else {
            return {};
        }
    }

    /**
     * 错误封装
     * @param err
     */
    error(err) {
        let msg = err || '';
        if (!THINK.isError(msg)) {
            if (!THINK.isString(msg)) {
                msg = (0, _stringify2.default)(msg);
            }
            msg = new Error(msg);
        }

        let stack = msg.message;
        // connection error
        if (~stack.indexOf('connect') || ~stack.indexOf('ECONNREFUSED')) {
            this.close(this.adapterKey);
        }
        return _promise2.default.reject(msg);
    }

    /**
     * 关闭数据链接
     * @returns {Promise}
     */
    close(adapterKey) {
        let adapters = this.dbOptions.adapters || {};
        if (adapterKey) {
            if (THINK.INSTANCES.DB[adapterKey]) {
                THINK.INSTANCES.DB[adapterKey] = null;
                //THINK.ORM[adapterKey] = null;
            }
            let promise = new _promise2.default(resolve => {
                if (this.dbOptions.connections[adapterKey] && this.dbOptions.connections[adapterKey].adapter) {
                    adapters[this.dbOptions.connections[adapterKey].adapter].teardown(null, resolve);
                }
                resolve(null);
            });
            return promise;
        } else {
            let promises = [];
            THINK.INSTANCES.DB = {};
            THINK.ORM = {};
            (0, _keys2.default)(adapters).forEach(function (adp) {
                if (adapters[adp].teardown) {
                    let promise = new _promise2.default(function (resolve) {
                        adapters[adp].teardown(null, resolve);
                    });
                    promises.push(promise);
                }
            });
            return _promise2.default.all(promises);
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
        options.tableName = options.tableName || this.getTableName();
        //表前缀，Db里会使用
        options.tablePrefix = this.tablePrefix;
        options.modelName = this.getModelName();

        return options;
    }

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @returns {*}
     */
    parseData(data, options) {
        let preCheck = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        if (preCheck) {
            if (THINK.isEmpty(data)) {
                return data;
            }
            //根据模型定义字段类型进行数据检查
            let result = [];
            for (let field in data) {
                if (this.fields[field] && this.fields[field].type) {
                    switch (this.fields[field].type) {
                        case 'integer':
                            !THINK.isNumber(data[field]) && !THINK.isNumberString(data[field]) && result.push(`${ field }值类型错误`);
                            break;
                        case 'float':
                            !THINK.isNumber(data[field]) && !THINK.isNumberString(data[field]) && result.push(`${ field }值类型错误`);
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
            //根据规则自动验证数据
            if (options.verify) {
                if (THINK.isEmpty(this.validations)) {
                    return data;
                }
                let field,
                    value,
                    checkData = [];
                for (field in this.validations) {
                    value = THINK.extend(this.validations[field], { name: field, value: data[field] });
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
                return this.error((0, _values2.default)(result)[0]);
            }

            return data;
        } else {
            if (THINK.isJSONObj(data)) {
                return data;
            } else {
                return JSON.parse((0, _stringify2.default)(data));
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
    verify() {
        let flag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        this._options.verify = !!flag;
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
            if (order.indexOf(',')) {
                let strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","').replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
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
    rel() {
        let table = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (THINK.isBoolean(table)) {
            if (table === false) {
                this._options.rel = [];
            } else {
                this._options.rel = true;
            }
        } else {
            if (THINK.isString(table)) {
                table = table.replace(/ +/g, '').split(',');
            }
            this._options.rel = THINK.isArray(table) ? table : [];
        }

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
        this._options.select = fields;
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
        return _promise2.default.resolve(data);
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (THINK.isEmpty(data)) {
                    return _this3.error('_DATA_TYPE_INVALID_');
                }
                //parse options
                let parsedOptions = _this3.parseOptions(options);
                // init model
                let model = yield _this3.initDb();
                //copy data
                _this3._data = THINK.extend({}, data);
                _this3._data = yield _this3._beforeAdd(_this3._data, parsedOptions);
                _this3._data = yield _this3.parseData(_this3._data, parsedOptions);
                let result = yield model.create(_this3._data).catch(function (e) {
                    return _this3.error(`${ _this3.modelName }:${ e.message }`);
                });
                let pk = yield _this3.getPk();
                _this3._data[pk] = _this3._data[pk] ? _this3._data[pk] : result[pk];
                yield _this3._afterAdd(_this3._data, parsedOptions);
                return _this3._data[pk];
            } catch (e) {
                return _this3.error(e);
            }
        })();
    }

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterAdd(data, options) {
        return _promise2.default.resolve(data);
    }

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */
    addAll(data, options) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (!THINK.isArray(data) || !THINK.isObject(data[0])) {
                    return _this4.error('_DATA_TYPE_INVALID_');
                }
                //parse options
                let parsedOptions = _this4.parseOptions(options);
                // init model
                let model = yield _this4.initDb();
                //copy data
                _this4._data = THINK.extend([], data);

                let promisesd = _this4._data.map(function (item) {
                    return _this4._beforeAdd(item, parsedOptions);
                });
                _this4._data = yield _promise2.default.all(promisesd);

                let promiseso = _this4._data.map(function (item) {
                    return _this4.parseData(item, parsedOptions);
                });
                _this4._data = yield _promise2.default.all(promiseso);

                let result = yield model.createEach(_this4._data).catch(function (e) {
                    return _this4.error(`${ _this4.modelName }:${ e.message }`);
                });
                if (!THINK.isEmpty(result) && THINK.isArray(result)) {
                    let pk = yield _this4.getPk(),
                        resData = [];
                    result.forEach(function (v) {
                        resData.push(_this4._afterAdd(v[pk], parsedOptions).then(function () {
                            return v[pk];
                        }));
                    });
                    return _promise2.default.all(resData);
                } else {
                    return [];
                }
            } catch (e) {
                return _this4.error(e);
            }
        })();
    }

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeDelete(options) {
        return _promise2.default.resolve(options);
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this5.parseOptions(options);
                // init model
                let model = yield _this5.initDb();
                yield _this5._beforeDelete(parsedOptions);
                let result = yield model.destroy(_this5.parseDeOptions(parsedOptions)).catch(function (e) {
                    return _this5.error(`${ _this5.modelName }:${ e.message }`);
                });
                yield _this5._afterDelete(parsedOptions.where || {});
                if (!THINK.isEmpty(result) && THINK.isArray(result)) {
                    let pk = yield _this5.getPk(),
                        affectedRows = [];
                    result.forEach(function (v) {
                        affectedRows.push(v[pk]);
                    });
                    return affectedRows;
                } else {
                    return [];
                }
            } catch (e) {
                return _this5.error(e);
            }
        })();
    }

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */
    _afterDelete(options) {
        return _promise2.default.resolve(options);
    }

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeUpdate(data, options) {
        return _promise2.default.resolve(data);
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (THINK.isEmpty(data)) {
                    return _this6.error('_DATA_TYPE_INVALID_');
                }
                //parse options
                let parsedOptions = _this6.parseOptions(options);
                // init model
                let model = yield _this6.initDb();
                //copy data
                _this6._data = THINK.extend({}, data);

                _this6._data = yield _this6._beforeUpdate(_this6._data, parsedOptions);
                _this6._data = yield _this6.parseData(_this6._data, parsedOptions);
                let pk = yield _this6.getPk();
                if (THINK.isEmpty(parsedOptions.where)) {
                    // 如果存在主键数据 则自动作为更新条件
                    if (!THINK.isEmpty(_this6._data[pk])) {
                        parsedOptions.where = THINK.getObject(pk, _this6._data[pk]);
                        delete _this6._data[pk];
                    } else {
                        return _this6.error('_OPERATION_WRONG_');
                    }
                } else {
                    if (!THINK.isEmpty(_this6._data[pk])) {
                        delete _this6._data[pk];
                    }
                }
                let result = yield model.update(parsedOptions, _this6._data).catch(function (e) {
                    return _this6.error(`${ _this6.modelName }:${ e.message }`);
                });
                yield _this6._afterUpdate(_this6._data, parsedOptions);
                let affectedRows = [];
                if (!THINK.isEmpty(result) && THINK.isArray(result)) {
                    result.forEach(function (v) {
                        affectedRows.push(v[pk]);
                    });
                    return affectedRows;
                } else {
                    return [];
                }
            } catch (e) {
                return _this6.error(e);
            }
        })();
    }

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterUpdate(data, options) {
        return _promise2.default.resolve(data);
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this7.parseOptions(options, { limit: 1 });
                // init model
                let model = yield _this7.initDb();

                let result = {};
                if (!THINK.isEmpty(_this7.relation)) {
                    let process = model.find(_this7.parseDeOptions(parsedOptions));
                    if (!THINK.isEmpty(_this7._relationLink) && !THINK.isEmpty(parsedOptions.rel)) {
                        _this7._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process;
                } else {
                    result = yield model.find(_this7.parseDeOptions(parsedOptions));
                }
                //Formatting Data
                result = yield _this7.parseData(result, parsedOptions, false);
                result = THINK.isArray(result) ? result[0] : result;
                return _this7._afterFind(result || {}, parsedOptions);
            } catch (e) {
                return _this7.error(e);
            }
        })();
    }

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */
    _afterFind(result, options) {
        return _promise2.default.resolve(result);
    }

    /**
     * 查询数据条数
     * @param options
     * @returns {*}
     */
    count(options) {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this8.parseOptions(options);
                // init model
                let model = yield _this8.initDb();

                let result = {};
                result = yield model.count(_this8.parseDeOptions(parsedOptions));

                //Formatting Data
                result = yield _this8.parseData(result, parsedOptions, false);
                return result || 0;
            } catch (e) {
                return _this8.error(e);
            }
        })();
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    sum(field, options) {
        var _this9 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this9.parseOptions(options);
                // init model
                let model = yield _this9.initDb();

                let result = {};
                let pk = yield _this9.getPk();
                field = field || pk;
                if (!THINK.isEmpty(_this9.relation)) {
                    let process = model.find(_this9.parseDeOptions(parsedOptions));
                    if (!THINK.isEmpty(_this9._relationLink) && !THINK.isEmpty(parsedOptions.rel)) {
                        _this9._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.sum(field);
                } else {
                    result = yield model.find(_this9.parseDeOptions(parsedOptions)).sum(field);
                }
                //Formatting Data
                result = yield _this9.parseData(result, parsedOptions, false);
                result = THINK.isArray(result) ? result[0] : result;
                return result[field] || 0;
            } catch (e) {
                return _this9.error(e);
            }
        })();
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    max(field, options) {
        var _this10 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this10.parseOptions(options);
                // init model
                let model = yield _this10.initDb();

                let result = {};
                let pk = yield _this10.getPk();
                field = field || pk;
                if (!THINK.isEmpty(_this10.relation)) {
                    let process = model.find(_this10.parseDeOptions(parsedOptions));
                    if (!THINK.isEmpty(_this10._relationLink) && !THINK.isEmpty(parsedOptions.rel)) {
                        _this10._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.max(field);
                } else {
                    result = yield model.find(_this10.parseDeOptions(parsedOptions)).max(field);
                }
                //Formatting Data
                result = yield _this10.parseData(result, parsedOptions, false);
                result = THINK.isArray(result) ? result[0] : result;
                return result[field];
            } catch (e) {
                return _this10.error(e);
            }
        })();
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    min(field, options) {
        var _this11 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this11.parseOptions(options);
                // init model
                let model = yield _this11.initDb();

                let result = {};
                let pk = yield _this11.getPk();
                field = field || pk;
                if (!THINK.isEmpty(_this11.relation)) {
                    let process = model.find(_this11.parseDeOptions(parsedOptions));
                    if (!THINK.isEmpty(_this11._relationLink) && !THINK.isEmpty(parsedOptions.rel)) {
                        _this11._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.min(field);
                } else {
                    result = yield model.find(_this11.parseDeOptions(parsedOptions)).min(field);
                }
                //Formatting Data
                result = yield _this11.parseData(result, parsedOptions, false);
                result = THINK.isArray(result) ? result[0] : result;
                return result[field];
            } catch (e) {
                return _this11.error(e);
            }
        })();
    }

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */
    avg(field, options) {
        var _this12 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this12.parseOptions(options);
                // init model
                let model = yield _this12.initDb();

                let result = {};
                let pk = yield _this12.getPk();
                field = field || pk;
                if (!THINK.isEmpty(_this12.relation)) {
                    let process = model.find(_this12.parseDeOptions(parsedOptions));
                    if (!THINK.isEmpty(_this12._relationLink) && !THINK.isEmpty(parsedOptions.rel)) {
                        _this12._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.average(field);
                } else {
                    result = yield model.find(_this12.parseDeOptions(parsedOptions)).average(field);
                }
                //Formatting Data
                result = yield _this12.parseData(result, parsedOptions, false);
                result = THINK.isArray(result) ? result[0] : result;
                return result[field] || 0;
            } catch (e) {
                return _this12.error(e);
            }
        })();
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options) {
        var _this13 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this13.parseOptions(options);
                // init model
                let model = yield _this13.initDb();

                let result = {};
                if (!THINK.isEmpty(_this13.relation)) {
                    let process = model.find(_this13.parseDeOptions(parsedOptions));
                    if (!THINK.isEmpty(_this13._relationLink) && !THINK.isEmpty(parsedOptions.rel)) {
                        _this13._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process;
                } else {
                    result = yield model.find(_this13.parseDeOptions(parsedOptions));
                }
                //Formatting Data
                result = yield _this13.parseData(result, parsedOptions, false);
                return _this13._afterSelect(result || {}, parsedOptions);
            } catch (e) {
                return _this13.error(e);
            }
        })();
    }

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterSelect(result, options) {
        return _promise2.default.resolve(result);
    }

    /**
     * 返回数据里含有count信息的查询
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */
    countSelect(options, pageFlag) {
        var _this14 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (THINK.isBoolean(options)) {
                    pageFlag = options;
                    options = {};
                }
                //parse options
                let parsedOptions = _this14.parseOptions(options);
                // init model
                let model = yield _this14.initDb();

                let count = yield _this14.count(parsedOptions);
                let pageOptions = _this14.parsePage(parsedOptions);
                let totalPage = Math.ceil(count / pageOptions.num);
                if (THINK.isBoolean(pageFlag)) {
                    if (pageOptions.page > totalPage) {
                        pageOptions.page = pageFlag === true ? 1 : totalPage;
                    }
                    parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                }
                //传入分页参数
                _this14.limit(pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
                let result = THINK.extend(false, { count: count, total: totalPage }, pageOptions);
                if (!parsedOptions.page) {
                    parsedOptions.page = pageOptions.page;
                }
                result.data = yield _this14.select(parsedOptions);
                //Formatting Data
                result = yield _this14.parseData(result, parsedOptions, false);
                return result;
            } catch (e) {
                return _this14.error(e);
            }
        })();
    }

    /**
     * 原生语句查询
     * mysql  THINK.M('Test',[config]).query('select * from test');
     * mongo  THINK.M('Test',[config]).query('db.test.find()');
     * @param sqlStr
     */
    query(sqlStr) {
        var _this15 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //safe mode
                _this15.config.db_ext_config.safe = true;
                // init model
                let model = yield _this15.initDb();
                let process = null,
                    result = [];
                if (_this15.config.db_type === 'mongo') {
                    let quer = sqlStr.split('.');
                    if (THINK.isEmpty(quer) || THINK.isEmpty(quer[0]) || quer[0] !== 'db' || THINK.isEmpty(quer[1])) {
                        return _this15.error('query language error');
                    }
                    quer.shift();
                    let tableName = quer.shift();
                    if (tableName !== _this15.trueTableName) {
                        return _this15.error('table name error');
                    }
                    if (!THINK.INSTANCES.DB[_this15.adapterKey] || !THINK.INSTANCES.DB[_this15.adapterKey].collections || !THINK.INSTANCES.DB[_this15.adapterKey].collections[tableName]) {
                        return _this15.error('model init error');
                    }
                    model = THINK.INSTANCES.DB[_this15.adapterKey].collections[tableName];
                    let cls = THINK.promisify(model.native, model);
                    process = yield cls();

                    let func = new Function('process', 'return process.' + quer.join('.') + ';');
                    process = func(process);
                    process = new _promise2.default(function (reslove, reject) {
                        process.toArray(function (err, results) {
                            if (err) reject(err);
                            reslove(results);
                        });
                    });

                    result = yield process;
                } else if (_this15.config.db_type === 'mysql') {
                    let cls = THINK.promisify(model.query, _this15);
                    result = yield cls(sqlStr);
                } else if (_this15.config.db_type === 'postgresql') {
                    let cls = THINK.promisify(model.query, _this15);
                    result = yield cls(sqlStr);
                } else {
                    return _this15.error('adapter not supported this method');
                }
                //Formatting Data
                result = yield _this15.parseData(result, {}, false);
                return result;
            } catch (e) {
                return _this15.error(e);
            }
        })();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/26
    */