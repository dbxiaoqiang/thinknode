/**
 * Created by lihao on 16/7/19.
 */
import parse from './_parse';
export default class extends parse {
    init(config) {
        super.init(config);
        this.sql = '';
        this.lastInsertId = 0;
        this._socket = null;
        this.transTimes = 0; //transaction times
    }

    /**
     * 数据库连接,各子类自行实现
     */
    socket() {
    }

    add(data, options, replace) {
        let values = [];
        let fields = [];
        for (let key in data) {
            let val = data[key];
            val = this.parseValue(val);
            if (THINK.isString(val) || THINK.isBoolean(val) || THINK.isNumber(val)) {
                values.push(val);
                fields.push(this.parseKey(key));
            }
        }
        let sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parseTable(options.table) + ' (' + fields.join(',') + ')';
        sql += ' VALUES (' + values.join(',') + ')';
        sql += this.parseLock(options.lock) + this.parseComment(options.comment);
        return this.execute(sql);
    }

    addAll(data, options, replace) {
        let fields = Object.keys(data[0]).map(item => this.parseKey(item)).join(',');
        let values = data.map(item => {
            let value = [];
            for (let key in item) {
                let val = item[key];
                val = this.parseValue(val);
                if (THINK.isString(val) || THINK.isBoolean(val) || THINK.isNumber(val)) {
                    value.push(val);
                }
            }
            return '(' + value.join(',') + ')';
        }).join(',');
        let sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parseTable(options.table) + '(' + fields + ')';
        sql += ' VALUES ' + values;
        sql += this.parseLock(options.lock) + this.parseComment(options.comment);
        return this.execute(sql);
    }

    selectAdd(fields, table, options = {}){
        if (THINK.isString(fields)) {
            fields = fields.split(/\s*,\s*/);
        }
        fields = fields.map(item => this.parseKey(item));
        let sql = 'INSERT INTO ' + this.parseTable(table) + ' (' + fields.join(',') + ') ';
        sql += this.buildSelectSql(options);
        return this.execute(sql);
    }

    delete(options){
        let sql = [
            'DELETE FROM ',
            this.parseTable(options.table),
            this.parseWhere(options.where),
            this.parseOrder(options.order),
            this.parseLimit(options.limit),
            this.parseLock(options.lock),
            this.parseComment(options.comment)
        ].join('');
        return this.execute(sql);
    }

    update(options,data){
        let sql = [
            'UPDATE ',
            this.parseTable(options.table),
            this.parseSet(data),
            this.parseWhere(options.where),
            this.parseOrder(options.order),
            this.parseLimit(options.limit),
            this.parseLock(options.lock),
            this.parseComment(options.comment)
        ].join('');
        return this.execute(sql);
    }

    select(options, cache){
        let sql;
        if(THINK.isObject(options)){
            sql = this.buildSelectSql(options);
            cache = options.cache || cache;
        }else{
            sql = options;
        }
        if (!THINK.isEmpty(cache) && this.config.cache.on) {
            let key = cache.key || THINK.md5(sql);
            return THINK.cache(key, () => this.query(sql), cache);
        }
        return this.query(sql);
    }

    escapeString(str){
        if (!str) {
            return '';
        }
        return str.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, s => {
            switch(s) {
                case '\0':
                    return '\\0';
                case '\n':
                    return '\\n';
                case '\r':
                    return '\\r';
                case '\b':
                    return '\\b';
                case '\t':
                    return '\\t';
                case '\x1a':
                    return '\\Z';
                default:
                    return '\\' + s;
            }
        });
    }

    getLastSql(){
        return this.sql;
    }

    getLastInsertId(){
        return this.lastInsertId;
    }

    query(sql){
        console.log(sql);
        this.sql = sql;
        return this.socket(sql).query(sql).then(data => {
            return this.bufferToString(data);
        });
    }

    bufferToString(data){
        if (!this.config.buffer_tostring || !THINK.isArray(data)) {
            return data;
        }
        for(let i = 0, length = data.length; i < length; i++){
            for(let key in data[i]){
                if(THINK.isBuffer(data[i][key])){
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    }

    execute(sql){
        console.log(sql);
        this.sql = sql;
        return this.socket(sql).execute(sql).then(data => {
            if (data.insertId) {
                this.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    }

    startTrans(){
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('START TRANSACTION');
        }
        this.transTimes++;
        return Promise.resolve();
    }

    commit(){
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return Promise.resolve();
    }

    rollback(){
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return Promise.resolve();
    }

    close(){
        if (this._socket) {
            this._socket.close();
            this._socket = null;
        }
    }

}