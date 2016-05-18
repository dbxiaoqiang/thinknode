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
            return null;
        }
        let rules = this.options.url_route_rules;
        if (isEmpty(rules) || !isArray(rules)) {
            return null;
        }
        return this.parseRules(rules);
    }

    /**
     * parse array rules
     * @param  {Array} rules []
     * @return {}       []
     */
    parseRules(rules){
        let length = rules.length;
        let pathname = this.http.pathname;
        if (length === 0 || !pathname) {
            return null;
        }
        let item, route, rule;
        for (let key in rules) {
            item = rules[key];
            rule = item[0];
            route = item[1];
            //正则路由
            if (isRegexp(rule)) {
                if (rule.test(pathname)) {
                    return this.parseRegExp(rule, route, pathname);
                }
            } else {//字符串路由
                let prefix = rule.substring(0,rule.indexOf(':'));
                if (rule && pathname.indexOf(prefix) === 0) {
                    return this.parseStr(rule, route, pathname, prefix);
                }
            }
        }
        return null;
    }
    /**
     * 正则匹配路由
     * @param  {[type]} rule  [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @return {[type]}          [description]
     */
    parseRegExp(rule, route, pathname) {
        route = this.getRoute(route, pathname);
        if(!route){
            return null;
        }
        return this.parseRoute(route, pathname);
    }

    /**
     * 字符串匹配路由
     * @param  {[type]} rule     [description]
     * @param  {[type]} route    [description]
     * @param  {[type]} pathname [description]
     * @param  {[type]} prefix [description]
     * @return {[type]}          [description]
     */
    parseStr(rule, route, pathname, prefix) {
        route = this.getRoute(route, pathname);
        if (!route) {
            return null;
        }
        //根据
        route = ((route.substring(route.length - 1) === '/') ? route : (route + '/'));
        let match = pathname.split('/');
        prefix = prefix.substring(0,prefix.length - 1).split('/');
        match.splice(0, prefix.length);
        rule = rule.substring(rule.indexOf(':')).replace(/:/g,'').split('/');
        for(var i = 0; i < rule.length; i++) {
            match.splice(i * 2, 0, rule[i]);
        }
        route += match.join('/');

        return this.parseRoute(route, pathname);
    }


    /**
     * parse route string
     * @param  {String} route []
     * @param  {String} pathname []
     * @return {}       []
     */
    parseRoute(route, pathname){
        if(route.indexOf(':') > -1){
            //替换路由字符串里的:1, :2 匹配都的值
            //如：group/detail?date=:1&groupId=:2&page=:3
            let match = pathname.split('/');
            route = route.replace(/:(\d+)/g, (a, b) => (match[b] || ''));
        }

        if (route[0] === '/') {
            route = route.slice(1);
        }
        this.http.pathname = route;
        return null;
    }

    /**
     * get route
     * @param  {Object} route   []
     * @param  {Array} pathname []
     * @return {[type]}         []
     */
    getRoute(route = '', pathname){
        let method = this.http.method;
        let matches = this.http.splitPathName(pathname);
        if(isObject(route)){
            for(let m in route){
                if(m && m.toUpperCase() === method.toUpperCase()){
                    return route[m];
                }
            }
        } else {
            if(route.toUpperCase() === 'RESTFUL'){
                let resource = matches.shift();
                route = `${C('restful_group')}/${resource}/${method.toLowerCase()}/resource/${resource}`;
                let id = matches.shift();
                if(id){
                    route += `/id/${id}`;
                }
                if(matches.length > 0){
                    route += `/${matches.join('/')}`;
                }
            }
            return route;
        }
        return '';
    }

}
