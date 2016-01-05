/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/3
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _ThinkController = require('../../Think/Controller');

var _ThinkController2 = _interopRequireDefault(_ThinkController);

var _default = (function (_controller) {
    _inherits(_default, _controller);

    function _default() {
        _classCallCheck(this, _default);

        _controller.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        _controller.prototype.init.call(this, http);
        this.http.isRestful = true;
        //资源名
        this.resource = ucfirst(this.get('resource'));
        //资源id
        this.id = this.get('id') || 0;
        //实例化对应的模型
        this.model = isEmpty(D(this.http.group + '/' + this.resource)) ? D('Common/' + this.resource) : D(this.http.group + '/' + this.resource);
    };

    _default.prototype.getAction = function getAction() {
        var pk, data;
        return _regeneratorRuntime.async(function getAction$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    if (isEmpty(this.id)) {
                        context$2$0.next = 16;
                        break;
                    }

                    context$2$0.prev = 1;
                    context$2$0.next = 4;
                    return _regeneratorRuntime.awrap(this.model.getPk());

                case 4:
                    pk = context$2$0.sent;
                    context$2$0.next = 7;
                    return _regeneratorRuntime.awrap(this.model.where(getObject(pk, this.id)).find());

                case 7:
                    data = context$2$0.sent;
                    return context$2$0.abrupt('return', this.success(data));

                case 11:
                    context$2$0.prev = 11;
                    context$2$0.t0 = context$2$0['catch'](1);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 14:
                    context$2$0.next = 26;
                    break;

                case 16:
                    context$2$0.prev = 16;
                    context$2$0.next = 19;
                    return _regeneratorRuntime.awrap(this.model.select());

                case 19:
                    data = context$2$0.sent;
                    return context$2$0.abrupt('return', this.success(data));

                case 23:
                    context$2$0.prev = 23;
                    context$2$0.t1 = context$2$0['catch'](16);
                    return context$2$0.abrupt('return', this.error(context$2$0.t1));

                case 26:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[1, 11], [16, 23]]);
    };

    _default.prototype.postAction = function postAction() {
        var pk, data, rows;
        return _regeneratorRuntime.async(function postAction$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;
                    context$2$0.next = 3;
                    return _regeneratorRuntime.awrap(this.model.getPk());

                case 3:
                    pk = context$2$0.sent;
                    data = this.post();

                    data[pk] && delete data[pk];

                    if (!isEmpty(data)) {
                        context$2$0.next = 8;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('data is empty'));

                case 8:
                    context$2$0.next = 10;
                    return _regeneratorRuntime.awrap(this.model.add(data));

                case 10:
                    rows = context$2$0.sent;
                    return context$2$0.abrupt('return', this.success(rows));

                case 14:
                    context$2$0.prev = 14;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 17:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 14]]);
    };

    _default.prototype.deleteAction = function deleteAction() {
        var pk, rows;
        return _regeneratorRuntime.async(function deleteAction$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;

                    if (this.id) {
                        context$2$0.next = 3;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('params error'));

                case 3:
                    context$2$0.next = 5;
                    return _regeneratorRuntime.awrap(this.model.getPk());

                case 5:
                    pk = context$2$0.sent;
                    context$2$0.next = 8;
                    return _regeneratorRuntime.awrap(this.model.where(getObject(pk, this.id))['delete']());

                case 8:
                    rows = context$2$0.sent;
                    return context$2$0.abrupt('return', this.success(rows));

                case 12:
                    context$2$0.prev = 12;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 15:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 12]]);
    };

    _default.prototype.putAction = function putAction() {
        var pk, data, rows;
        return _regeneratorRuntime.async(function putAction$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.prev = 0;

                    if (this.id) {
                        context$2$0.next = 3;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('params error'));

                case 3:
                    context$2$0.next = 5;
                    return _regeneratorRuntime.awrap(this.model.getPk());

                case 5:
                    pk = context$2$0.sent;
                    data = this.post();

                    data[pk] && delete data[pk];

                    if (!isEmpty(data)) {
                        context$2$0.next = 10;
                        break;
                    }

                    return context$2$0.abrupt('return', this.error('data is empty'));

                case 10:
                    context$2$0.next = 12;
                    return _regeneratorRuntime.awrap(this.model.where(getObject(pk, this.id)).update(data));

                case 12:
                    rows = context$2$0.sent;
                    return context$2$0.abrupt('return', this.success(rows));

                case 16:
                    context$2$0.prev = 16;
                    context$2$0.t0 = context$2$0['catch'](0);
                    return context$2$0.abrupt('return', this.error(context$2$0.t0));

                case 19:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this, [[0, 16]]);
    };

    return _default;
})(_ThinkController2['default']);

exports['default'] = _default;
module.exports = exports['default'];