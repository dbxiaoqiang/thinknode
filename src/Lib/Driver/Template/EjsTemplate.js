/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
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