/**
 * jade模版引擎
 * expressjs默认为该模版引擎
 * @type {[type]}
 */
import jade from 'jade';
import base from '../../Think/Base.js';

export default class extends base {

    init(config = {}) {
        this.config = extend(false, C('tpl_engine_config'), config);
    }

    /**
     *
     * @param templateFile
     */
    fetch(templateFile, data){
        this.config.filename = templateFile;
        let content = getFileContent(templateFile);
        return jade.compile(content, this.config)(data);
    }
}