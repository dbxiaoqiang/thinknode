'use strict';

exports.__esModule = true;

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

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.tVar = {};
    };

    /**
     * 赋值
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */


    _class.prototype.assign = function assign(name, value) {
        if (name === undefined) {
            return this.tVar;
        }
        if (THINK.isString(name) && arguments.length === 1) {
            return this.tVar[name];
        }
        if (THINK.isObject(name)) {
            for (var key in name) {
                this.tVar[key] = name[key];
            }
        } else {
            this.tVar[name] = value;
        }
    };

    /**
     * 输出模版
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */


    _class.prototype.display = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(templateFile, charset, contentType) {
            var content;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!this.http.isend) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return', THINK.statusAction(this.http, 403, 'this http has being end'));

                        case 2:
                            _context.next = 4;
                            return THINK.run('view_init', this.http, [templateFile, this.tVar]);

                        case 4:
                            _context.next = 6;
                            return this.fetch(templateFile);

                        case 6:
                            content = _context.sent;
                            _context.next = 9;
                            return THINK.run('view_end', this.http, [content, this.tVar]);

                        case 9:

                            charset = charset || THINK.config('encoding');
                            if (!this.http.typesend) {
                                contentType = contentType || THINK.config('tpl_content_type');
                                this.http.type(contentType, charset);
                            }
                            if (THINK.config('show_exec_time')) {
                                this.http.sendTime();
                            }
                            return _context.abrupt('return', this.http.end(content || '', charset));

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function display(_x, _x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return display;
    }();

    /**
     * 渲染模版
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */


    _class.prototype.fetch = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(templateFile) {
            var tpFile, v;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            tpFile = templateFile || this.http.templateFile;

                            if (!(!tpFile || !THINK.isFile(tpFile))) {
                                _context2.next = 3;
                                break;
                            }

                            return _context2.abrupt('return', THINK.statusAction(this.http, 404, 'can\'t find template file ' + (tpFile || '')));

                        case 3:
                            _context2.t0 = _regenerator2.default.keys(this.tVar);

                        case 4:
                            if ((_context2.t1 = _context2.t0()).done) {
                                _context2.next = 12;
                                break;
                            }

                            v = _context2.t1.value;

                            if (!THINK.isPromise(this.tVar[v])) {
                                _context2.next = 10;
                                break;
                            }

                            _context2.next = 9;
                            return this.tVar[v];

                        case 9:
                            this.tVar[v] = _context2.sent;

                        case 10:
                            _context2.next = 4;
                            break;

                        case 12:
                            _context2.next = 14;
                            return THINK.run('view_filter', this.http, this.tVar);

                        case 14:
                            this.tVar = _context2.sent;

                            //挂载所有变量到THINK.ViewVar
                            THINK.ViewVar = this.tVar;
                            //渲染模板
                            return _context2.abrupt('return', THINK.run('view_parse', this.http, { 'var': this.tVar, 'file': tpFile }));

                        case 17:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function fetch(_x4) {
            return _ref2.apply(this, arguments);
        }

        return fetch;
    }();

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/11/26
                    */


exports.default = _class;