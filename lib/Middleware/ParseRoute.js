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

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_THINK$Middleware) {
    (0, _inherits3.default)(_class, _THINK$Middleware);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _THINK$Middleware.apply(this, arguments));
    }

    _class.prototype.init = function init(http) {
        this.http = http;
        this.options = {
            'url_route_on': THINK.config('url_route_on'), //是否开启自定义URL路由
            'url_route_rules': THINK.config('url_route_rules') //自定义URL路由规则
        };
    };

    _class.prototype.run = function run(data) {
        if (!this.options.url_route_on) {
            return _promise2.default.resolve();
        }
        var rules = this.options.url_route_rules;
        if (THINK.isEmpty(rules) || !THINK.isArray(rules)) {
            return _promise2.default.resolve();
        }
        return this.parseRules(rules);
    };

    /**
     * parse array rules
     * @param  {Array} rules []
     * @return {}       []
     */


    _class.prototype.parseRules = function parseRules(rules) {
        var length = rules.length;
        var pathname = this.http.pathname;
        if (length === 0 || !pathname) {
            return _promise2.default.resolve();
        }
        var item = void 0,
            route = void 0,
            rule = void 0;
        for (var key in rules) {
            item = rules[key];
            if (item) {
                rule = item[0];
                route = item[1];
                //正则路由
                if (THINK.isRegexp(rule)) {
                    if (rule.test(pathname)) {
                        return this.parseRegExp(rule, route, pathname);
                    }
                } else {
                    //字符串路由
                    var prefix = rule.substring(0, rule.indexOf(':'));
                    if (rule && pathname.indexOf(prefix) === 0) {
                        return this.parseStr(rule, route, pathname, prefix);
                    }
                }
            }
        }
        return _promise2.default.resolve();
    };
    /**
     * 正则匹配路由
     * @param  {[type]} rule  [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */


    _class.prototype.parseRegExp = function parseRegExp(rule, route, pathname) {
        route = this.getRoute(route, pathname);
        if (!route) {
            return _promise2.default.resolve();
        }
        return this.parseRoute(route, pathname);
    };

    /**
     * 字符串匹配路由
     * @param  {[type]} rule     [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @param  {[type]} prefix [description]
     * @return {[type]}          [description]
     */


    _class.prototype.parseStr = function parseStr(rule, route, pathname, prefix) {
        route = this.getRoute(route, pathname);
        if (!route) {
            return _promise2.default.resolve();
        }
        //根据
        route = route.substring(route.length - 1) === '/' ? route : route + '/';
        var match = pathname.split('/');
        prefix = prefix.substring(0, prefix.length - 1).split('/');
        match.splice(0, prefix.length);
        rule = rule.substring(rule.indexOf(':')).replace(/:/g, '').split('/');
        for (var i = 0; i < rule.length; i++) {
            match.splice(i * 2, 0, rule[i]);
        }
        route += match.join('/');

        return this.parseRoute(route, pathname);
    };

    /**
     * parse route string
     * @param  {String} route []
     * @param  {String} pathname []
     * @return {}       []
     */


    _class.prototype.parseRoute = function parseRoute(route, pathname) {
        if (route.indexOf(':') > -1) {
            (function () {
                //替换路由字符串里的:1, :2 匹配都的值
                //如：group/detail?date=:1&groupId=:2&page=:3
                var match = pathname.split('/');
                route = route.replace(/:(\d+)/g, function (a, b) {
                    return match[b] || '';
                });
            })();
        }

        if (route[0] === '/') {
            route = route.slice(1);
        }
        this.http.pathname = route;
        return _promise2.default.resolve();
    };

    /**
     * get route
     * @param  {Object} route   []
     * @param  {Array} pathname []
     * @return {[type]}         []
     */


    _class.prototype.getRoute = function getRoute() {
        var route = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var pathname = arguments[1];

        var method = this.http.method;
        var matches = this.http.splitPathName(pathname);
        if (THINK.isObject(route)) {
            for (var m in route) {
                if (m && m.toUpperCase() === method.toUpperCase()) {
                    return route[m];
                }
            }
        } else {
            if (route.toUpperCase() === 'RESTFUL') {
                var resource = matches.shift();
                route = THINK.config('restful_group') + '/' + resource + '/' + method.toLowerCase() + '/resource/' + resource;
                var id = matches.shift();
                if (id) {
                    route += '/id/' + id;
                }
                if (matches.length > 0) {
                    route += '/' + matches.join('/');
                }
            }
            return route;
        }
        return '';
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