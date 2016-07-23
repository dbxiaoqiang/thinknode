'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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
var _class = function (_THINK$Middleware) {
    (0, _inherits3.default)(_class, _THINK$Middleware);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Middleware.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.options = THINK.config('tpl_engine_config');
        var key = THINK.hash((0, _stringify2.default)(this.options));
        if (!(key in THINK.INSTANCES.TPLENGINE)) {
            //get tpl pase engine instance
            var engine = THINK.config('tpl_engine_type');
            var clsEngine = THINK.adapter(THINK.ucFirst(engine) + 'Template');
            THINK.INSTANCES.TPLENGINE[key] = new clsEngine(this.options);
        }
        this.handle = THINK.INSTANCES.TPLENGINE[key];
    };

    _class.prototype.run = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data) {
            var engine;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            //将模版文件路径写入到http对象上，供writehtmlcache里使用
                            this.http._tplfile = data.file;
                            engine = THINK.config('tpl_engine_type');
                            //不使用模版引擎，直接返回文件内容

                            if (engine) {
                                _context.next = 4;
                                break;
                            }

                            return _context.abrupt('return', THINK.getFileContent(data.file));

                        case 4:
                            _context.next = 6;
                            return this.handle.fetch(data.file, data.var);

                        case 6:
                            return _context.abrupt('return', _context.sent);

                        case 7:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function run(_x) {
            return _ref.apply(this, arguments);
        }

        return run;
    }();

    return _class;
}(THINK.Middleware);

exports.default = _class;