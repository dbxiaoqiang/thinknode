'use strict';

exports.__esModule = true;

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
            cache_type: THINK.config('cache_type'), //数据缓存类型 File,Redis,Memcache
            cache_key_prefix: THINK.config('cache_key_prefix'), //缓存key前置
            cache_timeout: THINK.config('cache_timeout'), //数据缓存有效期，单位: 秒
            cache_path: THINK.CACHE_PATH, //缓存路径设置 (File缓存方式有效)
            cache_file_suffix: THINK.config('cache_file_suffix'), //File缓存方式下文件后缀名
            cache_gc_hour: THINK.config('cache_gc_hour') //缓存清除的时间点，数据为小时
        }, options);
        this.options.cache_path = THINK.isEmpty(this.options.cache_path) ? THINK.CACHE_PATH : this.options.cache_path;
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/19
                    */


exports.default = _class;