/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
export default class extends THINK.Middleware {
    init(http) {
        this.http = http;
        this.options = THINK.C('tpl_engine_config');
        let key = THINK.hash(JSON.stringify(this.options));
        if(!(key in THINK.INSTANCES.TPLENGINE)){
            //get tpl pase engine instance
            let engine = THINK.C('tpl_engine_type');
            let clsEngine = THINK.adapter(`${THINK.ucFirst(engine)}Template`);
            THINK.INSTANCES.TPLENGINE[key] = new clsEngine(this.options);
        }
        this.handle = THINK.INSTANCES.TPLENGINE[key];
    }

    async run(data) {
        let file = data.file;
        //将模版文件路径写入到http对象上，供writehtmlcache里使用
        this.http._tplfile = file;
        let engine = THINK.C('tpl_engine_type');
        //不使用模版引擎，直接返回文件内容
        if (!engine) {
            return THINK.getFileContent(file);
        }
        return await this.handle.fetch(file, data.var);
    }
}
