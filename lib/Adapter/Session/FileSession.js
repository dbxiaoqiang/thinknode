'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _FileCache = require('../Cache/FileCache');

var _FileCache2 = _interopRequireDefault(_FileCache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
var _class = function (_filecache) {
    (0, _inherits3.default)(_class, _filecache);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(options) {
            this.keyName = options.cache_key_prefix;
            (0, _get3.default)((0, _getPrototypeOf2.default)(_class.prototype), 'init', this).call(this, options);
            this.cachePath = this.options.cache_path + '/' + THINK.config('cache_key_prefix') + '/Session';
            this.options.gctype = 'fileSession';
            THINK.GCTIMER(this);
        }
    }, {
        key: 'getFilePath',
        value: function getFilePath() {
            var tmp = THINK.hash(this.keyName).split('').slice(0, 1) || '';
            var dir = this.cachePath + '/' + tmp;
            THINK.isDir(dir) || THINK.mkDir(dir);
            return dir + '/' + this.keyName + this.options.cache_file_suffix;
        }

        /**
         *
         * @param name
         */

    }, {
        key: 'get',
        value: function get(name) {
            var file = this.getFilePath();
            if (!THINK.isFile(file)) {
                return _promise2.default.resolve('');
            }
            var fn = THINK.promisify(_fs2.default.readFile, _fs2.default);
            return fn(file, { encoding: 'utf8' }).then(function (data) {
                if (!data) {
                    return '';
                }
                try {
                    data = JSON.parse(data);
                    if (data.expire && Date.now() > data.expire) {
                        _fs2.default.unlink(file, function () {});
                        return '';
                    } else {
                        return data[name];
                    }
                } catch (e) {
                    _fs2.default.unlink(file, function () {});
                    return '';
                }
            }).catch(function () {
                return '';
            });
        }

        /**
         *
         * @param name
         * @param value
         * @param timeout
         */

    }, {
        key: 'set',
        value: function set(name, value, timeout) {
            var _content;

            if (timeout === undefined) {
                timeout = this.options.cache_timeout;
            }
            var file = this.getFilePath();
            var rfn = THINK.promisify(_fs2.default.readFile, _fs2.default);
            var wfn = THINK.promisify(_fs2.default.writeFile, _fs2.default);
            var content = (_content = {}, (0, _defineProperty3.default)(_content, name, value), (0, _defineProperty3.default)(_content, 'expire', Date.now() + timeout * 1000), (0, _defineProperty3.default)(_content, 'timeout', timeout), _content),
                promise = _promise2.default.resolve();
            if (THINK.isFile(file)) {
                promise = rfn(file, { encoding: 'utf8' });
            }
            try {
                return promise.then(function (rdata) {
                    if (!THINK.isEmpty(rdata)) {
                        rdata = JSON.parse(rdata);
                        content = THINK.extend(false, rdata, content);
                    }
                    return wfn(file, (0, _stringify2.default)(content)).then(function () {
                        //修改缓存文件权限，避免不同账号下启动时可能会出现无权限的问题
                        THINK.chmod(file);
                    });
                });
            } catch (e) {
                return _promise2.default.resolve();
            }
        }

        /**
         *
         * @param
         */

    }, {
        key: 'rm',
        value: function rm() {
            var file = this.getFilePath();
            if (THINK.isFile(file)) {
                var fn = THINK.promisify(_fs2.default.unlink, _fs2.default);
                return fn(file);
            }
            return _promise2.default.resolve();
        }
    }]);
    return _class;
}(_FileCache2.default);

exports.default = _class;