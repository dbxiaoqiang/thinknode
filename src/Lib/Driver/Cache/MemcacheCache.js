/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
import cache from '../../Think/Cache';
import memcache from '../Socket/MemcacheSocket';

export default class extends cache {

    init(options) {
        super.init(options);

        let key = hash(JSON.stringify(this.options));
        if(!(key in THINK.INSTANCES.MEMCACHE)){
            THINK.INSTANCES.MEMCACHE[key] = new memcache(this.options);
        }
        this.handle = THINK.INSTANCES.MEMCACHE[key];
        this.options.gctype = 'memcacheCache';
        THINK.GCTIMER(this);
    }

    /**
     *
     * @param name
     */
    async getData(name){
        let value = await this.handle.get(this.options.cache_key_prefix + name);
        return value ? JSON.parse(value) : value;
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    setData(name, value, timeout = this.options.cache_timeout){
        return this.handle.set(this.options.cache_key_prefix + name, JSON.stringify(value), timeout);
    }

    /**
     *
     * @param name
     */
    rmData(name){
        return this.handle.rm(this.options.cache_key_prefix + name);
    }
}