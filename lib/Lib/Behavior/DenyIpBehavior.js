'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
exports.default = class extends THINK.Behavior {
    //使用了解构,new的时候实参为{http: http, options: options}
    init(_ref) {
        let http = _ref.http;
        let options = _ref.options;

        this.http = http;
        this.options = extend(false, {
            deny_ip: [] //阻止的ip列表
        }, options);
    }

    run(data) {
        if (this.options.deny_ip.length === 0) {
            return true;
        }

        let clientIps = this.http.ip().split('.');
        let flag = this.options.deny_ip.some(function (item) {
            return item.split('.').every(function (num, i) {
                if (num === '*' || num === clientIps[i]) {
                    return true;
                }
            });
        });
        //如果在阻止的ip在列表里，则返回一个pendding promise，让后面的代码不执行
        if (flag) {
            return O(this.http, 403);
        }
        return true;
    }
};