/**
 * 读取HTML缓存
 * @return {[type]} [description]
 */

export default class extends THINK.Behavior{
    init(http){
        this.http = http;
        this.options = {
            'html_cache_on': C("html_cache_on"), //是否开启缓存
            'html_cache_timeout': C("html_cache_timeout"), //缓存时间
            'html_cache_path': C("html_cache_path"),
            'html_cache_file_suffix': C("html_cache_file_suffix") || '.html', //缓存文件扩展名
            'cache_options': {
                cache_path: C("html_cache_path"),
                cache_timeout: C("html_cache_timeout"),
                cache_key_prefix: C("cache_key_prefix").indexOf(':') > -1 ? C("cache_key_prefix") + 'Temp:' : C("cache_key_prefix") + ':Temp:'
            }
        };
    }

    async run(data){
        if (!this.options.html_cache_on || !this.options.html_cache_timeout) {
            return false;
        }
        let content = await S(this.getCacheName(data.data),'', this.options.cache_options);
        if(isEmpty(content)){
            return false;
        }else{
            await this.http.echo(content);
            return getDefer().promise;
        }
    }

    getCacheName(data){
        if(isObject(data)){
            data = JSON.stringify(data);
        }
        data += this.http.group + ':' + this.http.controller + ':' + this.http.action;
        return md5(data) + this.options.html_cache_file_suffix;
    }
}