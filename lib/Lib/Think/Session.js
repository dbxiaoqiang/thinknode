'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.options = {
            session_name: C('session_name'), //session对应的cookie名称
            session_type: C('session_type'), //session存储类型 Memory,File,Redis,Db
            session_options: C('session_options'), //session对应的cookie选项
            session_sign: C('session_sign'), //session对应的cookie使用签名
            session_timeout: C('session_timeout') //服务器上session失效时间，单位：秒
        };
        this.updateExpire = true;
    };
    /**
     * 生成uid
     * @param  int length
     * @return string
     */

    _class.prototype.uid = function uid(length) {
        var ratio = Math.log(64) / Math.log(256);
        var numbytes = Math.ceil(length * ratio);
        var str = _crypto2.default.randomBytes(numbytes).toString('base64').slice(0, length);
        return str.replace(/\+/g, '_').replace(/\//g, '-');
    };
    /**
     * 生成cookie签名
     * @param  string val
     * @param  string secret
     * @return string
     */

    _class.prototype.cookieSign = function cookieSign(val, secret) {
        secret = _crypto2.default.createHmac('sha256', secret).update(val).digest('base64');
        secret = secret.replace(/\=+$/, '');
        return val + '.' + secret;
    };
    /**
     * 解析cookie签名
     * @param  {[type]} val
     * @param  {[type]} secret
     * @return {[type]}
     */

    _class.prototype.cookieUnsign = function cookieUnsign(val, secret) {
        var str = val.slice(0, val.lastIndexOf('.'));
        return cookieSign(str, secret) === val ? str : '';
    };

    _class.prototype.start = function start() {
        var sessionCookie = this.http._cookie[this.options.session_name];
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
    };

    return _class;
}(_Base2.default);

exports.default = _class;