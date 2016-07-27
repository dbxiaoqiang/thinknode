'use strict';

exports.__esModule = true;

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise2 = require('babel-runtime/core-js/promise');

var _promise3 = _interopRequireDefault(_promise2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _of = require('babel-runtime/core-js/array/of');

var _of2 = _interopRequireDefault(_of);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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
            db_type: THINK.config('db_type'),
            db_host: THINK.config('db_host'),
            db_port: THINK.config('db_port'),
            db_name: THINK.config('db_name'),
            db_user: THINK.config('db_user'),
            db_pwd: THINK.config('db_pwd'),
            db_prefix: THINK.config('db_prefix'),
            db_charset: THINK.config('db_charset'),
            db_ext_config: THINK.config('db_ext_config')
        }, config);

        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {
            this.tablePrefix = THINK.config('db_prefix');
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //安全模式
        this.safe = this.config.db_ext_config.safe === true ? true : false;
        //配置hash
        this.adapterKey = THINK.hash(this.config.db_type + '_' + this.config.db_host + '_' + this.config.db_port + '_' + this.config.db_name);
        //数据源配置
        this.dbOptions = {};
    };

    /**
     * 初始化数据模型
     * @returns {*|Promise.<T>}
     */


    _class.prototype.initModel = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var instances;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            instances = THINK.INSTANCES.DB[this.adapterKey];

                            if (instances) {
                                _context.next = 8;
                                break;
                            }

                            _context.next = 5;
                            return this.setConnectionPool();

                        case 5:
                            instances = _context.sent;
                            _context.next = 14;
                            break;

                        case 8:
                            if (instances.collections[this.trueTableName]) {
                                _context.next = 14;
                                break;
                            }

                            _context.next = 11;
                            return this.setCollections();

                        case 11:
                            _context.next = 13;
                            return this.setConnectionPool();

                        case 13:
                            instances = _context.sent;

                        case 14:
                            this._relationLink = THINK.ORM[this.adapterKey]['thinkrelation'][this.trueTableName] || [];
                            this.model = instances.collections[this.trueTableName];
                            return _context.abrupt('return', this.model || this.error('connection initialize faild.'));

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

        function initModel() {
            return _ref.apply(this, arguments);
        }

        return initModel;
    }();

    /**
     * 连接池
     * @returns {*}
     */


    _class.prototype.setConnectionPool = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _this2 = this;

            var schema, v, inits, instances;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            _context2.t0 = THINK.INSTANCES.DB[this.adapterKey];

                            if (!_context2.t0) {
                                _context2.next = 5;
                                break;
                            }

                            _context2.next = 5;
                            return this.close(this.adapterKey);

                        case 5:
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
                                this.dbOptions.adapters[this.config.db_type] = THINK.require('sails-' + this.config.db_type);
                            }
                            //check adapters

                            if (this.dbOptions.adapters[this.config.db_type]) {
                                _context2.next = 9;
                                break;
                            }

                            return _context2.abrupt('return', this.error('adapters is not installed. please run \'npm install sails-' + this.config.db_type + '@0.11.x\''));

                        case 9:
                            if (!THINK.isEmpty(THINK.ORM[this.adapterKey])) {
                                _context2.next = 11;
                                break;
                            }

                            return _context2.abrupt('return', this.error('orm initialize faild. please check db config.'));

                        case 11:
                            schema = THINK.ORM[this.adapterKey]['thinkschema'];

                            for (v in schema) {
                                THINK.ORM[this.adapterKey].loadCollection(schema[v]);
                            }
                            //initialize
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
                            inits = THINK.promisify(THINK.ORM[this.adapterKey].initialize, THINK.ORM[this.adapterKey]);
                            _context2.next = 17;
                            return inits(this.dbOptions).catch(function (e) {
                                return _this2.error(e.message);
                            });

                        case 17:
                            instances = _context2.sent;

                            THINK.INSTANCES.DB[this.adapterKey] = instances;
                            return _context2.abrupt('return', instances);

                        case 22:
                            _context2.prev = 22;
                            _context2.t1 = _context2['catch'](0);
                            return _context2.abrupt('return', this.error(_context2.t1));

                        case 25:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[0, 22]]);
        }));

        function setConnectionPool() {
            return _ref2.apply(this, arguments);
        }

        return setConnectionPool;
    }();

    /**
     * 加载collections
     * @returns {*}
     */


    _class.prototype.setCollections = function setCollections() {
        var _this3 = this;

        try {
            var _ret = function () {
                //fields filter
                var allowAttr = { type: 1, size: 1, defaultsTo: 1, required: 1, unique: 1, index: 1, columnName: 1 };
                for (var f in _this3.fields) {
                    (function (k) {
                        for (var arr in _this3.fields[k]) {
                            if (!allowAttr[arr]) {
                                delete _this3.fields[k][arr];
                            }
                        }
                        if (THINK.isEmpty(_this3.fields[k])) {
                            delete _this3.fields[k];
                        }
                    })(f);
                }
                if (!THINK.ORM[_this3.adapterKey]) {
                    THINK.ORM[_this3.adapterKey] = new _waterline2.default();
                    THINK.ORM[_this3.adapterKey]['thinkschema'] = {};
                    THINK.ORM[_this3.adapterKey]['thinkfields'] = {};
                    THINK.ORM[_this3.adapterKey]['thinkrelation'] = {};
                }
                //表关联关系
                if (!THINK.isEmpty(_this3.relation)) {
                    var _config = THINK.extend({}, _this3.config);
                    THINK.ORM[_this3.adapterKey]['thinkrelation'][_this3.trueTableName] = _this3.setRelation(_this3.trueTableName, _this3.relation, _config) || [];
                }
                if (THINK.ORM[_this3.adapterKey]['thinkfields'][_this3.trueTableName]) {
                    THINK.ORM[_this3.adapterKey]['thinkfields'][_this3.trueTableName] = THINK.extend(false, THINK.ORM[_this3.adapterKey]['thinkfields'][_this3.trueTableName], _this3.fields);
                } else {
                    THINK.ORM[_this3.adapterKey]['thinkfields'][_this3.trueTableName] = THINK.extend(false, {}, _this3.fields);
                }
                THINK.ORM[_this3.adapterKey]['thinkschema'][_this3.trueTableName] = _this3.setSchema(_this3.trueTableName, THINK.ORM[_this3.adapterKey]['thinkfields'][_this3.trueTableName]);
                return {
                    v: THINK.ORM[_this3.adapterKey]
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
        } catch (e) {
            return this.error(e);
        }
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
            schema: true,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            attributes: fields,
            migrate: 'safe'
        };
        //安全模式下ORM不会实时映射修改数据库表
        if (!this.safe && THINK.APP_DEBUG) {
            THINK.log('migrate is an experimental feature, you risk losing your data. please back up your data before use', 'WARNING');
            schema.migrate = 'alter';
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
        if (!THINK.isArray(relation)) {
            relation = (0, _of2.default)(relation);
        }
        //类作用域
        var scope = this;
        var caseList = {
            1: this._getHasOneRelation,
            2: this._getHasManyRelation,
            3: this._getManyToManyRelation,
            HASONE: this._getHasOneRelation,
            HASMANY: this._getHasManyRelation,
            MANYTOMANY: this._getManyToManyRelation
        };
        relation.forEach(function (rel) {
            var type = rel.type && !~['1', '2', '3'].indexOf(rel.type + '') ? (rel.type + '').toUpperCase() : rel.type;
            if (type && type in caseList) {
                relationObj = caseList[type](scope, table, rel, config);
                if (relationObj.table) {
                    relationList.push({ table: relationObj.table, relfield: relationObj.relfield });
                    if (THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table]) {
                        THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table] = THINK.extend(false, THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table], relationObj.fields);
                    } else {
                        THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table] = relationObj.fields;
                    }
                    THINK.ORM[_this4.adapterKey]['thinkschema'][relationObj.table] = _this4.setSchema(relationObj.table, THINK.ORM[_this4.adapterKey]['thinkfields'][relationObj.table]);
                }
            }
        });
        return relationList;
    };

    /**
     *
     * @param scope
     * @param table
     * @param relation
     * @param config
     * @returns {{table: (string|string|type[]|*), relfields: *}}
     * @private
     */


    _class.prototype._getHasOneRelation = function _getHasOneRelation(scope, table, relation, config) {
        var relationModel = THINK.model(relation.model, config);
        if (relationModel.trueTableName) {
            var relationTableName = relationModel.trueTableName;
            var field = relation.field || relationTableName;
            if (scope.fields[field]) {
                throw new Error(scope.modelName + ' Model class relation field or relation columnName duplicate definitions, check to ensure no repeat this.fields named above');
            }
            scope.fields[field] = {
                model: relationTableName
            };
            return { table: relationTableName, relfield: field, fields: relationModel.fields };
        } else {
            return {};
        }
    };

    /**
     *
     * @param scope
     * @param table
     * @param relation
     * @param config
     * @returns {{table: (string|string|type[]|*), fields: *}}
     * @private
     */


    _class.prototype._getHasManyRelation = function _getHasManyRelation(scope, table, relation, config) {
        var relationModel = THINK.model(relation.model, config);
        if (relationModel.trueTableName) {
            var relationTableName = relationModel.trueTableName;
            var field = relation.field || relationTableName;
            var columnName = relation.columnName || table;
            if (scope.fields[field] || relationModel.fields[columnName]) {
                throw new Error(scope.modelName + ' or ' + relationModel.modelName + ' Model class relation field or relation columnName duplicate definitions, check to ensure no repeat this.fields named above');
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
    };

    /**
     *
     * @param scope
     * @param table
     * @param relation
     * @param config
     * @returns {{table: (string|string|type[]|*), fields: *}}
     * @private
     */


    _class.prototype._getManyToManyRelation = function _getManyToManyRelation(scope, table, relation, config) {
        var relationModel = THINK.model(relation.model, config);
        if (relationModel.trueTableName) {
            var relationTableName = relationModel.trueTableName;
            var field = relation.field || relationTableName;
            var columnName = relation.columnName || table;
            if (scope.fields[field] || relationModel.fields[columnName]) {
                throw new Error(scope.modelName + ' or ' + relationModel.modelName + ' Model class relation field or relation columnName duplicate definitions, check to ensure no repeat this.fields named above');
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
    };

    /**
     * 错误封装
     * @param err
     */


    _class.prototype.error = function error(err) {
        var msg = err || '';
        if (!THINK.isError(msg)) {
            if (!THINK.isString(msg)) {
                msg = (0, _stringify2.default)(msg);
            }
            msg = new Error(msg);
        }

        var stack = msg.message;
        // connection error
        if (~stack.indexOf('connect') || ~stack.indexOf('ECONNREFUSED')) {
            this.close(this.adapterKey);
        }
        return _promise3.default.reject(msg);
    };

    /**
     * 关闭数据链接
     * @returns {Promise}
     */


    _class.prototype.close = function close(adapterKey) {
        var _this5 = this;

        var adapters = this.dbOptions.adapters || {};
        if (adapterKey) {
            if (THINK.INSTANCES.DB[adapterKey]) {
                THINK.INSTANCES.DB[adapterKey] = null;
                //THINK.ORM[adapterKey] = null;
            }
            var promise = new _promise3.default(function (resolve) {
                if (_this5.dbOptions.connections[adapterKey] && _this5.dbOptions.connections[adapterKey].adapter) {
                    adapters[_this5.dbOptions.connections[adapterKey].adapter].teardown(null, resolve);
                }
                resolve(null);
            });
            return promise;
        } else {
            var _ret2 = function () {
                var promises = [];
                THINK.INSTANCES.DB = {};
                THINK.ORM = {};
                (0, _keys2.default)(adapters).forEach(function (adp) {
                    if (adapters[adp].teardown) {
                        var _promise = new _promise3.default(function (resolve) {
                            adapters[adp].teardown(null, resolve);
                        });
                        promises.push(_promise);
                    }
                });
                return {
                    v: _promise3.default.all(promises)
                };
            }();

            if ((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
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
        if (!THINK.isEmpty(this.fields)) {
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
        var options = void 0;
        if (THINK.isScalar(oriOpts)) {
            options = THINK.extend({}, this._options);
        } else {
            options = THINK.extend({}, this._options, oriOpts, extraOptions);
        }
        //查询过后清空sql表达式组装 避免影响下次查询
        this._options = {};

        return options;
    };

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @returns {*}
     */


    _class.prototype.parseData = function parseData(data, options) {
        var preCheck = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

        if (preCheck) {
            if (THINK.isEmpty(data)) {
                return data;
            }
            //根据模型定义字段类型进行数据检查
            var result = [];
            for (var field in data) {
                if (this.fields[field] && this.fields[field].type) {
                    switch (this.fields[field].type) {
                        case 'integer':
                            !THINK.isNumber(data[field]) && !THINK.isNumberString(data[field]) && result.push(field + '值类型错误');
                            break;
                        case 'float':
                            !THINK.isNumber(data[field]) && !THINK.isNumberString(data[field]) && result.push(field + '值类型错误');
                            break;
                        case 'boolean':
                            !THINK.isBoolean(data[field]) && result.push(field + '值类型错误');
                            break;
                        case 'array':
                            !THINK.isArray(data[field]) && result.push(field + '值类型错误');
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
                var _field = void 0,
                    value = void 0,
                    checkData = [];
                for (_field in this.validations) {
                    value = THINK.extend(this.validations[_field], { name: _field, value: data[_field] });
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
    };

    /**
     * 解构参数
     * @param options
     */


    _class.prototype.parseDeOptions = function parseDeOptions(options) {
        var parsedOptions = THINK.extend({}, options);

        parsedOptions.hasOwnProperty('page') ? delete parsedOptions.page : '';
        parsedOptions.hasOwnProperty('rel') ? delete parsedOptions.rel : '';
        parsedOptions.hasOwnProperty('verify') ? delete parsedOptions.verify : '';
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
            num = num || THINK.config('db_nums_per_page');
            page = parseInt(page, 10) || 1;
            return {
                page: page,
                num: num
            };
        }
        return {
            page: 1,
            num: THINK.config('db_nums_per_page')
        };
    };

    /**
     * 自动验证开关
     * @param data
     */


    _class.prototype.verify = function verify() {
        var flag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        this._options.verify = !!flag;
        return this;
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
        if (THINK.isObject(_order2)) {
            _order2 = THINK.extend(false, {}, _order2);
            var _order = {};
            for (var v in _order2) {
                if (THINK.isNumber(_order2[v])) {
                    _order[v] = _order2[v];
                } else {
                    if (_order2[v].toLowerCase() === 'desc') {
                        _order[v] = 0;
                    } else if (_order2[v].toLowerCase() === 'asc') {
                        _order[v] = 1;
                    }
                }
            }
            if (!THINK.isEmpty(_order)) {
                this._options.sort = _order;
            }
        } else if (THINK.isString(_order2)) {
            if (_order2.indexOf(',')) {
                var strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","').replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
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
    };

    /**
     * 要查询的字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */


    _class.prototype.field = function field(fields) {
        if (THINK.isEmpty(fields)) {
            return this;
        }
        if (THINK.isString(fields)) {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this._options.select = fields;
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
        this._options.where = THINK.extend(false, this._options.where || {}, _where);
        return this;
    };

    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeAdd = function _beforeAdd(data, options) {
        return _promise3.default.resolve(data);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(data, options) {
            var parsedOptions, model, result, pk;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;

                            if (!THINK.isEmpty(data)) {
                                _context3.next = 3;
                                break;
                            }

                            return _context3.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            // init model

                            _context3.next = 6;
                            return this.initModel();

                        case 6:
                            model = _context3.sent;

                            //copy data
                            this._data = THINK.extend({}, data);
                            _context3.next = 10;
                            return this._beforeAdd(this._data, parsedOptions);

                        case 10:
                            this._data = _context3.sent;
                            _context3.next = 13;
                            return this.parseData(this._data, parsedOptions);

                        case 13:
                            this._data = _context3.sent;
                            _context3.next = 16;
                            return model.create(this._data);

                        case 16:
                            result = _context3.sent;
                            _context3.next = 19;
                            return this.getPk();

                        case 19:
                            pk = _context3.sent;

                            this._data[pk] = this._data[pk] ? this._data[pk] : result[pk];
                            _context3.next = 23;
                            return this._afterAdd(this._data, parsedOptions);

                        case 23:
                            return _context3.abrupt('return', this._data[pk] || null);

                        case 26:
                            _context3.prev = 26;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(this.modelName + ':' + _context3.t0.message));

                        case 29:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 26]]);
        }));

        function add(_x5, _x6) {
            return _ref3.apply(this, arguments);
        }

        return add;
    }();

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._afterAdd = function _afterAdd(data, options) {
        return _promise3.default.resolve(data);
    };

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */


    _class.prototype.addAll = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(data, options) {
            var _this6 = this;

            var _ret3;

            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;
                            return _context6.delegateYield(_regenerator2.default.mark(function _callee5() {
                                var parsedOptions, model, promisesd, promiseso, result, _ret4;

                                return _regenerator2.default.wrap(function _callee5$(_context5) {
                                    while (1) {
                                        switch (_context5.prev = _context5.next) {
                                            case 0:
                                                if (!(!THINK.isArray(data) || !THINK.isObject(data[0]))) {
                                                    _context5.next = 2;
                                                    break;
                                                }

                                                return _context5.abrupt('return', {
                                                    v: _this6.error('_DATA_TYPE_INVALID_')
                                                });

                                            case 2:
                                                //parse options
                                                parsedOptions = _this6.parseOptions(options);
                                                // init model

                                                _context5.next = 5;
                                                return _this6.initModel();

                                            case 5:
                                                model = _context5.sent;

                                                //copy data
                                                _this6._data = THINK.extend([], data);

                                                promisesd = _this6._data.map(function (item) {
                                                    return _this6._beforeAdd(item, parsedOptions);
                                                });
                                                _context5.next = 10;
                                                return _promise3.default.all(promisesd);

                                            case 10:
                                                _this6._data = _context5.sent;
                                                promiseso = _this6._data.map(function (item) {
                                                    return _this6.parseData(item, parsedOptions);
                                                });
                                                _context5.next = 14;
                                                return _promise3.default.all(promiseso);

                                            case 14:
                                                _this6._data = _context5.sent;
                                                _context5.next = 17;
                                                return model.createEach(_this6._data);

                                            case 17:
                                                result = _context5.sent;

                                                if (!(!THINK.isEmpty(result) && THINK.isArray(result))) {
                                                    _context5.next = 25;
                                                    break;
                                                }

                                                return _context5.delegateYield(_regenerator2.default.mark(function _callee4() {
                                                    var pk, resData;
                                                    return _regenerator2.default.wrap(function _callee4$(_context4) {
                                                        while (1) {
                                                            switch (_context4.prev = _context4.next) {
                                                                case 0:
                                                                    _context4.next = 2;
                                                                    return _this6.getPk();

                                                                case 2:
                                                                    pk = _context4.sent;
                                                                    resData = [];

                                                                    result.forEach(function (v) {
                                                                        resData.push(_this6._afterAdd(v, parsedOptions).then(function () {
                                                                            return v[pk];
                                                                        }));
                                                                    });
                                                                    return _context4.abrupt('return', {
                                                                        v: {
                                                                            v: _promise3.default.all(resData)
                                                                        }
                                                                    });

                                                                case 6:
                                                                case 'end':
                                                                    return _context4.stop();
                                                            }
                                                        }
                                                    }, _callee4, _this6);
                                                })(), 't0', 20);

                                            case 20:
                                                _ret4 = _context5.t0;

                                                if (!((typeof _ret4 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret4)) === "object")) {
                                                    _context5.next = 23;
                                                    break;
                                                }

                                                return _context5.abrupt('return', _ret4.v);

                                            case 23:
                                                _context5.next = 26;
                                                break;

                                            case 25:
                                                return _context5.abrupt('return', {
                                                    v: []
                                                });

                                            case 26:
                                            case 'end':
                                                return _context5.stop();
                                        }
                                    }
                                }, _callee5, _this6);
                            })(), 't0', 2);

                        case 2:
                            _ret3 = _context6.t0;

                            if (!((typeof _ret3 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret3)) === "object")) {
                                _context6.next = 5;
                                break;
                            }

                            return _context6.abrupt('return', _ret3.v);

                        case 5:
                            _context6.next = 10;
                            break;

                        case 7:
                            _context6.prev = 7;
                            _context6.t1 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(this.modelName + ':' + _context6.t1.message));

                        case 10:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 7]]);
        }));

        function addAll(_x7, _x8) {
            return _ref4.apply(this, arguments);
        }

        return addAll;
    }();

    /**
     * 根据条件查询后不存在则新增
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.thenAdd = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(data, options) {
            var info;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.next = 2;
                            return this.find(options);

                        case 2:
                            info = _context7.sent;

                            if (!THINK.isEmpty(info)) {
                                _context7.next = 5;
                                break;
                            }

                            return _context7.abrupt('return', this.add(data, options));

                        case 5:
                            return _context7.abrupt('return', null);

                        case 6:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function thenAdd(_x9, _x10) {
            return _ref5.apply(this, arguments);
        }

        return thenAdd;
    }();

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeDelete = function _beforeDelete(options) {
        return _promise3.default.resolve(options);
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options) {
            var _this7 = this;

            var parsedOptions, model, result, _ret5;

            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.prev = 0;

                            //parse options
                            parsedOptions = this.parseOptions(options);
                            // init model

                            _context9.next = 4;
                            return this.initModel();

                        case 4:
                            model = _context9.sent;
                            _context9.next = 7;
                            return this._beforeDelete(parsedOptions);

                        case 7:
                            _context9.next = 9;
                            return model.destroy(this.parseDeOptions(parsedOptions));

                        case 9:
                            result = _context9.sent;
                            _context9.next = 12;
                            return this._afterDelete(parsedOptions || {});

                        case 12:
                            if (!(!THINK.isEmpty(result) && THINK.isArray(result))) {
                                _context9.next = 19;
                                break;
                            }

                            return _context9.delegateYield(_regenerator2.default.mark(function _callee8() {
                                var pk, affectedRows;
                                return _regenerator2.default.wrap(function _callee8$(_context8) {
                                    while (1) {
                                        switch (_context8.prev = _context8.next) {
                                            case 0:
                                                _context8.next = 2;
                                                return _this7.getPk();

                                            case 2:
                                                pk = _context8.sent;
                                                affectedRows = [];

                                                result.forEach(function (v) {
                                                    affectedRows.push(v[pk]);
                                                });
                                                return _context8.abrupt('return', {
                                                    v: affectedRows
                                                });

                                            case 6:
                                            case 'end':
                                                return _context8.stop();
                                        }
                                    }
                                }, _callee8, _this7);
                            })(), 't0', 14);

                        case 14:
                            _ret5 = _context9.t0;

                            if (!((typeof _ret5 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret5)) === "object")) {
                                _context9.next = 17;
                                break;
                            }

                            return _context9.abrupt('return', _ret5.v);

                        case 17:
                            _context9.next = 20;
                            break;

                        case 19:
                            return _context9.abrupt('return', []);

                        case 20:
                            _context9.next = 25;
                            break;

                        case 22:
                            _context9.prev = 22;
                            _context9.t1 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(this.modelName + ':' + _context9.t1.message));

                        case 25:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 22]]);
        }));

        function _delete(_x11) {
            return _ref6.apply(this, arguments);
        }

        return _delete;
    }();

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */


    _class.prototype._afterDelete = function _afterDelete(options) {
        return _promise3.default.resolve(options);
    };

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeUpdate = function _beforeUpdate(data, options) {
        return _promise3.default.resolve(data);
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(data, options) {
            var _this8 = this;

            var _ret6;

            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            _context11.prev = 0;
                            return _context11.delegateYield(_regenerator2.default.mark(function _callee10() {
                                var parsedOptions, model, pk, result, affectedRows;
                                return _regenerator2.default.wrap(function _callee10$(_context10) {
                                    while (1) {
                                        switch (_context10.prev = _context10.next) {
                                            case 0:
                                                if (!THINK.isEmpty(data)) {
                                                    _context10.next = 2;
                                                    break;
                                                }

                                                return _context10.abrupt('return', {
                                                    v: _this8.error('_DATA_TYPE_INVALID_')
                                                });

                                            case 2:
                                                //parse options
                                                parsedOptions = _this8.parseOptions(options);
                                                // init model

                                                _context10.next = 5;
                                                return _this8.initModel();

                                            case 5:
                                                model = _context10.sent;

                                                //copy data
                                                _this8._data = THINK.extend({}, data);

                                                _context10.next = 9;
                                                return _this8._beforeUpdate(_this8._data, parsedOptions);

                                            case 9:
                                                _this8._data = _context10.sent;
                                                _context10.next = 12;
                                                return _this8.parseData(_this8._data, parsedOptions);

                                            case 12:
                                                _this8._data = _context10.sent;
                                                _context10.next = 15;
                                                return _this8.getPk();

                                            case 15:
                                                pk = _context10.sent;

                                                if (!THINK.isEmpty(parsedOptions.where)) {
                                                    _context10.next = 25;
                                                    break;
                                                }

                                                if (THINK.isEmpty(_this8._data[pk])) {
                                                    _context10.next = 22;
                                                    break;
                                                }

                                                parsedOptions.where = THINK.getObject(pk, _this8._data[pk]);
                                                delete _this8._data[pk];
                                                _context10.next = 23;
                                                break;

                                            case 22:
                                                return _context10.abrupt('return', {
                                                    v: _this8.error('_OPERATION_WRONG_')
                                                });

                                            case 23:
                                                _context10.next = 26;
                                                break;

                                            case 25:
                                                if (!THINK.isEmpty(_this8._data[pk])) {
                                                    delete _this8._data[pk];
                                                }

                                            case 26:
                                                _context10.next = 28;
                                                return model.update(parsedOptions, _this8._data);

                                            case 28:
                                                result = _context10.sent;
                                                _context10.next = 31;
                                                return _this8._afterUpdate(_this8._data, parsedOptions);

                                            case 31:
                                                affectedRows = [];

                                                if (!(!THINK.isEmpty(result) && THINK.isArray(result))) {
                                                    _context10.next = 37;
                                                    break;
                                                }

                                                result.forEach(function (v) {
                                                    affectedRows.push(v[pk]);
                                                });
                                                return _context10.abrupt('return', {
                                                    v: affectedRows
                                                });

                                            case 37:
                                                return _context10.abrupt('return', {
                                                    v: []
                                                });

                                            case 38:
                                            case 'end':
                                                return _context10.stop();
                                        }
                                    }
                                }, _callee10, _this8);
                            })(), 't0', 2);

                        case 2:
                            _ret6 = _context11.t0;

                            if (!((typeof _ret6 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret6)) === "object")) {
                                _context11.next = 5;
                                break;
                            }

                            return _context11.abrupt('return', _ret6.v);

                        case 5:
                            _context11.next = 10;
                            break;

                        case 7:
                            _context11.prev = 7;
                            _context11.t1 = _context11['catch'](0);
                            return _context11.abrupt('return', this.error(this.modelName + ':' + _context11.t1.message));

                        case 10:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this, [[0, 7]]);
        }));

        function update(_x12, _x13) {
            return _ref7.apply(this, arguments);
        }

        return update;
    }();

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._afterUpdate = function _afterUpdate(data, options) {
        return _promise3.default.resolve(data);
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(options) {
            var _this9 = this;

            var _ret7;

            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            _context14.prev = 0;
                            return _context14.delegateYield(_regenerator2.default.mark(function _callee13() {
                                var parsedOptions, model, result;
                                return _regenerator2.default.wrap(function _callee13$(_context13) {
                                    while (1) {
                                        switch (_context13.prev = _context13.next) {
                                            case 0:
                                                //parse options
                                                parsedOptions = _this9.parseOptions(options, { limit: 1 });
                                                // init model

                                                _context13.next = 3;
                                                return _this9.initModel();

                                            case 3:
                                                model = _context13.sent;
                                                result = [];

                                                if (!(parsedOptions.rel && !THINK.isEmpty(_this9.relation))) {
                                                    _context13.next = 9;
                                                    break;
                                                }

                                                return _context13.delegateYield(_regenerator2.default.mark(function _callee12() {
                                                    var process;
                                                    return _regenerator2.default.wrap(function _callee12$(_context12) {
                                                        while (1) {
                                                            switch (_context12.prev = _context12.next) {
                                                                case 0:
                                                                    process = model.find(_this9.parseDeOptions(parsedOptions));

                                                                    if (!THINK.isEmpty(_this9._relationLink)) {
                                                                        _this9._relationLink.forEach(function (v) {
                                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                                process = process.populate(v.relfield);
                                                                            }
                                                                        });
                                                                    }
                                                                    _context12.next = 4;
                                                                    return process;

                                                                case 4:
                                                                    result = _context12.sent;

                                                                case 5:
                                                                case 'end':
                                                                    return _context12.stop();
                                                            }
                                                        }
                                                    }, _callee12, _this9);
                                                })(), 't0', 7);

                                            case 7:
                                                _context13.next = 12;
                                                break;

                                            case 9:
                                                _context13.next = 11;
                                                return model.find(_this9.parseDeOptions(parsedOptions));

                                            case 11:
                                                result = _context13.sent;

                                            case 12:
                                                _context13.next = 14;
                                                return _this9.parseData(result, parsedOptions, false);

                                            case 14:
                                                result = _context13.sent;
                                                return _context13.abrupt('return', {
                                                    v: _this9._afterFind(result[0] || {}, parsedOptions)
                                                });

                                            case 16:
                                            case 'end':
                                                return _context13.stop();
                                        }
                                    }
                                }, _callee13, _this9);
                            })(), 't0', 2);

                        case 2:
                            _ret7 = _context14.t0;

                            if (!((typeof _ret7 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret7)) === "object")) {
                                _context14.next = 5;
                                break;
                            }

                            return _context14.abrupt('return', _ret7.v);

                        case 5:
                            _context14.next = 10;
                            break;

                        case 7:
                            _context14.prev = 7;
                            _context14.t1 = _context14['catch'](0);
                            return _context14.abrupt('return', this.error(this.modelName + ':' + _context14.t1.message));

                        case 10:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this, [[0, 7]]);
        }));

        function find(_x14) {
            return _ref8.apply(this, arguments);
        }

        return find;
    }();

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */


    _class.prototype._afterFind = function _afterFind(result, options) {
        return _promise3.default.resolve(result);
    };

    /**
     * 查询数据条数
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(options) {
            var _this10 = this;

            var _ret9;

            return _regenerator2.default.wrap(function _callee17$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            _context17.prev = 0;
                            return _context17.delegateYield(_regenerator2.default.mark(function _callee16() {
                                var parsedOptions, model, result, pk;
                                return _regenerator2.default.wrap(function _callee16$(_context16) {
                                    while (1) {
                                        switch (_context16.prev = _context16.next) {
                                            case 0:
                                                //parse options
                                                parsedOptions = _this10.parseOptions(options);
                                                // init model

                                                _context16.next = 3;
                                                return _this10.initModel();

                                            case 3:
                                                model = _context16.sent;
                                                result = [];
                                                _context16.next = 7;
                                                return _this10.getPk();

                                            case 7:
                                                pk = _context16.sent;

                                                parsedOptions.select = (0, _of2.default)(pk);
                                                parsedOptions.sort && delete parsedOptions.sort;

                                                if (!(parsedOptions.rel && !THINK.isEmpty(_this10.relation))) {
                                                    _context16.next = 14;
                                                    break;
                                                }

                                                return _context16.delegateYield(_regenerator2.default.mark(function _callee15() {
                                                    var process;
                                                    return _regenerator2.default.wrap(function _callee15$(_context15) {
                                                        while (1) {
                                                            switch (_context15.prev = _context15.next) {
                                                                case 0:
                                                                    process = model.find(_this10.parseDeOptions(parsedOptions));

                                                                    if (!THINK.isEmpty(_this10._relationLink)) {
                                                                        _this10._relationLink.forEach(function (v) {
                                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                                process = process.populate(v.relfield);
                                                                            }
                                                                        });
                                                                    }
                                                                    _context15.next = 4;
                                                                    return process;

                                                                case 4:
                                                                    result = _context15.sent;

                                                                case 5:
                                                                case 'end':
                                                                    return _context15.stop();
                                                            }
                                                        }
                                                    }, _callee15, _this10);
                                                })(), 't0', 12);

                                            case 12:
                                                _context16.next = 17;
                                                break;

                                            case 14:
                                                _context16.next = 16;
                                                return model.find(_this10.parseDeOptions(parsedOptions));

                                            case 16:
                                                result = _context16.sent;

                                            case 17:
                                                _context16.next = 19;
                                                return _this10.parseData(result, parsedOptions, false);

                                            case 19:
                                                result = _context16.sent;

                                                result = THINK.isEmpty(result) ? 0 : result.length;
                                                return _context16.abrupt('return', {
                                                    v: result || 0
                                                });

                                            case 22:
                                            case 'end':
                                                return _context16.stop();
                                        }
                                    }
                                }, _callee16, _this10);
                            })(), 't0', 2);

                        case 2:
                            _ret9 = _context17.t0;

                            if (!((typeof _ret9 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret9)) === "object")) {
                                _context17.next = 5;
                                break;
                            }

                            return _context17.abrupt('return', _ret9.v);

                        case 5:
                            _context17.next = 10;
                            break;

                        case 7:
                            _context17.prev = 7;
                            _context17.t1 = _context17['catch'](0);
                            return _context17.abrupt('return', this.error(this.modelName + ':' + _context17.t1.message));

                        case 10:
                        case 'end':
                            return _context17.stop();
                    }
                }
            }, _callee17, this, [[0, 7]]);
        }));

        function count(_x15) {
            return _ref9.apply(this, arguments);
        }

        return count;
    }();

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(field, options) {
            var _this11 = this;

            var _ret11;

            return _regenerator2.default.wrap(function _callee20$(_context20) {
                while (1) {
                    switch (_context20.prev = _context20.next) {
                        case 0:
                            _context20.prev = 0;
                            return _context20.delegateYield(_regenerator2.default.mark(function _callee19() {
                                var parsedOptions, model, result, pk;
                                return _regenerator2.default.wrap(function _callee19$(_context19) {
                                    while (1) {
                                        switch (_context19.prev = _context19.next) {
                                            case 0:
                                                //parse options
                                                parsedOptions = _this11.parseOptions(options);
                                                // init model

                                                _context19.next = 3;
                                                return _this11.initModel();

                                            case 3:
                                                model = _context19.sent;
                                                result = [];
                                                _context19.next = 7;
                                                return _this11.getPk();

                                            case 7:
                                                pk = _context19.sent;

                                                field = THINK.isString(field) ? field : pk;
                                                parsedOptions.select = (0, _of2.default)(field);
                                                parsedOptions.sort && delete parsedOptions.sort;

                                                if (!(parsedOptions.rel && !THINK.isEmpty(_this11.relation))) {
                                                    _context19.next = 15;
                                                    break;
                                                }

                                                return _context19.delegateYield(_regenerator2.default.mark(function _callee18() {
                                                    var process;
                                                    return _regenerator2.default.wrap(function _callee18$(_context18) {
                                                        while (1) {
                                                            switch (_context18.prev = _context18.next) {
                                                                case 0:
                                                                    process = model.find(_this11.parseDeOptions(parsedOptions));

                                                                    if (!THINK.isEmpty(_this11._relationLink)) {
                                                                        _this11._relationLink.forEach(function (v) {
                                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                                process = process.populate(v.relfield);
                                                                            }
                                                                        });
                                                                    }
                                                                    _context18.next = 4;
                                                                    return process.sum(field);

                                                                case 4:
                                                                    result = _context18.sent;

                                                                case 5:
                                                                case 'end':
                                                                    return _context18.stop();
                                                            }
                                                        }
                                                    }, _callee18, _this11);
                                                })(), 't0', 13);

                                            case 13:
                                                _context19.next = 18;
                                                break;

                                            case 15:
                                                _context19.next = 17;
                                                return model.find(_this11.parseDeOptions(parsedOptions)).sum(field);

                                            case 17:
                                                result = _context19.sent;

                                            case 18:
                                                _context19.next = 20;
                                                return _this11.parseData(result, parsedOptions, false);

                                            case 20:
                                                result = _context19.sent;

                                                result = THINK.isEmpty(result) ? 0 : result[0] ? result[0][field] || 0 : 0;
                                                return _context19.abrupt('return', {
                                                    v: result || 0
                                                });

                                            case 23:
                                            case 'end':
                                                return _context19.stop();
                                        }
                                    }
                                }, _callee19, _this11);
                            })(), 't0', 2);

                        case 2:
                            _ret11 = _context20.t0;

                            if (!((typeof _ret11 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret11)) === "object")) {
                                _context20.next = 5;
                                break;
                            }

                            return _context20.abrupt('return', _ret11.v);

                        case 5:
                            _context20.next = 10;
                            break;

                        case 7:
                            _context20.prev = 7;
                            _context20.t1 = _context20['catch'](0);
                            return _context20.abrupt('return', this.error(this.modelName + ':' + _context20.t1.message));

                        case 10:
                        case 'end':
                            return _context20.stop();
                    }
                }
            }, _callee20, this, [[0, 7]]);
        }));

        function sum(_x16, _x17) {
            return _ref10.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee23(options) {
            var _this12 = this;

            var _ret13;

            return _regenerator2.default.wrap(function _callee23$(_context23) {
                while (1) {
                    switch (_context23.prev = _context23.next) {
                        case 0:
                            _context23.prev = 0;
                            return _context23.delegateYield(_regenerator2.default.mark(function _callee22() {
                                var parsedOptions, model, result;
                                return _regenerator2.default.wrap(function _callee22$(_context22) {
                                    while (1) {
                                        switch (_context22.prev = _context22.next) {
                                            case 0:
                                                //parse options
                                                parsedOptions = _this12.parseOptions(options);
                                                // init model

                                                _context22.next = 3;
                                                return _this12.initModel();

                                            case 3:
                                                model = _context22.sent;
                                                result = [];

                                                if (!(parsedOptions.rel && !THINK.isEmpty(_this12.relation))) {
                                                    _context22.next = 9;
                                                    break;
                                                }

                                                return _context22.delegateYield(_regenerator2.default.mark(function _callee21() {
                                                    var process;
                                                    return _regenerator2.default.wrap(function _callee21$(_context21) {
                                                        while (1) {
                                                            switch (_context21.prev = _context21.next) {
                                                                case 0:
                                                                    process = model.find(_this12.parseDeOptions(parsedOptions));

                                                                    if (!THINK.isEmpty(_this12._relationLink)) {
                                                                        _this12._relationLink.forEach(function (v) {
                                                                            if (parsedOptions.rel === true || parsedOptions.rel.indexOf(v.table) > -1) {
                                                                                process = process.populate(v.relfield);
                                                                            }
                                                                        });
                                                                    }
                                                                    _context21.next = 4;
                                                                    return process;

                                                                case 4:
                                                                    result = _context21.sent;

                                                                case 5:
                                                                case 'end':
                                                                    return _context21.stop();
                                                            }
                                                        }
                                                    }, _callee21, _this12);
                                                })(), 't0', 7);

                                            case 7:
                                                _context22.next = 12;
                                                break;

                                            case 9:
                                                _context22.next = 11;
                                                return model.find(_this12.parseDeOptions(parsedOptions));

                                            case 11:
                                                result = _context22.sent;

                                            case 12:
                                                _context22.next = 14;
                                                return _this12.parseData(result, parsedOptions, false);

                                            case 14:
                                                result = _context22.sent;
                                                return _context22.abrupt('return', {
                                                    v: _this12._afterSelect(result || [], parsedOptions)
                                                });

                                            case 16:
                                            case 'end':
                                                return _context22.stop();
                                        }
                                    }
                                }, _callee22, _this12);
                            })(), 't0', 2);

                        case 2:
                            _ret13 = _context23.t0;

                            if (!((typeof _ret13 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret13)) === "object")) {
                                _context23.next = 5;
                                break;
                            }

                            return _context23.abrupt('return', _ret13.v);

                        case 5:
                            _context23.next = 10;
                            break;

                        case 7:
                            _context23.prev = 7;
                            _context23.t1 = _context23['catch'](0);
                            return _context23.abrupt('return', this.error(this.modelName + ':' + _context23.t1.message));

                        case 10:
                        case 'end':
                            return _context23.stop();
                    }
                }
            }, _callee23, this, [[0, 7]]);
        }));

        function select(_x18) {
            return _ref11.apply(this, arguments);
        }

        return select;
    }();

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._afterSelect = function _afterSelect(result, options) {
        return _promise3.default.resolve(result);
    };

    /**
     * 返回数据里含有count信息的查询
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */


    _class.prototype.countSelect = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee24(options, pageFlag) {
            var parsedOptions, model, count, pageOptions, totalPage, result;
            return _regenerator2.default.wrap(function _callee24$(_context24) {
                while (1) {
                    switch (_context24.prev = _context24.next) {
                        case 0:
                            _context24.prev = 0;

                            if (THINK.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            // init model

                            _context24.next = 5;
                            return this.initModel();

                        case 5:
                            model = _context24.sent;
                            _context24.next = 8;
                            return this.count(parsedOptions);

                        case 8:
                            count = _context24.sent;
                            pageOptions = this.parsePage(parsedOptions);
                            totalPage = Math.ceil(count / pageOptions.num);

                            if (THINK.isBoolean(pageFlag)) {
                                if (pageOptions.page > totalPage) {
                                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                                }
                                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                            }
                            //传入分页参数
                            parsedOptions.skip = pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
                            parsedOptions.limit = pageOptions.num;
                            result = THINK.extend(false, { count: count, total: totalPage }, pageOptions);

                            if (!parsedOptions.page) {
                                parsedOptions.page = pageOptions.page;
                            }
                            _context24.next = 18;
                            return this.select(parsedOptions);

                        case 18:
                            result.data = _context24.sent;
                            _context24.next = 21;
                            return this.parseData(result, parsedOptions, false);

                        case 21:
                            result = _context24.sent;
                            return _context24.abrupt('return', result);

                        case 25:
                            _context24.prev = 25;
                            _context24.t0 = _context24['catch'](0);
                            return _context24.abrupt('return', this.error(this.modelName + ':' + _context24.t0.message));

                        case 28:
                        case 'end':
                            return _context24.stop();
                    }
                }
            }, _callee24, this, [[0, 25]]);
        }));

        function countSelect(_x19, _x20) {
            return _ref12.apply(this, arguments);
        }

        return countSelect;
    }();

    /**
     * 原生语句查询
     * mysql  THINK.model('Test',{}).query('select * from test');
     * mongo  THINK.model('Test',{}).query('db.test.find()');
     * @param sqlStr
     */


    _class.prototype.query = function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee26(sqlStr) {
            var _this13 = this;

            var _ret15;

            return _regenerator2.default.wrap(function _callee26$(_context26) {
                while (1) {
                    switch (_context26.prev = _context26.next) {
                        case 0:
                            _context26.prev = 0;
                            return _context26.delegateYield(_regenerator2.default.mark(function _callee25() {
                                var model, process, result, quer, tableName, cls, func, _cls, _cls2;

                                return _regenerator2.default.wrap(function _callee25$(_context25) {
                                    while (1) {
                                        switch (_context25.prev = _context25.next) {
                                            case 0:
                                                //safe mode
                                                _this13.config.db_ext_config.safe = true;
                                                // init model
                                                _context25.next = 3;
                                                return _this13.initModel();

                                            case 3:
                                                model = _context25.sent;
                                                process = null, result = [];

                                                if (!(_this13.config.db_type === 'mongo')) {
                                                    _context25.next = 28;
                                                    break;
                                                }

                                                quer = sqlStr.split('.');

                                                if (!(THINK.isEmpty(quer) || THINK.isEmpty(quer[0]) || quer[0] !== 'db' || THINK.isEmpty(quer[1]))) {
                                                    _context25.next = 9;
                                                    break;
                                                }

                                                return _context25.abrupt('return', {
                                                    v: _this13.error('query language error')
                                                });

                                            case 9:
                                                quer.shift();
                                                tableName = quer.shift();

                                                if (!(tableName !== _this13.trueTableName)) {
                                                    _context25.next = 13;
                                                    break;
                                                }

                                                return _context25.abrupt('return', {
                                                    v: _this13.error('table name error')
                                                });

                                            case 13:
                                                if (!(!THINK.INSTANCES.DB[_this13.adapterKey] || !THINK.INSTANCES.DB[_this13.adapterKey].collections || !THINK.INSTANCES.DB[_this13.adapterKey].collections[tableName])) {
                                                    _context25.next = 15;
                                                    break;
                                                }

                                                return _context25.abrupt('return', {
                                                    v: _this13.error('model init error')
                                                });

                                            case 15:
                                                model = THINK.INSTANCES.DB[_this13.adapterKey].collections[tableName];
                                                cls = THINK.promisify(model.native, model);
                                                _context25.next = 19;
                                                return cls();

                                            case 19:
                                                process = _context25.sent;
                                                func = new Function('process', 'return process.' + quer.join('.') + ';');

                                                process = func(process);
                                                process = new _promise3.default(function (reslove, reject) {
                                                    process.toArray(function (err, results) {
                                                        if (err) reject(err);
                                                        reslove(results);
                                                    });
                                                });

                                                _context25.next = 25;
                                                return process;

                                            case 25:
                                                result = _context25.sent;
                                                _context25.next = 43;
                                                break;

                                            case 28:
                                                if (!(_this13.config.db_type === 'mysql')) {
                                                    _context25.next = 35;
                                                    break;
                                                }

                                                _cls = THINK.promisify(model.query, _this13);
                                                _context25.next = 32;
                                                return _cls(sqlStr);

                                            case 32:
                                                result = _context25.sent;
                                                _context25.next = 43;
                                                break;

                                            case 35:
                                                if (!(_this13.config.db_type === 'postgresql')) {
                                                    _context25.next = 42;
                                                    break;
                                                }

                                                _cls2 = THINK.promisify(model.query, _this13);
                                                _context25.next = 39;
                                                return _cls2(sqlStr);

                                            case 39:
                                                result = _context25.sent;
                                                _context25.next = 43;
                                                break;

                                            case 42:
                                                return _context25.abrupt('return', {
                                                    v: _this13.error('adapter not supported this method')
                                                });

                                            case 43:
                                                _context25.next = 45;
                                                return _this13.parseData(result, {}, false);

                                            case 45:
                                                result = _context25.sent;
                                                return _context25.abrupt('return', {
                                                    v: result
                                                });

                                            case 47:
                                            case 'end':
                                                return _context25.stop();
                                        }
                                    }
                                }, _callee25, _this13);
                            })(), 't0', 2);

                        case 2:
                            _ret15 = _context26.t0;

                            if (!((typeof _ret15 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret15)) === "object")) {
                                _context26.next = 5;
                                break;
                            }

                            return _context26.abrupt('return', _ret15.v);

                        case 5:
                            _context26.next = 10;
                            break;

                        case 7:
                            _context26.prev = 7;
                            _context26.t1 = _context26['catch'](0);
                            return _context26.abrupt('return', this.error(this.modelName + ':' + _context26.t1.message));

                        case 10:
                        case 'end':
                            return _context26.stop();
                    }
                }
            }, _callee26, this, [[0, 7]]);
        }));

        function query(_x21) {
            return _ref13.apply(this, arguments);
        }

        return query;
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