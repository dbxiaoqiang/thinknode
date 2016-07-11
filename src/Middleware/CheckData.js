/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import querystring from 'querystring';

export default class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run(data) {
        let post = this.http._post;
        let length = Object.keys(post).length;
        //最大表单数超过限制
        if (length > THINK.C('post_max_fields')) {
            return THINK.O(this.http, 400, 'exceed the limit on the form fields', this.http.isWebSocket ? 'SOCKET' : 'HTTP');
        }
        for (let name in post) {
            //单个表单值长度超过限制
            if (post[name] && post[name].length > THINK.C('post_max_fields_size')) {
                return THINK.O(this.http, 400, 'exceed the limit on the form length', this.http.isWebSocket ? 'SOCKET' : 'HTTP');
            }
        }
        return;
    }
}
