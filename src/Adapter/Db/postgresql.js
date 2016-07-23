'use strict';

import base from './_base';

/**
 * postgre db
 */
export default class extends base {
    /**
     * get postgre socket instance
     * @param  {Object} config []
     * @return {}        []
     */
    socket(sql) {
        if (this._socket) {
            return this._socket;
        }
        let config = THINK.extend({
            sql: sql
        }, this.config);
        let PGSocket = THINK.safeRequire(`${THINK.THINK_PATH}/lib/Adapter/Socket/PostgresqlSocket`);
        this._socket = new PGSocket(config);
        return this._socket;
    }

    /**
     * 获取表模型
     * @param  {String} table [table name]
     * @return {Promise}       []
     */
    async getSchema(table) {
        let columnSql = `SELECT column_name,is_nullable,data_type FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='${table}'`;
        let columnsPromise = this.query(columnSql);
        let indexSql = `SELECT indexname,indexdef FROM pg_indexes WHERE tablename='${table}'`;
        let indexPromise = this.query(indexSql);
        let [columns, indexs] = await Promise.all([columnsPromise, indexPromise]);
        let schema = {};
        columns.forEach(item => {
            schema[item.column_name] = {
                name: item.column_name,
                type: item.data_type,
                required: item.is_nullable === 'NO',
                default: '',
                auto_increment: false
            };
        });
        let extra = {};
        let reg = /\((\w+)(?:, (\w+))*\)/;
        indexs.forEach(item => {
            let [, name, ...others] = item.indexdef.match(reg);
            extra[name] = {};
            if (item.indexdef.indexOf(' pkey ') > -1) {
                extra[name].primary = true;
            }
            let index = item.indexdef.indexOf(' UNIQUE ') > -1 ? 'unique' : 'index';
            extra[name][index] = others.length ? others : true;
        });

        return THINK.extend(schema, extra);
    }

    /**
     * start transaction
     * @return {Promise} []
     */
    startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('BEGIN');
        }
        this.transTimes++;
        return Promise.resolve();
    }

    /**
     * parse limit
     * @param  {String} limit []
     * @return {String}       []
     */
    parseLimit(limit) {
        if (THINK.isEmpty(limit)) {
            return '';
        }
        if (THINK.isNumber(limit)) {
            return ` LIMIT ${limit}`;
        }
        if (THINK.isString(limit)) {
            limit = limit.split(/\s*,\s*/);
        }
        if (limit[1]) {
            return ' LIMIT ' + (limit[1] | 0) + ' OFFSET ' + (limit[0] | 0);
        }
        return ' LIMIT ' + (limit[0] | 0);
    }

    /**
     * parse value
     * @param  {Mixed} value []
     * @return {Mixed}       []
     */
    parseValue(value) {
        if (THINK.isString(value)) {
            value = 'E\'' + this.escapeString(value) + '\'';
        } else if (THINK.isArray(value)) {
            if (/^exp$/.test(value[0])) {
                value = value[1];
            } else {
                value = value.map(item => this.parseValue(item));
            }
        } else if (THINK.isBoolean(value)) {
            value = value ? 'true' : 'false';
        } else if (value === null) {
            value = 'null';
        }
        return value;
    }

    /**
     * query string
     * @param  string str
     * @return promise
     */
    query(sql) {
        this.sql = sql;
        return THINK.await(sql, () => {
            return this.socket(sql).query(sql).then(data => {
                return this.bufferToString(data.rows);
            });
        });
    }

    /**
     * execute sql
     * @param  {String} sql []
     * @return {}     []
     */
    execute(sql) {
        this.sql = sql;
        let insertInto = 'insert into ';
        let prefix = sql.slice(0, insertInto.length).toLowerCase();
        let isInsert = false;
        if (prefix === insertInto) {
            sql += ' RETURNING id';
            isInsert = true;
        }
        return this.socket(sql).execute(sql).then(data => {
            if (isInsert) {
                this.lastInsertId = data.rows[0].id;
            }
            return data.rowCount || 0;
        });
    }
}