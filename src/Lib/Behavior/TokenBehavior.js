/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

export default class extends THINK.Behavior {
    init(http) {
        this.http = http;
    }

    async run(data) {
        if (C('token_on')) {
            let tokenName = C('token_name');
            let token = await this.getToken(tokenName);
            this.http.view().assign(tokenName, token);
        }
        return data;
    }

    async getToken(tokenName){
        let value = await this.http.session(tokenName);
        if (!value) {
            value = this.http.cookieUid(32);
            await this.http.session(tokenName, value);
        }
        return value;
    }
}
