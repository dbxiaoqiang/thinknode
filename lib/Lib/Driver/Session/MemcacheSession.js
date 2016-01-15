/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _CacheMemcacheCache = require('../Cache/MemcacheCache');

var _CacheMemcacheCache2 = _interopRequireDefault(_CacheMemcacheCache);

var _default = (function (_memcachecache) {
    _inherits(_default, _memcachecache);

    function _default() {
        _classCallCheck(this, _default);

        _memcachecache.apply(this, arguments);
    }

    _default.prototype.init = function init(options) {
        _memcachecache.prototype.init.call(this, options);

        //cache keystore
        this.cacheStore = thinkCache.SESSION;
        //cache auto refresh
        this.updateExpire = true;
    };

    return _default;
})(_CacheMemcacheCache2['default']);

exports['default'] = _default;
module.exports = exports['default'];