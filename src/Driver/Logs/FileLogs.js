/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import fs from 'fs';
import util from 'util';
import logs from './Logs';

export default class extends logs {
    init(options){
        super.init(options);
    }

    /**
     * 获取日志路径
     * @param type
     */
    getFilePath(name){
        let dir = `${THINK.LOG_PATH}/console`;
        if(this.options.log_itemtype === 'memory'){
            dir = `${THINK.LOG_PATH}/memory`;
        }else if(this.options.log_itemtype === 'custom'){
            dir = `${THINK.LOG_PATH}/custom`;
        }
        isDir(dir) || mkDir(dir);
        return `${dir}/${name ? name + '_' : ''}${this.getDate()}.log`;
    }

    /**
     * 获取指定日期的log内容
     * @param name
     */
    get(name = ''){
        let file = this.getFilePath(name);
        return getFileContent(file);
    }

    set(name = '', value = ''){
        if(!isEmpty(value)){
            let file = this.getFilePath(name);
            let dateTime = this.getDateTime();
            try{
                value = ['[' + dateTime + ']'].concat([].slice.call(value));
                let message = util.format.apply(null, value) + '\n';
                fs.appendFile(file, message);
            }catch (e){}
        }
    }

}
