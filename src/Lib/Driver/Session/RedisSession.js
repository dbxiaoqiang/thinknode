/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/29
 */
import rediscache from '../Cache/RedisCache';

export default class extends rediscache{
    init(options) {
        super.init(options);
        this.options.cache_key_prefix = `${C('cache_key_prefix')}session_${this.options.cache_key_prefix}`;
        //cache auto refresh
        this.updateExpire = true;
    }
}