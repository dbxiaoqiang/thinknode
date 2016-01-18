'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _RedisCache = require('../Cache/RedisCache');

var _RedisCache2 = _interopRequireDefault(_RedisCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_rediscache) {
    (0, _inherits3.default)(_class, _rediscache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _rediscache.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        _rediscache.prototype.init.call(this, options);
        this.options.cache_key_prefix = C('cache_key_prefix') + 'session_' + this.options.cache_key_prefix;
        //cache auto refresh
        this.updateExpire = true;
    };

    return _class;
}(_RedisCache2.default); /**
                          *
                          * @author     richen
                          * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                          * @license    MIT
                          * @version    15/12/29
                          */

exports.default = _class;