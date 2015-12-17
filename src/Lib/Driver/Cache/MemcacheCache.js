/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/3
 */
import cache from '../../Think/Cache';
import memcache from '../Socket/MemcacheSocket';

export default class extends cache {

    init(options) {
        super.init(options);

        let key = md5(JSON.stringify(this.options));
        if(!(key in THINK.INSTANCES.MEMCACHE)){
            THINK.INSTANCES.MEMCACHE[key] = memcache(this.options.memcache_port, this.options.memcache_host);
        }
        this.handle = THINK.INSTANCES.MEMCACHE[key];
    }

    /**
     *
     * @param name
     */
    async get(name){
        let value = await this.handle.get(this.options.cache_key_prefix + name);
        return value ? JSON.parse(value) : value;
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