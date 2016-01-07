/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/29
 */
import session from '../../Think/Session';
import redis from '../Socket/RedisSocket';

export default class extends session{
    init(http){
        super.init(http);

        this.options['cache_key_prefix'] = 'Session:';
        let key = md5(JSON.stringify(this.options));
        if(!(key in THINK.INSTANCES.REDIS)){
            THINK.INSTANCES.REDIS[key] = new redis(this.options);
        }
        this.handle = THINK.INSTANCES.REDIS[key];
    }

    async get(name){
        let cookie = this.http.cookie(this.options.session_name);
        let content = await this.handle.get(this.options.cache_key_prefix + cookie);
        let value = {};
        try{
            content = JSON.parse(content || '{}');
            value = content[name] || {};
        }catch (e){
            value = {};
        }
        if(isEmpty(value)){
            return getPromise();
        }
        let now = Date.now();
        if(this.updateExpire){
            value.expire = now + value.timeout * 1000;
            try{
                this.expire(name, value.expire);
            }catch (e){}
        }
        let data = value.data;
        //如果data是个对象或者数组，需要深度拷贝
        if(isObject(data)){
            data = extend({}, data);
        }else if(isArray(data)){
            data = extend([], data);
        }
        return getPromise(data);
    }

    async set(name, value, timeout){
        let cookie = this.http.cookie(this.options.session_name);
        if(timeout === undefined){
            timeout = this.options.session_timeout;
        }
        //如果value是个对象或者数组，这里需要深度拷贝，防止程序里修改值导致缓存值被修改
        if(isObject(value)){
            value = extend({}, value);
        }else if(isArray(value)){
            value = extend([], value);
        }
        let data = {
            data: value,
            expire: Date.now() + timeout * 1000,
            timeout: timeout
        };
        try{
            let content = await this.handle.get(this.options.cache_key_prefix + cookie);
            content = JSON.parse(content || '{}');
            content[name] = data;
            this.handle.set(this.options.cache_key_prefix + cookie, JSON.stringify(content), timeout);
            return getPromise();
        }catch (e){
            return getPromise();
        }
    }

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */
    expire(name, timeout){
        return this.handle.expire(this.options.cache_key_prefix + name, timeout);
    }

    rm(){
        let cookie = this.http.cookie(this.options.session_name);
        return this.handle.rm(this.options.cache_key_prefix + cookie);
    }
}