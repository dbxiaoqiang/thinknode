'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _MemcacheCache = require('../Cache/MemcacheCache');

var _MemcacheCache2 = _interopRequireDefault(_MemcacheCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_memcachecache) {
    (0, _inherits3.default)(_class, _memcachecache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _memcachecache.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        _memcachecache.prototype.init.call(this, options);
        this.options.cache_key_prefix = C('cache_key_prefix') + 'session_' + this.options.cache_key_prefix;
        //cache auto refresh
        this.updateExpire = true;
    };

    return _class;
}(_MemcacheCache2.default); /**
                             *
                             * @author     richen
                             * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                             * @license    MIT
                             * @version    15/12/2
                             */

exports.default = _class;