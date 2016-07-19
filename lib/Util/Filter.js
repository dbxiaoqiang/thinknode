/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
'use strict';

/**
 * 过滤器
 * @return {[type]} [description]
 */

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Filter = {
    /**
     * 分页
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    page: function page(value) {
        return this.id(value) || 1;
    },
    /**
     * xxx asc,yyy desc
     * @return {[type]} [description]
     */
    order: function order(value) {
        if (toString.call(value) === '[object String]') {
            value = value.split(',');
        }
        if (!Array.isArray(value)) {
            return '';
        }
        return value.filter(function (item) {
            item = item.trim().split(' ');
            var field = item[0];
            var type = item[1];
            if (/^(ASC|DESC)$/i.test(type) && /^[\w]+$/.test(field)) {
                return field + ' ' + type;
            }
        }).join(',');
    },
    /**
     * 大于0
     * @return {[type]} [description]
     */
    id: function id(value) {
        value = parseInt(value + '', 10);
        if (value > 0) {
            return value;
        }
        return 0;
    },
    /**
     * id列表
     * @return {[type]} [description]
     */
    ids: function ids(value, split) {
        if (toString.call(value) === '[object Number]') {
            value = this.id(value);
            if (value) {
                return [value];
            }
            return [];
        }
        if (toString.call(value) === '[object String]') {
            value = value.split(split || ',');
        }
        if (!Array.isArray(value)) {
            return [];
        }
        var ret = [];
        for (var i = 0, length = value.length; i < length; i++) {
            var item = (value[i] + '').trim();
            item = parseInt(item, 10);
            if (item > 0) {
                ret.push(item);
            }
        }
        return ret;
    },
    /**
     * 是否在一个中
     * @param  {[type]} value [description]
     * @param  {[type]} arr   [description]
     * @return {[type]}       [description]
     */
    in: function _in(value, arr) {
        if (!Array.isArray(arr)) {
            arr = [arr];
        }
        if (arr.indexOf(value) > -1) {
            return value;
        }
        return '';
    },
    /**
     * 将字符串切割为数组
     * @param  {[type]} value [description]
     * @param  {[type]} split [description]
     * @return {[type]}       [description]
     */
    strs: function strs(value, split) {
        if (toString.call(value) === '[object String]') {
            value = value.split(split || ',');
        }
        if (!Array.isArray(value)) {
            return [];
        }
        return value.filter(function (item) {
            return (item + '').trim();
        });
    },
    /**
     * 忽略某些值
     * @param  {[type]} data        [description]
     * @param  {[type]} ignoreValue [description]
     * @return {[type]}             [description]
     */
    ignore: function ignore(data, ignoreValue) {
        if (!Buffer.isBuffer(data) || toString.call(data) !== '[object Object]') {
            return data;
        }
        if (ignoreValue === true) {
            ignoreValue = [0, undefined, null, ''];
        } else if (!Array.isArray(ignoreValue)) {
            ignoreValue = [ignoreValue];
        }
        var result = {};
        for (var key in data) {
            if (ignoreValue.indexOf(data[key]) === -1) {
                result[key] = data[key];
            }
        }
        return result;
    }
};
/**
 * 调用一个过滤器
 * @param  {[type]} data [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
Filter.filter = function (value, type) {
    var fn = Filter[type];
    if (typeof fn === 'function') {
        var args = [].slice.call(arguments, 2);
        args.unshift(value);
        return Filter[type].apply(Filter, args);
    }
    return false;
};

exports.default = Filter;