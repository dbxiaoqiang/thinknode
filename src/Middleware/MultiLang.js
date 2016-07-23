/**
 * 多语言支持中间件
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
export default class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    run(data) {
        if (THINK.config('multi_lang')) {
            let pathname = this.http.pathname.split('/');
            if(pathname[0] && pathname[0] in THINK.LANGUAGE){
                THINK.config('language', pathname[0]);
                pathname.shift();
                this.http.pathname = pathname.join('/');
            }
        }
        return Promise.resolve();
    }
}
