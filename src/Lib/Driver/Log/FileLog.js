/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/2
 */
import fs from 'fs';
import util from 'util';
import log from '../../Think/Log';

export default class extends log {
    init(options){
        super.init(options);
    }

    /**
     * 获取日志路径
     * @param type
     */
    getLogPath(type){
        if(type === 'memory'){
            this.options.log_path = `${THINK.LOG_PATH}/memory`;
        }else if(type === 'custom'){
            this.options.log_path = `${THINK.LOG_PATH}/custom`;
        }else{
            this.options.log_path = `${THINK.LOG_PATH}/console`;
        }
        isDir(this.options.log_path) || mkdir(this.options.log_path);
    }

    /**
     * 获取指定日期的log内容
     * @param name
     */
    get(name = ''){
        let file = `${this.options.log_path}/${name ? name + '_' : ''}${this.getDate()}.log`;
        return getFileContent(file);
    }

    set(name = '', value = ''){
        if(!isEmpty(value)){
            let file = `${this.options.log_path}/${name ? name + '_' : ''}${this.getDate()}.log`;
            let dateTime = this.getDateTime();
            try{
                value = ['[' + dateTime + ']'].concat([].slice.call(value));
                let message = util.format.apply(null, value) + '\n';
                fs.appendFile(file, message);
            }catch (e){}
        }
    }

}