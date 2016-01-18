/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import memcachecache from '../Cache/MemcacheCache';

export default class extends memcachecache{

    init(options) {
        super.init(options);
        this.options.cache_key_prefix = `${C('cache_key_prefix')}session_${this.options.cache_key_prefix}`;
        //cache auto refresh
        this.updateExpire = true;
    }

}