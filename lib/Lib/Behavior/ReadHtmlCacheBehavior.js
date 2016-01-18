'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

var _class = function (_THINK$Behavior) {
    (0, _inherits3.default)(_class, _THINK$Behavior);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Behavior.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.options = {
            'html_cache_on': C('html_cache_on'), //是否开启缓存
            'html_cache_timeout': C('html_cache_timeout'), //缓存时间
            'html_cache_path': C('html_cache_path'),
            'html_cache_file_suffix': C('html_cache_file_suffix') || '.html', //缓存文件扩展名
            'cache_options': {
                cache_path: C('html_cache_path'),
                cache_timeout: C('html_cache_timeout'),
                cache_key_prefix: C('cache_key_prefix').indexOf(':') > -1 ? C('cache_key_prefix') + 'Temp:' : C('cache_key_prefix') + ':Temp:'
            }
        };
    };

    _class.prototype.run = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data) {
            var content;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(!this.options.html_cache_on || !this.options.html_cache_timeout)) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return', false);

                        case 2:
                            _context.next = 4;
                            return S(this.getCacheName(data.data), '', this.options.cache_options);

                        case 4:
                            content = _context.sent;

                            if (!isEmpty(content)) {
                                _context.next = 9;
                                break;
                            }

                            return _context.abrupt('return', false);

                        case 9:
                            _context.next = 11;
                            return this.http.echo(content);

                        case 11:
                            return _context.abrupt('return', getDefer().promise);

                        case 12:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function run(_x) {
            return ref.apply(this, arguments);
        };
    }();

    _class.prototype.getCacheName = function getCacheName(data) {
        if (isObject(data)) {
            data = (0, _stringify2.default)(data);
        }
        data += this.http.group + ':' + this.http.controller + ':' + this.http.action;
        return md5(data) + this.options.html_cache_file_suffix;
    };

    return _class;
}(THINK.Behavior);

exports.default = _class;