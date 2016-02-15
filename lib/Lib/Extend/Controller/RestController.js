'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Controller = require('../../Core/Controller');

var _Controller2 = _interopRequireDefault(_Controller);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Controller2.default {

    init(http) {
        super.init(http);
        this.http.isRestful = true;
        //资源名
        this.resource = ucfirst(this.get('resource'));
        //资源id
        this.id = this.get('id') || 0;
        //实例化对应的模型
        let cls = M(`${ this.http.group }/${ this.resource }`);
        this.model = cls.config ? cls : M(`Common/${ this.resource }`);
    }

    getAction() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (!isEmpty(_this.id)) {
                try {
                    let pk = yield _this.model.getPk();
                    let data = yield _this.model.where(getObject(pk, _this.id)).find();
                    return _this.success('', data);
                } catch (e) {
                    return _this.error(e);
                }
            } else {
                try {
                    let data = yield _this.model.select();
                    return _this.success(data);
                } catch (e) {
                    return _this.error(e);
                }
            }
        })();
    }

    postAction() {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let pk = yield _this2.model.getPk();
                let data = _this2.post();
                data[pk] && delete data[pk];
                if (isEmpty(data)) {
                    return _this2.error('data is empty');
                }
                let rows = yield _this2.model.add(data);
                return _this2.success(rows);
            } catch (e) {
                return _this2.error(e);
            }
        })();
    }

    deleteAction() {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (!_this3.id) {
                    return _this3.error('params error');
                }
                let pk = yield _this3.model.getPk();
                let rows = yield _this3.model.where(getObject(pk, _this3.id)).delete();
                return _this3.success(rows);
            } catch (e) {
                return _this3.error(e);
            }
        })();
    }

    putAction() {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (!_this4.id) {
                    return _this4.error('params error');
                }
                let pk = yield _this4.model.getPk();
                let data = _this4.post();
                data[pk] && delete data[pk];
                if (isEmpty(data)) {
                    return _this4.error('data is empty');
                }
                let rows = yield _this4.model.where(getObject(pk, _this4.id)).update(data);
                return _this4.success(rows);
            } catch (e) {
                return _this4.error(e);
            }
        })();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/12/3
    */