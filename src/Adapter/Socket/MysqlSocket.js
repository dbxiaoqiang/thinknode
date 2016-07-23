'use strict';

import Base from './_base.js';

/**
 * mysql socket class
 * @return {} []
 */
export default class extends Base {
    /**
     * init
     * @param  {Object} config [connection options]
     * @return {}        []
     */
    init(config = {}) {
        super.init(config);

        //alias password config
        // if (config.pwd) {
        //   config.password = config.pwd;
        //   delete config.pwd;
        // }
        //merge config
        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3006,
            charset: config.db_charset || 'utf8',
            connectionLimit: config.poolsize || 10
        }

        //rename encoding to charset
        if (!this.config.db_charset && this.config.db_encoding) {
            this.config.charset = this.config.encoding;
            delete this.config.encoding;
        }
        //node-mysql2 not support utf8 or utf-8
        let charset = (this.config.charset || '').toLowerCase();
        if (charset === 'utf8' || charset === 'utf-8') {
            this.config.charset = 'UTF8_GENERAL_CI';
        }

        this.pool = null;
    }

    /**
     * get connection
     * @return {Promise} [conneciton handle]
     */
    async getConnection() {
        if (this.connection) {
            return this.connection;
        }

        let config = this.config;
        let str = `mysql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
        if (this.pool) {
            let fn = THINK.promisify(this.pool.getConnection, this.pool);
            let promise = fn().catch(err => {
                this.close();
                return Promise.reject(err);
            });
            let err = new Error(str);
            return THINK.E(promise, err);
        }

        let mysql = require('mysql2');

        //默认即开启连接池
        if (config.connectionLimit) {
            this.logConnect(str, 'mysql');

            this.pool = mysql.createPool(config);
            return this.getConnection();
        }
        return THINK.await(str, ()=> {
            let deferred = THINK.getDefer();
            this.connection = mysql.createConnection(config);
            this.connection.connect(err => {
                this.logConnect(str, 'mysql');

                if (err) {
                    deferred.reject(err);
                    this.close();
                } else {
                    deferred.resolve(this.connection);
                }
            });
            this.connection.on('error', () => {
                this.close();
            });
            //PROTOCOL_CONNECTION_LOST
            this.connection.on('end', () => {
                this.connection = null;
            });
            let err = new Error(str);
            return THINK.E(deferred.promise, err);
        })
    }

    /**
     * query sql
     * @param  {String} sql []
     * @return {[type]}     []
     */
    async query(sql, nestTables, times = 1) {
        let connection = await this.getConnection();
        let data = {
            sql: sql,
            nestTables: nestTables
        };
        //query timeout
        if (this.config.timeout) {
            data.timeout = this.config.timeout;
        }
        let startTime = Date.now();
        let fn = THINK.promisify(connection.query, connection);
        let promise = fn(data).then((rows = []) => {
            // just call connection.release() and the connection will return to the pool,
            // ready to be used again by someone else.
            // https://github.com/felixge/node-mysql#pooling-connections
            if (this.pool && connection.release) {
                connection.release();
            }

            if (this.config.log_sql) {
                THINK.log(sql, 'SQL', startTime);
            }
            return rows;
        }).catch(async err => {
            if (this.pool && connection.release) {
                connection.release();
            }
            //Connection lost: The server closed the connection.
            if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'EPIPE') {
                await this.close();
                if (times <= 3) {
                    return this.query(sql, nestTables, ++times);
                }
            }

            if (this.config.log_sql) {
                THINK.log(sql, 'SQL', startTime);
            }
            return Promise.reject(err);
        });
        promise = this.autoClose(promise);
        return THINK.E(promise);
    }

    /**
     * execute
     * @param  {Array} args []
     * @return {Promise}         []
     */
    execute(...args) {
        return this.query(...args);
    }

    /**
     * close connections
     * @return {} []
     */
    close() {
        if (this.pool) {
            let fn = THINK.promisify(this.pool.end, this.pool);
            return fn().then(() => this.pool = null);
        } else if (this.connection) {
            let fn = THINK.promisify(this.connection.end, this.connection);
            return fn().then(() => this.connection = null);
        }
    }
}