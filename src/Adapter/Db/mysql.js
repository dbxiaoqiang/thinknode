/**
 * Created by lihao on 16/7/19.
 */
import base from './_base';
export default class extends base {
    socket(sql) {
        if (this._socket) {
            return this._socket;
        }
        let config = THINK.extend({
            sql: sql
        }, this.config);
        let MysqlSocket = THINK.safeRequire(`${THINK.THINK_PATH}/lib/Adapter/Socket/MysqlSocket`);
        this._socket = new MysqlSocket(config);
        return this._socket;
    }

    /**
     * 获取表模型
     * @param  {String} table [table name]
     * @return {Promise}       []
     */
    async getSchema(table) {
        let data = await this.query(`SHOW COLUMNS FROM ${this.parseKey(table)}`);
        let ret = {};
        data.forEach(item => {
            ret[item.Field] = {
                'name': item.Field,
                'type': item.Type,
                'required': item.Null === '',
                //'default': item.Default,
                'primary': item.Key === 'PRI',
                'unique': item.Key === 'UNI',
                'auto_increment': item.Extra.toLowerCase() === 'auto_increment'
            };
        });
        return ret;
    }

    /**
     * parse key
     * @param  {String} key []
     * @return {String}     []
     */
    parseKey(key = '') {
        key = key.trim();
        if (THINK.isEmpty(key)) {
            return '';
        }
        if (THINK.isNumberString(key)) {
            return key;
        }
        if (!(/[,\'\"\*\(\)`.\s]/.test(key))) {
            key = '`' + key + '`';
        }
        return key;
    }
}