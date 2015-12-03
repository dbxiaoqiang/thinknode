/**
 * 阻止ip来源访问
 * @return {[type]} [description]
 */
export default class extends THINK.Behavior{
    //使用了解构,new的时候实参为{http: http, options: options}
    init({http, options}){
        this.http = http;
        this.options = extend(false, {
            deny_ip: [] //阻止的ip列表
        }, options);
    }

    run(data){
        if (this.options.deny_ip.length === 0) {
            return true;
        }

        let clientIps = this.http.ip().split('.');
        let flag = this.options.deny_ip.some(function (item) {
            return item.split('.').every(function (num, i) {
                if (num === '*' || num === clientIps[i]) {
                    return true;
                }
            });
        });
        //如果在阻止的ip在列表里，则返回一个pendding promise，让后面的代码不执行
        if (flag) {
            return O(this.http, '', 403);
        }
        return true;
    }
}