/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/14
 */
import base from '../Core/Base';

export default class extends base{
    init(){
        this.queue = {};
    }

    run(key, fn){
        if(!key in this.queue){
            this.queue[key] = [];
            return Promise.resolve(fn()).then(data => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.resolve(data));
                    delete this.queue[key];
                });
                return data;
            }).catch(err => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.reject(err));
                    delete this.queue[key];
                });
                return THINK.error(err);
            });
        } else {
            let deferred = THINK.getDefer();
            this.queue[key].push(deferred);
            return deferred.promise;
        }
    }
}
