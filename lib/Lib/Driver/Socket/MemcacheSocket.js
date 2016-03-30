'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {
    init() {
        let config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = extend(false, {
            memcache_host: C('memcache_host'),
            memcache_port: C('memcache_port')
        }, config);
        this.handle = null;
        this.deferred = null;
    }

    connect() {
        if (this.handle) {
            return this.deferred.promise;
        }
        let deferred = getDefer();
        let memcached = require('memcached');
        //[ '192.168.0.102:11211', '192.168.0.103:11211', '192.168.0.104:11211' ]
        let connection = new memcached([`${ this.config.memcache_host }:${ this.config.memcache_port }`]);
        connection.on('issue', () => {
            this.close();
            deferred.reject(connection);
        });
        connection.on('failure', () => {
            this.close();
            deferred.reject(connection);
        });

        this.handle = connection;
        if (this.deferred) {
            this.deferred.reject(new Error('connection closed'));
        }
        deferred.resolve();
        this.deferred = deferred;
        return this.deferred.promise;
    }

    close() {
        if (this.handle) {
            this.handle.remove();
            this.handle = null;
        }
    }

    /**
     *
     * @param name
     * @param data
     * @returns {*}
     */
    wrap(name, data) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            yield _this.connect();
            let deferred = getDefer();
            if (!isArray(data)) {
                data = data === undefined ? [] : [data];
            }
            data.push(function (err, data) {
                if (err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(data);
                }
            });
            _this.handle[name].apply(_this.handle, data);
            return deferred.promise;
        })();
    }

    /**
     * 字符串获取
     * @param name
     */
    get(name) {
        return this.wrap('get', [name]);
    }

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */
    set(name, value, timeout) {
        return this.wrap('set', [name, value, timeout]);
    }

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */
    expire(name, timeout) {
        return this.wrap('touch', [name, timeout]);
    }

    /**
     * 删除key
     * @param name
     */
    rm(name) {
        return this.wrap('del', [name]);
    }

    /**
     * 自增
     * @param name
     */
    incr(name) {
        return this.wrap('incr', [name, 1]);
    }

    /**
     * 自减
     * @param name
     * @returns {*}
     */
    decr(name) {
        return this.wrap('decr', [name, 1]);
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/12/3
    */