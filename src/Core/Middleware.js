/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */
import base from './Base';

export default class extends base{
    init(http){
        this.http = http;
    }

    run(data = {}){
        return data;
    }
}
