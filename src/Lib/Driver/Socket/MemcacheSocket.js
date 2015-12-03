/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/3
 */
import net from 'net';
import {EventEmitter} from 'events';
import base from '../../Think/Base.js';

export default class extends base{
    init(config = {}){
        EventEmitter.call(this);
        this.config = extend(false, {
            memcache_port: C('memcache_port'),
            memcache_host: C('memcache_host')
        }, config);
        //换行符
        this.config.crlf = '\r\n';
        //定义错误
        this.config.errors = ['ERROR', 'NOT_FOUND', 'CLIENT_ERROR', 'SERVER_ERROR'];

        this.buffer = '';
        this.callbacks = []; //回调函数
        this.handle = null; //socket连接句柄
    }

    connect(){
        if (this.handle) {
            return this;
        }
        let self = this;
        let deferred = getDefer();
        this.handle = net.createConnection(this.config.memcache_port, this.config.memcache_host);
        this.handle.on('connect', function () {
            this.setTimeout(0);
            this.setNoDelay();
            self.emit('connect');
            deferred.resolve();
        });
        this.handle.on('data', function (data) {
            self.buffer += data.toString();
            self.handleData();
        });
        this.handle.on('end', function () {
            while (self.callbacks.length > 0) {
                let callback = self.callbacks.shift();
                if (callback && callback.callback) {
                    callback.callback('CONNECTION_CLOSED');
                }
            }
            self.handle = null;
        });
        this.handle.on('close', function () {
            self.handle = null;
            self.emit('close');
        });
        this.handle.on('timeout', function () {
            if (self.callbacks.length > 0) {
                let callback = self.callbacks.shift();
                if (callback && callback.callback) {
                    callback.callback('TIMEOUT');
                }
            }
            self.emit('timeout');
        });
        this.handle.on('error', function (error) {
            while (self.callbacks.length > 0) {
                let callback = self.callbacks.shift();
                if (callback && callback.callback) {
                    callback.callback('ERROR');
                }
            }
            self.handle = null;
            self.emit('clienterror', error);
        });
        this.promise = deferred.promise;
        return this;
    }

    close(){
        if (this.handle && this.handle.readyState === 'open') {
            this.handle.end();
            this.handle = null;
        }
    }

    /**
     *
     * @param query
     * @param type
     */
    async wrap(query, type){
        await this.connect();
        let deferred = getDefer();
        let callback = (error, value) =>  {
            return error ? deferred.reject(error) : deferred.resolve(value);
        };
        this.callbacks.push({type: type, callback: callback});
        this.handle.write(query + this.config.crlf);
        return deferred.promise;
    }

    /**
     * 获取
     * @param key
     */
    get(key){
        return this.wrap('get ' + key, 'get');
    }

    /**
     *
     * @param key
     * @param value
     * @param lifetime
     * @param flags
     * @returns {*}
     */
    set(key, value, lifetime = 0, flags = 0){
        let length = Buffer.byteLength(value.toString());
        let query = ['set', key, flags, lifetime, length].join(' ') + this.config.crlf + value;
        return this.wrap(query, 'simple');
    }

    /**
     *
     * @param key
     */
    rm(key){
        return this.wrap('delete ' + key, 'simple');
    }

    /**
     * 增长
     * @param key
     * @param step
     * @returns {*}
     */
    incr(key, step = 1){
        return this.wrap('incr ' + key + ' ' + step, 'simple');
    }

    /**
     * 减少
     * @param key
     * @param step
     * @returns {*}
     */
    decr(key, step = 1){
        return this.wrap('decr ' + key + ' ' + step, 'simple');
    }

    /**
     *
     */
    handleData(){
        while (this.buffer.length > 0) {
            let result = this.getHandleResult(this.buffer);
            if (result === false) {
                break;
            }
            let value = result[0];
            let pos = result[1];
            let error = result[2];
            if (pos > this.buffer.length) {
                break;
            }
            this.buffer = this.buffer.substring(pos);
            let callback = this.callbacks.shift();
            if (callback && callback.callback) {
                callback.callback(error, value);
            }
        }
    }

    /**
     *
     * @param buffer
     */
    getHandleResult(buffer){
        if (buffer.indexOf(this.config.crlf) === -1) {
            return false;
        }
        for (var i = 0; i < this.config.errors.length; i++) {
            let item = this.config.errors[i];
            if (buffer.indexOf(item) > -1) {
                return this.handleError(buffer);
            }
        }
        let callback = this.callbacks[0];
        if (callback && callback.type) {
            return this['handle' + ucfirst(callback.type)](buffer);
        }
        return false;
    }

    /**
     *
     * @param buffer
     */
    handleError(buffer){
        let line = buffer.indexOf(this.config.crlf);
        if (line > -1) {
            line = buffer.substr(0, line);
        }
        return [null, line.length + this.config.crlf.length, line];
    }

    /**
     *
     * @param buffer
     */
    handleGet(buffer){
        let value = null, end = 3, resultLen = 0, firstPos, crlfLen = this.config.crlf.length;
        if (buffer.indexOf('END') === 0) {
            return [value, end + crlfLen];
        } else if (buffer.indexOf('VALUE') === 0 && buffer.indexOf('END') > -1) {
            firstPos = buffer.indexOf(CRLF) + crlfLen;
            var endPos = buffer.indexOf('END');
            resultLen = endPos - firstPos - crlfLen;
            value = buffer.substr(firstPos, resultLen);
            return [value, firstPos + parseInt(resultLen, 10) + crlfLen + end + crlfLen];
        } else {
            firstPos = buffer.indexOf(this.config.crlf) + crlfLen;
            resultLen = buffer.substr(0, firstPos).split(' ')[3];
            value = buffer.substr(firstPos, resultLen);
            return [value, firstPos + parseInt(resultLen) + crlfLen + end + crlfLen];
        }
    }

    /**
     *
     * @param buffer
     */
    handleSimple(buffer){
        let line = buffer.indexOf(this.config.crlf);
        if (line > -1) {
            line = buffer.substr(0, line);
        }
        return [line, line.length + this.config.crlf.length, null];
    }
}