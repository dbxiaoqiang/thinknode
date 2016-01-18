'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _FileCache = require('../Cache/FileCache');

var _FileCache2 = _interopRequireDefault(_FileCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_filecache) {
    (0, _inherits3.default)(_class, _filecache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _filecache.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        _filecache.prototype.init.call(this, options);

        //cache keystore
        this.cacheStore = THINK.CACHES.SESSION;
        //cache auto refresh
        this.updateExpire = true;
    };

    return _class;
}(_FileCache2.default); /**
                         *
                         * @author     richen
                         * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                         * @license    MIT
                         * @version    15/12/2
                         */

exports.default = _class;