/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

export default class extends THINK.Middleware {
    init(http) {
        this.http = http;
    }

    async run(data) {
        if (THINK.C('token_on')) {
            let tokenName = THINK.C('token_name');
            let token = await this.getToken(tokenName);
            this.http.view().assign(tokenName, token);
        }
        return Promise.resolve();
    }

    async getToken(tokenName){
        let value = await this.http.session(tokenName);
        if (!value) {
            value = this.http.cookieUid(32);
            this.http.session(tokenName, value);
        }
        return value;
    }
}
