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
        if (isString(name) && arguments.length === 1) {
            return this.tVar[name];
        }
        if (isObject(name)) {
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
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(templateFile, charset, contentType) {
            var content, _ref;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!this.http.isend) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return', E('this http has being end'));

                        case 2:
                            _context.next = 4;
                            return T('view_init', this.http, this.tVar);

                        case 4:
                            _context.next = 6;
                            return this.fetch(templateFile);

                        case 6:
                            content = _context.sent;
                            _context.next = 9;
                            return this.render(content, charset, contentType);

                        case 9:
                            content = _context.sent;
                            _context.next = 12;
                            return T('view_end', this.http, { content: content, var: this.tVar });

                        case 12:
                            _ref = [null, null];
                            this.tVar = _ref[0];
                            content = _ref[1];
                            return _context.abrupt('return');

                        case 16:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function display(_x, _x2, _x3) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * 渲染模版
     * @param  {[type]} content     [description]
     * @param  {[type]} charset     [description]
     * @param  {[type]} contentType [description]
     * @return {[type]}             [description]
     */

    _class.prototype.render = function render(content, charset, contentType) {
        if (!this.http.typesend) {
            charset = charset || C('encoding');
            contentType = contentType || C('tpl_content_type');
            this.http.header('Content-Type', contentType + '; charset=' + charset);
        }
        if (C('show_exec_time')) {
            this.http.sendTime();
        }
        return this.http.echo(content || '', charset || C('encoding'));
    };

    /**
     * 获取模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */

    _class.prototype.fetch = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(templateFile) {
            var tpFile, v, content;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            tpFile = templateFile;

                            if (!(isEmpty(templateFile) || !isFile(templateFile))) {
                                _context2.next = 7;
                                break;
                            }

                            _context2.next = 4;
                            return T('view_template', this.http, templateFile);

                        case 4:
                            tpFile = _context2.sent;

                            if (isFile(tpFile)) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.abrupt('return', E('can\'t find template file ' + tpFile));

                        case 7:
                            _context2.t0 = _regenerator2.default.keys(this.tVar);

                        case 8:
                            if ((_context2.t1 = _context2.t0()).done) {
                                _context2.next = 16;
                                break;
                            }

                            v = _context2.t1.value;

                            if (!isPromise(this.tVar[v])) {
                                _context2.next = 14;
                                break;
                            }

                            _context2.next = 13;
                            return this.tVar[v];

                        case 13:
                            this.tVar[v] = _context2.sent;

                        case 14:
                            _context2.next = 8;
                            break;

                        case 16:
                            _context2.next = 18;
                            return T('view_parse', this.http, { 'var': this.tVar, 'file': tpFile });

                        case 18:
                            content = _context2.sent;
                            return _context2.abrupt('return', T('view_filter', this.http, content));

                        case 20:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
        return function fetch(_x4) {
            return ref.apply(this, arguments);
        };
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