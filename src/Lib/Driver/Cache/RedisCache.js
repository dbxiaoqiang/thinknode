/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
import cache from '../../Think/Cache';
import redis from '../Socket/RedisSocket';

export default class extends cache {
    init(options) {
        super.init(options);

        let key = hash(JSON.stringify(this.options));
        if(!(key in THINK.INSTANCES.REDIS)){
            THINK.INSTANCES.REDIS[key] = new redis(this.options);
        }
        this.handle = THINK.INSTANCES.REDIS[key];
    }

    /**
     * 字符串获取
     * @param name
     */
    get(name){
        return this.handle.get(this.options.cache_key_prefix + name);
    }

    /**
     * 字符串写入
     * @param name
     * @param value
     * @param timeout
     * @returns {Promise}
     */
    set(name, value, timeout = this.options.cache_timeout){
        return this.handle.set(this.options.cache_key_prefix + name, value, timeout);
    }

    /**
     * 删除key
     * @param name
     */
    rm(name){
        return this.handle.rm(this.options.cache_key_prefix + name);
    }

    /**
     * 设置key超时属性
     * @param name
     * @param timeout
     */
    expire(name, timeout = this.options.cache_timeout){
        return this.handle.expire(this.options.cache_key_prefix + name, timeout);
    }

    /**
     * 批量删除，可模糊匹配
     * @param keyword
     * @returns {*}
     */
    batchRm(keyword) {
        return this.handle.batchRm(this.options.cache_key_prefix + keyword);
    }

    /**
     * 判断key是否存在
     * @param name
     */
    exists(name){
        return this.handle.exists(this.options.cache_key_prefix + name);
    }

    /**
     * 自增
     * @param name
     */
    incr(name) {
        return this.handle.incr(this.options.cache_key_prefix + name);
    }

    /**
     * 自减
     * @param name
     * @returns {*}
     */
    decr(name) {
        return this.handle.decr(this.options.cache_key_prefix + name);
    }

    /**
     * 字符key增加指定长度
     * @param name
     * @param incr
     * @returns {*}
     */
    incrBy(name, incr) {
        return this.handle.incrBy(this.options.cache_key_prefix + name, incr);
    }

    /**
     * 哈希写入
     * @param name
     * @param key
     * @param value
     * @param timeout
     */
    hSet(name, key, value, timeout = this.options.cache_timeout){
        return this.handle.hSet(this.options.cache_key_prefix + name, key, value, timeout);
    }

    /**
     * 哈希获取
     * @param name
     * @param key
     * @returns {*}
     */
    hGet(name, key){
        return this.handle.hGet(this.options.cache_key_prefix + name, key);
    }

    /**
     * 查看哈希表 hashKey 中，给定域 key 是否存在
     * @param name
     * @param key
     * @returns {*}
     */
    hExists(name, key){
        return this.handle.hExists(this.options.cache_key_prefix + name, key);
    }

    /**
     * 返回哈希表 key 中域的数量
     * @param name
     * @returns {*}
     */
    hLen(name){
        return this.handle.hLen(this.options.cache_key_prefix + name);
    }

    /**
     * 给哈希表指定key，增加increment
     * @param name
     * @param key
     * @param incr
     * @returns {*}
     */
    hIncrBy(name, key, incr){
        return this.handle.hIncrBy(this.options.cache_key_prefix + name, key, incr);
    }

    /**
     * 返回哈希表所有key-value
     * @param name
     * @returns {*}
     */
    hGetAll(name){
        return this.handle.hGetAll(this.options.cache_key_prefix + name);
    }

    /**
     * 返回哈希表所有key
     * @param name
     * @returns {*}
     */
    hKeys(name){
        return this.handle.hKeys(this.options.cache_key_prefix + name);
    }

    /**
     * 返回哈希表所有value
     * @param name
     * @returns {*}
     */
    hVals(name){
        return this.handle.hVals(this.options.cache_key_prefix + name);
    }

    /**
     * 哈希删除
     * @param name
     * @param key
     * @returns {*}
     */
    hDel(name, key){
        return this.handle.hDel(this.options.cache_key_prefix + name, key);
    }

    /**
     * 判断列表长度，若不存在则表示为空
     * @param name
     * @returns {*}
     */
    lLen(name){
        return this.handle.lLen(this.options.cache_key_prefix + name);
    }

    /**
     * 将值插入列表表尾
     * @param name
     * @param value
     * @returns {*}
     */
    rPush(name, value){
        return this.handle.rPush(this.options.cache_key_prefix + name, value);
    }

    /**
     * 将列表表头取出，并去除
     * @param name
     * @returns {*}
     */
    lPop(name){
        return this.handle.lPop(this.options.cache_key_prefix + name);
    }

    /**
     * 集合新增
     * @param name
     * @param value
     * @returns {*}
     */
    sAdd(name, value) {
        return this.handle.sAdd(this.options.cache_key_prefix + name, value);
    }

    /**
     * 返回集合的基数(集合中元素的数量)
     * @param name
     * @returns {*}
     */
    sCard(name) {
        return this.handle.sCard(this.options.cache_key_prefix + name);
    }

    /**
     * 判断 member 元素是否集合的成员
     * @param name
     * @param key
     * @returns {*}
     */
    sisMember(name, key) {
        return this.handle.sisMember(this.options.cache_key_prefix + name, key);
    }

    /**
     * 返回集合中的所有成员
     * @param name
     * @returns {*}
     */
    sMembers(name) {
        return this.handle.sMembers(this.options.cache_key_prefix + name);
    }

    /**
     * 移除并返回集合中的一个随机元素
     * @param name
     * @returns {*}
     */
    sPop(name) {
        return this.handle.sPop(this.options.cache_key_prefix + name);
    }

    /**
     * 移除集合 key 中的一个 member 元素
     * @param name
     * @param key
     * @returns {*}
     */
    sRem(name, key) {
        return this.handle.sRem(this.options.cache_key_prefix + name, key);
    }
}