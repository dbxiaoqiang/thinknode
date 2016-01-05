/**
 * 检测路由行为
 * 通过自定义路由识别到对应的URL上
 * @return {[type]} [description]
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _default = (function (_THINK$Behavior) {
    _inherits(_default, _THINK$Behavior);

    function _default() {
        _classCallCheck(this, _default);

        _THINK$Behavior.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        this.http = http;
        this.options = {
            'url_route_on': C('url_route_on'), //是否开启自定义URL路由
            'url_route_rules': C('url_route_rules') //自定义URL路由规则
        };
    };

    _default.prototype.run = function run(data) {
        var _this = this;

        if (!this.options.url_route_on) {
            return data;
        }
        var routes = this.options.url_route_rules;
        if (isEmpty(routes)) {
            return data;
        }
        var pathname = this.http.pathname;
        var match = undefined,
            route = undefined,
            rule = undefined;

        for (var key in routes) {
            (function (k) {
                route = routes[k];
                rule = route[0];
                //正则路由
                if (isRegexp(rule)) {
                    if (rule.test(pathname)) {
                        match = pathname.split('/');
                        return _this.parseRegExp(match, route[1], pathname);
                    }
                } else {
                    //字符串路由
                    match = _this.checkUrlMatch(pathname, rule);
                    if (match) {
                        return _this.parseRule(rule, route[1], pathname);
                    }
                }
            })(key);
        }
        return data;
    };

    /**
     * 正则匹配路由
     * @param  {[type]} matches  [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */

    _default.prototype.parseRegExp = function parseRegExp(matches, route, pathname) {
        route = this.getRoute(route, matches);
        if (!route) {
            return this.http;
        }
        //替换路由字符串里的:1, :2 匹配都的值
        //如：group/detail?date=:1&groupId=:2&page=:3
        route = route.replace(/:(\d+)/g, function (a, b) {
            return matches[b] || '';
        });
        pathname = this.http.splitPathName(pathname);
        //将剩余的pathname分割为querystring
        if (pathname.length) {
            for (var i = 0, _length = Math.ceil(pathname.length) / 2; i < _length; i++) {
                this.http._get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
            }
        }
        return this.parseUrl(route);
    };

    /**
     * 检测URL是否匹配
     * @param  {[type]} pathname [description]
     * @param  {[type]} rule     [description]
     * @return {[type]}          [description]
     */

    _default.prototype.checkUrlMatch = function checkUrlMatch(pathname, rule) {
        pathname = this.http.splitPathName(pathname);
        rule = this.http.splitPathName(rule);
        return rule.every(function (item, i) {
            if (item.indexOf(':') === 0) {
                if (item.indexOf('\\') > -1) {
                    var type = item.substr(-1);
                    var reg = undefined;
                    switch (type) {
                        case 'd':
                            reg = /^\d+$/;
                            break;
                        case 'w':
                            reg = /^\w+$/;
                            break;
                    }
                    if (reg && !reg.test(pathname[i])) {
                        return false;
                    }
                }
            } else {
                var pitem = pathname[i] || '';
                if (pitem.toLowerCase() !== item.toLowerCase()) {
                    return false;
                }
            }
            return true;
        });
    };

    /**
     * 解析字符串路由
     * @param  {[type]} rule     [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */

    _default.prototype.parseRule = function parseRule(rule, route, pathname) {
        pathname = this.http.splitPathName(pathname);
        rule = this.http.splitPathName(rule);
        var matches = [],
            self = this,
            pathitem = undefined;
        rule.forEach(function (item) {
            pathitem = pathname.shift();
            matches.push(pathitem);
            if (item.indexOf(':') === 0) {
                if (item.indexOf('\\') === -1) {
                    self.http._get[item.substr(1)] = pathitem;
                }
            }
        });
        route = this.getRoute(route, matches);
        if (!route) {
            return this.http;
        }
        //将剩余的pathname分割为querystring
        if (pathname.length) {
            for (var i = 0, _length2 = Math.ceil(pathname.length) / 2; i < _length2; i++) {
                this.http._get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
            }
        }
        route = route.replace(/:(\d+)/g, function (a, b) {
            return matches[b] || '';
        });
        return this.parseUrl(route);
    };

    /**
     * 解析转化后的url
     * @param  {[type]} urlInfo [description]
     * @return {[type]}         [description]
     */

    _default.prototype.parseUrl = function parseUrl(urlInfo) {
        urlInfo = _url2['default'].parse(urlInfo, true);
        if (!isEmpty(urlInfo.query)) {
            for (var key in urlInfo.query) {
                if (urlInfo.query[key] || !(key in this.http._get)) {
                    this.http._get[key] = urlInfo.query[key];
                }
            }
        }
        // 过滤调用pathname最后有/的情况
        var pathname = this.http.splitPathName(urlInfo.pathname);
        this.http.action = this.http.getAction(pathname.pop(), this.http);
        this.http.controller = this.http.getController(pathname.pop(), this.http);
        this.http.group = this.http.getGroup(pathname.pop(), this.http);
        return this.http;
    };

    /**
     * 获取route
     * @param  {[type]} route [description]
     * @return {[type]}       [description]
     */

    _default.prototype.getRoute = function getRoute(route, matches) {
        if (route === undefined) route = '';

        var pathname = '',
            action = '';
        if (isObject(route)) {
            for (var r in route) {
                if (r && r.toUpperCase() === this.http.method.toUpperCase()) {
                    action = route[r];
                }
            }
        } else {
            action = route;
        }
        var method = this.http.method;
        //RESTFUL API
        if (action.toUpperCase() === 'RESTFUL') {
            pathname = C('restful_group') + '/' + matches[0] + '/' + method.toLowerCase() + '?resource=' + matches[0];
            if (matches[1]) {
                pathname += '&id=' + matches[1];
            }
        } else {
            if (!action) {
                pathname = C('default_group') + '/' + C('default_controller') + '/' + matches[0];
            } else {
                var match = action.split('/');
                if (match[0]) {
                    pathname = match[0];
                } else {
                    pathname = C('default_group');
                }
                if (match[1]) {
                    pathname += '/' + match[1];
                } else {
                    pathname += '/' + C('default_controller');
                }
                if (match[2]) {
                    pathname += '/' + match[2];
                } else {
                    pathname += '/' + matches[0];
                }
            }
        }
        this.http.pathname = pathname;
        return pathname;
    };

    return _default;
})(THINK.Behavior);

exports['default'] = _default;
module.exports = exports['default'];