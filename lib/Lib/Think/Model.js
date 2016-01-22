'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _of = require('babel-runtime/core-js/array/of');

var _of2 = _interopRequireDefault(_of);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _waterline = require('waterline');

var _waterline2 = _interopRequireDefault(_waterline);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Valid = require('../Util/Valid');

var _Valid2 = _interopRequireDefault(_Valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(name) {
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

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

        if (isEmpty(config)) {
            config.default = true;
        } else if (config.default === true) {
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
        var hashStr = this.config.db_type + '_' + this.config.db_host + '_' + this.config.db_port + '_' + this.config.db_name;
        if (!this.config.default) {
            hashStr = hashStr + '_' + this.trueTableName;
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
            connectionLimit: 30,
            waitForConnections: true
        };
    };

    /**
     * 初始化数据模型
     * @returns {*|Promise.<T>}
     */

    _class.prototype.initDb = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _this2 = this;

            var instances, schema, v, inits;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            instances = THINK.INSTANCES.DB[this.adapterKey];

                            if (instances) {
                                _context.next = 14;
                                break;
                            }

                            if (this.dbOptions.adapters[this.config.db_type]) {
                                _context.next = 5;
                                break;
                            }

                            return _context.abrupt('return', this.error('adapters is not installed. please run \'npm install sails-' + this.config.db_type + '\''));

                        case 5:
                            _context.next = 7;
                            return this.setCollections();

                        case 7:
                            schema = THINK.ORM[this.adapterKey]['thinkschema'];

                            for (v in schema) {
                                THINK.ORM[this.adapterKey].loadCollection(schema[v]);
                            }
                            inits = promisify(THINK.ORM[this.adapterKey].initialize, THINK.ORM[this.adapterKey]);
                            _context.next = 12;
                            return inits(this.dbOptions).catch(function (e) {
                                return _this2.error('connection initialize faild. please check the model property');
                            });

                        case 12:
                            THINK.INSTANCES.DB[this.adapterKey] = _context.sent;

                            instances = THINK.INSTANCES.DB[this.adapterKey];

                        case 14:
                            this._relationLink = THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName];
                            this.model = instances.collections[this.trueTableName];
                            return _context.abrupt('return', this.model);

                        case 19:
                            _context.prev = 19;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', this.error(_context.t0));

                        case 22:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 19]]);
        }));
        return function initDb() {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 加载collections
     * @returns {*}
     */

    _class.prototype.setCollections = function setCollections() {
        var _this3 = this;

        //fields filter
        var allowAttr = { type: 1, size: 1, defaultsTo: 1, required: 1, unique: 1, index: 1, columnName: 1 };
        for (var f in this.fields) {
            (function (k) {
                for (var arr in _this3.fields[k]) {
                    if (!allowAttr[arr]) {
                        delete _this3.fields[k][arr];
                    }
                }
                if (isEmpty(_this3.fields[k])) {
                    delete _this3.fields[k];
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
            var _config = extend(false, {}, this.config);
            _config.default = true;
            THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName] = this.setRelation(this.trueTableName, this.relation, _config) || [];
        }
        if (THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName]) {
            THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = extend(false, THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName], this.fields);
        } else {
            THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName] = extend(false, {}, this.fields);
        }
        THINK.ORM[this.adapterKey]['thinkschema'][this.trueTableName] = this.setSchema(this.trueTableName, THINK.ORM[this.adapterKey]['thinkfields'][this.trueTableName]);
        return THINK.ORM[this.adapterKey];
    };

    /**
     * 生成schema
     * @param table
     * @param fields
     * @returns {type[]|void}
     */

    _class.prototype.setSchema = function setSchema(table, fields) {
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
        return _waterline2.default.Collection.extend(schema);
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

    _class.prototype.setRelation = function setRelation(table, relation, config) {
        var _this4 = this;

        var relationObj = {},
            relationList = [];
        if (!isArray(relation)) {
            relation = (0, _of2.default)(relation);
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
                        relationObj = _this4._getHasOneRelation(table, _this4.fields, rel, config);
                        break;
                    case 2:
                        relationObj = _this4._getHasManyRelation(table, _this4.fields, rel, config);
                        break;
                    case 3:
                        relationObj = _this4._getManyToManyRelation(table, _this4.fields, rel, config);
                        break;
                    default:
                        relationObj = _this4._getHasOneRelation(table, _this4.fields, rel, config);
                        break;
                }
                relationList.push({ table: relationObj.table });
                if (THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table]) {
                    THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table] = extend(false, THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table], relationObj.fields);
                } else {
                    THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table] = extend(false, {}, relationObj.fields);
                }
                THINK.ORM[_this4.adapterKey]['thinkschema'][relationObj.table] = _this4.setSchema(relationObj.table, THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table]);
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

    _class.prototype._getHasOneRelation = function _getHasOneRelation(table, fields, relation, config) {
        var relationModel = M(relation.model, config);
        var relationTableName = relationModel.trueTableName;
        this.fields[relationTableName] = {
            model: relationTableName
        };
        return { table: relationTableName, relfields: relationModel.fields };
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

    _class.prototype._getHasManyRelation = function _getHasManyRelation(table, fields, relation, config) {
        var relationModel = M(relation.model, config);
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

    _class.prototype._getManyToManyRelation = function _getManyToManyRelation(table, fields, relation, config) {
        var relationModel = M(relation.model, config);
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

    _class.prototype.error = function error() {
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

    _class.prototype.close = function close(adapter) {
        var _this5 = this;

        var adapters = this.dbOptions.adapters || {};
        if (adapter) {
            if (THINK.INSTANCES.DB[adapter]) {
                THINK.INSTANCES.DB[adapter] = null;
                THINK.ORM[adapter] = null;
            }
            var promise = new _promise2.default(function (resolve) {
                if (_this5.dbOptions.connections[adapter] && _this5.dbOptions.connections[adapter].adapter) {
                    adapters[_this5.dbOptions.connections[adapter].adapter].teardown(null, resolve);
                }
                resolve(null);
            });
            return promise;
        } else {
            var _ret = function () {
                var promises = [];
                THINK.INSTANCES.DB = {};
                THINK.ORM = {};
                (0, _keys2.default)(adapters).forEach(function (adp) {
                    if (adapters[adp].teardown) {
                        var promise = new _promise2.default(function (resolve) {
                            adapters[adp].teardown(null, resolve);
                        });
                        promises.push(promise);
                    }
                });
                return {
                    v: _promise2.default.all(promises)
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
        }
    };

    /**
     * 获取表名
     * @return {[type]} [description]
     */

    _class.prototype.getTableName = function getTableName() {
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

    _class.prototype.getModelName = function getModelName() {
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

    _class.prototype.getPk = function getPk() {
        if (!isEmpty(this.fields)) {
            for (var _v in this.fields) {
                if (this.fields[_v].hasOwnProperty('primaryKey') && this.fields[_v].primaryKey === true) {
                    this.pk = _v;
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

    _class.prototype.parseName = function parseName(name) {
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

    _class.prototype.parseOptions = function parseOptions(oriOpts, extraOptions) {
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

    _class.prototype.parseData = function parseData(data) {
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
        var result = (0, _Valid2.default)(checkData);
        if (isEmpty(result)) {
            return data;
        }
        return this.error(result);
    };

    /**
     * 解构参数
     * @param options
     */

    _class.prototype.parseDeOptions = function parseDeOptions(options) {
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

    _class.prototype.parsePage = function parsePage(options) {
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

    _class.prototype.limit = function limit(offset, length) {
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

    _class.prototype.order = function order(_order2) {
        if (_order2 === undefined) {
            return this;
        }
        if (isObject(_order2)) {
            _order2 = extend({}, _order2);
            var _order = {};
            for (var _v2 in _order2) {
                if (isNumber(_order2[_v2])) {
                    _order[_v2] = _order2[_v2];
                } else {
                    if (_order2[_v2].toLowerCase() === 'desc') {
                        _order[_v2] = 0;
                    } else if (_order2[_v2].toLowerCase() === 'asc') {
                        _order[_v2] = 1;
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

    _class.prototype.page = function page(_page, listRows) {
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

    _class.prototype.rel = function rel() {
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

    _class.prototype.field = function field(_field) {
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

    _class.prototype.where = function where(_where) {
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

    _class.prototype._beforeAdd = function _beforeAdd(data, options) {
        return getPromise(data);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */

    _class.prototype.add = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, options) {
            var model, parsedOptions, parsedData, result, pk;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;

                            if (!isEmpty(data)) {
                                _context2.next = 3;
                                break;
                            }

                            return _context2.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context2.next = 5;
                            return this.initDb();

                        case 5:
                            model = _context2.sent;

                            //copy data
                            this._data = {};

                            //解析后的选项
                            parsedOptions = this.parseOptions(options);
                            _context2.next = 10;
                            return this._beforeAdd(data, parsedOptions);

                        case 10:
                            this._data = _context2.sent;

                            //解析后的数据
                            parsedData = this.parseData(this._data);
                            _context2.next = 14;
                            return model.create(parsedData);

                        case 14:
                            result = _context2.sent;
                            _context2.next = 17;
                            return this.getPk();

                        case 17:
                            pk = _context2.sent;

                            parsedData[pk] = parsedData[pk] ? parsedData[pk] : result[pk];
                            _context2.next = 21;
                            return this._afterAdd(parsedData, parsedOptions);

                        case 21:
                            return _context2.abrupt('return', parsedData[pk]);

                        case 24:
                            _context2.prev = 24;
                            _context2.t0 = _context2['catch'](0);
                            return _context2.abrupt('return', this.error(_context2.t0));

                        case 27:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[0, 24]]);
        }));
        return function add(_x4, _x5) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _class.prototype._afterAdd = function _afterAdd(data, options) {
        return getPromise(data);
    };

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */

    _class.prototype.addAll = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(data, options) {
            var _this6 = this;

            var _ret2;

            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;
                            return _context5.delegateYield(_regenerator2.default.mark(function _callee4() {
                                var model, parsedOptions, promiseso, promisesd, parsedData, result, _ret3;

                                return _regenerator2.default.wrap(function _callee4$(_context4) {
                                    while (1) {
                                        switch (_context4.prev = _context4.next) {
                                            case 0:
                                                if (!(!isArray(data) || !isObject(data[0]))) {
                                                    _context4.next = 2;
                                                    break;
                                                }

                                                return _context4.abrupt('return', {
                                                    v: _this6.error('_DATA_TYPE_INVALID_')
                                                });

                                            case 2:
                                                _context4.next = 4;
                                                return _this6.initDb();

                                            case 4:
                                                model = _context4.sent;

                                                //copy data
                                                _this6._data = {};

                                                parsedOptions = _this6.parseOptions(options);
                                                promiseso = data.map(function (item) {
                                                    return _this6._beforeAdd(item, parsedOptions);
                                                });
                                                _context4.next = 10;
                                                return _promise2.default.all(promiseso);

                                            case 10:
                                                _this6._data = _context4.sent;
                                                promisesd = _this6._data.map(function (item) {
                                                    return _this6.parseData(item);
                                                });
                                                _context4.next = 14;
                                                return _promise2.default.all(promisesd);

                                            case 14:
                                                parsedData = _context4.sent;
                                                _context4.next = 17;
                                                return model.createEach(parsedData);

                                            case 17:
                                                result = _context4.sent;

                                                if (!(!isEmpty(result) && isArray(result))) {
                                                    _context4.next = 25;
                                                    break;
                                                }

                                                return _context4.delegateYield(_regenerator2.default.mark(function _callee3() {
                                                    var pk, resData, self;
                                                    return _regenerator2.default.wrap(function _callee3$(_context3) {
                                                        while (1) {
                                                            switch (_context3.prev = _context3.next) {
                                                                case 0:
                                                                    _context3.next = 2;
                                                                    return _this6.getPk();

                                                                case 2:
                                                                    pk = _context3.sent;
                                                                    resData = [];
                                                                    self = _this6;

                                                                    result.forEach(function (v) {
                                                                        resData.push(self._afterAdd(v[pk], parsedOptions).then(function () {
                                                                            return v[pk];
                                                                        }));
                                                                    });
                                                                    return _context3.abrupt('return', {
                                                                        v: {
                                                                            v: _promise2.default.all(resData)
                                                                        }
                                                                    });

                                                                case 7:
                                                                case 'end':
                                                                    return _context3.stop();
                                                            }
                                                        }
                                                    }, _callee3, _this6);
                                                })(), 't0', 20);

                                            case 20:
                                                _ret3 = _context4.t0;

                                                if (!((typeof _ret3 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret3)) === "object")) {
                                                    _context4.next = 23;
                                                    break;
                                                }

                                                return _context4.abrupt('return', _ret3.v);

                                            case 23:
                                                _context4.next = 26;
                                                break;

                                            case 25:
                                                return _context4.abrupt('return', {
                                                    v: []
                                                });

                                            case 26:
                                            case 'end':
                                                return _context4.stop();
                                        }
                                    }
                                }, _callee4, _this6);
                            })(), 't0', 2);

                        case 2:
                            _ret2 = _context5.t0;

                            if (!((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object")) {
                                _context5.next = 5;
                                break;
                            }

                            return _context5.abrupt('return', _ret2.v);

                        case 5:
                            _context5.next = 10;
                            break;

                        case 7:
                            _context5.prev = 7;
                            _context5.t1 = _context5['catch'](0);
                            return _context5.abrupt('return', this.error(_context5.t1));

                        case 10:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[0, 7]]);
        }));
        return function addAll(_x6, _x7) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _class.prototype._beforeDelete = function _beforeDelete(options) {
        return getPromise(options);
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */

    _class.prototype.delete = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(options) {
            var _this7 = this;

            var _model, _parsedOptions, _result, _ret4;

            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;
                            _context7.next = 3;
                            return this.initDb();

                        case 3:
                            _model = _context7.sent;

                            //copy data
                            this._data = {};

                            _parsedOptions = this.parseOptions(options);
                            _context7.next = 8;
                            return this._beforeDelete(_parsedOptions);

                        case 8:
                            _context7.next = 10;
                            return _model.destroy(this.parseDeOptions(_parsedOptions));

                        case 10:
                            _result = _context7.sent;
                            _context7.next = 13;
                            return this._afterDelete(_parsedOptions.where || {});

                        case 13:
                            if (!(!isEmpty(_result) && isArray(_result))) {
                                _context7.next = 20;
                                break;
                            }

                            return _context7.delegateYield(_regenerator2.default.mark(function _callee6() {
                                var pk, affectedRows;
                                return _regenerator2.default.wrap(function _callee6$(_context6) {
                                    while (1) {
                                        switch (_context6.prev = _context6.next) {
                                            case 0:
                                                _context6.next = 2;
                                                return _this7.getPk();

                                            case 2:
                                                pk = _context6.sent;
                                                affectedRows = [];

                                                _result.forEach(function (v) {
                                                    affectedRows.push(v[pk]);
                                                });
                                                return _context6.abrupt('return', {
                                                    v: affectedRows
                                                });

                                            case 6:
                                            case 'end':
                                                return _context6.stop();
                                        }
                                    }
                                }, _callee6, _this7);
                            })(), 't0', 15);

                        case 15:
                            _ret4 = _context7.t0;

                            if (!((typeof _ret4 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret4)) === "object")) {
                                _context7.next = 18;
                                break;
                            }

                            return _context7.abrupt('return', _ret4.v);

                        case 18:
                            _context7.next = 21;
                            break;

                        case 20:
                            return _context7.abrupt('return', []);

                        case 21:
                            _context7.next = 26;
                            break;

                        case 23:
                            _context7.prev = 23;
                            _context7.t1 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(_context7.t1));

                        case 26:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 23]]);
        }));
        return function _delete(_x8) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */

    _class.prototype._afterDelete = function _afterDelete(options) {
        return getPromise(options);
    };

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _class.prototype._beforeUpdate = function _beforeUpdate(data, options) {
        return getPromise(data);
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */

    _class.prototype.update = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(data, options) {
            var _this8 = this;

            var _ret5;

            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.prev = 0;
                            return _context9.delegateYield(_regenerator2.default.mark(function _callee8() {
                                var model, parsedOptions, parsedData, pk, result, affectedRows;
                                return _regenerator2.default.wrap(function _callee8$(_context8) {
                                    while (1) {
                                        switch (_context8.prev = _context8.next) {
                                            case 0:
                                                if (!isEmpty(data)) {
                                                    _context8.next = 2;
                                                    break;
                                                }

                                                return _context8.abrupt('return', {
                                                    v: _this8.error('_DATA_TYPE_INVALID_')
                                                });

                                            case 2:
                                                _context8.next = 4;
                                                return _this8.initDb();

                                            case 4:
                                                model = _context8.sent;

                                                //copy data
                                                _this8._data = {};

                                                parsedOptions = _this8.parseOptions(options);
                                                _context8.next = 9;
                                                return _this8._beforeUpdate(data, parsedOptions);

                                            case 9:
                                                _this8._data = _context8.sent;
                                                parsedData = _this8.parseData(_this8._data);
                                                _context8.next = 13;
                                                return _this8.getPk();

                                            case 13:
                                                pk = _context8.sent;

                                                if (!isEmpty(parsedOptions.where)) {
                                                    _context8.next = 23;
                                                    break;
                                                }

                                                if (isEmpty(parsedData[pk])) {
                                                    _context8.next = 20;
                                                    break;
                                                }

                                                parsedOptions.where = getObject(pk, data[pk]);
                                                delete parsedData[pk];
                                                _context8.next = 21;
                                                break;

                                            case 20:
                                                return _context8.abrupt('return', {
                                                    v: self.error('_OPERATION_WRONG_')
                                                });

                                            case 21:
                                                _context8.next = 24;
                                                break;

                                            case 23:
                                                if (!isEmpty(parsedData[pk])) {
                                                    delete parsedData[pk];
                                                }

                                            case 24:
                                                _context8.next = 26;
                                                return model.update(parsedOptions, parsedData);

                                            case 26:
                                                result = _context8.sent;
                                                _context8.next = 29;
                                                return _this8._afterUpdate(parsedData, parsedOptions);

                                            case 29:
                                                affectedRows = [];

                                                if (!(!isEmpty(result) && isArray(result))) {
                                                    _context8.next = 35;
                                                    break;
                                                }

                                                result.forEach(function (v) {
                                                    affectedRows.push(v[pk]);
                                                });
                                                return _context8.abrupt('return', {
                                                    v: affectedRows
                                                });

                                            case 35:
                                                return _context8.abrupt('return', {
                                                    v: []
                                                });

                                            case 36:
                                            case 'end':
                                                return _context8.stop();
                                        }
                                    }
                                }, _callee8, _this8);
                            })(), 't0', 2);

                        case 2:
                            _ret5 = _context9.t0;

                            if (!((typeof _ret5 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret5)) === "object")) {
                                _context9.next = 5;
                                break;
                            }

                            return _context9.abrupt('return', _ret5.v);

                        case 5:
                            _context9.next = 10;
                            break;

                        case 7:
                            _context9.prev = 7;
                            _context9.t1 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t1));

                        case 10:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 7]]);
        }));
        return function update(_x9, _x10) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _class.prototype._afterUpdate = function _afterUpdate(data, options) {
        return getPromise(data);
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */

    _class.prototype.find = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(options) {
            var _this9 = this;

            var _ret6;

            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            _context12.prev = 0;
                            return _context12.delegateYield(_regenerator2.default.mark(function _callee11() {
                                var model, parsedOptions, result;
                                return _regenerator2.default.wrap(function _callee11$(_context11) {
                                    while (1) {
                                        switch (_context11.prev = _context11.next) {
                                            case 0:
                                                _context11.next = 2;
                                                return _this9.initDb();

                                            case 2:
                                                model = _context11.sent;
                                                parsedOptions = _this9.parseOptions(options, { limit: 1 });
                                                result = {};

                                                if (isEmpty(_this9.relation)) {
                                                    _context11.next = 9;
                                                    break;
                                                }

                                                return _context11.delegateYield(_regenerator2.default.mark(function _callee10() {
                                                    var process;
                                                    return _regenerator2.default.wrap(function _callee10$(_context10) {
                                                        while (1) {
                                                            switch (_context10.prev = _context10.next) {
                                                                case 0:
                                                                    process = model.find(_this9.parseDeOptions(parsedOptions));

                                                                    if (!isEmpty(_this9._relationLink) && !isEmpty(parsedOptions.rel)) {
                                                                        _this9._relationLink.forEach(function (v) {
                                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                                process = process.populate(v.table);
                                                                            }
                                                                        });
                                                                    }
                                                                    _context10.next = 4;
                                                                    return process;

                                                                case 4:
                                                                    result = _context10.sent;

                                                                case 5:
                                                                case 'end':
                                                                    return _context10.stop();
                                                            }
                                                        }
                                                    }, _callee10, _this9);
                                                })(), 't0', 7);

                                            case 7:
                                                _context11.next = 12;
                                                break;

                                            case 9:
                                                _context11.next = 11;
                                                return model.find(_this9.parseDeOptions(parsedOptions));

                                            case 11:
                                                result = _context11.sent;

                                            case 12:
                                                result = isArray(result) ? result[0] : result;
                                                return _context11.abrupt('return', {
                                                    v: _this9._afterFind(result || {}, parsedOptions)
                                                });

                                            case 14:
                                            case 'end':
                                                return _context11.stop();
                                        }
                                    }
                                }, _callee11, _this9);
                            })(), 't0', 2);

                        case 2:
                            _ret6 = _context12.t0;

                            if (!((typeof _ret6 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret6)) === "object")) {
                                _context12.next = 5;
                                break;
                            }

                            return _context12.abrupt('return', _ret6.v);

                        case 5:
                            _context12.next = 10;
                            break;

                        case 7:
                            _context12.prev = 7;
                            _context12.t1 = _context12['catch'](0);
                            return _context12.abrupt('return', this.error(_context12.t1));

                        case 10:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this, [[0, 7]]);
        }));
        return function find(_x11) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */

    _class.prototype._afterFind = function _afterFind(result, options) {
        return getPromise(result);
    };

    /**
     * 查询数据条数
     * @return 返回一个promise
     */

    _class.prototype.count = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(options) {
            var _model2, _parsedOptions2;

            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            _context13.prev = 0;
                            _context13.next = 3;
                            return this.initDb();

                        case 3:
                            _model2 = _context13.sent;
                            _parsedOptions2 = this.parseOptions(options);
                            return _context13.abrupt('return', _model2.count(this.parseDeOptions(_parsedOptions2)));

                        case 8:
                            _context13.prev = 8;
                            _context13.t0 = _context13['catch'](0);
                            return _context13.abrupt('return', this.error(_context13.t0));

                        case 11:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this, [[0, 8]]);
        }));
        return function count(_x12) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 查询数据
     * @return 返回一个promise
     */

    _class.prototype.select = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(options) {
            var _this10 = this;

            var _ret8;

            return _regenerator2.default.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            _context16.prev = 0;
                            return _context16.delegateYield(_regenerator2.default.mark(function _callee15() {
                                var model, parsedOptions, result;
                                return _regenerator2.default.wrap(function _callee15$(_context15) {
                                    while (1) {
                                        switch (_context15.prev = _context15.next) {
                                            case 0:
                                                _context15.next = 2;
                                                return _this10.initDb();

                                            case 2:
                                                model = _context15.sent;
                                                parsedOptions = _this10.parseOptions(options);
                                                result = {};

                                                if (isEmpty(_this10.relation)) {
                                                    _context15.next = 9;
                                                    break;
                                                }

                                                return _context15.delegateYield(_regenerator2.default.mark(function _callee14() {
                                                    var process;
                                                    return _regenerator2.default.wrap(function _callee14$(_context14) {
                                                        while (1) {
                                                            switch (_context14.prev = _context14.next) {
                                                                case 0:
                                                                    process = model.find(_this10.parseDeOptions(parsedOptions));

                                                                    if (!isEmpty(_this10._relationLink) && !isEmpty(parsedOptions.rel)) {
                                                                        _this10._relationLink.forEach(function (v) {
                                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                                process = process.populate(v.table);
                                                                            }
                                                                        });
                                                                    }
                                                                    _context14.next = 4;
                                                                    return process;

                                                                case 4:
                                                                    result = _context14.sent;

                                                                case 5:
                                                                case 'end':
                                                                    return _context14.stop();
                                                            }
                                                        }
                                                    }, _callee14, _this10);
                                                })(), 't0', 7);

                                            case 7:
                                                _context15.next = 12;
                                                break;

                                            case 9:
                                                _context15.next = 11;
                                                return model.find(_this10.parseDeOptions(parsedOptions));

                                            case 11:
                                                result = _context15.sent;

                                            case 12:
                                                return _context15.abrupt('return', {
                                                    v: _this10._afterSelect(result || {}, parsedOptions)
                                                });

                                            case 13:
                                            case 'end':
                                                return _context15.stop();
                                        }
                                    }
                                }, _callee15, _this10);
                            })(), 't0', 2);

                        case 2:
                            _ret8 = _context16.t0;

                            if (!((typeof _ret8 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret8)) === "object")) {
                                _context16.next = 5;
                                break;
                            }

                            return _context16.abrupt('return', _ret8.v);

                        case 5:
                            _context16.next = 10;
                            break;

                        case 7:
                            _context16.prev = 7;
                            _context16.t1 = _context16['catch'](0);
                            return _context16.abrupt('return', this.error(_context16.t1));

                        case 10:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee16, this, [[0, 7]]);
        }));
        return function select(_x13) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */

    _class.prototype._afterSelect = function _afterSelect(result, options) {
        return getPromise(result);
    };

    /**
     * 返回数据里含有count信息的查询
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */

    _class.prototype.countSelect = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(options, pageFlag) {
            var _model3, _parsedOptions3, count, pageOptions, totalPage, _result2;

            return _regenerator2.default.wrap(function _callee17$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            _context17.prev = 0;

                            if (isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            // init model
                            _context17.next = 4;
                            return this.initDb();

                        case 4:
                            _model3 = _context17.sent;
                            _parsedOptions3 = this.parseOptions(options);
                            _context17.next = 8;
                            return this.count(options);

                        case 8:
                            count = _context17.sent;
                            pageOptions = this.parsePage(_parsedOptions3);
                            totalPage = Math.ceil(count / pageOptions.num);

                            if (isBoolean(pageFlag)) {
                                if (pageOptions.page > totalPage) {
                                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                                }
                                _parsedOptions3.page = pageOptions.page + ',' + pageOptions.num;
                            }
                            //传入分页参数
                            this.limit(pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
                            _result2 = extend({ count: count, total: totalPage }, pageOptions);

                            if (!_parsedOptions3.page) {
                                _parsedOptions3.page = pageOptions.page;
                            }
                            _context17.next = 17;
                            return this.select(_parsedOptions3);

                        case 17:
                            _result2.data = _context17.sent;
                            return _context17.abrupt('return', _result2);

                        case 21:
                            _context17.prev = 21;
                            _context17.t0 = _context17['catch'](0);
                            return _context17.abrupt('return', this.error(_context17.t0));

                        case 24:
                        case 'end':
                            return _context17.stop();
                    }
                }
            }, _callee17, this, [[0, 21]]);
        }));
        return function countSelect(_x14, _x15) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 原生语句查询
     * mysql  M('Test',[config]).query('select * from test');
     * mongo  M('Test',[config]).query('db.test.find()');
     * @param sqlStr
     */

    _class.prototype.query = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19(sqlStr) {
            var _this11 = this;

            var _model4, _result3, _ret10;

            return _regenerator2.default.wrap(function _callee19$(_context19) {
                while (1) {
                    switch (_context19.prev = _context19.next) {
                        case 0:
                            _context19.prev = 0;

                            //safe mode
                            this.config.db_ext_config.safe = true;
                            // init model
                            _context19.next = 4;
                            return this.initDb();

                        case 4:
                            _model4 = _context19.sent;
                            _result3 = null;

                            if (!(this.config.db_type === 'mongo')) {
                                _context19.next = 13;
                                break;
                            }

                            return _context19.delegateYield(_regenerator2.default.mark(function _callee18() {
                                var quer, tableName, cls, process, func;
                                return _regenerator2.default.wrap(function _callee18$(_context18) {
                                    while (1) {
                                        switch (_context18.prev = _context18.next) {
                                            case 0:
                                                quer = sqlStr.split('.');

                                                if (!(isEmpty(quer) || isEmpty(quer[0]) || quer[0] !== 'db' || isEmpty(quer[1]))) {
                                                    _context18.next = 3;
                                                    break;
                                                }

                                                return _context18.abrupt('return', {
                                                    v: _this11.error('query language error')
                                                });

                                            case 3:
                                                quer.shift();
                                                tableName = quer.shift();

                                                if (!(tableName !== _this11.trueTableName)) {
                                                    _context18.next = 7;
                                                    break;
                                                }

                                                return _context18.abrupt('return', {
                                                    v: _this11.error('table name error')
                                                });

                                            case 7:
                                                if (!(!THINK.INSTANCES.DB[_this11.adapterKey] || !THINK.INSTANCES.DB[_this11.adapterKey].collections || !THINK.INSTANCES.DB[_this11.adapterKey].collections[tableName])) {
                                                    _context18.next = 9;
                                                    break;
                                                }

                                                return _context18.abrupt('return', {
                                                    v: _this11.error('model init error')
                                                });

                                            case 9:
                                                _model4 = THINK.INSTANCES.DB[_this11.adapterKey].collections[tableName];
                                                cls = promisify(_model4.native, _model4);
                                                _context18.next = 13;
                                                return cls();

                                            case 13:
                                                process = _context18.sent;
                                                func = new Function('process', 'return process.' + quer.join('.') + ';');

                                                process = func(process);
                                                _result3 = new _promise2.default(function (reslove, reject) {
                                                    process.toArray(function (err, results) {
                                                        if (err) reject(err);
                                                        reslove(results);
                                                    });
                                                });
                                                return _context18.abrupt('return', {
                                                    v: _result3
                                                });

                                            case 18:
                                            case 'end':
                                                return _context18.stop();
                                        }
                                    }
                                }, _callee18, _this11);
                            })(), 't0', 8);

                        case 8:
                            _ret10 = _context19.t0;

                            if (!((typeof _ret10 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret10)) === "object")) {
                                _context19.next = 11;
                                break;
                            }

                            return _context19.abrupt('return', _ret10.v);

                        case 11:
                            _context19.next = 19;
                            break;

                        case 13:
                            if (!(this.config.db_type === 'mysql' || this.config.db_type === 'postgresql')) {
                                _context19.next = 18;
                                break;
                            }

                            _result3 = promisify(_model4.query, this);
                            return _context19.abrupt('return', _result3(sqlStr));

                        case 18:
                            return _context19.abrupt('return', this.error('adapter not supported this method'));

                        case 19:
                            _context19.next = 24;
                            break;

                        case 21:
                            _context19.prev = 21;
                            _context19.t1 = _context19['catch'](0);
                            return _context19.abrupt('return', this.error(_context19.t1));

                        case 24:
                        case 'end':
                            return _context19.stop();
                    }
                }
            }, _callee19, this, [[0, 21]]);
        }));
        return function query(_x16) {
            return ref.apply(this, arguments);
        };
    }();

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/26
                    */

exports.default = _class;