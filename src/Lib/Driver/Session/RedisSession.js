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
        this.keyName = options.cache_key_prefix;
        super.init(options);
        this.options.cache_key_prefix = `${C('cache_key_prefix')}Session:${this.options.cache_key_prefix}`;
    }

    /**
     *
     * @param name
     */
    async get(name){
        let data = await this.handle.get(this.options.cache_key_prefix + this.keyName);
        if(!data){
            return;
        }
        try{
            data = JSON.parse(data);
            if(data.expire && Date.now() > data.expire){
                return this.handle.rm(this.options.cache_key_prefix + this.keyName);
            }else{
                return data[name];
            }
        }catch(e){
            return this.handle.rm(this.options.cache_key_prefix + this.keyName);
        }
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    async set(name, value, timeout){
        let key = name;
        if (isObject(name)) {
            timeout = value;
            key = Object.keys(name)[0];
        }
        if (timeout === undefined) {
            timeout = this.options.cache_timeout;
        }

        let rdata = await this.handle.get(this.options.cache_key_prefix + this.keyName);
        let content = {
            [name]: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        try{
            if(!isEmpty(rdata)){
                rdata = JSON.parse(rdata);
                content = extend(false, rdata, content);
            }
            return this.handle.set(this.options.cache_key_prefix + this.keyName, JSON.stringify(content), timeout);
        }catch(e){
            return Promise.resolve();
        }
    }

    /**
     *
     * @param
     */
    rm(){
        return this.handle.rm(this.options.cache_key_prefix + this.keyName);
    }
}