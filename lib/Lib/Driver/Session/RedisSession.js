/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/29
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _CacheRedisCache = require('../Cache/RedisCache');

var _CacheRedisCache2 = _interopRequireDefault(_CacheRedisCache);

var _default = (function (_rediscache) {
    _inherits(_default, _rediscache);

    function _default() {
        _classCallCheck(this, _default);

        _rediscache.apply(this, arguments);
    }

    _default.prototype.init = function init(options) {
        _rediscache.prototype.init.call(this, options);

        //cache keystore
        this.cacheStore = thinkCache.SESSION;
        //cache auto refresh
        this.updateExpire = true;
    };

    return _default;
})(_CacheRedisCache2['default']);

exports['default'] = _default;
module.exports = exports['default'];