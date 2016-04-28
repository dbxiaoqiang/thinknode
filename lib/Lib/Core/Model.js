'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.trueTableName = '_temp';
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
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //安全模式
        this.safe = this.config.db_ext_config.safe === true ? true : false;
        //配置hash
        this.adapterKey = hash(`${ this.config.db_type }_${ this.config.db_host }_${ this.config.db_port }_${ this.config.db_name }`);
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
        if (!this.dbOptions.adapters[this.config.db_type]) {
            this.dbOptions.adapters[this.config.db_type] = thinkRequire(`sails-${ this.config.db_type }`);
        }
        //数据源链接配置
        this.dbOptions.connections[this.adapterKey] = {
            adapter: this.config.db_type,
            host: this.config.db_host,
            port: this.config.db_port,
            database: this.config.db_name,
            user: this.config.db_user,
            password: this.config.db_pwd,
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
                if (instances && !instances.collections[_this.trueTableName]) {
                    //先关闭连接,以备重新初始化
                    yield _this.close(_this.adapterKey);
                    instances = null;
                }
                if (!instances) {
                    if (!_this.dbOptions.adapters[_this.config.db_type]) {
                        return _this.error(`adapters is not installed. please run 'npm install sails-${ _this.config.db_type }'`);
                    }
                    yield _this.setCollections();
                    let schema = THINK.ORM[_this.adapterKey]['thinkschema'];
                    for (let v in schema) {
                        THINK.ORM[_this.adapterKey].loadCollection(schema[v]);
                    }
                    let inits = promisify(THINK.ORM[_this.adapterKey].initialize, THINK.ORM[_this.adapterKey]);
                    instances = yield inits(_this.dbOptions);
                    THINK.INSTANCES.DB[_this.adapterKey] = instances;
                }
                _this._relationLink = THINK.ORM[_this.adapterKey]['thinkrelation'][_this.trueTableName];
                _this.model = instances.collections[_this.trueTableName];
                return _this.model || E('connection initialize faild.');
            } catch (e) {
                return _this.error(e);
            }
        })();
    }

    /**
     * 加载collections
     * @returns {*}
     */
    setCollections() {
        //fields filter
        let allowAttr = { type: 1, size: 1, defaultsTo: 1, required: 1, unique: 1, index: 1, columnName: 1 };
        for (let f in this.fields) {
            (k => {
                for (let arr in this.fields[k]) {
                    if (!allowAttr[arr]) {
                        delete this.fields[k][arr];
                    }
                }
                if (isEmpty(this.fields[k])) {
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
        if (!isEmpty(this.relation)) {
            let _config = extend(false, {}, this.config);
            THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName] = this.setRelation(this.trueTableName, this.relation, _config) || [];
        }
        if (THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName]) {
            THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = extend(THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName], this.fields);
        } else {
            THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = extend({}, this.fields);
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
            schema: true,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            attributes: fields
        };
        //安全模式下ORM不会实时映射修改数据库表
        if (this.safe || !THINK.APP_DEBUG) {
            schema.migrate = 'safe';
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
        if (!isArray(relation)) {
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
            let type = rel.type && ! ~['1', '2', '3'].indexOf(rel.type + '') ? (rel.type + '').toUpperCase() : rel.type;
            if (type && type in caseList) {
                relationObj = caseList[type](scope, table, rel, config);
                if (relationObj.table) {
                    relationList.push({ table: relationObj.table, relfield: relationObj.relfield });
                    if (THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table]) {
                        THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table] = extend(THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table], relationObj.fields);
                    } else {
                        THINK.ORM[this.adapterKey]['thinkfields'][relationObj.table] = extend({}, relationObj.fields);
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
        let relationModel = M(relation.model, config);
        if (relationModel.trueTableName) {
            let relationTableName = relationModel.trueTableName;
            let field = relation.field || relationTableName;
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
        let relationModel = M(relation.model, config);
        if (relationModel.trueTableName) {
            let relationTableName = relationModel.trueTableName;
            let field = relation.field || relationTableName;
            let columnName = relation.columnName || table;
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
        let relationModel = M(relation.model, config);
        if (relationModel.trueTableName) {
            let relationTableName = relationModel.trueTableName;
            let field = relation.field || relationTableName;
            let columnName = relation.columnName || table;
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
    error() {
        let err = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        let stack = isError(err) ? err.message : err.toString();
        // connection error
        if (~stack.indexOf('connect') || ~stack.indexOf('ECONNREFUSED')) {
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
        if (adapter) {
            if (THINK.INSTANCES.DB[adapter]) {
                THINK.INSTANCES.DB[adapter] = null;
                //THINK.ORM[adapter] = null;
            }
            let promise = new _promise2.default(resolve => {
                if (this.dbOptions.connections[adapter] && this.dbOptions.connections[adapter].adapter) {
                    adapters[this.dbOptions.connections[adapter].adapter].teardown(null, resolve);
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
     * @param data
     * @param preCheck
     * @returns {*}
     */
    parseData(data) {
        let preCheck = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        if (preCheck) {
            //因为会对data进行修改，所以这里需要深度拷贝
            data = extend({}, data);
            if (isEmpty(this.validations) || isEmpty(data)) {
                return data;
            }
            let field,
                value,
                checkData = [];
            for (field in this.validations) {
                value = extend({}, this.validations[field], { name: field, value: data[field] });
                checkData.push(value);
            }
            if (isEmpty(checkData)) {
                return data;
            }
            let result = (0, _Valid2.default)(checkData);
            if (isEmpty(result)) {
                return data;
            }
            return this.error(result);
        } else {
            if (isJSONObj(data)) {
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
            order = extend(false, {}, order);
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
                let strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, "").replace(/ +$/, "").replace(/( +, +)+|( +,)+|(, +)/, ",").replace(/ +/g, "-").replace(/,-/g, ",").replace(/-/g, ":").replace(/^/, "{\"").replace(/$/, "\"}").replace(/:/g, "\":\"").replace(/,/g, "\",\"").replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
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

        if (isBoolean(table)) {
            if (table === false) {
                this._options.rel = [];
            } else {
                this._options.rel = true;
            }
        } else {
            if (isString(table)) {
                table = table.replace(/ +/g, "").split(',');
            }
            this._options.rel = isArray(table) ? table : [];
        }

        return this;
    }

    /**
     * 要查询的字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */
    field(fields) {
        if (isEmpty(fields)) {
            return this;
        }
        if (isString(fields)) {
            fields = fields.replace(/ +/g, "").split(',');
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
        return _promise2.default.resolve(data);
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (isEmpty(data)) {
                    return _this2.error('_DATA_TYPE_INVALID_');
                }
                //parse options
                let parsedOptions = _this2.parseOptions(options);
                // init model
                let model = yield _this2.initDb();
                //copy data
                _this2._data = {};

                _this2._data = yield _this2._beforeAdd(data, parsedOptions);
                //解析后的数据
                let parsedData = yield _this2.parseData(_this2._data);
                let result = yield model.create(parsedData).catch(function (e) {
                    return E(`${ _this2.modelName }:${ e.message }`);
                });
                let pk = yield _this2.getPk();
                parsedData[pk] = parsedData[pk] ? parsedData[pk] : result[pk];
                yield _this2._afterAdd(parsedData, parsedOptions);
                return parsedData[pk];
            } catch (e) {
                return _this2.error(e);
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
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (!isArray(data) || !isObject(data[0])) {
                    return _this3.error('_DATA_TYPE_INVALID_');
                }
                //parse options
                let parsedOptions = _this3.parseOptions(options);
                // init model
                let model = yield _this3.initDb();
                //copy data
                _this3._data = {};

                let promiseso = data.map(function (item) {
                    return _this3._beforeAdd(item, parsedOptions);
                });
                _this3._data = yield _promise2.default.all(promiseso);
                let promisesd = _this3._data.map(function (item) {
                    return _this3.parseData(item);
                });
                let parsedData = yield _promise2.default.all(promisesd);

                let result = yield model.createEach(parsedData).catch(function (e) {
                    return E(`${ _this3.modelName }:${ e.message }`);
                });
                if (!isEmpty(result) && isArray(result)) {
                    let pk = yield _this3.getPk(),
                        resData = [];
                    result.forEach(function (v) {
                        resData.push(_this3._afterAdd(v[pk], parsedOptions).then(function () {
                            return v[pk];
                        }));
                    });
                    return _promise2.default.all(resData);
                } else {
                    return [];
                }
            } catch (e) {
                return _this3.error(e);
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
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this4.parseOptions(options);
                // init model
                let model = yield _this4.initDb();
                //copy data
                _this4._data = {};

                yield _this4._beforeDelete(parsedOptions);
                let result = yield model.destroy(_this4.parseDeOptions(parsedOptions)).catch(function (e) {
                    return E(`${ _this4.modelName }:${ e.message }`);
                });
                yield _this4._afterDelete(parsedOptions.where || {});
                if (!isEmpty(result) && isArray(result)) {
                    let pk = yield _this4.getPk(),
                        affectedRows = [];
                    result.forEach(function (v) {
                        affectedRows.push(v[pk]);
                    });
                    return affectedRows;
                } else {
                    return [];
                }
            } catch (e) {
                return _this4.error(e);
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
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (isEmpty(data)) {
                    return _this5.error('_DATA_TYPE_INVALID_');
                }
                //parse options
                let parsedOptions = _this5.parseOptions(options);
                // init model
                let model = yield _this5.initDb();
                //copy data
                _this5._data = {};

                _this5._data = yield _this5._beforeUpdate(data, parsedOptions);
                let parsedData = yield _this5.parseData(_this5._data);
                let pk = yield _this5.getPk();
                if (isEmpty(parsedOptions.where)) {
                    // 如果存在主键数据 则自动作为更新条件
                    if (!isEmpty(parsedData[pk])) {
                        parsedOptions.where = getObject(pk, data[pk]);
                        delete parsedData[pk];
                    } else {
                        return _this5.error('_OPERATION_WRONG_');
                    }
                } else {
                    if (!isEmpty(parsedData[pk])) {
                        delete parsedData[pk];
                    }
                }
                let result = yield model.update(parsedOptions, parsedData).catch(function (e) {
                    return E(`${ _this5.modelName }:${ e.message }`);
                });
                yield _this5._afterUpdate(parsedData, parsedOptions);
                let affectedRows = [];
                if (!isEmpty(result) && isArray(result)) {
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
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this6.parseOptions(options, { limit: 1 });
                // init model
                let model = yield _this6.initDb();

                let result = {};
                if (!isEmpty(_this6.relation)) {
                    let process = model.find(_this6.parseDeOptions(parsedOptions));
                    if (!isEmpty(_this6._relationLink) && !isEmpty(parsedOptions.rel)) {
                        _this6._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process;
                } else {
                    result = yield model.find(_this6.parseDeOptions(parsedOptions));
                }
                //Formatting Data
                result = yield _this6.parseData(result, false);
                result = isArray(result) ? result[0] : result;
                return _this6._afterFind(result || {}, parsedOptions);
            } catch (e) {
                return _this6.error(e);
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
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this7.parseOptions(options);
                // init model
                let model = yield _this7.initDb();

                let result = {};
                result = yield model.count(_this7.parseDeOptions(parsedOptions));

                //Formatting Data
                result = yield _this7.parseData(result, false);
                return result || 0;
            } catch (e) {
                return _this7.error(e);
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
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this8.parseOptions(options);
                // init model
                let model = yield _this8.initDb();

                let result = {};
                let pk = yield _this8.getPk();
                field = field || pk;
                if (!isEmpty(_this8.relation)) {
                    let process = model.find(_this8.parseDeOptions(parsedOptions));
                    if (!isEmpty(_this8._relationLink) && !isEmpty(parsedOptions.rel)) {
                        _this8._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.sum(field);
                } else {
                    result = yield model.find(_this8.parseDeOptions(parsedOptions)).sum(field);
                }
                //Formatting Data
                result = yield _this8.parseData(result, false);
                result = isArray(result) ? result[0] : result;
                return result[field] || 0;
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
    max(field, options) {
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
                if (!isEmpty(_this9.relation)) {
                    let process = model.find(_this9.parseDeOptions(parsedOptions));
                    if (!isEmpty(_this9._relationLink) && !isEmpty(parsedOptions.rel)) {
                        _this9._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.max(field);
                } else {
                    result = yield model.find(_this9.parseDeOptions(parsedOptions)).max(field);
                }
                //Formatting Data
                result = yield _this9.parseData(result, false);
                result = isArray(result) ? result[0] : result;
                return result[field];
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
    min(field, options) {
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
                if (!isEmpty(_this10.relation)) {
                    let process = model.find(_this10.parseDeOptions(parsedOptions));
                    if (!isEmpty(_this10._relationLink) && !isEmpty(parsedOptions.rel)) {
                        _this10._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.min(field);
                } else {
                    result = yield model.find(_this10.parseDeOptions(parsedOptions)).min(field);
                }
                //Formatting Data
                result = yield _this10.parseData(result, false);
                result = isArray(result) ? result[0] : result;
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
    avg(field, options) {
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
                if (!isEmpty(_this11.relation)) {
                    let process = model.find(_this11.parseDeOptions(parsedOptions));
                    if (!isEmpty(_this11._relationLink) && !isEmpty(parsedOptions.rel)) {
                        _this11._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process.average(field);
                } else {
                    result = yield model.find(_this11.parseDeOptions(parsedOptions)).average(field);
                }
                //Formatting Data
                result = yield _this11.parseData(result, false);
                result = isArray(result) ? result[0] : result;
                return result[field] || 0;
            } catch (e) {
                return _this11.error(e);
            }
        })();
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options) {
        var _this12 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //parse options
                let parsedOptions = _this12.parseOptions(options);
                // init model
                let model = yield _this12.initDb();

                let result = {};
                if (!isEmpty(_this12.relation)) {
                    let process = model.find(_this12.parseDeOptions(parsedOptions));
                    if (!isEmpty(_this12._relationLink) && !isEmpty(parsedOptions.rel)) {
                        _this12._relationLink.forEach(function (v) {
                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                process = process.populate(v.relfield);
                            }
                        });
                    }
                    result = yield process;
                } else {
                    result = yield model.find(_this12.parseDeOptions(parsedOptions));
                }
                //Formatting Data
                result = yield _this12.parseData(result, false);
                return _this12._afterSelect(result || {}, parsedOptions);
            } catch (e) {
                return _this12.error(e);
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
        var _this13 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (isBoolean(options)) {
                    pageFlag = options;
                    options = {};
                }
                //parse options
                let parsedOptions = _this13.parseOptions(options);
                // init model
                let model = yield _this13.initDb();

                let count = yield _this13.count(parsedOptions);
                let pageOptions = _this13.parsePage(parsedOptions);
                let totalPage = Math.ceil(count / pageOptions.num);
                if (isBoolean(pageFlag)) {
                    if (pageOptions.page > totalPage) {
                        pageOptions.page = pageFlag === true ? 1 : totalPage;
                    }
                    parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                }
                //传入分页参数
                _this13.limit(pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
                let result = extend({ count: count, total: totalPage }, pageOptions);
                if (!parsedOptions.page) {
                    parsedOptions.page = pageOptions.page;
                }
                result.data = yield _this13.select(parsedOptions);
                //Formatting Data
                result = yield _this13.parseData(result, false);
                return result;
            } catch (e) {
                return _this13.error(e);
            }
        })();
    }

    /**
     * 原生语句查询
     * mysql  M('Test',[config]).query('select * from test');
     * mongo  M('Test',[config]).query('db.test.find()');
     * @param sqlStr
     */
    query(sqlStr) {
        var _this14 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                //safe mode
                _this14.config.db_ext_config.safe = true;
                // init model
                let model = yield _this14.initDb();
                let process = null,
                    result = [];
                if (_this14.config.db_type === 'mongo') {
                    let quer = sqlStr.split('.');
                    if (isEmpty(quer) || isEmpty(quer[0]) || quer[0] !== 'db' || isEmpty(quer[1])) {
                        return _this14.error('query language error');
                    }
                    quer.shift();
                    let tableName = quer.shift();
                    if (tableName !== _this14.trueTableName) {
                        return _this14.error('table name error');
                    }
                    if (!THINK.INSTANCES.DB[_this14.adapterKey] || !THINK.INSTANCES.DB[_this14.adapterKey].collections || !THINK.INSTANCES.DB[_this14.adapterKey].collections[tableName]) {
                        return _this14.error('model init error');
                    }
                    model = THINK.INSTANCES.DB[_this14.adapterKey].collections[tableName];
                    let cls = promisify(model.native, model);
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
                } else if (_this14.config.db_type === 'mysql') {
                    let cls = promisify(model.query, _this14);
                    result = yield cls(sqlStr);
                } else if (_this14.config.db_type === 'postgresql') {
                    let cls = promisify(model.query, _this14);
                    result = yield cls(sqlStr);
                } else {
                    return _this14.error('adapter not supported this method');
                }
                //Formatting Data
                result = yield _this14.parseData(result, false);
                return result;
            } catch (e) {
                return _this14.error(e);
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