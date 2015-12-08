/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/8
 */
import base from '../Think/Base.js';

export default class extends base{
    /**
     * limit
     * @param  {[type]}   limit    []
     * @param  {Function} callback []
     * @return {[type]}            []
     */
    init(limit, callback){
        if(isFunction(limit)){
            callback = limit;
            limit = 0;
        }
        this.limit = limit || 10;
        this.index = 0;
        this.doing = 0;
        this.callback = callback;
        this.deferreds = [];
    }
    /**
     * add item data
     * @param {data} item []
     */
    add(item){
        let deferred = getDefer();
        deferred.data = item;
        this.deferreds.push(deferred);
        this.run();
        return deferred.promise;
    }
    /**
     * add many data once
     * @param {Array} dataList [data array]
     */
    addMany(dataList, ignoreError){
        if (!dataList || dataList.length === 0) {
            return Promise.resolve();
        }
        dataList.forEach(item => {
            return this.add(item);
        });
        let promises = this.deferreds.map( deferred => {
            //ignore erros
            if (ignoreError) {
                return deferred.promise.catch(() => {
                    return;
                });
            }
            return deferred.promise;
        });
        return Promise.all(promises);
    }
    /**
     * run
     * @return {} []
     */
    run(){
        if (this.doing >= this.limit || this.index >= this.deferreds.length) {
            return;
        }
        this.doing++;
        let item = this.deferreds[this.index++];
        let callback = isFunction(item.data) ? item.data : this.callback;
        if (!isFunction(callback)) {
            throw new Error('data item or callback must be a function');
        }
        let result = callback(item.data);
        if (!isPromise(result)) {
            result = Promise.resolve(result);
        }
        return result.then(data => {
            this.doing --;
            this.run();
            //resolve item
            item.resolve(data);
        }).catch(err => {
            this.doing --;
            this.run();
            //reject item
            item.reject(err);
        });
    }
}