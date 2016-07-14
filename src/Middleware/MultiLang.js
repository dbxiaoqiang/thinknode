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
        //暂未实现
        return Promise.resolve();
    }
}
