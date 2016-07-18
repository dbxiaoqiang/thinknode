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
        this.keyName = options.cache_key_prefix;
        super.init(options);
        this.options.cache_key_prefix = `${~(THINK.config('cache_key_prefix').indexOf(':')) ? THINK.config('cache_key_prefix') : `${THINK.config('cache_key_prefix')}:`}Session:`;
    }

    /**
     *
     * @param name
     */
    async get(name){
        let data = await this.handle.get(this.options.cache_key_prefix + this.keyName);
        if(!data){
            return '';
        }
        try{
            data = JSON.parse(data);
            if(data.expire && Date.now() > data.expire){
                this.handle.rm(this.options.cache_key_prefix + this.keyName);
                return '';
            }else{
                return data[name];
            }
        }catch(e){
            this.handle.rm(this.options.cache_key_prefix + this.keyName);
            return '';
        }
    }

    /**
     *
     * @param name
     * @param value
     * @param timeout
     */
    async set(name, value, timeout){
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
            if(!THINK.isEmpty(rdata)){
                rdata = JSON.parse(rdata);
                content = THINK.extend(false, rdata, content);
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
