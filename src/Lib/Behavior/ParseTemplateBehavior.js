/**
 * 调用对应的模版引擎解析模版
 * @return {[type]} [description]
 */
export default class extends THINK.Behavior {
    init(http) {
        this.http = http;
    }

    run(data) {
        let file = data.file;
        //将模版文件路径写入到http对象上，供writehtmlcache里使用
        this.http._tplfile = file;
        let engine = C('tpl_engine_type');
        //不使用模版引擎，直接返回文件内容
        if (!engine) {
            return getFileContent(file);
        }
        return this.http.tplengine().fetch(file, data.var);
    }
}