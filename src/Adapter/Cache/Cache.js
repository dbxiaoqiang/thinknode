/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import base from '../../Core/Base';

export default class extends base{
    init(options = {}){
        this.options = THINK.extend(false, {
            cache_type: THINK.config('cache_type'), //数据缓存类型 File,Redis,Memcache
            cache_key_prefix: THINK.config('cache_key_prefix'), //缓存key前置
            cache_timeout: THINK.config('cache_timeout'), //数据缓存有效期，单位: 秒
            cache_path: THINK.CACHE_PATH,  //缓存路径设置 (File缓存方式有效)
            cache_file_suffix: THINK.config('cache_file_suffix'), //File缓存方式下文件后缀名
            cache_gc_hour: THINK.config('cache_gc_hour') //缓存清除的时间点，数据为小时
        }, options);
        this.options.cache_path = THINK.isEmpty(this.options.cache_path) ? THINK.CACHE_PATH : this.options.cache_path;
    }

}
