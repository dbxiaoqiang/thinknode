/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Array$of = require('babel-runtime/core-js/array/of')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _waterline = require('waterline');

var _waterline2 = _interopRequireDefault(_waterline);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _UtilValid = require('../Util/Valid');

var _UtilValid2 = _interopRequireDefault(_UtilValid);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init(name) {
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // 当前数据库操作对象
        this.db = null;
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
        // 数据源key
        this.adapterKey = '';
        // 数据源配置
        this.dbOptions = {};
        // 是否迁移(安全模式)
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
        //配置hash
        this.adapterKey = hash('["' + this.config.db_type + '", "' + this.config.db_host + '", "' + this.config.db_port + '", "' + this.config.db_name + '", "' + this.trueTableName + '"]');
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
            this.dbOptions.adapters[this.config.db_type] = thinkRequire('sails-' + this.config.db_type);
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
    };

    /**
     * 初始化数据模型
     * @returns {*|Promise.<T>}
     */

    _default.prototype.initDb = function initDb() {
        var instances, schema, v, inits;
        return _regeneratorRuntime.async(function initDb$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;
                    instances = THINK.INSTANCES.DB[this.adapterKey];

                    if (instances) {
                        context$2$0.next = 12;
                        break;
                    }

                    context$2$0.next = 5;
                    return _regeneratorRuntime.awrap(this.setCollections());

                case 5:
                    schema = THINK.ORM[this.adapterKey]['thinkschema'];

                    for (v in schema) {
                        THINK.ORM[this.adapterKey].loadCollection(schema[v]);
                    }
                    inits = promisify(THINK.ORM[this.adapterKey].initialize, THINK.ORM[this.adapterKey]);
                    context$2$0.next = 10;
                    return _regeneratorRuntime.awrap(inits(this.dbOptions));

                case 10:
                    THINK.INSTANCES.DB[this.adapterKey] = context$2$0.sent;

                    instances = THINK.INSTANCES.DB[this.adapterKey];

                case 12:
                    this._relationLink = THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName];
                    this.model = instances.collections[this.trueTableName];
                    return context$2$0.abrupt('return', this.model);

                case 17:
                    context$2$0.prev = 17;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 20:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 17]]);
    };

    /**
     * 生成schema
     * @param table
     * @param fields
     * @returns {type[]|void}
     */

    _default.prototype.setSchema = function setSchema(table, fields) {
        //初始化attributes
        if (isEmpty(this.fields) && this.modelName !== '_temp') {
            return this.error('Model\'s attributes is undefined');
        }
        var schema = {
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
        return _waterline2['default'].Collection.extend(schema);
    };

    /**
     * 加载collections
     * @param init
     * @returns {*}
     */

    _default.prototype.setCollections = function setCollections() {
        var init = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (!THINK.ORM[this.adapterKey]) {
            THINK.ORM[this.adapterKey] = new _waterline2['default']();
            THINK.ORM[this.adapterKey]['thinkschema'] = {};
            THINK.ORM[this.adapterKey]['thinkrelation'] = {};
        }
        //表关联关系
        if (!isEmpty(this.relation)) {
            var _config = extend(false, {}, this.config);
            THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName] = this.setRelation(this.trueTableName, this.relation, _config) || [];
        }
        if (init === true || !THINK.ORM[this.adapterKey]['thinkschema'][this.trueTableName]) {
            THINK.ORM[this.adapterKey]['thinkschema'][this.trueTableName] = this.setSchema(this.trueTableName, this.fields);
        }
        return THINK.ORM[this.adapterKey];
    };

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

    _default.prototype.setRelation = function setRelation(table, relation, config) {
        var _this = this;

        var relationObj = {},
            relationList = [];
        if (!isArray(relation)) {
            relation = _Array$of(relation);
        }
        relation.forEach(function (rel) {
            var type = rel.type;
            if (!isEmpty(type)) {
                if (['1', '2', '3'].indexOf(type.toString()) < 0) {
                    switch (type.toUpperCase()) {
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
                        relationObj = _this._getHasOneRelation(table, _this.fields, rel, config);
                        break;
                    case 2:
                        relationObj = _this._getHasManyRelation(table, _this.fields, rel, config);
                        break;
                    case 3:
                        relationObj = _this._getManyToManyRelation(table, _this.fields, rel, config);
                        break;
                    default:
                        relationObj = _this._getHasOneRelation(table, _this.fields, rel, config);
                        break;
                }
                relationList.push(relationObj);
                THINK.ORM[_this.adapterKey]['thinkschema'][relationObj.table] = _this.setSchema(relationObj.table, relationObj.fields);
            }
        });
        return relationList;
    };

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @param config
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */

    _default.prototype._getHasOneRelation = function _getHasOneRelation(table, fields, relation, config) {
        var relationModel = D(relation.model, config);
        var relationTableName = relationModel.trueTableName;
        this.fields[relationTableName] = {
            model: relationTableName
        };
        return { table: relationTableName, fields: relationModel.fields };
    };

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @param config
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */

    _default.prototype._getHasManyRelation = function _getHasManyRelation(table, fields, relation, config) {
        var relationModel = D(relation.model, config);
        var relationTableName = relationModel.trueTableName;
        this.fields[relationTableName] = {
            collection: relationTableName,
            via: table
        };
        relationModel.fields[table] = {
            model: table
        };
        return { table: relationTableName, fields: relationModel.fields };
    };

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @param config
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */

    _default.prototype._getManyToManyRelation = function _getManyToManyRelation(table, fields, relation, config) {
        var relationModel = D(relation.model, config);
        var relationTableName = relationModel.trueTableName;
        this.fields[relationTableName] = {
            collection: relationTableName,
            via: table,
            dominant: true
        };
        relationModel.fields[table] = {
            collection: table,
            via: relationTableName
        };
        return { table: relationTableName, fields: relationModel.fields };
    };

    /**
     * 错误封装
     * @param err
     */

    _default.prototype.error = function error() {
        var err = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        var stack = isError(err) ? err.message : err.toString();
        // connection error
        if (stack.indexOf('connection') > -1 || stack.indexOf('ECONNREFUSED') > -1) {
            this.close(this.adapterKey);
        }
        return E(err);
    };

    /**
     * 关闭数据链接
     * @returns {Promise}
     */

    _default.prototype.close = function close(adapter) {
        var _this2 = this;

        var adapters = this.dbOptions.adapters || {};
        if (adapter) {
            if (THINK.INSTANCES.DB[adapter]) {
                THINK.INSTANCES.DB[adapter] = null;
            }
            var promise = new _Promise(function (resolve) {
                if (_this2.dbOptions.connections[adapter] && _this2.dbOptions.connections[adapter].adapter) {
                    adapters[_this2.dbOptions.connections[adapter].adapter].teardown(null, resolve);
                }
                resolve(null);
            });
            return promise;
        } else {
            var _ret = (function () {
                var promises = [];
                THINK.INSTANCES.DB = {};
                _Object$keys(adapters).forEach(function (adp) {
                    if (adapters[adp].teardown) {
                        var promise = new _Promise(function (resolve) {
                            adapters[adp].teardown(null, resolve);
                        });
                        promises.push(promise);
                    }
                });
                return {
                    v: _Promise.all(promises)
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        }
    };

    /**
     * 获取表名
     * @return {[type]} [description]
     */

    _default.prototype.getTableName = function getTableName() {
        if (!this.trueTableName) {
            var tableName = this.config.db_prefix || '';
            tableName += this.tableName || this.parseName(this.getModelName());
            this.trueTableName = tableName.toLowerCase();
        }
        return this.trueTableName;
    };

    /**
     * 获取模型名
     * @access public
     * @return string
     */

    _default.prototype.getModelName = function getModelName() {
        if (this.modelName) {
            return this.modelName;
        }
        var filename = this.__filename || __filename;
        var last = filename.lastIndexOf('/');
        this.modelName = filename.substr(last + 1, filename.length - last - 9);
        return this.modelName;
    };

    /**
     * 获取主键名称
     * @access public
     * @return string
     */

    _default.prototype.getPk = function getPk() {
        if (!isEmpty(this.fields)) {
            for (var v in this.fields) {
                if (this.fields[v].hasOwnProperty('primaryKey') && this.fields[v].primaryKey === true) {
                    this.pk = v;
                }
            }
        }
        return this.pk;
    };

    /**
     * 字符串命名风格转换
     * @param  {[type]} name [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */

    _default.prototype.parseName = function parseName(name) {
        name = name.trim();
        if (!name) {
            return name;
        }
        //首字母如果是大写，不转义为_x
        name = name[0].toLowerCase() + name.substr(1);
        return name.replace(/[A-Z]/g, function (a) {
            return '_' + a.toLowerCase();
        });
    };

    /**
     * 解析参数
     * @param  {[type]} options [description]
     * @return promise         [description]
     */

    _default.prototype.parseOptions = function parseOptions(oriOpts, extraOptions) {
        var self = this;
        var options = undefined;
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
    };

    /**
     * 检测数据是否合法
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */

    _default.prototype.parseData = function parseData(data) {
        //因为会对data进行修改，所以这里需要深度拷贝
        data = extend({}, data);
        if (isEmpty(this.validations) || isEmpty(data)) {
            return data;
        }
        var field = undefined,
            value = undefined,
            checkData = [];
        for (field in data) {
            if (field in this.validations) {
                value = extend({}, this.validations[field], { name: field, value: data[field] });
                checkData.push(value);
            }
        }
        if (isEmpty(checkData)) {
            return data;
        }
        var result = _UtilValid2['default'](checkData);
        if (isEmpty(result)) {
            return data;
        }
        return this.error(result);
    };

    /**
     * 解构参数
     * @param options
     */

    _default.prototype.parseDeOptions = function parseDeOptions(options) {
        var parsedOptions = extend({}, options);
        parsedOptions.hasOwnProperty('tableName') ? delete parsedOptions.tableName : '';
        parsedOptions.hasOwnProperty('tablePrefix') ? delete parsedOptions.tablePrefix : '';
        parsedOptions.hasOwnProperty('modelName') ? delete parsedOptions.modelName : '';
        parsedOptions.hasOwnProperty('page') ? delete parsedOptions.page : '';
        parsedOptions.hasOwnProperty('rel') ? delete parsedOptions.rel : '';
        return parsedOptions;
    };

    /**
     * 解析page参数
     * @param options
     * @returns {*}
     */

    _default.prototype.parsePage = function parsePage(options) {
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
    };

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */

    _default.prototype.limit = function limit(offset, length) {
        if (this.modelName === '_temp') {
            return this.error('This method is not support empty model');
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
    };

    /**
     * 排序
     * @param order
     * @returns {exports}
     */

    _default.prototype.order = function order(_order2) {
        if (this.modelName === '_temp') {
            return this.error('This method is not support empty model');
        }
        if (_order2 === undefined) {
            return this;
        }
        if (isObject(_order2)) {
            _order2 = extend({}, _order2);
            var _order = {};
            for (var v in _order2) {
                if (isNumber(_order2[v])) {
                    _order[v] = _order2[v];
                } else {
                    if (_order2[v].toLowerCase() === 'desc') {
                        _order[v] = 0;
                    } else if (_order2[v].toLowerCase() === 'asc') {
                        _order[v] = 1;
                    }
                }
            }
            if (!isEmpty(_order)) {
                this._options.sort = _order;
            }
        } else if (isString(_order2)) {
            if (_order2.indexOf(',')) {
                var strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, "").replace(/ +$/, "").replace(/( +, +)+|( +,)+|(, +)/, ",").replace(/ +/g, "-").replace(/,-/g, ",").replace(/-/g, ":").replace(/^/, "{\"").replace(/$/, "\"}").replace(/:/g, "\":\"").replace(/,/g, "\",\"").replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
                };
                this._options.sort = JSON.parse(strToObj(_order2));
            } else {
                this._options.sort = _order2;
            }
        }
        return this;
    };

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */

    _default.prototype.page = function page(_page, listRows) {
        if (this.modelName === '_temp') {
            return this.error('This method is not support empty model');
        }
        if (_page === undefined) {
            return this;
        }
        this._options.page = listRows === undefined ? _page : _page + ',' + listRows;
        return this;
    };

    /**
     * 指定关联操作的表
     * @param table
     */

    _default.prototype.rel = function rel() {
        var table = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

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
    };

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */

    _default.prototype.field = function field(_field) {
        if (this.modelName === '_temp') {
            return this.error('This method is not support empty model');
        }
        if (isEmpty(_field)) {
            return this;
        }
        if (isString(_field)) {
            _field = _field.replace(/ +/g, "").split(',');
        }
        this._options.select = _field;
        return this;
    };

    /**
     * where条件
     * @return {[type]} [description]
     */

    _default.prototype.where = function where(_where) {
        if (this.modelName === '_temp') {
            return this.error('This method is not support empty model');
        }
        if (!_where) {
            return this;
        }
        this._options.where = extend(this._options.where || {}, _where);
        return this;
    };

    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype._beforeAdd = function _beforeAdd(data, options) {
        return getPromise(data);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */

    _default.prototype.add = function add(data, options) {
        var model, parsedOptions, parsedData, result, pk;
        return _regeneratorRuntime.async(function add$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;

                    if (!(this.modelName === '_temp')) {
                        context$2$0.next = 3;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('This method is not support empty model'));

                case 3:
                    if (!isEmpty(data)) {
                        context$2$0.next = 5;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                case 5:
                    context$2$0.next = 7;
                    return _regeneratorRuntime.awrap(this.initDb());

                case 7:
                    model = context$2$0.sent;

                    //copy data
                    this._data = {};

                    //解析后的选项
                    parsedOptions = this.parseOptions(options);
                    context$2$0.next = 12;
                    return _regeneratorRuntime.awrap(this._beforeAdd(data, parsedOptions));

                case 12:
                    this._data = context$2$0.sent;
                    parsedData = this.parseData(this._data);
                    context$2$0.next = 16;
                    return _regeneratorRuntime.awrap(model.create(parsedData));

                case 16:
                    result = context$2$0.sent;
                    context$2$0.next = 19;
                    return _regeneratorRuntime.awrap(this.getPk());

                case 19:
                    pk = context$2$0.sent;

                    parsedData[pk] = parsedData[pk] ? parsedData[pk] : result[pk];
                    context$2$0.next = 23;
                    return _regeneratorRuntime.awrap(this._afterAdd(parsedData, parsedOptions));

                case 23:
                    return context$2$0.abrupt('return', parsedData[pk]);

                case 26:
                    context$2$0.prev = 26;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 29:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 26]]);
    };

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype._afterAdd = function _afterAdd(data, options) {
        return getPromise(data);
    };

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */

    _default.prototype.addAll = function addAll(data, options) {
        var _ret2;

        return _regeneratorRuntime.async(function addAll$(context$2$0) {
            var _this4 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap((function callee$2$0() {
                        var model, parsedOptions, promiseso, promisesd, parsedData, result, _ret3;

                        return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            var _this3 = this;

                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    if (!(this.modelName == '_temp')) {
                                        context$3$0.next = 2;
                                        break;
                                    }

                                    return context$3$0.abrupt('return', {
                                        v: this.error('This method is not support empty model')
                                    });

                                case 2:
                                    if (!(!isArray(data) || !isObject(data[0]))) {
                                        context$3$0.next = 4;
                                        break;
                                    }

                                    return context$3$0.abrupt('return', {
                                        v: this.error('_DATA_TYPE_INVALID_')
                                    });

                                case 4:
                                    context$3$0.next = 6;
                                    return _regeneratorRuntime.awrap(this.initDb());

                                case 6:
                                    model = context$3$0.sent;

                                    //copy data
                                    this._data = {};

                                    parsedOptions = this.parseOptions(options);
                                    promiseso = data.map(function (item) {
                                        return _this3._beforeAdd(item, parsedOptions);
                                    });
                                    context$3$0.next = 12;
                                    return _regeneratorRuntime.awrap(_Promise.all(promiseso));

                                case 12:
                                    this._data = context$3$0.sent;
                                    promisesd = this._data.map(function (item) {
                                        return _this3.parseData(item);
                                    });
                                    context$3$0.next = 16;
                                    return _regeneratorRuntime.awrap(_Promise.all(promisesd));

                                case 16:
                                    parsedData = context$3$0.sent;
                                    context$3$0.next = 19;
                                    return _regeneratorRuntime.awrap(model.createEach(parsedData));

                                case 19:
                                    result = context$3$0.sent;

                                    if (!(!isEmpty(result) && isArray(result))) {
                                        context$3$0.next = 28;
                                        break;
                                    }

                                    context$3$0.next = 23;
                                    return _regeneratorRuntime.awrap((function callee$3$0() {
                                        var pk, resData, self;
                                        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                                            while (1) switch (context$4$0.prev = context$4$0.next) {
                                                case 0:
                                                    context$4$0.next = 2;
                                                    return _regeneratorRuntime.awrap(this.getPk());

                                                case 2:
                                                    pk = context$4$0.sent;
                                                    resData = [];
                                                    self = this;

                                                    result.forEach(function (v) {
                                                        resData.push(self._afterAdd(v[pk], parsedOptions).then(function () {
                                                            return v[pk];
                                                        }));
                                                    });
                                                    return context$4$0.abrupt('return', {
                                                        v: {
                                                            v: _Promise.all(resData)
                                                        }
                                                    });

                                                case 7:
                                                case 'end':
                                                    return context$4$0.stop();
                                            }
                                        }, null, _this3);
                                    })());

                                case 23:
                                    _ret3 = context$3$0.sent;

                                    if (!(typeof _ret3 === 'object')) {
                                        context$3$0.next = 26;
                                        break;
                                    }

                                    return context$3$0.abrupt('return', _ret3.v);

                                case 26:
                                    context$3$0.next = 29;
                                    break;

                                case 28:
                                    return context$3$0.abrupt('return', {
                                        v: []
                                    });

                                case 29:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, _this4);
                    })());

                case 3:
                    _ret2 = context$2$0.sent;

                    if (!(typeof _ret2 === 'object')) {
                        context$2$0.next = 6;
                        break;
                    }

                    return context$2$0.abrupt('return', _ret2.v);

                case 6:
                    context$2$0.next = 11;
                    break;

                case 8:
                    context$2$0.prev = 8;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 11:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 8]]);
    };

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype._beforeDelete = function _beforeDelete(options) {
        return getPromise(options);
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */

    _default.prototype['delete'] = function _delete(options) {
        var model, parsedOptions, result, _ret4;

        return _regeneratorRuntime.async(function _delete$(context$2$0) {
            var _this5 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;

                    if (!(this.modelName === '_temp')) {
                        context$2$0.next = 3;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('This method is not support empty model'));

                case 3:
                    context$2$0.next = 5;
                    return _regeneratorRuntime.awrap(this.initDb());

                case 5:
                    model = context$2$0.sent;

                    //copy data
                    this._data = {};

                    parsedOptions = this.parseOptions(options);
                    context$2$0.next = 10;
                    return _regeneratorRuntime.awrap(this._beforeDelete(parsedOptions));

                case 10:
                    context$2$0.next = 12;
                    return _regeneratorRuntime.awrap(model.destroy(this.parseDeOptions(parsedOptions)));

                case 12:
                    result = context$2$0.sent;
                    context$2$0.next = 15;
                    return _regeneratorRuntime.awrap(this._afterDelete(parsedOptions.where || {}));

                case 15:
                    if (!(!isEmpty(result) && isArray(result))) {
                        context$2$0.next = 23;
                        break;
                    }

                    context$2$0.next = 18;
                    return _regeneratorRuntime.awrap((function callee$2$0() {
                        var pk, affectedRows;
                        return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    context$3$0.next = 2;
                                    return _regeneratorRuntime.awrap(this.getPk());

                                case 2:
                                    pk = context$3$0.sent;
                                    affectedRows = [];

                                    result.forEach(function (v) {
                                        affectedRows.push(v[pk]);
                                    });
                                    return context$3$0.abrupt('return', {
                                        v: affectedRows
                                    });

                                case 6:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, _this5);
                    })());

                case 18:
                    _ret4 = context$2$0.sent;

                    if (!(typeof _ret4 === 'object')) {
                        context$2$0.next = 21;
                        break;
                    }

                    return context$2$0.abrupt('return', _ret4.v);

                case 21:
                    context$2$0.next = 24;
                    break;

                case 23:
                    return context$2$0.abrupt('return', []);

                case 24:
                    context$2$0.next = 29;
                    break;

                case 26:
                    context$2$0.prev = 26;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 29:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 26]]);
    };

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */

    _default.prototype._afterDelete = function _afterDelete(options) {
        return getPromise(options);
    };

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype._beforeUpdate = function _beforeUpdate(data, options) {
        return getPromise(data);
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */

    _default.prototype.update = function update(data, options) {
        var _ret5;

        return _regeneratorRuntime.async(function update$(context$2$0) {
            var _this6 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap((function callee$2$0() {
                        var model, parsedOptions, parsedData, pk, result, affectedRows;
                        return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    if (!(this.modelName === '_temp')) {
                                        context$3$0.next = 2;
                                        break;
                                    }

                                    return context$3$0.abrupt('return', {
                                        v: this.error('This method is not support empty model')
                                    });

                                case 2:
                                    if (!isEmpty(data)) {
                                        context$3$0.next = 4;
                                        break;
                                    }

                                    return context$3$0.abrupt('return', {
                                        v: this.error('_DATA_TYPE_INVALID_')
                                    });

                                case 4:
                                    context$3$0.next = 6;
                                    return _regeneratorRuntime.awrap(this.initDb());

                                case 6:
                                    model = context$3$0.sent;

                                    //copy data
                                    this._data = {};

                                    parsedOptions = this.parseOptions(options);
                                    context$3$0.next = 11;
                                    return _regeneratorRuntime.awrap(this._beforeUpdate(data, parsedOptions));

                                case 11:
                                    this._data = context$3$0.sent;
                                    parsedData = this.parseData(this._data);
                                    context$3$0.next = 15;
                                    return _regeneratorRuntime.awrap(this.getPk());

                                case 15:
                                    pk = context$3$0.sent;

                                    if (!isEmpty(parsedOptions.where)) {
                                        context$3$0.next = 25;
                                        break;
                                    }

                                    if (isEmpty(parsedData[pk])) {
                                        context$3$0.next = 22;
                                        break;
                                    }

                                    parsedOptions.where = getObject(pk, data[pk]);
                                    delete parsedData[pk];
                                    context$3$0.next = 23;
                                    break;

                                case 22:
                                    return context$3$0.abrupt('return', {
                                        v: self.error('_OPERATION_WRONG_')
                                    });

                                case 23:
                                    context$3$0.next = 26;
                                    break;

                                case 25:
                                    if (!isEmpty(parsedData[pk])) {
                                        delete parsedData[pk];
                                    }

                                case 26:
                                    context$3$0.next = 28;
                                    return _regeneratorRuntime.awrap(model.update(parsedOptions, parsedData));

                                case 28:
                                    result = context$3$0.sent;
                                    context$3$0.next = 31;
                                    return _regeneratorRuntime.awrap(this._afterUpdate(parsedData, parsedOptions));

                                case 31:
                                    affectedRows = [];

                                    if (!(!isEmpty(result) && isArray(result))) {
                                        context$3$0.next = 37;
                                        break;
                                    }

                                    result.forEach(function (v) {
                                        affectedRows.push(v[pk]);
                                    });
                                    return context$3$0.abrupt('return', {
                                        v: affectedRows
                                    });

                                case 37:
                                    return context$3$0.abrupt('return', {
                                        v: []
                                    });

                                case 38:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, _this6);
                    })());

                case 3:
                    _ret5 = context$2$0.sent;

                    if (!(typeof _ret5 === 'object')) {
                        context$2$0.next = 6;
                        break;
                    }

                    return context$2$0.abrupt('return', _ret5.v);

                case 6:
                    context$2$0.next = 11;
                    break;

                case 8:
                    context$2$0.prev = 8;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 11:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 8]]);
    };

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype._afterUpdate = function _afterUpdate(data, options) {
        return getPromise(data);
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */

    _default.prototype.find = function find(options) {
        var _ret6;

        return _regeneratorRuntime.async(function find$(context$2$0) {
            var _this8 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap((function callee$2$0() {
                        var model, parsedOptions, result;
                        return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            var _this7 = this;

                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    if (!(this.modelName === '_temp')) {
                                        context$3$0.next = 2;
                                        break;
                                    }

                                    return context$3$0.abrupt('return', {
                                        v: this.error('This method is not support empty model')
                                    });

                                case 2:
                                    context$3$0.next = 4;
                                    return _regeneratorRuntime.awrap(this.initDb());

                                case 4:
                                    model = context$3$0.sent;
                                    parsedOptions = this.parseOptions(options, { limit: 1 });
                                    result = {};

                                    if (isEmpty(this.relation)) {
                                        context$3$0.next = 12;
                                        break;
                                    }

                                    context$3$0.next = 10;
                                    return _regeneratorRuntime.awrap((function callee$3$0() {
                                        var process;
                                        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                                            while (1) switch (context$4$0.prev = context$4$0.next) {
                                                case 0:
                                                    process = model.find(this.parseDeOptions(parsedOptions));

                                                    if (!isEmpty(this._relationLink) && !isEmpty(parsedOptions.rel)) {
                                                        this._relationLink.forEach(function (v) {
                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                process = process.populate(v.table);
                                                            }
                                                        });
                                                    }
                                                    context$4$0.next = 4;
                                                    return _regeneratorRuntime.awrap(process);

                                                case 4:
                                                    result = context$4$0.sent;

                                                case 5:
                                                case 'end':
                                                    return context$4$0.stop();
                                            }
                                        }, null, _this7);
                                    })());

                                case 10:
                                    context$3$0.next = 15;
                                    break;

                                case 12:
                                    context$3$0.next = 14;
                                    return _regeneratorRuntime.awrap(model.find(this.parseDeOptions(parsedOptions)));

                                case 14:
                                    result = context$3$0.sent;

                                case 15:
                                    result = isArray(result) ? result[0] : result;
                                    return context$3$0.abrupt('return', {
                                        v: this._afterFind(result || {}, parsedOptions)
                                    });

                                case 17:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, _this8);
                    })());

                case 3:
                    _ret6 = context$2$0.sent;

                    if (!(typeof _ret6 === 'object')) {
                        context$2$0.next = 6;
                        break;
                    }

                    return context$2$0.abrupt('return', _ret6.v);

                case 6:
                    context$2$0.next = 11;
                    break;

                case 8:
                    context$2$0.prev = 8;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 11:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 8]]);
    };

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */

    _default.prototype._afterFind = function _afterFind(result, options) {
        return getPromise(result);
    };

    /**
     * 查询数据条数
     * @return 返回一个promise
     */

    _default.prototype.count = function count(options) {
        var model, parsedOptions;
        return _regeneratorRuntime.async(function count$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;

                    if (!(this.modelName === '_temp')) {
                        context$2$0.next = 3;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('This method is not support empty model'));

                case 3:
                    context$2$0.next = 5;
                    return _regeneratorRuntime.awrap(this.initDb());

                case 5:
                    model = context$2$0.sent;
                    parsedOptions = this.parseOptions(options);
                    return context$2$0.abrupt('return', model.count(this.parseDeOptions(parsedOptions)));

                case 10:
                    context$2$0.prev = 10;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 13:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 10]]);
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */

    _default.prototype.select = function select(options) {
        var _ret8;

        return _regeneratorRuntime.async(function select$(context$2$0) {
            var _this10 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap((function callee$2$0() {
                        var model, parsedOptions, result;
                        return _regeneratorRuntime.async(function callee$2$0$(context$3$0) {
                            var _this9 = this;

                            while (1) switch (context$3$0.prev = context$3$0.next) {
                                case 0:
                                    if (!(this.modelName === '_temp')) {
                                        context$3$0.next = 2;
                                        break;
                                    }

                                    return context$3$0.abrupt('return', {
                                        v: this.error('This method is not support empty model')
                                    });

                                case 2:
                                    context$3$0.next = 4;
                                    return _regeneratorRuntime.awrap(this.initDb());

                                case 4:
                                    model = context$3$0.sent;
                                    parsedOptions = this.parseOptions(options);
                                    result = {};

                                    if (isEmpty(this.relation)) {
                                        context$3$0.next = 12;
                                        break;
                                    }

                                    context$3$0.next = 10;
                                    return _regeneratorRuntime.awrap((function callee$3$0() {
                                        var process;
                                        return _regeneratorRuntime.async(function callee$3$0$(context$4$0) {
                                            while (1) switch (context$4$0.prev = context$4$0.next) {
                                                case 0:
                                                    process = model.find(this.parseDeOptions(parsedOptions));

                                                    if (!isEmpty(this._relationLink) && !isEmpty(parsedOptions.rel)) {
                                                        this._relationLink.forEach(function (v) {
                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                process = process.populate(v.table);
                                                            }
                                                        });
                                                    }
                                                    context$4$0.next = 4;
                                                    return _regeneratorRuntime.awrap(process);

                                                case 4:
                                                    result = context$4$0.sent;

                                                case 5:
                                                case 'end':
                                                    return context$4$0.stop();
                                            }
                                        }, null, _this9);
                                    })());

                                case 10:
                                    context$3$0.next = 15;
                                    break;

                                case 12:
                                    context$3$0.next = 14;
                                    return _regeneratorRuntime.awrap(model.find(this.parseDeOptions(parsedOptions)));

                                case 14:
                                    result = context$3$0.sent;

                                case 15:
                                    return context$3$0.abrupt('return', {
                                        v: this._afterSelect(result || {}, parsedOptions)
                                    });

                                case 16:
                                case 'end':
                                    return context$3$0.stop();
                            }
                        }, null, _this10);
                    })());

                case 3:
                    _ret8 = context$2$0.sent;

                    if (!(typeof _ret8 === 'object')) {
                        context$2$0.next = 6;
                        break;
                    }

                    return context$2$0.abrupt('return', _ret8.v);

                case 6:
                    context$2$0.next = 11;
                    break;

                case 8:
                    context$2$0.prev = 8;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 11:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 8]]);
    };

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _default.prototype._afterSelect = function _afterSelect(result, options) {
        return getPromise(result);
    };

    /**
     * 返回数据里含有count信息的查询
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */

    _default.prototype.countSelect = function countSelect(options, pageFlag) {
        var model, parsedOptions, count, pageOptions, totalPage, result;
        return _regeneratorRuntime.async(function countSelect$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;

                    if (!(this.modelName === '_temp')) {
                        context$2$0.next = 3;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('This method is not support empty model'));

                case 3:
                    if (isBoolean(options)) {
                        pageFlag = options;
                        options = {};
                    }
                    // init model
                    context$2$0.next = 6;
                    return _regeneratorRuntime.awrap(this.initDb());

                case 6:
                    model = context$2$0.sent;
                    parsedOptions = this.parseOptions(options);
                    context$2$0.next = 10;
                    return _regeneratorRuntime.awrap(this.count(options));

                case 10:
                    count = context$2$0.sent;
                    pageOptions = this.parsePage(parsedOptions);
                    totalPage = Math.ceil(count / pageOptions.num);

                    if (isBoolean(pageFlag)) {
                        if (pageOptions.page > totalPage) {
                            pageOptions.page = pageFlag === true ? 1 : totalPage;
                        }
                        parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                    }
                    //传入分页参数
                    this.limit(pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
                    result = extend({ count: count, total: totalPage }, pageOptions);

                    if (!parsedOptions.page) {
                        parsedOptions.page = pageOptions.page;
                    }
                    context$2$0.next = 19;
                    return _regeneratorRuntime.awrap(this.select(parsedOptions));

                case 19:
                    result.data = context$2$0.sent;
                    return context$2$0.abrupt('return', result);

                case 23:
                    context$2$0.prev = 23;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 26:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 23]]);
    };

    /**
     * 原生语句查询
     * mysql  M([config]).query('select * from test'); //test model可以不存在实体类
     * mongo  M([config]).query('db.test.find()'); //test model必须存在实体类,在框架启动时加载(暂停支持)
     * @param sqlStr
     */

    _default.prototype.query = function query(sqlStr) {
        var model, result;
        return _regeneratorRuntime.async(function query$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;

                    //safe mode
                    this.config.db_ext_config.safe = true;
                    // init model
                    context$2$0.next = 4;
                    return _regeneratorRuntime.awrap(this.initDb());

                case 4:
                    model = context$2$0.sent;
                    result = null;

                    if (!(this.config.db_type === 'mysql' || this.config.db_type === 'postgresql')) {
                        context$2$0.next = 11;
                        break;
                    }

                    result = promisify(model.query, this);
                    return context$2$0.abrupt('return', result(sqlStr));

                case 11:
                    return context$2$0.abrupt('return', this.error('adapter not supported this method'));

                case 12:
                    context$2$0.next = 17;
                    break;

                case 14:
                    context$2$0.prev = 14;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 17:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 14]]);
    };

    return _default;
})(_Base2['default']);

exports['default'] = _default;
module.exports = exports['default'];

// init model

//解析后的数据

// init model

// init model

// init model

// 如果存在主键数据 则自动作为更新条件

// init model

// init model

// init model

//if (this.config.db_type === 'mongo') {
//    let quer = sqlStr.split('.');
//    if(isEmpty(quer) || isEmpty(quer[0]) || quer[0] !== 'db' || isEmpty(quer[1])){
//        return this.error('query language error');
//    }
//    quer.shift();
//    let tableName = quer.shift();
//    if(!THINK.INSTANCES.DB[this.adapterKey] || !THINK.INSTANCES.DB[this.adapterKey].collections || !THINK.INSTANCES.DB[this.adapterKey].collections[tableName]){
//        return this.error('model init error');
//    }
//    model = THINK.INSTANCES.DB[this.adapterKey].collections[tableName];
//    let cls = promisify(model.native, model);
//    let process = await cls();
//
//    let func = new Function('process', 'return process.' + quer.join('.') + ';');
//    process = func(process);
//    result = new Promise(function (reslove, reject) {
//        process.toArray(function (err, results) {
//            if (err) reject(err);
//            reslove(results);
//        });
//    });
//    return result;
//}else