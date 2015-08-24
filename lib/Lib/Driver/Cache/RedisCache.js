var redis = thinkRequire('RedisSocket');
module.exports = Cache(function () {
    'use strict';
    var instances = {};
    return {
        namePrefix: C('cache_key_prefix'),
        init: function (options) {
            this.super_('init', options);
            this.options = extend(false,{
                redis_port: C('redis_port'),
                redis_host: C('redis_host'),
                redis_password: C('redis_password')
            }, options);

            var key = md5(JSON.stringify(this.options));
            if (!(key in instances)) {
                instances[key] = redis(this.options);
            }
            this.namePrefix = this.options.cache_key_prefix !== undefined ? this.options.cache_key_prefix : this.namePrefix;
            this.handle = instances[key];
        },
        get: function (name) {
            return this.handle.get(this.namePrefix + name);
        },
        set: function (name, value, timeout) {
            timeout = timeout || this.options.timeout;
            return this.handle.set(this.namePrefix + name, value, timeout);
        },
        /**
         * 删除key
         * @param name
         */
        delete: function (name) {
            return this.handle.delete(this.namePrefix + name);
        },
        rm: function (name) {
            return this.handle.delete(this.namePrefix + name);
        },
        /**
         * 设置key超时属性
         * @param name
         * @param timeout
         * @returns {*}
         */
        expire: function (name, timeout) {
            timeout = timeout || this.options.timeout;
            return this.handle.expire(this.namePrefix + name, timeout);
        },

        /**
         * 判断key是否存在
         * @param name
         * @returns {*}
         */
        exists: function (name) {
            return this.handle.exists(this.namePrefix + name);
        },
        /**
         * 哈希写入
         * @param name
         * @param key
         * @param value
         * @param timeout
         * @returns {*}
         */
        hSet: function (name, key, value, timeout) {
            timeout = timeout || this.options.timeout;
            return this.handle.hSet(this.namePrefix + name, key, value, timeout);
        },
        /**
         * 哈希获取
         * @param name
         * @param key
         * @returns {*}
         */
        hGet: function (name, key) {
            return this.handle.hGet(this.namePrefix + name, key);
        },
        /**
         * 查看哈希表 hashKey 中，给定域 key 是否存在
         * @param name
         * @param key
         * @returns {*}
         */
        hExists: function (name, key) {
            return this.handle.hExists(this.namePrefix + name, key);
        },
        /**
         * 返回哈希表 key 中域的数量
         * @param name
         * @returns {*}
         */
        hLen: function (name) {
            return this.handle.hLen(this.namePrefix + name);
        },
        /**
         * 给哈希表指定key，增加increment
         * @param name
         * @param key
         * @param incr
         */
        hIncrBy: function (name, key, incr) {
            return this.handle.hIncrBy(this.namePrefix + name, key, incr);
        },
        /**
         * 返回哈希表所有key-value
         * @param name
         * @returns {*}
         */
        hGetAll: function (name) {
            return this.handle.hGetAll(this.namePrefix + name);
        },
        /**
         * 返回哈希表所有value
         * @param name
         */
        hVals: function (name) {
            return this.handle.hVals(this.namePrefix + name);
        },
        /**
         * 返回哈希表所有key
         * @param name
         */
        hKeys: function (name) {
            return this.handle.hKeys(this.namePrefix + name);
        },
        /**
         * 哈希删除
         * @param name
         * @param key
         * @returns {*}
         */
        hDel: function (name, key) {
            return this.handle.hDel(this.namePrefix + name, key);
        },
        /**
         * 批量删除，可模糊匹配
         * @param keyword
         * @returns {*}
         */
        batchRm: function (keyword) {
            return this.handle.batchRm(this.namePrefix + keyword);
        },
        /**
         * 判断列表长度，若不存在则表示为空
         * @param name
         */
        lLen: function (name) {
            return this.handle.lLen(this.namePrefix + name);
        },
        /**
         * 将值插入列表表尾
         * @param name
         * @param value
         */
        rPush: function (name, value) {
            return this.handle.rPush(this.namePrefix + name, value);
        },
        /**
         * 将列表表头取出，并去除
         * @param name
         */
        lPop: function (name) {
            return this.handle.lPop(this.namePrefix + name);
        },
        /**
         * 自增
         * @param name
         */
        incr: function (name) {
            return this.handle.incr(this.namePrefix + name);
        },
        /**
         * 字符key增加指定长度
         * @param name
         * @param incr
         * @returns {*}
         */
        incrBy: function (name, incr) {
            return this.handle.incrBy(this.namePrefix + name, incr);
        },
        /**
         * 自减
         * @param name
         * @returns {*}
         */
        decr: function (name) {
            return this.handle.decr(this.namePrefix + name);
        },
        /**
         * 集合新增
         * @param name
         * @param value
         * @returns {*}
         */
        sAdd: function (name, value) {
            return this.handle.sAdd(this.namePrefix + name, value);
        },
        /**
         * 返回集合的基数(集合中元素的数量)
         * @param name
         * @returns {*}
         */
        sCard: function (name) {
            return this.handle.sCard(this.namePrefix + name);
        },
        /**
         * 判断 member 元素是否集合的成员
         * @param name
         * @param key
         * @returns {*}
         */
        sisMember: function (name, key) {
            return this.handle.sisMember(this.namePrefix + name, key);
        },
        /**
         * 返回集合中的所有成员
         * @param name
         * @returns {*}
         */
        sMembers: function (name) {
            return this.handle.sMembers(this.namePrefix + name);
        },
        /**
         * 移除并返回集合中的一个随机元素
         * @param name
         * @returns {*}
         */
        sPop: function (name) {
            return this.handle.sPop(this.namePrefix + name);
        },
        /**
         * 移除集合 key 中的一个 member 元素
         * @param name
         * @param key
         * @returns {*}
         */
        sRem: function (name, key) {
            return this.handle.sRem(this.namePrefix + name, key);
        }

    };
});