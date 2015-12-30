/**
 * 检测路由行为
 * 通过自定义路由识别到对应的URL上
 * @return {[type]} [description]
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
        let match, route, rule, result;
        for (var i in routes) {
            route = routes[i];
            rule = route.rule;
            //正则路由
            if (isRegexp(rule)) {
                console.log(rule);
                console.log(pathname);
                match = pathname.match(rule);
                console.log(match);
                if (match) {
                    return this.parseRegExp(match, route, pathname);
                }
            } else {//字符串路由
                match = this.checkUrlMatch(pathname, rule);
                if (match) {
                    return this.parseRule(rule, route, pathname);
                }
            }
        }
        return data;
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
        let matches = [pathname], self = this, pathitem;
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
            return matches[b - 1] || '';
        });
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
    getRoute(route, matches) {
        let routeUpper = route.route.toUpperCase();
        //RESTFUL API
        if (routeUpper === 'RESTFUL' || routeUpper.indexOf('RESTFUL:') === 0) {
            let method = route.method || this.http.method;
            let group = route.route.split(':')[1] || C('restful_group');
            route = group + '/' + matches[1] + '/' + method.toLowerCase() + '?resource=' + matches[1];
            if (matches[2]) {
                route += '&id=' + matches[2];
            }
            //设置变量到http对象上，方便后续使用
            this.http.isRestful = true;
            this.http.pathname = route;
            return route;
        } else {
            let group = ucfirst(route.route);
            let action = route.action;
            route = `${group}/${action}?id=${matches[1]}`;
            //设置变量到http对象上，方便后续使用
            this.http.isRestful = false;
            this.http.pathname = route;
        }
        //if (isObject(route)) {
        //    //对应的请求类型
        //    for (let method in route) {
        //        //由于请求类型没有包含关系，这里可以直接用indexOf判断
        //        if (method.toUpperCase().indexOf(this.http.method) > -1) {
        //            return route[method];
        //        }
        //    }
        //    return;
        //}
        //let routeUpper = route.toUpperCase();
        ////RESTFUL API
        //if (routeUpper === 'RESTFUL' || routeUpper.indexOf('RESTFUL:') === 0) {
        //    let group = route.split(':')[1] || C('restful_group');
        //    route = group + '/' + matches[1] + '/' + method.toLowerCase() + '?resource=' + matches[1];
        //    if (matches[2]) {
        //        route += '&id=' + matches[2];
        //    }
        //    //设置变量到http对象上，方便后续使用
        //    this.http.isRestful = true;
        //    this.http.pathname = route;
        //    return route;
        //}
        return route;
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
        console.log(route);
        if (!route) {
            return this.http;
        }
        //替换路由字符串里的:1, :2 匹配都的值
        //如：group/detail?date=:1&groupId=:2&page=:3
        route = route.replace(/:(\d+)/g, function (a, b) {
            return matches[b] || '';
        });

        pathname = pathname.replace(matches[0], '');
        pathname = this.http.splitPathName(pathname);
        //将剩余的pathname分割为querystring
        if (pathname.length) {
            for (let i = 0, length = Math.ceil(pathname.length) / 2; i < length; i++) {
                this.http._get[pathname[i * 2]] = pathname[i * 2 + 1] || '';
            }
        }
        return this.parseUrl(route);
    }
}