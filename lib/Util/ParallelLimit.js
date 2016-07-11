'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _Base = require('../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {
    /**
     * limit
     * @param  {[type]}   limit    []
     * @param  {Function} callback []
     * @return {[type]}            []
     */
    init(limit, callback) {
        if (THINK.isFunction(limit)) {
            callback = limit;
            limit = 0;
        }
        this.limit = limit || 10;
        this.index = 0;
        this.doing = 0;
        this.callback = callback;
        this.deferreds = [];
    }
    /**
     * add item data
     * @param {data} item []
     */
    add(item) {
        let deferred = THINK.getDefer();
        deferred.data = item;
        this.deferreds.push(deferred);
        this.run();
        return deferred.promise;
    }
    /**
     * add many data once
     * @param {Array} dataList [data array]
     */
    addMany(dataList, ignoreError) {
        if (!dataList || dataList.length === 0) {
            return _promise2.default.resolve();
        }
        dataList.forEach(item => {
            return this.add(item);
        });
        let promises = this.deferreds.map(deferred => {
            //ignore erros
            if (ignoreError) {
                return deferred.promise.catch(() => {
                    return;
                });
            }
            return deferred.promise;
        });
        return _promise2.default.all(promises);
    }
    /**
     * run
     * @return {} []
     */
    run() {
        if (this.doing >= this.limit || this.index >= this.deferreds.length) {
            return;
        }
        this.doing++;
        let item = this.deferreds[this.index++];
        let callback = THINK.isFunction(item.data) ? item.data : this.callback;
        if (!THINK.isFunction(callback)) {
            return THINK.E('data item or callback must be a function');
        }
        let result = callback(item.data);
        if (!THINK.isPromise(result)) {
            result = _promise2.default.resolve(result);
        }
        return result.then(data => {
            this.next();
            //resolve item
            item.resolve(data);
        }).catch(err => {
            this.next();

            //reject item
            item.reject(err);
        });
    }

    /**
     * next
     * @return {Function} [description]
     */
    next() {
        this.doing--;

        //reduce deferreds avoid memory leak when use single item data
        this.deferreds.splice(this.index - 1, 1);
        this.index--;

        this.run();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/12/8
    */