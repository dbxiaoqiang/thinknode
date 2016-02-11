/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import url from 'url';

export default class extends THINK.Behavior {
    init(http) {
        this.http = http;
        this.options = {
            'url_route_on': C('url_route_on'), //是否开启自定义URL路由
            'url_route_rules': C('url_route_rules') //自定义URL路由规则
        };
    }

    run(data) {
        if (!this.options.url_route_on) {
            return data;
        }
        let routes = this.options.url_route_rules;
        if (isEmpty(routes)) {
            return data;
        }
        let pathname = this.http.pathname;
        let match, route, rule;

        for (let key in routes) {
            route = routes[key];
            rule = route[0];
            //正则路由
            if (isRegexp(rule)) {
                if (rule.test(pathname)) {
                    match = pathname.split('/');
                    return this.parseRegExp(match, route[1], pathname);
                }
            } else {//字符串路由
                match = this.checkUrlMatch(pathname, rule);
                if (match) {
                    return this.parseRule(rule, route[1], pathname);
                }
            }
        }
        return data;
    }

    /**
     * 正则匹配路由
     * @param  {[type]} matches  [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */
    parseRegExp(matches, route, pathname) {
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
            for (let i = 0, length = Math.ceil(pathname.length) / 2; i < length; i++) {
                this.http._get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
            }
        }
        return this.parseUrl(route);
    }

    /**
     * 检测URL是否匹配
     * @param  {[type]} pathname [description]
     * @param  {[type]} rule     [description]
     * @return {[type]}          [description]
     */
    checkUrlMatch(pathname, rule) {
        pathname = this.http.splitPathName(pathname);
        rule = this.http.splitPathName(rule);
        return rule.every(function (item, i) {
            if (item.indexOf(':') === 0) {
                if (item.indexOf('\\') > -1) {
                    let type = item.substr(-1);
                    let reg;
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
                let pitem = pathname[i] || '';
                if (pitem.toLowerCase() !== item.toLowerCase()) {
                    return false;
                }
            }
            return true;
        });
    }

    /**
     * 解析字符串路由
     * @param  {[type]} rule     [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */
    parseRule(rule, route, pathname) {
        pathname = this.http.splitPathName(pathname);
        rule = this.http.splitPathName(rule);
        let matches = [], self = this, pathitem;
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
            for (let i = 0, length = Math.ceil(pathname.length) / 2; i < length; i++) {
                this.http._get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
            }
        }
        route = route.replace(/:(\d+)/g, function (a, b) {
            return matches[b] || '';
        });
        return this.parseUrl(route);
    }

    /**
     * 解析转化后的url
     * @param  {[type]} urlInfo [description]
     * @return {[type]}         [description]
     */
    parseUrl(urlInfo) {
        urlInfo = url.parse(urlInfo, true);
        if (!isEmpty(urlInfo.query)) {
            for (let key in urlInfo.query) {
                if (urlInfo.query[key] || !(key in this.http._get)) {
                    this.http._get[key] = urlInfo.query[key];
                }
            }
        }
        // 过滤调用pathname最后有/的情况
        let pathname = this.http.splitPathName(urlInfo.pathname);
        this.http.action = this.http.getAction(pathname.pop(), this.http);
        this.http.controller = this.http.getController(pathname.pop(), this.http);
        this.http.group = this.http.getGroup(pathname.pop(), this.http);
        return this.http;
    }

    /**
     * 获取route
     * @param  {[type]} route [description]
     * @return {[type]}       [description]
     */
    getRoute(route = '', matches) {
        let pathname = '', action = '';
        if(isObject(route)){
            for(let r in route){
                if(r && r.toUpperCase() === this.http.method.toUpperCase()){
                    action = route[r];
                }
            }
        }else{
            action = route;
        }
        let method = this.http.method;
        //RESTFUL API
        if(action.toUpperCase() === 'RESTFUL'){
            pathname = `${C('restful_group')}/${matches[0]}/${method.toLowerCase()}?resource=${matches[0]}`;
            if(matches[1]){
                pathname += `&id=${matches[1]}`;
            }
        }else{
            if(!action){
                pathname = `${C('default_group')}/${C('default_controller')}/${matches[0]}`;
            }else{
                let match = action.split('/');
                if(match[0]){
                    pathname = match[0];
                }else{
                    pathname = C('default_group');
                }
                if(match[1]){
                    pathname += `/${match[1]}`;
                }else{
                    pathname += `/${C('default_controller')}`;
                }
                if(match[2]){
                    pathname += `/${match[2]}`;
                }else{
                    pathname += `/${matches[0]}`;
                }
            }
        }
        this.http.pathname = pathname;
        return pathname;
    }
}