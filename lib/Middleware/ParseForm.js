'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_THINK$Middleware) {
    (0, _inherits3.default)(_class, _THINK$Middleware);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Middleware.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
    };

    _class.prototype.run = function run(data) {
        var _this2 = this;

        if (!this.http.req.readable) {
            return _promise2.default.resolve();
        }
        return this.http.getPayload().then(function (payload) {
            //解析提交的json数据
            var types = THINK.config('post_json_content_type');
            var data = {};
            if (types.indexOf(_this2.http._type) > -1) {
                try {
                    data = JSON.parse(payload);
                } catch (e) {
                    THINK.log('JSON.parse error, payload is not a valid JSON data', 'WARNING');
                    //if using json parse error, then use querystring parse.
                    //sometimes http header has json content-type, but payload data is querystring data
                    data = _querystring2.default.parse(payload);
                }
            }
            //querystring.parse解析
            //let contentType = this.http.type();
            //if(contentType && contentType.indexOf('application/x-www-form-urlencoded') > -1){
            data = THINK.extend(data, _querystring2.default.parse(payload));
            //}
            if (!THINK.isEmpty(data)) {
                _this2.http._post = THINK.extend(_this2.http._post, data);
            }
            return _promise2.default.resolve();
        });
    };

    return _class;
}(THINK.Middleware); /**
                      *
                      * @author     richen
                      * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                      * @license    MIT
                      * @version    15/11/19
                      */


exports.default = _class;