/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/2
 */
import session from '../../Think/Session.js';

export default class extends session{

    init(http){
        super.init(http);
        this.options.gctype = 'memorySession';
        THINK.GCTIMER(this);
    }

    /**
     *
     * @param name
     */
    get(name){
        if(!(name in thinkCache(thinkCache.SESSION))){
            return getPromise();
        }
        let value = thinkCache(thinkCache.SESSION, name);
        if(isEmpty(value)){
            return getPromise();
        }
        let now = Date.now();
        if(now > value.expire){
            thinkCache(thinkCache.SESSION, name, null);
            return getPromise();
        }
        if(this.updateExpire){
            value.expire = now + value.timeout * 1000;
            thinkCache(thinkCache.SESSION, name, value);
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

    /**
     *
     * @param name
     * @param vlaue
     * @param timeout
     */
    set(name, value, timeout){
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
            expire: Date.now() + timeout * 1000
        };
        thinkCache(thinkCache.SESSION, name, data);
        return getPromise();
    }

    /**
     *
     * @param name
     */
    rm(name){
        thinkCache(thinkCache.SESSION, name, null);
        return getPromise();
    }

    /**
     *
     */
    gc(now = Date.now()){
        let ls = thinkCache(thinkCache.SESSION) || {};
        for(let v in ls){
            ((k)=>{
                if(now > ls[k].expire){
                    thinkCache(thinkCache.SESSION, k, null);
                }
            })(v)
        }
    }

}