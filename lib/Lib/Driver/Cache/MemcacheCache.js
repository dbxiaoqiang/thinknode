'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Cache = require('./Cache');

var _Cache2 = _interopRequireDefault(_Cache);

var _MemcacheSocket = require('../Socket/MemcacheSocket');

var _MemcacheSocket2 = _interopRequireDefault(_MemcacheSocket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
exports.default = class extends _Cache2.default {

    init(options) {
        super.init(options);

        let key = hash((0, _stringify2.default)(this.options));
        if (!(key in THINK.INSTANCES.MEMCACHE)) {
            THINK.INSTANCES.MEMCACHE[key] = new _MemcacheSocket2.default(this.options);
        }
        this.handle = THINK.INSTANCES.MEMCACHE[key];
    }

    /**
     *
     * @param name
     */
    get(name) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let value = yield _this.handle.get(_this.options.cache_key_prefix + name);
            return value;
        })();
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value) {
        let timeout = arguments.length <= 2 || arguments[2] === undefined ? this.options.cache_timeout : arguments[2];

        return this.handle.set(this.options.cache_key_prefix + name, (0, _stringify2.default)(value), timeout);
    }

    /**
     *
     * @param name
     */
    rm(name) {
        return this.handle.rm(this.options.cache_key_prefix + name);
    }
};