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
        if (length > THINK.config('post_max_fields')) {
            return THINK.statusAction(this.http, 400, 'exceed the limit on the form fields');
        }
        for (let name in post) {
            //单个表单值长度超过限制
            if (post[name] && post[name].length > THINK.config('post_max_fields_size')) {
                return THINK.statusAction(this.http, 400, 'exceed the limit on the form length');
            }
        }
        return Promise.resolve();
    }
}
