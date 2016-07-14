/**
 * 二级域名支持中间件
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
export default class extends THINK.Middleware {
    init(http) {
        this.http = http;
        this.subdomain = THINK.C('sub_domain');
    }

    run(data) {
        if (THINK.isEmpty(this.subdomain)) {
            return Promise.resolve();
        }
        let hostname = this.http.hostname.split('.');
        let groupName = hostname[0];
        let value = this.subdomain[groupName];
        if (THINK.isEmpty(value)) {
            return Promise.resolve();
        }
        let pathname = this.http.pathname;
        if (value && pathname.indexOf(value) === 0) {
            pathname = pathname.substr(value.length);
        }

        this.http.pathname = `${value}/${pathname}`;
        return Promise.resolve();
    }
}
