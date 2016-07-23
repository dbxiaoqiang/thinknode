'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Valid = require('../Util/Valid');

var _Valid2 = _interopRequireDefault(_Valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
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
            db_ext_config: THINK.config('db_ext_config'),
            buffer_tostring: true
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
    };

    /**
     * 获取表模型
     * @param table
     */


    _class.prototype.getSchema = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(table) {
            var storeKey, schema, name;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            table = table || this.getTableName();
                            storeKey = this.config.db_type + '_' + table + '_schema';
                            schema = {};

                            if (!this.config.schema_force_update) {
                                _context.next = 9;
                                break;
                            }

                            _context.next = 6;
                            return this.db().getSchema(table);

                        case 6:
                            schema = _context.sent;
                            _context.next = 15;
                            break;

                        case 9:
                            schema = THINK.CACHES.Schema[storeKey];

                            if (schema) {
                                _context.next = 15;
                                break;
                            }

                            _context.next = 13;
                            return this.db().getSchema(table);

                        case 13:
                            schema = _context.sent;

                            THINK.CACHES.Schema[storeKey] = schema;

                        case 15:
                            if (!(table !== this.getTableName())) {
                                _context.next = 17;
                                break;
                            }

                            return _context.abrupt('return', schema);

                        case 17:
                            _context.t0 = _regenerator2.default.keys(schema);

                        case 18:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 25;
                                break;
                            }

                            name = _context.t1.value;

                            if (!schema[name].primary) {
                                _context.next = 23;
                                break;
                            }

                            this.pk = name;
                            return _context.abrupt('break', 25);

                        case 23:
                            _context.next = 18;
                            break;

                        case 25:
                            //merge user set schema config
                            this.schema = THINK.extend({}, schema, this.fields);
                            return _context.abrupt('return', this.schema);

                        case 27:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getSchema(_x3) {
            return _ref.apply(this, arguments);
        }

        return getSchema;
    }();

    /**
     *  获取DB单例
     */


    _class.prototype.db = function db() {
        if (this._db) return this._db;
        var DB = THINK.require(this.config.db_type || 'mysql', 'Db');
        this._db = new DB(this.config);
        return this._db;
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
        return _promise2.default.reject(msg);
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
        //获取表名
        options.table = options.table || this.getTableName();
        //表前缀，Db里会使用
        options.tablePrefix = this.tablePrefix;
        options.model = this.getModelName();
        //解析field,根据model的fields进行过滤
        var field = [];
        if (THINK.isEmpty(options.field) && !THINK.isEmpty(options.fields)) options.field = options.fields;
        return options;
    };

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @returns {*}
     */


    _class.prototype.parseData = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, options) {
            var preCheck = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
            var option = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

            var result, fields, field, key, _field, value, checkData;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!preCheck) {
                                _context2.next = 47;
                                break;
                            }

                            if (!THINK.isEmpty(data)) {
                                _context2.next = 3;
                                break;
                            }

                            return _context2.abrupt('return', data);

                        case 3:
                            result = [];
                            _context2.next = 6;
                            return this.getSchema();

                        case 6:
                            fields = _context2.sent;
                            _context2.t0 = _regenerator2.default.keys(data);

                        case 8:
                            if ((_context2.t1 = _context2.t0()).done) {
                                _context2.next = 27;
                                break;
                            }

                            field = _context2.t1.value;

                            if (!(fields[field] && fields[field].type)) {
                                _context2.next = 25;
                                break;
                            }

                            _context2.t2 = fields[field].type;
                            _context2.next = _context2.t2 === 'integer' ? 14 : _context2.t2 === 'int' ? 14 : _context2.t2 === 'float' ? 16 : _context2.t2 === 'boolean' ? 18 : _context2.t2 === 'array' ? 20 : 22;
                            break;

                        case 14:
                            !THINK.isNumber(data[field]) && !THINK.isNumberString(data[field]) && result.push(field + '值类型错误');
                            return _context2.abrupt('break', 23);

                        case 16:
                            !THINK.isNumber(data[field]) && !THINK.isNumberString(data[field]) && result.push(field + '值类型错误');
                            return _context2.abrupt('break', 23);

                        case 18:
                            !THINK.isBoolean(data[field]) && result.push(field + '值类型错误');
                            return _context2.abrupt('break', 23);

                        case 20:
                            !THINK.isArray(data[field]) && result.push(field + '值类型错误');
                            return _context2.abrupt('break', 23);

                        case 22:
                            return _context2.abrupt('break', 23);

                        case 23:
                            if (!(result.length > 0)) {
                                _context2.next = 25;
                                break;
                            }

                            return _context2.abrupt('return', this.error(result[0]));

                        case 25:
                            _context2.next = 8;
                            break;

                        case 27:
                            _context2.t3 = option;
                            _context2.next = _context2.t3 === 1 ? 30 : _context2.t3 === 2 ? 32 : _context2.t3 === 3 ? 32 : 32;
                            break;

                        case 30:
                            //新增
                            for (key in fields) {
                                if (THINK.isFunction(fields[key].defaultsTo)) {
                                    data[key] = fields[key].defaultsTo();
                                } else if (!THINK.isEmpty(fields[key].defaultsTo)) {
                                    data[key] = fields[key].defaultsTo;
                                }
                            }
                            return _context2.abrupt('break', 32);

                        case 32:
                            if (!options.verify) {
                                _context2.next = 44;
                                break;
                            }

                            if (!THINK.isEmpty(this.validations)) {
                                _context2.next = 35;
                                break;
                            }

                            return _context2.abrupt('return', data);

                        case 35:
                            _field = void 0, value = void 0, checkData = [];

                            for (_field in this.validations) {
                                value = THINK.extend(this.validations[_field], { name: _field, value: data[_field] });
                                checkData.push(value);
                            }

                            if (!THINK.isEmpty(checkData)) {
                                _context2.next = 39;
                                break;
                            }

                            return _context2.abrupt('return', data);

                        case 39:
                            result = {};
                            result = this._valid(checkData);

                            if (!THINK.isEmpty(result)) {
                                _context2.next = 43;
                                break;
                            }

                            return _context2.abrupt('return', data);

                        case 43:
                            return _context2.abrupt('return', this.error((0, _values2.default)(result)[0]));

                        case 44:
                            return _context2.abrupt('return', data);

                        case 47:
                            if (!THINK.isJSONObj(data)) {
                                _context2.next = 51;
                                break;
                            }

                            return _context2.abrupt('return', data);

                        case 51:
                            return _context2.abrupt('return', JSON.parse((0, _stringify2.default)(data)));

                        case 52:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function parseData(_x4, _x5, _x6, _x7) {
            return _ref2.apply(this, arguments);
        }

        return parseData;
    }();

    /**
     * 解构参数
     * @param options
     */


    _class.prototype.parseDeOptions = function parseDeOptions(options) {
        var parsedOptions = THINK.extend({}, options);
        parsedOptions.hasOwnProperty('tableName') ? delete parsedOptions.tableName : '';
        parsedOptions.hasOwnProperty('tablePrefix') ? delete parsedOptions.tablePrefix : '';
        parsedOptions.hasOwnProperty('modelName') ? delete parsedOptions.modelName : '';
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
     * set having options
     * @param  {String} value []
     * @return {}       []
     */


    _class.prototype.having = function having(value) {
        this._options.having = value;
        return this;
    };

    /**
     * 分组
     * @param value
     */


    _class.prototype.group = function group(value) {
        this._options.group = value;
        return this;
    };

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


    _class.prototype.join = function join(_join) {
        if (!_join) {
            return this;
        }
        if (!this._options.join) {
            this._options.join = [];
        }
        if (THINK.isArray(_join)) {
            this._options.join = this._options.join.concat(_join);
        } else {
            this._options.join.push(_join);
        }
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
            if (_order2.indexOf(',') > -1) {
                var strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","').replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
                };
                this._options.order = JSON.parse(strToObj(_order2));
            } else {

                this._options.order = _order2;
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
        this._options.fields = fields;
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
        return _promise2.default.resolve(data);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(data, options) {
            var _this2 = this;

            var parsedOptions, result, pk;
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
                            //copy data

                            this._data = THINK.extend({}, data);
                            _context3.next = 7;
                            return this._beforeAdd(this._data, parsedOptions);

                        case 7:
                            this._data = _context3.sent;
                            _context3.next = 10;
                            return this.parseData(this._data, parsedOptions);

                        case 10:
                            this._data = _context3.sent;
                            _context3.next = 13;
                            return this.db().add(this._data, parsedOptions).catch(function (e) {
                                return _this2.error(_this2.modelName + ':' + e.message);
                            });

                        case 13:
                            result = _context3.sent;

                            this._data[this.pk] = this.db().getLastInsertId();

                            if (THINK.isEmpty(this.relation)) {
                                _context3.next = 18;
                                break;
                            }

                            _context3.next = 18;
                            return this.__postRelationData(this._data[this.pk], this._data, 'ADD', parsedOptions);

                        case 18:
                            _context3.next = 20;
                            return this.getPk();

                        case 20:
                            pk = _context3.sent;

                            this._data[pk] = this._data[pk] ? this._data[pk] : result[pk];
                            _context3.next = 24;
                            return this._afterAdd(this._data, parsedOptions);

                        case 24:
                            return _context3.abrupt('return', this._data[pk]);

                        case 27:
                            _context3.prev = 27;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(_context3.t0));

                        case 30:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 27]]);
        }));

        function add(_x12, _x13) {
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
        return _promise2.default.resolve(data);
    };

    /**
     * 插入多条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param {[type]} replace [description]
     */


    _class.prototype.addAll = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(data, options) {
            var _this3 = this;

            var _ret;

            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;
                            return _context5.delegateYield(_regenerator2.default.mark(function _callee4() {
                                var parsedOptions, promisesd, promiseso, result;
                                return _regenerator2.default.wrap(function _callee4$(_context4) {
                                    while (1) {
                                        switch (_context4.prev = _context4.next) {
                                            case 0:
                                                if (!(!THINK.isArray(data) || !THINK.isObject(data[0]))) {
                                                    _context4.next = 2;
                                                    break;
                                                }

                                                return _context4.abrupt('return', {
                                                    v: _this3.error('_DATA_TYPE_INVALID_')
                                                });

                                            case 2:
                                                //parse options
                                                parsedOptions = _this3.parseOptions(options);
                                                //copy data

                                                _this3._data = THINK.extend([], data);

                                                promisesd = _this3._data.map(function (item) {
                                                    return _this3._beforeAdd(item, parsedOptions);
                                                });
                                                _context4.next = 7;
                                                return _promise2.default.all(promisesd);

                                            case 7:
                                                _this3._data = _context4.sent;
                                                promiseso = _this3._data.map(function (item) {
                                                    return _this3.parseData(item, parsedOptions);
                                                });
                                                _context4.next = 11;
                                                return _promise2.default.all(promiseso);

                                            case 11:
                                                _this3._data = _context4.sent;
                                                _context4.next = 14;
                                                return _this3.db().addAll(_this3._data, parsedOptions).catch(function (e) {
                                                    return _this3.error(_this3.modelName + ':' + e.message);
                                                });

                                            case 14:
                                                result = _context4.sent;
                                                return _context4.abrupt('return', {
                                                    v: result
                                                });

                                            case 16:
                                            case 'end':
                                                return _context4.stop();
                                        }
                                    }
                                }, _callee4, _this3);
                            })(), 't0', 2);

                        case 2:
                            _ret = _context5.t0;

                            if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
                                _context5.next = 5;
                                break;
                            }

                            return _context5.abrupt('return', _ret.v);

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

        function addAll(_x14, _x15) {
            return _ref4.apply(this, arguments);
        }

        return addAll;
    }();

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeDelete = function _beforeDelete(options) {
        return _promise2.default.resolve(options);
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(options) {
            var _this4 = this;

            var parsedOptions, result;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;

                            //parse options
                            parsedOptions = this.parseOptions(options);
                            // init model

                            _context6.next = 4;
                            return this._beforeDelete(parsedOptions);

                        case 4:
                            _context6.next = 6;
                            return this.db().delete(parsedOptions).catch(function (e) {
                                return _this4.error(_this4.modelName + ':' + e.message);
                            });

                        case 6:
                            result = _context6.sent;
                            _context6.next = 9;
                            return this._afterDelete(parsedOptions.where || {});

                        case 9:
                            return _context6.abrupt('return', result);

                        case 12:
                            _context6.prev = 12;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(_context6.t0));

                        case 15:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 12]]);
        }));

        function _delete(_x16) {
            return _ref5.apply(this, arguments);
        }

        return _delete;
    }();

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */


    _class.prototype._afterDelete = function _afterDelete(options) {
        return _promise2.default.resolve(options);
    };

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeUpdate = function _beforeUpdate(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(data, options) {
            var _this5 = this;

            var parsedOptions, pk, result;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;

                            if (!THINK.isEmpty(data)) {
                                _context7.next = 3;
                                break;
                            }

                            return _context7.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            //copy data

                            this._data = THINK.extend({}, data);

                            _context7.next = 7;
                            return this._beforeUpdate(this._data, parsedOptions);

                        case 7:
                            this._data = _context7.sent;
                            _context7.next = 10;
                            return this.parseData(this._data, parsedOptions, true, 2);

                        case 10:
                            this._data = _context7.sent;
                            _context7.next = 13;
                            return this.getPk();

                        case 13:
                            pk = _context7.sent;

                            if (!THINK.isEmpty(parsedOptions.where)) {
                                _context7.next = 23;
                                break;
                            }

                            if (THINK.isEmpty(this._data[pk])) {
                                _context7.next = 20;
                                break;
                            }

                            parsedOptions.where = THINK.getObject(pk, this._data[pk]);
                            delete this._data[pk];
                            _context7.next = 21;
                            break;

                        case 20:
                            return _context7.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 21:
                            _context7.next = 24;
                            break;

                        case 23:
                            if (!THINK.isEmpty(this._data[pk])) {
                                delete this._data[pk];
                            }

                        case 24:
                            _context7.next = 26;
                            return this.db().update(parsedOptions, this._data).catch(function (e) {
                                return _this5.error(_this5.modelName + ':' + e.message);
                            });

                        case 26:
                            result = _context7.sent;

                            if (THINK.isEmpty(this.relation)) {
                                _context7.next = 30;
                                break;
                            }

                            _context7.next = 30;
                            return this.__postRelationData(result, data, 'UPDATE', parsedOptions);

                        case 30:
                            _context7.next = 32;
                            return this._afterUpdate(this._data, parsedOptions);

                        case 32:
                            return _context7.abrupt('return', result);

                        case 35:
                            _context7.prev = 35;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(_context7.t0));

                        case 38:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 35]]);
        }));

        function update(_x17, _x18) {
            return _ref6.apply(this, arguments);
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
        return _promise2.default.resolve(data);
    };

    _class.prototype._beforeFind = function _beforeFind(options) {
        return options;
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            var result;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.next = 2;
                            return this.parseOptions(options, { limit: 1 });

                        case 2:
                            options = _context8.sent;
                            _context8.next = 5;
                            return this._beforeFind(options);

                        case 5:
                            options = _context8.sent;
                            _context8.next = 8;
                            return this.db().select(options);

                        case 8:
                            result = _context8.sent;

                            if (!(options.rel && !THINK.isEmpty(result))) {
                                _context8.next = 12;
                                break;
                            }

                            _context8.next = 12;
                            return this.__getRelationData(result[0], options);

                        case 12:
                            _context8.next = 14;
                            return this.parseData(result[0] || {}, options, false);

                        case 14:
                            result = _context8.sent;
                            return _context8.abrupt('return', this._afterFind(result, options));

                        case 16:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function find(_x19) {
            return _ref7.apply(this, arguments);
        }

        return find;
    }();

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */


    _class.prototype._afterFind = function _afterFind(result, options) {
        return _promise2.default.resolve(result);
    };

    /**
     * 查询数据条数
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(field, options) {
            var pk, parsedOptions, result;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.prev = 0;
                            _context9.next = 3;
                            return this.getPk();

                        case 3:
                            pk = _context9.sent;

                            field = field || pk;
                            this._options.field = 'count(\'' + field + '\') AS Count';
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context9.next = 9;
                            return this.db().select(parsedOptions);

                        case 9:
                            result = _context9.sent;
                            _context9.next = 12;
                            return this.parseData(result, parsedOptions, false);

                        case 12:
                            result = _context9.sent;
                            return _context9.abrupt('return', result[0].Count || 0);

                        case 16:
                            _context9.prev = 16;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t0));

                        case 19:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 16]]);
        }));

        function count(_x20, _x21) {
            return _ref8.apply(this, arguments);
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
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(field, options) {
            var pk, parsedOptions, result;
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            _context10.prev = 0;
                            _context10.next = 3;
                            return this.getPk();

                        case 3:
                            pk = _context10.sent;

                            field = field || pk;
                            this._options.field = 'SUM(`' + field + '`) AS Sum';
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context10.next = 9;
                            return this.db().select(parsedOptions);

                        case 9:
                            result = _context10.sent;
                            _context10.next = 12;
                            return this.parseData(result, parsedOptions, false);

                        case 12:
                            result = _context10.sent;
                            return _context10.abrupt('return', result[0].Sum || 0);

                        case 16:
                            _context10.prev = 16;
                            _context10.t0 = _context10['catch'](0);
                            return _context10.abrupt('return', this.error(_context10.t0));

                        case 19:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this, [[0, 16]]);
        }));

        function sum(_x22, _x23) {
            return _ref9.apply(this, arguments);
        }

        return sum;
    }();

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.max = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(field, options) {
            var pk, parsedOptions, result;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            _context11.prev = 0;
                            _context11.next = 3;
                            return this.getPk();

                        case 3:
                            pk = _context11.sent;

                            field = field || pk;
                            this._options.field = 'MAX(`' + field + '`) AS Max';
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context11.next = 9;
                            return this.db().select(parsedOptions);

                        case 9:
                            result = _context11.sent;
                            _context11.next = 12;
                            return this.parseData(result, parsedOptions, false);

                        case 12:
                            result = _context11.sent;
                            return _context11.abrupt('return', result[0].Max || 0);

                        case 16:
                            _context11.prev = 16;
                            _context11.t0 = _context11['catch'](0);
                            return _context11.abrupt('return', this.error(_context11.t0));

                        case 19:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this, [[0, 16]]);
        }));

        function max(_x24, _x25) {
            return _ref10.apply(this, arguments);
        }

        return max;
    }();

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.min = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(field, options) {
            var pk, parsedOptions, result;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            _context12.prev = 0;
                            _context12.next = 3;
                            return this.getPk();

                        case 3:
                            pk = _context12.sent;

                            field = field || pk;
                            this._options.field = 'MIN(`' + field + '`) AS Min';
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context12.next = 9;
                            return this.db().select(parsedOptions);

                        case 9:
                            result = _context12.sent;
                            _context12.next = 12;
                            return this.parseData(result, parsedOptions, false);

                        case 12:
                            result = _context12.sent;
                            return _context12.abrupt('return', result[0].Min || 0);

                        case 16:
                            _context12.prev = 16;
                            _context12.t0 = _context12['catch'](0);
                            return _context12.abrupt('return', this.error(_context12.t0));

                        case 19:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this, [[0, 16]]);
        }));

        function min(_x26, _x27) {
            return _ref11.apply(this, arguments);
        }

        return min;
    }();

    /**
     *
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.avg = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(field, options) {
            var pk, parsedOptions, result;
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            _context13.prev = 0;
                            _context13.next = 3;
                            return this.getPk();

                        case 3:
                            pk = _context13.sent;

                            field = field || pk;
                            this._options.field = 'AVG(`' + field + '`) AS Avg';
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context13.next = 9;
                            return this.db().select(parsedOptions);

                        case 9:
                            result = _context13.sent;
                            _context13.next = 12;
                            return this.parseData(result, parsedOptions, false);

                        case 12:
                            result = _context13.sent;
                            return _context13.abrupt('return', result[0].Avg || 0);

                        case 16:
                            _context13.prev = 16;
                            _context13.t0 = _context13['catch'](0);
                            return _context13.abrupt('return', this.error(_context13.t0));

                        case 19:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this, [[0, 16]]);
        }));

        function avg(_x28, _x29) {
            return _ref12.apply(this, arguments);
        }

        return avg;
    }();

    _class.prototype._beforeSelect = function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(options) {
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            return _context14.abrupt('return', options);

                        case 1:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this);
        }));

        function _beforeSelect(_x30) {
            return _ref13.apply(this, arguments);
        }

        return _beforeSelect;
    }();

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function () {
        var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(options) {
            var result;
            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            _context15.next = 2;
                            return this.parseOptions(options);

                        case 2:
                            options = _context15.sent;
                            _context15.next = 5;
                            return this._beforeSelect(options);

                        case 5:
                            options = _context15.sent;
                            _context15.next = 8;
                            return this.db().select(options);

                        case 8:
                            result = _context15.sent;

                            if (!(options.rel && !THINK.isEmpty(result))) {
                                _context15.next = 12;
                                break;
                            }

                            _context15.next = 12;
                            return this.__getRelationData(result, options);

                        case 12:
                            _context15.next = 14;
                            return this.parseData(result, options, false);

                        case 14:
                            result = _context15.sent;
                            return _context15.abrupt('return', this._afterSelect(result, options));

                        case 16:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this);
        }));

        function select(_x31) {
            return _ref14.apply(this, arguments);
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
        return _promise2.default.resolve(result);
    };

    /**
     * 返回数据里含有count信息的查询
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */


    _class.prototype.countSelect = function () {
        var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(options, pageFlag) {
            var parsedOptions, count, pageOptions, totalPage, result;
            return _regenerator2.default.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            _context16.prev = 0;

                            if (THINK.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context16.next = 5;
                            return this.count(parsedOptions);

                        case 5:
                            count = _context16.sent;
                            pageOptions = this.parsePage(parsedOptions);
                            totalPage = Math.ceil(count / pageOptions.num);

                            if (THINK.isBoolean(pageFlag)) {
                                if (pageOptions.page > totalPage) {
                                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                                }
                                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                            }
                            //传入分页参数
                            this.limit(pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
                            result = THINK.extend(false, { count: count, total: totalPage }, pageOptions);

                            if (!parsedOptions.page) {
                                parsedOptions.page = pageOptions.page;
                            }
                            _context16.next = 14;
                            return this.select(parsedOptions);

                        case 14:
                            result.data = _context16.sent;
                            _context16.next = 17;
                            return this.parseData(result, parsedOptions, false);

                        case 17:
                            result = _context16.sent;
                            return _context16.abrupt('return', result);

                        case 21:
                            _context16.prev = 21;
                            _context16.t0 = _context16['catch'](0);
                            return _context16.abrupt('return', this.error(_context16.t0));

                        case 24:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee16, this, [[0, 21]]);
        }));

        function countSelect(_x32, _x33) {
            return _ref15.apply(this, arguments);
        }

        return countSelect;
    }();

    /**
     * 原生语句查询
     * mysql  THINK.M('Test',[config]).query('select * from test');
     * mongo  THINK.M('Test',[config]).query('db.test.find()');
     * @param sqlStr
     */


    _class.prototype.query = function () {
        var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18(sqlStr) {
            var _this6 = this;

            var _ret2;

            return _regenerator2.default.wrap(function _callee18$(_context18) {
                while (1) {
                    switch (_context18.prev = _context18.next) {
                        case 0:
                            _context18.prev = 0;
                            return _context18.delegateYield(_regenerator2.default.mark(function _callee17() {
                                var model, process, result, quer, tableName, cls, func;
                                return _regenerator2.default.wrap(function _callee17$(_context17) {
                                    while (1) {
                                        switch (_context17.prev = _context17.next) {
                                            case 0:
                                                //safe mode
                                                _this6.config.db_ext_config.safe = true;
                                                // init model
                                                model = _this6.db();
                                                process = null, result = [];

                                                if (!(_this6.config.db_type === 'mongo')) {
                                                    _context17.next = 26;
                                                    break;
                                                }

                                                quer = sqlStr.split('.');

                                                if (!(THINK.isEmpty(quer) || THINK.isEmpty(quer[0]) || quer[0] !== 'db' || THINK.isEmpty(quer[1]))) {
                                                    _context17.next = 7;
                                                    break;
                                                }

                                                return _context17.abrupt('return', {
                                                    v: _this6.error('query language error')
                                                });

                                            case 7:
                                                quer.shift();
                                                tableName = quer.shift();

                                                if (!(tableName !== _this6.trueTableName)) {
                                                    _context17.next = 11;
                                                    break;
                                                }

                                                return _context17.abrupt('return', {
                                                    v: _this6.error('table name error')
                                                });

                                            case 11:
                                                if (!(!THINK.INSTANCES.DB[_this6.adapterKey] || !THINK.INSTANCES.DB[_this6.adapterKey].collections || !THINK.INSTANCES.DB[_this6.adapterKey].collections[tableName])) {
                                                    _context17.next = 13;
                                                    break;
                                                }

                                                return _context17.abrupt('return', {
                                                    v: _this6.error('model init error')
                                                });

                                            case 13:
                                                model = THINK.INSTANCES.DB[_this6.adapterKey].collections[tableName];
                                                cls = THINK.promisify(model.native, model);
                                                _context17.next = 17;
                                                return cls();

                                            case 17:
                                                process = _context17.sent;
                                                func = new Function('process', 'return process.' + quer.join('.') + ';');

                                                process = func(process);
                                                process = new _promise2.default(function (reslove, reject) {
                                                    process.toArray(function (err, results) {
                                                        if (err) reject(err);
                                                        reslove(results);
                                                    });
                                                });

                                                _context17.next = 23;
                                                return process;

                                            case 23:
                                                result = _context17.sent;
                                                _context17.next = 39;
                                                break;

                                            case 26:
                                                if (!(_this6.config.db_type === 'mysql')) {
                                                    _context17.next = 32;
                                                    break;
                                                }

                                                _context17.next = 29;
                                                return model.query(sqlStr);

                                            case 29:
                                                result = _context17.sent;
                                                _context17.next = 39;
                                                break;

                                            case 32:
                                                if (!(_this6.config.db_type === 'postgresql')) {
                                                    _context17.next = 38;
                                                    break;
                                                }

                                                _context17.next = 35;
                                                return model.query(sqlStr);

                                            case 35:
                                                result = _context17.sent;
                                                _context17.next = 39;
                                                break;

                                            case 38:
                                                return _context17.abrupt('return', {
                                                    v: _this6.error('adapter not supported this method')
                                                });

                                            case 39:
                                                _context17.next = 41;
                                                return _this6.parseData(result, {}, false);

                                            case 41:
                                                result = _context17.sent;
                                                return _context17.abrupt('return', {
                                                    v: result
                                                });

                                            case 43:
                                            case 'end':
                                                return _context17.stop();
                                        }
                                    }
                                }, _callee17, _this6);
                            })(), 't0', 2);

                        case 2:
                            _ret2 = _context18.t0;

                            if (!((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object")) {
                                _context18.next = 5;
                                break;
                            }

                            return _context18.abrupt('return', _ret2.v);

                        case 5:
                            _context18.next = 10;
                            break;

                        case 7:
                            _context18.prev = 7;
                            _context18.t1 = _context18['catch'](0);
                            return _context18.abrupt('return', this.error(_context18.t1));

                        case 10:
                        case 'end':
                            return _context18.stop();
                    }
                }
            }, _callee18, this, [[0, 7]]);
        }));

        function query(_x34) {
            return _ref16.apply(this, arguments);
        }

        return query;
    }();

    /**
     * 添加关联关系数据
     * @param result 主表操作返回结果
     * @param data 主表数据
     * @private
     */


    _class.prototype.__postRelationData = function () {
        var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19(result, data, postType, options) {
            var _this7 = this;

            var pk, caseList, promises;
            return _regenerator2.default.wrap(function _callee19$(_context19) {
                while (1) {
                    switch (_context19.prev = _context19.next) {
                        case 0:
                            _context19.next = 2;
                            return this.getPk();

                        case 2:
                            pk = _context19.sent;

                            //data[pk] = result;
                            caseList = {
                                1: this.__postHasOneRelation,
                                2: this.__postHasManyRelation,
                                3: this.__postManyToManyRelation,
                                4: this.__postBelongsToRealtion,
                                HASONE: this.__postHasOneRelation,
                                HASMANY: this.__postHasManyRelation,
                                MANYTOMANY: this.__postManyToManyRelation,
                                BELONGSTO: this.__postBelongsToRealtion
                            };
                            promises = (0, _keys2.default)(this.relation).map(function (key) {
                                var item = _this7.relation[key];
                                //主表数据没有存储关联字段数据,直接返回
                                if (THINK.isEmpty(data[key])) return;
                                var type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;
                                if (type && type in caseList) {
                                    caseList[type](_this7, data, data[key], postType, item);
                                }
                            });
                            _context19.next = 7;
                            return _promise2.default.all(promises);

                        case 7:
                            return _context19.abrupt('return', data);

                        case 8:
                        case 'end':
                            return _context19.stop();
                    }
                }
            }, _callee19, this);
        }));

        function __postRelationData(_x35, _x36, _x37, _x38) {
            return _ref17.apply(this, arguments);
        }

        return __postRelationData;
    }();

    /**
     * hasone子表数据新增更新
     * @param self
     * @param data
     * @param postType
     * @param item
     * @private
     */


    _class.prototype.__postHasOneRelation = function () {
        var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(self, data, childdata, postType, relation) {
            var _model$where;

            var model, key, fkey;
            return _regenerator2.default.wrap(function _callee20$(_context20) {
                while (1) {
                    switch (_context20.prev = _context20.next) {
                        case 0:
                            model = THINK.model(relation.model, {});
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            //子表外键数据

                            childdata[fkey] = data[key];
                            _context20.t0 = postType;
                            _context20.next = _context20.t0 === 'ADD' ? 7 : _context20.t0 === 'UPDATE' ? 11 : 18;
                            break;

                        case 7:
                            _context20.next = 9;
                            return model.add(childdata);

                        case 9:
                            return _context20.abrupt('return', _context20.sent);

                        case 11:
                            if (!THINK.isEmpty(childdata[fkey])) {
                                _context20.next = 13;
                                break;
                            }

                            return _context20.abrupt('return');

                        case 13:
                            delete childdata[fkey];
                            _context20.next = 16;
                            return model.where((_model$where = {}, _model$where[fkey] = data[key], _model$where)).update(childdata);

                        case 16:
                            return _context20.abrupt('return', _context20.sent);

                        case 18:
                        case 'end':
                            return _context20.stop();
                    }
                }
            }, _callee20, this);
        }));

        function __postHasOneRelation(_x39, _x40, _x41, _x42, _x43) {
            return _ref18.apply(this, arguments);
        }

        return __postHasOneRelation;
    }();

    /**
     * hasmany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */


    _class.prototype.__postHasManyRelation = function () {
        var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee21(self, data, childdata, postType, relation) {
            var model, key, fkey, pk, _iterator, _isArray, _i, _ref20, _ref21, k, v;

            return _regenerator2.default.wrap(function _callee21$(_context21) {
                while (1) {
                    switch (_context21.prev = _context21.next) {
                        case 0:
                            model = THINK.model(relation.model, {});
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            pk = model.getPk();
                            //子表外键数据

                            if (!THINK.isArray(childdata)) {
                                childdata = [childdata];
                            }
                            _iterator = childdata.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                        case 6:
                            if (!_isArray) {
                                _context21.next = 12;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context21.next = 9;
                                break;
                            }

                            return _context21.abrupt('break', 38);

                        case 9:
                            _ref20 = _iterator[_i++];
                            _context21.next = 16;
                            break;

                        case 12:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context21.next = 15;
                                break;
                            }

                            return _context21.abrupt('break', 38);

                        case 15:
                            _ref20 = _i.value;

                        case 16:
                            _ref21 = _ref20;
                            k = _ref21[0];
                            v = _ref21[1];

                            v[fkey] = data[key];
                            _context21.t0 = postType;
                            _context21.next = _context21.t0 === 'ADD' ? 23 : _context21.t0 === 'UPDATE' ? 26 : 36;
                            break;

                        case 23:
                            _context21.next = 25;
                            return model.add(v);

                        case 25:
                            return _context21.abrupt('break', 36);

                        case 26:
                            if (!v[pk]) {
                                _context21.next = 31;
                                break;
                            }

                            _context21.next = 29;
                            return model.update(v);

                        case 29:
                            _context21.next = 35;
                            break;

                        case 31:
                            if (!data[key]) {
                                _context21.next = 35;
                                break;
                            }

                            //若更新主表数据中有其关联子表的字段,则新增关联数据
                            v[fkey] = data[key];
                            _context21.next = 35;
                            return model.add(v);

                        case 35:
                            return _context21.abrupt('break', 36);

                        case 36:
                            _context21.next = 6;
                            break;

                        case 38:
                            return _context21.abrupt('return');

                        case 39:
                        case 'end':
                            return _context21.stop();
                    }
                }
            }, _callee21, this);
        }));

        function __postHasManyRelation(_x44, _x45, _x46, _x47, _x48) {
            return _ref19.apply(this, arguments);
        }

        return __postHasManyRelation;
    }();

    /**
     * manytomany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */


    _class.prototype.__postManyToManyRelation = function () {
        var _ref22 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee22(self, data, childdata, postType, relation) {
            var _self$db$add, _self$db$add2;

            var model, option, key, fkey, rpk, cid, rkey, rfkey, _iterator2, _isArray2, _i2, _ref23, cdata;

            return _regenerator2.default.wrap(function _callee22$(_context22) {
                while (1) {
                    switch (_context22.prev = _context22.next) {
                        case 0:
                            model = THINK.model(relation.model, {});
                            option = {};

                            if (relation.relationtable) {
                                option.table = relation.relationtable;
                            } else {
                                option.table = '' + THINK.config('db_prefix') + self.getModelName().toLowerCase() + '_' + model.getModelName().toLowerCase() + '_map';
                            }
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            //需要取到对应model的关联key,fkey

                            rpk = model.getPk(), cid = void 0;
                            rkey = model.relation.key || rpk;
                            rfkey = model.relation.fkey || model.getModelName().toLowerCase() + '_id';

                            if (!THINK.isArray(childdata)) {
                                _context22.next = 36;
                                break;
                            }

                            _iterator2 = childdata, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);

                        case 10:
                            if (!_isArray2) {
                                _context22.next = 16;
                                break;
                            }

                            if (!(_i2 >= _iterator2.length)) {
                                _context22.next = 13;
                                break;
                            }

                            return _context22.abrupt('break', 34);

                        case 13:
                            _ref23 = _iterator2[_i2++];
                            _context22.next = 20;
                            break;

                        case 16:
                            _i2 = _iterator2.next();

                            if (!_i2.done) {
                                _context22.next = 19;
                                break;
                            }

                            return _context22.abrupt('break', 34);

                        case 19:
                            _ref23 = _i2.value;

                        case 20:
                            cdata = _ref23;
                            _context22.t0 = postType;
                            _context22.next = _context22.t0 === 'ADD' ? 24 : _context22.t0 === 'UPDATE' ? 31 : 32;
                            break;

                        case 24:
                            _context22.next = 26;
                            return model.add(cdata);

                        case 26:
                            cid = _context22.sent;

                            cdata[rpk] = cid;
                            //写入两个表关系表
                            _context22.next = 30;
                            return self.db().add((_self$db$add = {}, _self$db$add[fkey] = data[key], _self$db$add[rfkey] = cdata[rkey], _self$db$add), option);

                        case 30:
                            return _context22.abrupt('break', 32);

                        case 31:
                            return _context22.abrupt('break', 32);

                        case 32:
                            _context22.next = 10;
                            break;

                        case 34:
                            _context22.next = 48;
                            break;

                        case 36:
                            if (!THINK.isObject(childdata)) {
                                _context22.next = 48;
                                break;
                            }

                            _context22.t1 = postType;
                            _context22.next = _context22.t1 === 'ADD' ? 40 : _context22.t1 === 'UPDATE' ? 47 : 48;
                            break;

                        case 40:
                            _context22.next = 42;
                            return model.add(childdata);

                        case 42:
                            cid = _context22.sent;

                            childdata[rpk] = cid;
                            _context22.next = 46;
                            return self.db().add((_self$db$add2 = {}, _self$db$add2[fkey] = data[key], _self$db$add2[rfkey] = childdata[rkey], _self$db$add2), option);

                        case 46:
                            return _context22.abrupt('break', 48);

                        case 47:
                            return _context22.abrupt('break', 48);

                        case 48:
                            return _context22.abrupt('return');

                        case 49:
                        case 'end':
                            return _context22.stop();
                    }
                }
            }, _callee22, this);
        }));

        function __postManyToManyRelation(_x49, _x50, _x51, _x52, _x53) {
            return _ref22.apply(this, arguments);
        }

        return __postManyToManyRelation;
    }();

    /**
     * belongsto 无需写入父表数据
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */


    _class.prototype.__postBelongsToRealtion = function __postBelongsToRealtion(self, data, childdata, postType, relation) {
        return;
    };

    /**
     * 获取关联数据
     * @param result
     * @param options
     * @private
     */


    _class.prototype.__getRelationData = function () {
        var _ref24 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee23(result, options) {
            var o;
            return _regenerator2.default.wrap(function _callee23$(_context23) {
                while (1) {
                    switch (_context23.prev = _context23.next) {
                        case 0:
                            o = void 0;

                            if (!THINK.isBoolean(options.rel)) {
                                _context23.next = 9;
                                break;
                            }

                            if (!(options.rel === false)) {
                                _context23.next = 6;
                                break;
                            }

                            return _context23.abrupt('return', result);

                        case 6:
                            o = true;

                        case 7:
                            _context23.next = 10;
                            break;

                        case 9:
                            if (THINK.isString(options.rel)) {
                                o = options.rel.replace(/ +/g, '').split(',');
                            } else {
                                o = options.rel;
                            }

                        case 10:
                            _context23.next = 12;
                            return this.__getRelationOptions(result, o);

                        case 12:
                        case 'end':
                            return _context23.stop();
                    }
                }
            }, _callee23, this);
        }));

        function __getRelationData(_x54, _x55) {
            return _ref24.apply(this, arguments);
        }

        return __getRelationData;
    }();

    /**
     *
     * @param option
     * @private
     */


    _class.prototype.__getRelationOptions = function () {
        var _ref25 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee24(data, option) {
            var relation, _iterator3, _isArray3, _i3, _ref26, k, _iterator4, _isArray4, _i4, _ref27, _k, caseList, relationObj, item, _k2, type;

            return _regenerator2.default.wrap(function _callee24$(_context24) {
                while (1) {
                    switch (_context24.prev = _context24.next) {
                        case 0:
                            relation = {};

                            if (!(option === true)) {
                                _context24.next = 5;
                                break;
                            }

                            //查询全部关联关系,且无任何条件
                            relation = this.relation;
                            _context24.next = 39;
                            break;

                        case 5:
                            if (!THINK.isObject(option)) {
                                _context24.next = 23;
                                break;
                            }

                            _iterator3 = (0, _keys2.default)(option), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);

                        case 7:
                            if (!_isArray3) {
                                _context24.next = 13;
                                break;
                            }

                            if (!(_i3 >= _iterator3.length)) {
                                _context24.next = 10;
                                break;
                            }

                            return _context24.abrupt('break', 21);

                        case 10:
                            _ref26 = _iterator3[_i3++];
                            _context24.next = 17;
                            break;

                        case 13:
                            _i3 = _iterator3.next();

                            if (!_i3.done) {
                                _context24.next = 16;
                                break;
                            }

                            return _context24.abrupt('break', 21);

                        case 16:
                            _ref26 = _i3.value;

                        case 17:
                            k = _ref26;

                            if (this.relation[k]) relation[k] = THINK.extend({}, option[k], this.relation[k]);

                        case 19:
                            _context24.next = 7;
                            break;

                        case 21:
                            _context24.next = 39;
                            break;

                        case 23:
                            if (!THINK.isArray(option)) {
                                _context24.next = 39;
                                break;
                            }

                            _iterator4 = option, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);

                        case 25:
                            if (!_isArray4) {
                                _context24.next = 31;
                                break;
                            }

                            if (!(_i4 >= _iterator4.length)) {
                                _context24.next = 28;
                                break;
                            }

                            return _context24.abrupt('break', 39);

                        case 28:
                            _ref27 = _iterator4[_i4++];
                            _context24.next = 35;
                            break;

                        case 31:
                            _i4 = _iterator4.next();

                            if (!_i4.done) {
                                _context24.next = 34;
                                break;
                            }

                            return _context24.abrupt('break', 39);

                        case 34:
                            _ref27 = _i4.value;

                        case 35:
                            _k = _ref27;

                            if (this.relation[_k]) relation[_k] = this.relation[_k];

                        case 37:
                            _context24.next = 25;
                            break;

                        case 39:

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
                            caseList = {
                                1: this.__getHasOneRelation,
                                2: this.__getHasManyRelation,
                                3: this.__getManyToManyRelation,
                                4: this.__getBelongsToRealtion,
                                HASONE: this.__getHasOneRelation,
                                HASMANY: this.__getHasManyRelation,
                                MANYTOMANY: this.__getManyToManyRelation,
                                BELONGSTO: this.__getBelongsToRealtion
                            };
                            relationObj = {}, item = void 0;
                            _context24.t0 = _regenerator2.default.keys(relation);

                        case 42:
                            if ((_context24.t1 = _context24.t0()).done) {
                                _context24.next = 53;
                                break;
                            }

                            _k2 = _context24.t1.value;

                            item = relation[_k2];
                            item.name = _k2;
                            type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;

                            if (!(type && type in caseList)) {
                                _context24.next = 51;
                                break;
                            }

                            _context24.next = 50;
                            return caseList[type](this, data, item);

                        case 50:
                            relationObj = _context24.sent;

                        case 51:
                            _context24.next = 42;
                            break;

                        case 53:
                            return _context24.abrupt('return', relationObj);

                        case 54:
                        case 'end':
                            return _context24.stop();
                    }
                }
            }, _callee24, this);
        }));

        function __getRelationOptions(_x56, _x57) {
            return _ref25.apply(this, arguments);
        }

        return __getRelationOptions;
    }();

    /**
     * 获取一对一关联数据
     * 附属表中有主表的一个外键
     * @param relation
     * @param option
     * @private
     */


    _class.prototype.__getHasOneRelation = function () {
        var _ref28 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee25(self, data, relation) {
            var model, key, fkey, where, _iterator5, _isArray5, _i5, _ref29, _ref30, k, v;

            return _regenerator2.default.wrap(function _callee25$(_context25) {
                while (1) {
                    switch (_context25.prev = _context25.next) {
                        case 0:
                            model = THINK.model(relation.model, {});

                            if (relation.field) model = model.field(relation.field);
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};

                            if (!THINK.isArray(data)) {
                                _context25.next = 31;
                                break;
                            }

                            _iterator5 = data.entries(), _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : (0, _getIterator3.default)(_iterator5);

                        case 9:
                            if (!_isArray5) {
                                _context25.next = 15;
                                break;
                            }

                            if (!(_i5 >= _iterator5.length)) {
                                _context25.next = 12;
                                break;
                            }

                            return _context25.abrupt('break', 29);

                        case 12:
                            _ref29 = _iterator5[_i5++];
                            _context25.next = 19;
                            break;

                        case 15:
                            _i5 = _iterator5.next();

                            if (!_i5.done) {
                                _context25.next = 18;
                                break;
                            }

                            return _context25.abrupt('break', 29);

                        case 18:
                            _ref29 = _i5.value;

                        case 19:
                            _ref30 = _ref29;
                            k = _ref30[0];
                            v = _ref30[1];

                            where[fkey] = v[key];
                            if (relation.where) where = THINK.extend({}, where, relation.where);
                            _context25.next = 26;
                            return model.where(where).find();

                        case 26:
                            data[k][relation.name] = _context25.sent;

                        case 27:
                            _context25.next = 9;
                            break;

                        case 29:
                            _context25.next = 36;
                            break;

                        case 31:
                            where[fkey] = data[key];
                            if (relation.where) where = THINK.extend({}, where, relation.where);
                            _context25.next = 35;
                            return model.where(where).find();

                        case 35:
                            data[relation.name] = _context25.sent;

                        case 36:
                            return _context25.abrupt('return', data);

                        case 37:
                        case 'end':
                            return _context25.stop();
                    }
                }
            }, _callee25, this);
        }));

        function __getHasOneRelation(_x58, _x59, _x60) {
            return _ref28.apply(this, arguments);
        }

        return __getHasOneRelation;
    }();

    /**
     * 获取一对多
     * @param self
     * @param data
     * @param relation
     * @private
     */


    _class.prototype.__getHasManyRelation = function () {
        var _ref31 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee26(self, data, relation) {
            var model, key, fkey, where, _iterator6, _isArray6, _i6, _ref32, _ref33, k, v;

            return _regenerator2.default.wrap(function _callee26$(_context26) {
                while (1) {
                    switch (_context26.prev = _context26.next) {
                        case 0:
                            model = THINK.model(relation.model, {});

                            if (relation.field) model = model.field(relation.field);
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};

                            if (!THINK.isArray(data)) {
                                _context26.next = 31;
                                break;
                            }

                            _iterator6 = data.entries(), _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : (0, _getIterator3.default)(_iterator6);

                        case 9:
                            if (!_isArray6) {
                                _context26.next = 15;
                                break;
                            }

                            if (!(_i6 >= _iterator6.length)) {
                                _context26.next = 12;
                                break;
                            }

                            return _context26.abrupt('break', 29);

                        case 12:
                            _ref32 = _iterator6[_i6++];
                            _context26.next = 19;
                            break;

                        case 15:
                            _i6 = _iterator6.next();

                            if (!_i6.done) {
                                _context26.next = 18;
                                break;
                            }

                            return _context26.abrupt('break', 29);

                        case 18:
                            _ref32 = _i6.value;

                        case 19:
                            _ref33 = _ref32;
                            k = _ref33[0];
                            v = _ref33[1];

                            where[fkey] = v[key];
                            if (relation.where) where = THINK.extend({}, where, relation.where);
                            _context26.next = 26;
                            return model.where(where).select();

                        case 26:
                            data[k][relation.name] = _context26.sent;

                        case 27:
                            _context26.next = 9;
                            break;

                        case 29:
                            _context26.next = 36;
                            break;

                        case 31:
                            where[fkey] = data[key];
                            if (relation.where) where = THINK.extend({}, where, relation.where);
                            _context26.next = 35;
                            return model.where(where).select();

                        case 35:
                            data[relation.name] = _context26.sent;

                        case 36:
                            return _context26.abrupt('return', data);

                        case 37:
                        case 'end':
                            return _context26.stop();
                    }
                }
            }, _callee26, this);
        }));

        function __getHasManyRelation(_x61, _x62, _x63) {
            return _ref31.apply(this, arguments);
        }

        return __getHasManyRelation;
    }();

    /**
     * 获取多对多,需要一张关联关系表
     * @param self
     * @param data
     * @param relation
     * @private
     */


    _class.prototype.__getManyToManyRelation = function () {
        var _ref34 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee27(self, data, relation) {
            var model, modelTableName, option, field, _iterator7, _isArray7, _i7, _ref35, f, key, fkey, where, rfkey, _iterator8, _isArray8, _i8, _ref36, _ref37, k, v;

            return _regenerator2.default.wrap(function _callee27$(_context27) {
                while (1) {
                    switch (_context27.prev = _context27.next) {
                        case 0:
                            model = THINK.model(relation.model, {});
                            modelTableName = model.getTableName();
                            option = { where: {} };

                            if (!relation.field) {
                                _context27.next = 23;
                                break;
                            }

                            field = [];
                            _iterator7 = relation.field.replace(/ +/g, '').split(','), _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : (0, _getIterator3.default)(_iterator7);

                        case 6:
                            if (!_isArray7) {
                                _context27.next = 12;
                                break;
                            }

                            if (!(_i7 >= _iterator7.length)) {
                                _context27.next = 9;
                                break;
                            }

                            return _context27.abrupt('break', 20);

                        case 9:
                            _ref35 = _iterator7[_i7++];
                            _context27.next = 16;
                            break;

                        case 12:
                            _i7 = _iterator7.next();

                            if (!_i7.done) {
                                _context27.next = 15;
                                break;
                            }

                            return _context27.abrupt('break', 20);

                        case 15:
                            _ref35 = _i7.value;

                        case 16:
                            f = _ref35;

                            field.push(modelTableName + '.' + f);

                        case 18:
                            _context27.next = 6;
                            break;

                        case 20:
                            model = model.field(field);
                            _context27.next = 24;
                            break;

                        case 23:
                            model = model.field(modelTableName + '.*');

                        case 24:
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            if (relation.relationtable) {
                                option.table = relation.relationtable;
                            } else {
                                option.table = '' + THINK.config('db_prefix') + self.getModelName().toLowerCase() + '_' + model.getModelName().toLowerCase() + '_map';
                            }
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};
                            //let rkey = model.relation.key || model.getPk();

                            rfkey = model.relation.fkey || model.getModelName().toLowerCase() + '_id';

                            if (!THINK.isArray(data)) {
                                _context27.next = 56;
                                break;
                            }

                            _iterator8 = data.entries(), _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : (0, _getIterator3.default)(_iterator8);

                        case 33:
                            if (!_isArray8) {
                                _context27.next = 39;
                                break;
                            }

                            if (!(_i8 >= _iterator8.length)) {
                                _context27.next = 36;
                                break;
                            }

                            return _context27.abrupt('break', 54);

                        case 36:
                            _ref36 = _iterator8[_i8++];
                            _context27.next = 43;
                            break;

                        case 39:
                            _i8 = _iterator8.next();

                            if (!_i8.done) {
                                _context27.next = 42;
                                break;
                            }

                            return _context27.abrupt('break', 54);

                        case 42:
                            _ref36 = _i8.value;

                        case 43:
                            _ref37 = _ref36;
                            k = _ref37[0];
                            v = _ref37[1];

                            option.where[option.table + '.' + fkey] = v[key];
                            if (relation.where) option.where = THINK.extend({}, where, option.where);
                            option.join = option.table + ' ON ' + modelTableName + '.' + key + ' = ' + option.table + '.' + rfkey;
                            //data[k][relation.name] = await self.db().select(option);
                            _context27.next = 51;
                            return model.where(option.where).join(option.join).select();

                        case 51:
                            data[k][relation.name] = _context27.sent;

                        case 52:
                            _context27.next = 33;
                            break;

                        case 54:
                            _context27.next = 62;
                            break;

                        case 56:
                            option.where[option.table + '.' + fkey] = data[key];
                            if (relation.where) option.where = THINK.extend({}, where, option.where);
                            option.join = option.table + ' ON ' + modelTableName + '.' + key + ' = ' + option.table + '.' + rfkey;
                            _context27.next = 61;
                            return model.where(option.where).join(option.join).select();

                        case 61:
                            data[relation.name] = _context27.sent;

                        case 62:
                            return _context27.abrupt('return', data);

                        case 63:
                        case 'end':
                            return _context27.stop();
                    }
                }
            }, _callee27, this);
        }));

        function __getManyToManyRelation(_x64, _x65, _x66) {
            return _ref34.apply(this, arguments);
        }

        return __getManyToManyRelation;
    }();

    /**
     * 获取属于关系
     * 附属表中有主表的一个外键
     * @private
     */


    _class.prototype.__getBelongsToRealtion = function () {
        var _ref38 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee28(self, data, relation) {
            var model, key, fkey, where, _iterator9, _isArray9, _i9, _ref39, _ref40, k, v;

            return _regenerator2.default.wrap(function _callee28$(_context28) {
                while (1) {
                    switch (_context28.prev = _context28.next) {
                        case 0:
                            model = THINK.model(relation.model, {});

                            if (relation.field) model = model.field(relation.field);
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};

                            if (!THINK.isArray(data)) {
                                _context28.next = 31;
                                break;
                            }

                            _iterator9 = data.entries(), _isArray9 = Array.isArray(_iterator9), _i9 = 0, _iterator9 = _isArray9 ? _iterator9 : (0, _getIterator3.default)(_iterator9);

                        case 9:
                            if (!_isArray9) {
                                _context28.next = 15;
                                break;
                            }

                            if (!(_i9 >= _iterator9.length)) {
                                _context28.next = 12;
                                break;
                            }

                            return _context28.abrupt('break', 29);

                        case 12:
                            _ref39 = _iterator9[_i9++];
                            _context28.next = 19;
                            break;

                        case 15:
                            _i9 = _iterator9.next();

                            if (!_i9.done) {
                                _context28.next = 18;
                                break;
                            }

                            return _context28.abrupt('break', 29);

                        case 18:
                            _ref39 = _i9.value;

                        case 19:
                            _ref40 = _ref39;
                            k = _ref40[0];
                            v = _ref40[1];

                            where[key] = v[fkey];
                            if (relation.where) where = THINK.extend({}, where, relation.where);
                            _context28.next = 26;
                            return model.where(where).find();

                        case 26:
                            data[k][relation.name] = _context28.sent;

                        case 27:
                            _context28.next = 9;
                            break;

                        case 29:
                            _context28.next = 36;
                            break;

                        case 31:
                            where[key] = data[fkey];
                            if (relation.where) where = THINK.extend({}, where, relation.where);
                            _context28.next = 35;
                            return model.where(where).find();

                        case 35:
                            data[relation.name] = _context28.sent;

                        case 36:
                            return _context28.abrupt('return', data);

                        case 37:
                        case 'end':
                            return _context28.stop();
                    }
                }
            }, _callee28, this);
        }));

        function __getBelongsToRealtion(_x67, _x68, _x69) {
            return _ref38.apply(this, arguments);
        }

        return __getBelongsToRealtion;
    }();

    return _class;
}(_Base2.default);

exports.default = _class;