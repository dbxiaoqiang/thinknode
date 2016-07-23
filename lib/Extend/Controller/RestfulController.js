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

var _Controller = require('../../Core/Controller');

var _Controller2 = _interopRequireDefault(_Controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_controller) {
    (0, _inherits3.default)(_class, _controller);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _controller.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        _controller.prototype.init.call(this, http);
        this.http.isRestful = true;
        //资源名
        this.resource = THINK.ucFirst(this.get('resource'));
        //资源id
        this.id = this.get('id') || 0;
        //实例化对应的模型
        var cls = THINK.model(this.http.group + '/' + this.resource, {});
        this.model = cls.config ? cls : THINK.model('Common/' + this.resource, {});
    };

    _class.prototype.getAction = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var pk, data, _data;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!this.id) {
                                _context.next = 16;
                                break;
                            }

                            _context.prev = 1;
                            _context.next = 4;
                            return this.model.getPk();

                        case 4:
                            pk = _context.sent;
                            _context.next = 7;
                            return this.model.where(THINK.getObject(pk, this.id)).find();

                        case 7:
                            data = _context.sent;
                            return _context.abrupt('return', this.success('', data));

                        case 11:
                            _context.prev = 11;
                            _context.t0 = _context['catch'](1);
                            return _context.abrupt('return', this.error(_context.t0.message));

                        case 14:
                            _context.next = 26;
                            break;

                        case 16:
                            _context.prev = 16;
                            _context.next = 19;
                            return this.model.select();

                        case 19:
                            _data = _context.sent;
                            return _context.abrupt('return', this.success('', _data));

                        case 23:
                            _context.prev = 23;
                            _context.t1 = _context['catch'](16);
                            return _context.abrupt('return', this.error(_context.t1.message));

                        case 26:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[1, 11], [16, 23]]);
        }));

        function getAction() {
            return _ref.apply(this, arguments);
        }

        return getAction;
    }();

    _class.prototype.postAction = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var pk, data, rows;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            _context2.next = 3;
                            return this.model.getPk();

                        case 3:
                            pk = _context2.sent;
                            data = this.post();

                            data[pk] && delete data[pk];

                            if (!THINK.isEmpty(data)) {
                                _context2.next = 8;
                                break;
                            }

                            return _context2.abrupt('return', this.error('data is empty'));

                        case 8:
                            _context2.next = 10;
                            return this.model.add(data);

                        case 10:
                            rows = _context2.sent;
                            return _context2.abrupt('return', this.success('', rows));

                        case 14:
                            _context2.prev = 14;
                            _context2.t0 = _context2['catch'](0);
                            return _context2.abrupt('return', this.error(_context2.t0.message));

                        case 17:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[0, 14]]);
        }));

        function postAction() {
            return _ref2.apply(this, arguments);
        }

        return postAction;
    }();

    _class.prototype.deleteAction = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var pk, rows;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;

                            if (this.id) {
                                _context3.next = 3;
                                break;
                            }

                            return _context3.abrupt('return', this.error('params error'));

                        case 3:
                            _context3.next = 5;
                            return this.model.getPk();

                        case 5:
                            pk = _context3.sent;
                            _context3.next = 8;
                            return this.model.where(THINK.getObject(pk, this.id)).delete();

                        case 8:
                            rows = _context3.sent;
                            return _context3.abrupt('return', this.success('', rows));

                        case 12:
                            _context3.prev = 12;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(_context3.t0.message));

                        case 15:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 12]]);
        }));

        function deleteAction() {
            return _ref3.apply(this, arguments);
        }

        return deleteAction;
    }();

    _class.prototype.putAction = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var pk, data, rows;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;

                            if (this.id) {
                                _context4.next = 3;
                                break;
                            }

                            return _context4.abrupt('return', this.error('params error'));

                        case 3:
                            _context4.next = 5;
                            return this.model.getPk();

                        case 5:
                            pk = _context4.sent;
                            data = this.post();

                            data[pk] && delete data[pk];

                            if (!THINK.isEmpty(data)) {
                                _context4.next = 10;
                                break;
                            }

                            return _context4.abrupt('return', this.error('data is empty'));

                        case 10:
                            _context4.next = 12;
                            return this.model.where(THINK.getObject(pk, this.id)).update(data);

                        case 12:
                            rows = _context4.sent;
                            return _context4.abrupt('return', this.success('', rows));

                        case 16:
                            _context4.prev = 16;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', this.error(_context4.t0.message));

                        case 19:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[0, 16]]);
        }));

        function putAction() {
            return _ref4.apply(this, arguments);
        }

        return putAction;
    }();

    return _class;
}(_Controller2.default); /**
                          *
                          * @author     richen
                          * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                          * @license    MIT
                          * @version    15/12/3
                          */


exports.default = _class;