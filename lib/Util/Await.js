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
    init() {
        this.queue = {};
    }

    run(key, fn) {
        if (!(key in this.queue)) {
            this.queue[key] = [];
            return _promise2.default.resolve(fn()).then(data => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.resolve(data));
                    delete this.queue[key];
                });
                return data;
            }).catch(err => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.reject(err));
                    delete this.queue[key];
                });
                return THINK.E(err);
            });
        } else {
            let deferred = THINK.getDefer();
            this.queue[key].push(deferred);
            return deferred.promise;
        }
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    16/7/14
    */