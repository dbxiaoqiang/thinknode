/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
import ejs from 'ejs';
import base from '../../Core/Base';

export default class extends base{

    init(options = {}){
        this.options = THINK.extend(false, THINK.config('tpl_engine_config'), options);
    }

    /**
     *
     * @param templateFile
     */
    fetch(templateFile, data){
        this.options.filename = templateFile;
        let content = THINK.getFileContent(templateFile);
        return ejs.compile(content, this.options)(data);
    }
}
