/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import crypto from 'crypto';
import base from './Base';

export default class extends base{
    init(http){
        this.http = http;
        this.options = {
            session_name: C('session_name'), //session对应的cookie名称
            session_type: C('session_type'), //session存储类型 Memory,File,Redis,Db
            session_options: C('session_options'), //session对应的cookie选项
            session_sign: C('session_sign'), //session对应的cookie使用签名
            session_timeout: C('session_timeout') //服务器上session失效时间，单位：秒
        };
        this.updateExpire = true;
    }
    /**
     * 生成uid
     * @param  int length
     * @return string
     */
    uid(length){
        let ratio = Math.log(64) / Math.log(256);
        let numbytes = Math.ceil(length * ratio);
        let str = crypto.randomBytes(numbytes).toString('base64').slice(0, length);
        return str.replace(/\+/g, '_').replace(/\//g, '-');
    }
    /**
     * 生成cookie签名
     * @param  string val
     * @param  string secret
     * @return string
     */
    cookieSign(val, secret){
        secret = crypto.createHmac('sha256', secret).update(val).digest('base64');
        secret = secret.replace(/\=+$/, '');
        return `${val}.${secret}`;
    }
    /**
     * 解析cookie签名
     * @param  {[type]} val
     * @param  {[type]} secret
     * @return {[type]}
     */
    cookieUnsign(val, secret){
        let str = val.slice(0, val.lastIndexOf('.'));
        return cookieSign(str, secret) === val ? str : '';
    }

    start(){
        let sessionCookie = this.http._cookie[this.options.session_name];
        //是否使用签名
        if (sessionCookie && this.options.session_sign) {
            sessionCookie = this.cookieUnsign(sessionCookie, this.options.session_sign);
            if (sessionCookie) {
                this.http._cookie[this.options.session_name] = sessionCookie;
            }
        }
        if (!sessionCookie) {
            sessionCookie = this.uid(32);
            if (this.options.session_sign) {
                sessionCookie = this.cookieSign(sessionCookie, this.options.session_sign);
            }
            //将生成的sessionCookie放在http._cookie对象上，方便程序内读取
            this.http._cookie[this.options.session_name] = sessionCookie;
            this.http.cookie(this.options.session_name, sessionCookie);
        }
        return sessionCookie;
    }

}