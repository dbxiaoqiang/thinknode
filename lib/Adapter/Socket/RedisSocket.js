'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.options = THINK.extend(false, {
            redis_port: THINK.config('redis_port'),
            redis_host: THINK.config('redis_host'),
            redis_password: THINK.config('redis_password')
        }, options);
        this.handle = null;
        this.deferred = null;
    };

    _class.prototype.connect = function connect() {
        var _this2 = this;

        if (this.handle) {
            return this.deferred.promise;
        }
        var deferred = THINK.getDefer();
        var port = this.options.redis_port || '6379';
        var host = this.options.redis_host || '127.0.0.1';
        var redis = require('redis');
        var connection = redis.createClient(port, host, this.options);
        if (this.options.redis_password) {
            connection.auth(this.options.redis_password, function () {});
        }
        if (this.options.redis_db) {
            connection.select(this.options.redis_db, function () {});
        }
        connection.on('ready', function () {
            deferred.resolve();
        });
        connection.on('connect', function () {
            deferred.resolve();
        });
        connection.on('error', function (err) {
            _this2.close();
            deferred.reject(err);
        });
        connection.on('end', function () {
            _this2.close();
            deferred.reject('connection end');
        });
        this.handle = connection;
        if (this.deferred) {
            this.deferred.reject(new Error('connection closed'));
        }
        this.deferred = deferred;
        return this.deferred.promise;
    };

    _class.prototype.close = function close() {
        if (this.handle) {
            this.handle.quit();
            this.handle = null;
        }
    };

    /**
     *
     * @param name
     * @param data
     */


    _class.prototype.wrap = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(name, data) {
            var deferred;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            deferred = THINK.getDefer();
                            _context.next = 3;
                            return this.connect().catch(function (e) {
                                return deferred.reject(e);
                            });

                        case 3:
                            if (!THINK.isArray(data)) {
                                data = data === undefined ? [] : [data];
                            }
                            data.push(function (err, data) {
                                if (err) {
                                    deferred.reject(err);
                                } else {
                                    deferred.resolve(data);
                                }
                            });
                            if (this.handle) {
                                this.handle[name].apply(this.handle, data);
                            } else {
                                deferred.reject('connection end');
                            }
                            return _context.abrupt('return', deferred.promise);

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function wrap(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return wrap;
    }();

    /**
     * 字符串获取
     * @param name
     */


    _class.prototype.get = function get(name) {
        return this.wrap('get', [name]);
    };

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */


    _class.prototype.set = function set(name, value, timeout) {
        var setP = [this.wrap('set', [name, value])];
        if (typeof timeout === 'number') {
            setP.push(this.expire(name, timeout));
        }
        return _promise2.default.all(setP);
    };

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */


    _class.prototype.expire = function expire(name, timeout) {
        return this.wrap('expire', [name, timeout]);
    };

    /**
     * 删除key
     * @param name
     */


    _class.prototype.rm = function rm(name) {
        return this.wrap('del', [name]);
    };

    /**
     * 批量删除，可模糊匹配
     * @param keyword
     * @returns {*}
     */


    _class.prototype.batchRm = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(keyword) {
            var keys;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return this.wrap('keys', keyword + '*');

                        case 2:
                            keys = _context2.sent;

                            if (!THINK.isEmpty(keys)) {
                                _context2.next = 5;
                                break;
                            }

                            return _context2.abrupt('return', null);

                        case 5:
                            return _context2.abrupt('return', this.wrap('del', [keys]));

                        case 6:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function batchRm(_x4) {
            return _ref2.apply(this, arguments);
        }

        return batchRm;
    }();

    /**
     * 判断key是否存在
     * @param name
     */


    _class.prototype.exists = function exists(name) {
        return this.wrap('exists', [name]);
    };

    /**
     * 自增
     * @param name
     */


    _class.prototype.incr = function incr(name) {
        return this.wrap('incr', [name]);
    };

    /**
     * 自减
     * @param name
     * @returns {*}
     */


    _class.prototype.decr = function decr(name) {
        return this.wrap('decr', [name]);
    };

    /**
     * 字符key增加指定长度
     * @param name
     * @param incr
     * @returns {*}
     */


    _class.prototype.incrBy = function incrBy(name, incr) {
        incr = incr || 1;
        return this.wrap('incrby', [name, incr]);
    };

    /**
     * 哈希写入
     * @param name
     * @param key
     * @param value
     * @param timeout
     */


    _class.prototype.hSet = function hSet(name, key, value, timeout) {
        var setP = [this.wrap('hset', [name, key, value])];
        if (typeof timeout === 'number') {
            setP.push(this.expire(name, timeout));
        }
        return _promise2.default.all(setP);
    };

    /**
     * 哈希获取
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.hGet = function hGet(name, key) {
        return this.wrap('hget', [name, key]);
    };

    /**
     * 查看哈希表 hashKey 中，给定域 key 是否存在
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.hExists = function hExists(name, key) {
        return this.wrap('hexists', [name, key]);
    };

    /**
     * 返回哈希表 key 中域的数量
     * @param name
     * @returns {*}
     */


    _class.prototype.hLen = function hLen(name) {
        return this.wrap('hlen', [name]);
    };

    /**
     * 给哈希表指定key，增加increment
     * @param name
     * @param key
     * @param incr
     * @returns {*}
     */


    _class.prototype.hIncrBy = function hIncrBy(name, key) {
        var incr = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

        return this.wrap('hincrby', [name, key, incr]);
    };

    /**
     * 返回哈希表所有key-value
     * @param name
     * @returns {*}
     */


    _class.prototype.hGetAll = function hGetAll(name) {
        return this.wrap('hgetall', [name]);
    };

    /**
     * 返回哈希表所有key
     * @param name
     * @returns {*}
     */


    _class.prototype.hKeys = function hKeys(name) {
        return this.wrap('hkeys', [name]);
    };

    /**
     * 返回哈希表所有value
     * @param name
     * @returns {*}
     */


    _class.prototype.hVals = function hVals(name) {
        return this.wrap('hvals', [name]);
    };

    /**
     * 哈希删除
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.hDel = function hDel(name, key) {
        return this.wrap('hdel', [name, key]);
    };

    /**
     * 判断列表长度，若不存在则表示为空
     * @param name
     * @returns {*}
     */


    _class.prototype.lLen = function lLen(name) {
        return this.wrap('llen', [name]);
    };

    /**
     * 将值插入列表表尾
     * @param name
     * @param value
     * @returns {*}
     */


    _class.prototype.rPush = function rPush(name, value) {
        return this.wrap('rpush', [name, value]);
    };

    /**
     * 将列表表头取出，并去除
     * @param name
     * @returns {*}
     */


    _class.prototype.lPop = function lPop(name) {
        return this.wrap('lpop', [name]);
    };

    /**
     * 集合新增
     * @param name
     * @param value
     * @param timeout
     * @returns {*}
     */


    _class.prototype.sAdd = function sAdd(name, value, timeout) {
        var setP = [this.wrap('sadd', [name, value])];
        if (typeof timeout === 'number') {
            setP.push(this.expire(name, timeout));
        }
        return _promise2.default.all(setP);
    };

    /**
     * 返回集合的基数(集合中元素的数量)
     * @param name
     * @returns {*}
     */


    _class.prototype.sCard = function sCard(name) {
        return this.wrap('scard', [name]);
    };

    /**
     * 判断 member 元素是否集合的成员
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.sisMember = function sisMember(name, key) {
        return this.wrap('sismember', [name, key]);
    };

    /**
     * 返回集合中的所有成员
     * @param name
     * @returns {*}
     */


    _class.prototype.sMembers = function sMembers(name) {
        return this.wrap('smembers', [name]);
    };

    /**
     * 移除并返回集合中的一个随机元素
     * @param name
     * @returns {*}
     */


    _class.prototype.sPop = function sPop(name) {
        return this.wrap('spop', [name]);
    };

    /**
     * 移除集合 key 中的一个 member 元素
     * @param name
     * @param key
     * @returns {*}
     */


    _class.prototype.sRem = function sRem(name, key) {
        return this.wrap('srem', [name, key]);
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/12/3
                    */


exports.default = _class;