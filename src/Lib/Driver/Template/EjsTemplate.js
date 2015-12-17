/**
 * ejs模版引擎
 * https://github.com/visionmedia/ejs
 * @type {[type]}
 */
import ejs from 'ejs';
import base from '../../Think/Base';

export default class extends base{

    init(config = {}){
        this.config = extend(false, C('tpl_engine_config'), config);
    }

    /**
     *
     * @param templateFile
     */
    fetch(templateFile, data){
        this.config.filename = templateFile;
        let content = getFileContent(templateFile);
        return ejs.compile(content, this.config)(data);
    }
}