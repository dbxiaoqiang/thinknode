'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _Filter = require('../Util/Filter');

var _Filter2 = _interopRequireDefault(_Filter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/26
 */

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(_class).apply(this, arguments));
    }

    (0, _createClass3.default)(_class, [{
        key: 'init',
        value: function init(http) {
            this.http = http;
            //assign别名
            this.set = this.assign;
            //success别名
            this.ok = this.success;
            //error别名
            this.fail = this.error;
            //display别名
            this.render = this.display;
        }

        /**
         * 是否是GET请求
         * @return {Boolean} [description]
         */

    }, {
        key: 'isGet',
        value: function isGet() {
            return this.http.isGet();
        }

        /**
         * 是否是POST请求
         * @return {Boolean} [description]
         */

    }, {
        key: 'isPost',
        value: function isPost() {
            return this.http.isPost();
        }

        /**
         * 是否是特定METHOD请求
         * @param  {[type]}  method [description]
         * @return {Boolean}        [description]
         */

    }, {
        key: 'isMethod',
        value: function isMethod(method) {
            return this.http.method === method.toUpperCase();
        }

        /**
         * 是否是AJAX请求
         * @return {Boolean} [description]
         */

    }, {
        key: 'isAjax',
        value: function isAjax(method) {
            return this.http.isAjax(method);
        }

        /**
         * 是否是websocket请求
         * @return {Boolean} [description]
         */

    }, {
        key: 'isWebSocket',
        value: function isWebSocket() {
            return this.http.isWebSocket;
        }

        /**
         * 是否是restful请求
         */

    }, {
        key: 'isRestful',
        value: function isRestful() {
            return this.http.isRestful;
        }

        /**
         * 是否是jsonp接口
         * @return {Boolean} [description]
         */

    }, {
        key: 'isJsonp',
        value: function isJsonp(name) {
            return this.http.isJsonp(name);
        }

        /**
         * token功能
         * @return {[type]} [description]
         */

    }, {
        key: 'token',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
                var tokenName, value, formValue;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (!THINK.config('token_on')) {
                                    _context.next = 14;
                                    break;
                                }

                                tokenName = THINK.config('token_name');
                                _context.next = 4;
                                return this.session(tokenName);

                            case 4:
                                value = _context.sent;
                                formValue = this.http.param(tokenName);

                                if (!(value !== formValue)) {
                                    _context.next = 10;
                                    break;
                                }

                                return _context.abrupt('return', false);

                            case 10:
                                //token匹配方式 http每次请求token不同, session在session有效期内token相同
                                if (THINK.config('token_type') === 'http') {
                                    //匹配完成后清除token
                                    this.http.session(tokenName, null);
                                }
                                return _context.abrupt('return', true);

                            case 12:
                                _context.next = 15;
                                break;

                            case 14:
                                return _context.abrupt('return', true);

                            case 15:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function token() {
                return _ref.apply(this, arguments);
            }

            return token;
        }()

        /**
         * 获取及构造QUERY参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'get',
        value: function get(name, value) {
            return this.http.get(name, value);
        }

        /**
         * 获取及构造POST参数
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'post',
        value: function post(name, value) {
            return this.http.post(name, value);
        }

        /**
         * 获取post或get参数,post优先
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'param',
        value: function param(name) {
            return this.http.param(name);
        }

        /**
         * 获取及构造上传的文件
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'file',
        value: function file(name, value) {
            return this.http.file(name, value);
        }

        /**
         * header操作
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */

    }, {
        key: 'header',
        value: function header(name, value) {
            return this.http.header(name, value);
        }

        /**
         * 获取userAgent
         * @return {[type]} [description]
         */

    }, {
        key: 'userAgent',
        value: function userAgent() {
            return this.http.userAgent();
        }

        /**
         * 获取referrer
         * @return {[type]} [description]
         */

    }, {
        key: 'referer',
        value: function referer(host) {
            return this.http.referrer(host);
        }

        /**
         * cookie操作
         * @param  {[type]} name    [description]
         * @param  {[type]} value   [description]
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */

    }, {
        key: 'cookie',
        value: function cookie(name, value, options) {
            return this.http.cookie(name, value, options);
        }

        /**
         * session操作
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]} timeout [description]
         */

    }, {
        key: 'session',
        value: function session(name, value, timeout) {
            return this.http.session(name, value, timeout);
        }

        /**
         * 赋值变量到模版
         * @param  {[type]} name  [description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */

    }, {
        key: 'assign',
        value: function assign(name, value) {
            return this.http.view().assign(name, value);
        }

        /**
         * 获取模板引擎解析后的模版内容
         * @param  {[type]} templateFile [description]
         * @param  {[type]} content      [description]
         * @return {[type]}              [description]
         */

    }, {
        key: 'fetch',
        value: function fetch(templateFile) {
            return this.http.view().fetch(templateFile);
        }

        /**
         * 输出模版内容
         * @param  {[type]} templateFile [description]
         * @param  {[type]} charset      [description]
         * @param  {[type]} contentType  [description]
         * @param  {[type]} content      [description]
         * @return {[type]}              [description]
         */

    }, {
        key: 'display',
        value: function display(templateFile, charset, contentType) {
            return this.http.view().display(templateFile, charset, contentType);
        }
        /**
         * 设置http响应状态码
         * @param  {Number} status [status code]
         * @return {}        []
         */

    }, {
        key: 'status',
        value: function status() {
            var _status = arguments.length <= 0 || arguments[0] === undefined ? 404 : arguments[0];

            this.http.status(_status);
            return this;
        }
        /**
         * 阻止访问
         * @param  {Number} status [status code]
         * @return {[type]}        []
         */

    }, {
        key: 'deny',
        value: function deny() {
            var status = arguments.length <= 0 || arguments[0] === undefined ? 403 : arguments[0];

            return THINK.statusAction(this.http, 403);
        }
        /**
         * 设置Cache-Control及失效时间
         * @param  {Number} time []
         * @return {}      []
         */

    }, {
        key: 'expires',
        value: function expires(time) {
            this.http.expires(time);
            return this;
        }

        /**
         * url跳转
         * @param url
         * @param code
         * @returns {*}
         */

    }, {
        key: 'redirect',
        value: function redirect(url, code) {
            this.http.redirect(url, code);
            return THINK.getDefer().promise;
        }

        /**
         * 发送Content-Type
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'type',
        value: function type(ext) {
            var encoding = arguments.length <= 1 || arguments[1] === undefined ? THINK.config('encoding') : arguments[1];

            return this.http.type(ext, encoding);
        }

        /**
         * 发送执行时间
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'sendTime',
        value: function sendTime(name) {
            return this.http.sendTime(name);
        }

        /**
         * json格式输出数据
         * @param  {[type]} data [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'json',
        value: function json(data) {
            this.type(THINK.config('json_content_type'));
            return this.http.end(data);
        }

        /**
         * jsonp格式输出数据
         * @param  {[type]} data  [description]
         * @param  {[type]} jsonp [description]
         * @return {[type]}       [description]
         */

    }, {
        key: 'jsonp',
        value: function jsonp(data) {
            this.type(THINK.config('json_content_type'));
            var callback = this.get(THINK.config('url_callback_name'));
            //过滤callback值里的非法字符
            callback = callback.replace(/[^\w\.]/g, '');
            if (callback) {
                data = callback + '(' + (data !== undefined ? (0, _stringify2.default)(data) : '') + ')';
            }
            return this.http.end(data);
        }

        /**
         * 操作成功后格式化的json数据输出
         * @param errmsg
         * @param data
         * @param code
         * @returns {type[]}
         */

    }, {
        key: 'success',
        value: function success(errmsg, data) {
            var code = arguments.length <= 2 || arguments[2] === undefined ? 200 : arguments[2];

            var obj = THINK.getObject(['status', THINK.config('error_no_key'), THINK.config('error_msg_key')], [1, code, errmsg || '']);
            if (data !== undefined) {
                obj.data = data;
            } else {
                obj.data = {};
            }
            this.type(THINK.config('json_content_type'));
            return this.http.end(obj);
        }

        /**
         * 操作异常后格式化的json数据输出
         * @param errmsg
         * @param data
         * @param code
         * @returns {type[]}
         */

    }, {
        key: 'error',
        value: function error(errmsg, data) {
            var code = arguments.length <= 2 || arguments[2] === undefined ? 500 : arguments[2];

            var obj = THINK.getObject(['status', THINK.config('error_no_key'), THINK.config('error_msg_key')], [0, code, (THINK.isError(errmsg) ? errmsg.messave : errmsg) || 'error']);
            if (data !== undefined) {
                obj.data = data;
            } else {
                obj.data = {};
            }
            this.type(THINK.config('json_content_type'));
            return this.http.end(obj);
        }

        /**
         * 输出内容
         * 自动JSON.stringify
         * 自定将数字等转化为字符串
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */

    }, {
        key: 'echo',
        value: function echo(obj, contentType, encoding) {
            contentType = contentType || THINK.config('tpl_content_type');
            this.type(contentType);
            return this.http.end(obj, encoding);
        }

        /**
         * 结束输出
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */

    }, {
        key: 'end',
        value: function end(obj, encoding) {
            return this.http.end(obj, encoding);
        }

        /**
         * 对数据进行过滤
         * @param  {[type]} data [description]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */

    }, {
        key: 'filter',
        value: function filter() {
            var _filter = _Filter2.default.filter;
            return _filter.apply(null, arguments);
        }

        /**
         * emit socket data
         * @param  {String} event []
         * @param  {Miex} data  []
         * @return {}       []
         */

    }, {
        key: 'emit',
        value: function emit(event, data) {
            if (!this.http.isWebSocket) {
                return THINK.statusAction(this.http, 403, 'emit method can only used in websocket request', 'SOCKET');
            }
            return this.http.socketEmit(event, data);
        }
        /**
         * broadcast socket data
         * @param  {String} event       []
         * @param  {Mixed} data        []
         * @param  {Boolean} containSelf []
         * @return {}             []
         */

    }, {
        key: 'broadcast',
        value: function broadcast(event, data, containSelf) {
            if (!this.http.isWebSocket) {
                return THINK.statusAction(this.http, 403, 'broadcast method can only used in websocket request', 'SOCKET');
            }
            return this.http.socketBroadcast(event, data, containSelf);
        }
    }]);
    return _class;
}(_Base2.default);

exports.default = _class;