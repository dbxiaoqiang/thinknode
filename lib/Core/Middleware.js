'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {
    init(http) {
        this.http = http;
    }

    run() {
        let data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        return data;
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/26
    */