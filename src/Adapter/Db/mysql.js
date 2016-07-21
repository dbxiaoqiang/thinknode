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
}