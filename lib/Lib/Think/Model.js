/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Array$of = require('babel-runtime/core-js/array/of')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _waterline = require('waterline');

var _waterline2 = _interopRequireDefault(_waterline);

var _sailsMongo = require('sails-mongo');

var _sailsMongo2 = _interopRequireDefault(_sailsMongo);

var _sailsMysql = require('sails-mysql');

var _sailsMysql2 = _interopRequireDefault(_sailsMysql);

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
            config = { db_prefix: config };
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
        this.adapter = md5(JSON.stringify(this.config));

        //数据源
        this.dbOptions = {
            adapters: {
                'mongo': _sailsMongo2['default'],
                'mysql': _sailsMysql2['default']
            },
            connections: {}
        };
        this.dbOptions.connections[this.adapter] = {
            adapter: this.config.db_type,
            host: this.config.db_host,
            port: this.config.db_port,
            database: this.config.db_name,
            user: this.config.db_user,
            password: this.config.db_pwd
        };
    };

    /**
     * 初始化数据模型
     * @param init 是否框架初始化时候调用
     * @returns {*|Promise.<T>}
     */

    _default.prototype.initDb = function initDb() {
        var _this = this;

        if (!THINK.INSTANCES.DB[this.adapter]) {
            this.setCollections();
            THINK.INSTANCES.DB[this.adapter] = new _Promise(function (fulfill, reject) {
                THINK.ORM[_this.adapter].initialize(_this.dbOptions, function (err, ontology) {
                    if (err) reject(err);else fulfill(ontology);
                });
            });
        }
        return THINK.INSTANCES.DB[this.adapter].then(function (coll) {
            //表关联关系
            if (!isEmpty(_this.relation)) {
                _this._relationLink = _this.setRelation(_this.trueTableName, _this.relation);
            }
            _this.model = coll.collections[_this.trueTableName];
            return _this.model;
        });
    };

    /**
     * 生成schema
     * @param table
     * @param fields
     * @returns {type[]|void}
     */

    _default.prototype.setSchema = function setSchema(table, fields) {
        //初始化attributes
        if (isEmpty(this.fields) && this.modelName !== '_empty') {
            return E('Model\'s attributes is undefined');
        }
        var schema = {
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
        var _this2 = this;

        var init = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        //表关联关系
        if (!isEmpty(this.relation)) {
            var config = extend(false, {}, this.config);
            this._relationLink = this.setRelation(this.trueTableName, this.relation, config);
        }
        if (!THINK.ORM[this.adapter]) {
            THINK.ORM[this.adapter] = new _waterline2['default']();
        }
        if (init === true || isEmpty(THINK.ORM[this.adapter].collections) || isEmpty(THINK.ORM[this.adapter].collections[this.trueTableName])) {
            if (!isEmpty(this._relationLink)) {
                this._relationLink.forEach(function (rel) {
                    THINK.ORM[_this2.adapter].loadCollection(_this2.schema[rel.table]);
                });
                THINK.ORM[this.adapter].loadCollection(this.schema[this.trueTableName]);
            } else {
                if (isEmpty(this.schema[this.trueTableName])) {
                    this.schema[this.trueTableName] = this.setSchema(this.trueTableName, this.fields);
                }
                THINK.ORM[this.adapter].loadCollection(this.schema[this.trueTableName]);
            }
        }
        return THINK.ORM[this.adapter];
    };

    /**
     * 关联定义
     * relation: [{
                type: 1, //类型 1 one2one 2 one2many 3 many2many
                model: 'Home/Profile', //对应的模型名
            }]
     * @type {Object}
     */

    /**
     * 设置本次使用的relation
     * @param table
     * @param relation
     * @param config
     * @returns {Array}
     */

    _default.prototype.setRelation = function setRelation(table, relation, config) {
        var _this3 = this;

        var relationObj = {},
            relationList = [];
        if (!isArray(relation)) {
            relation = _Array$of(relation);
        }
        relation.forEach(function (rel) {
            if (!isEmpty(rel.type)) {
                switch (rel.type) {
                    case 2:
                        relationObj = _this3._getHasManyRelation(table, _this3.fields, rel, config);
                        break;
                    case 3:
                        relationObj = _this3._getManyToManyRelation(table, _this3.fields, rel, config);
                        break;
                    default:
                        relationObj = _this3._getHasOneRelation(table, _this3.fields, rel, config);
                        break;
                }
                relationList.push(relationObj);
                _this3.schema[relationObj.table] = _this3.setSchema(relationObj.table, relationObj.fields);
            }
        });
        this.schema[table] = this.setSchema(table, this.fields);
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
        var relationTableName = relationModel.getTableName();
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
        var relationTableName = relationModel.getTableName();
        this.fields[relationTableName] = {
            collection: relationTableName,
            via: table
        };
        if (!relationModel.fields.hasOwnProperty('table')) {
            relationModel.fields[table] = {
                model: table
            };
        }
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
        var relationTableName = relationModel.getTableName();
        this.fields[relationTableName] = {
            collection: relationTableName,
            via: table,
            dominant: true
        };
        if (!relationModel.fields.hasOwnProperty('table')) {
            relationModel.fields[table] = {
                collection: table,
                via: relationTableName
            };
        }
        return { table: relationTableName, fields: relationModel.fields };
    };

    /**
     * 关闭数据链接
     * @returns {Promise}
     */

    _default.prototype.close = function close() {
        var adapters = this.dbOptions.adapters || {};
        var promises = [];
        THINK.INSTANCES.DB = {};
        _Object$keys(adapters).forEach(function (adapter) {
            if (adapters[adapter].teardown) {
                var promise = new _Promise(function (resolve) {
                    adapters[adapter].teardown(null, resolve);
                });
                promises.push(promise);
            }
        });
        return _Promise.all(promises);
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

        return getPromise(options);
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
        return E(result);
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
        }
        if (_page === undefined) {
            return this;
        }
        this._options.page = listRows === undefined ? _page : _page + ',' + listRows;
        return this;
    };

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */

    _default.prototype.field = function field(_field) {
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
        }
        if (isEmpty(_field)) {
            return this;
        }
        if (isString(_field)) {
            _field = _field.split(',');
        }
        this._options.select = _field;
        return this;
    };

    /**
     * where条件
     * @return {[type]} [description]
     */

    _default.prototype.where = function where(_where) {
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
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
            return self.parseData(data);
        }).then(function (data) {
            parsedData = data;
            return self.initDb();
        }).then(function (model) {
            return model.create(parsedData);
        }).then(function (result) {
            var pk = self.getPk();
            parsedData[pk] = parsedData[pk] ? parsedData[pk] : result[pk];
            return self._afterAdd(parsedData, parsedOptions);
        }).then(function () {
            return parsedData[self.getPk()];
        })['catch'](function (e) {
            return E(e);
        });
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
        if (this.modelName == '_empty') {
            return E('This method is not support empty model');
        }
        if (!isArray(data) || !isObject(data[0])) {
            return E('_DATA_TYPE_INVALID_');
        }
        var self = this;
        var parsedOptions = {},
            parsedData = [];
        var promises = undefined;
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            promises = data.map(function (item) {
                return self._beforeAdd(item, parsedOptions);
            });
            return _Promise.all(promises);
        }).then(function (data) {
            promises = data.map(function (item) {
                return self.parseData(item);
            });
            return _Promise.all(promises);
        }).then(function (data) {
            parsedData = data;
            return self.initDb();
        }).then(function (model) {
            return model.createEach(parsedData);
        }).then(function (result) {
            if (!isEmpty(result) && isArray(result)) {
                var _ret = (function () {
                    var pk = self.getPk();
                    var resData = [];
                    result.forEach(function (v) {
                        resData.push(self._afterAdd(v[pk], parsedOptions).then(function () {
                            return v[pk];
                        }));
                    });
                    return {
                        v: _Promise.all(resData)
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            } else {
                return [];
            }
        })['catch'](function (e) {
            return E(e);
        });
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
        }
        var self = this;
        var parsedOptions = {};
        var parsedData = [],
            affectedRows = [];
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
                var _ret2 = (function () {
                    var pk = self.getPk();
                    parsedData.forEach(function (v) {
                        affectedRows.push(v[pk]);
                    });
                    return {
                        v: affectedRows
                    };
                })();

                if (typeof _ret2 === 'object') return _ret2.v;
            } else {
                return [];
            }
        })['catch'](function (e) {
            return E(e);
        });
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
        }
        data = extend({}, this._data, data);
        this._data = {};
        if (isEmpty(data)) {
            return E('_DATA_TYPE_INVALID_');
        }
        var self = this;
        var parsedOptions = {};
        var parsedData = [],
            result = [],
            affectedRows = [];
        var pk = null;
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
        })['catch'](function (e) {
            return E(e);
        });
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
        }
        var self = this;
        var parsedOptions = {};
        return this.parseOptions(options, { limit: 1 }).then(function (options) {
            parsedOptions = options;
            return self.initDb();
        }).then(function (model) {
            if (!isEmpty(self.relation)) {
                var _ret3 = (function () {
                    var process = model.find(self.parseDeOptions(parsedOptions));
                    if (!isEmpty(self._relationLink)) {
                        self._relationLink.forEach(function (v) {
                            process = process.populate(v.table);
                        });
                    }
                    return {
                        v: process
                    };
                })();

                if (typeof _ret3 === 'object') return _ret3.v;
            } else {
                return model.find(self.parseDeOptions(parsedOptions));
            }
        }).then(function (data) {
            return self._afterFind(data[0] || {}, parsedOptions);
        })['catch'](function (e) {
            return E(e);
        });
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
        }
        var self = this;
        var parsedOptions = {};
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            return self.initDb();
        }).then(function (model) {
            return model.count(self.parseDeOptions(parsedOptions));
        })['catch'](function (e) {
            return E(e);
        });
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */

    _default.prototype.select = function select(options) {
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
        }
        var self = this;
        var parsedOptions = {};
        return this.parseOptions(options).then(function (options) {
            parsedOptions = options;
            return self.initDb();
        }).then(function (model) {
            if (!isEmpty(self.relation)) {
                var _ret4 = (function () {
                    var process = model.find(self.parseDeOptions(parsedOptions));
                    if (!isEmpty(self._relationLink)) {
                        self._relationLink.forEach(function (v) {
                            process = process.populate(v.table);
                        });
                    }
                    return {
                        v: process
                    };
                })();

                if (typeof _ret4 === 'object') return _ret4.v;
            } else {
                return model.find(self.parseDeOptions(parsedOptions));
            }
        }).then(function (data) {
            return self._afterSelect(data || {}, parsedOptions);
        })['catch'](function (e) {
            return E(e);
        });
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
        if (this.modelName === '_empty') {
            return E('This method is not support empty model');
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
            //传入分页参数
            self.limit(pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
            result = extend({ count: count, total: totalPage }, pageOptions);
            if (!parsedOptions.page) {
                parsedOptions.page = pageOptions.page;
            }
            return self.select(parsedOptions);
        }).then(function (data) {
            result.data = data;
            return result;
        })['catch'](function (e) {
            return E(e);
        });
    };

    /**
     * Mysql、PostgreSql原生语句查询
     * @param sqlStr
     */

    _default.prototype.query = function query(sqlStr, model) {
        var self = this;
        var promises = undefined;
        return this.parseOptions().then(function (options) {
            if (model) {
                promises = getPromise(model);
            } else {
                promises = self.initDb();
            }
            return promises.then(function (model) {
                return new _Promise(function (fulfill, reject) {
                    if (self.config.db_type === 'mongo') {
                        //model.native(sqlStr, function (err, results) {
                        //    if (err) reject(err);
                        //    else fulfill(results);
                        //});
                        reject('not supported');
                    } else {
                        model.query(sqlStr, function (err, results) {
                            if (err) reject(err);else fulfill(results);
                        });
                    }
                });
            });
        })['catch'](function (e) {
            return E(e);
        });
    };

    return _default;
})(_Base2['default']);

exports['default'] = _default;
module.exports = exports['default'];