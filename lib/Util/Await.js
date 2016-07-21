'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        this.queue = {};
    };

    _class.prototype.run = function run(key, fn) {
        var _this2 = this;

        if (!key in this.queue) {
            this.queue[key] = [];
            return _promise2.default.resolve(fn()).then(function (data) {
                process.nextTick(function () {
                    _this2.queue[key].forEach(function (deferred) {
                        return deferred.resolve(data);
                    });
                    delete _this2.queue[key];
                });
                return data;
            }).catch(function (err) {
                process.nextTick(function () {
                    _this2.queue[key].forEach(function (deferred) {
                        return deferred.reject(err);
                    });
                    delete _this2.queue[key];
                });
                return THINK.error(err);
            });
        } else {
            var deferred = THINK.getDefer();
            this.queue[key].push(deferred);
            return deferred.promise;
        }
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    16/7/14
                    */


exports.default = _class;