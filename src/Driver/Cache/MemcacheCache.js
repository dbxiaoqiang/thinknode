/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
import cache from './Cache';
import memcache from '../Socket/MemcacheSocket';

export default class extends cache {

    init(options) {
        super.init(options);

        let key = hash(`${this.options.memcache_host}_${this.options.memcache_port}`);
        if(!(key in THINK.INSTANCES.MEMCACHE)){
            THINK.INSTANCES.MEMCACHE[key] = new memcache(this.options);
        }
        this.handle = THINK.INSTANCES.MEMCACHE[key];
    }

    /**
     *
     * @param name
     */
    async get(name){
        let value = await this.handle.get(this.options.cache_key_prefix + name);
        return value;
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    set(name, value, timeout = this.options.cache_timeout){
        return this.handle.set(this.options.cache_key_prefix + name, JSON.stringify(value), timeout);
    }

    /**
     *
     * @param name
     */
    rm(name){
        return this.handle.rm(this.options.cache_key_prefix + name);
    }
}
