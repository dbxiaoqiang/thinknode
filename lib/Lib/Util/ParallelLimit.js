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

var _Base = require('../Think/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    /**
     * limit
     * @param  {[type]}   limit    []
     * @param  {Function} callback []
     * @return {[type]}            []
     */

    _class.prototype.init = function init(limit, callback) {
        if (isFunction(limit)) {
            callback = limit;
            limit = 0;
        }
        this.limit = limit || 10;
        this.index = 0;
        this.doing = 0;
        this.callback = callback;
        this.deferreds = [];
    };
    /**
     * add item data
     * @param {data} item []
     */

    _class.prototype.add = function add(item) {
        var deferred = getDefer();
        deferred.data = item;
        this.deferreds.push(deferred);
        this.run();
        return deferred.promise;
    };
    /**
     * add many data once
     * @param {Array} dataList [data array]
     */

    _class.prototype.addMany = function addMany(dataList, ignoreError) {
        var _this2 = this;

        if (!dataList || dataList.length === 0) {
            return _promise2.default.resolve();
        }
        dataList.forEach(function (item) {
            return _this2.add(item);
        });
        var promises = this.deferreds.map(function (deferred) {
            //ignore erros
            if (ignoreError) {
                return deferred.promise.catch(function () {
                    return;
                });
            }
            return deferred.promise;
        });
        return _promise2.default.all(promises);
    };
    /**
     * run
     * @return {} []
     */

    _class.prototype.run = function run() {
        var _this3 = this;

        if (this.doing >= this.limit || this.index >= this.deferreds.length) {
            return;
        }
        this.doing++;
        var item = this.deferreds[this.index++];
        var callback = isFunction(item.data) ? item.data : this.callback;
        if (!isFunction(callback)) {
            return E('data item or callback must be a function');
        }
        var result = callback(item.data);
        if (!isPromise(result)) {
            result = _promise2.default.resolve(result);
        }
        return result.then(function (data) {
            _this3.next();
            //resolve item
            item.resolve(data);
        }).catch(function (err) {
            _this3.next();

            //reject item
            item.reject(err);
        });
    };

    /**
     * next
     * @return {Function} [description]
     */

    _class.prototype.next = function next() {
        this.doing--;

        //reduce deferreds avoid memory leak when use single item data
        this.deferreds.splice(this.index - 1, 1);
        this.index--;

        this.run();
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/12/8
                    */

exports.default = _class;