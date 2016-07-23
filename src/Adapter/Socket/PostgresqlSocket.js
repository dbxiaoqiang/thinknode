'use strict';

import Base from './_base.js';

/**
 * mysql socket class
 * @return {} []
 */
export default class extends Base {
    /**
     * init
     * @param  {Object} config []
     * @return {}        []
     */
    init(config) {
        super.init(config);

        config.port = config.db_port || 5432;
        //config.password = config.pwd;
        //delete config.pwd;

        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3006
        }
    }

    /**
     * get pg
     * @return {} []
     */
    async getPG() {
        if (this.pg) {
            return this.pg;
        }
        let pg = require('pg');
        //set poolSize
        if (this.config.poolsize) {
            pg.defaults.poolSize = this.config.poolsize;
        }
        //set poolIdleTimeout, change default `30 seconds` to 8 hours
        pg.defaults.poolIdleTimeout = this.config.poolIdleTimeout * 1000 || 8 * 60 * 60 * 1000;

        //when has error, close connection
        pg.on('error', () => {
            this.close();
        });
        pg.on('end', () => {
            this.close();
        });
        pg.on('close', () => {
            this.close();
        });
        this.pg = pg;
        return pg;
    }

    /**
     * get connection
     * @return {} []
     */
    async getConnection() {
        if (this.connection) {
            return this.connection;
        }
        let pg = await this.getPG();
        let config = this.config;
        let connectionStr = `postgres://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;

        return THINK.await(connectionStr, () => {
            let deferred = THINK.getDefer();
            pg.connect(this.config, (err, client, done) => {
                this.logConnect(connectionStr, 'postgre');
                if (err) {
                    deferred.reject(err);
                } else {
                    this.connection = client;
                    this.release = done;
                    deferred.resolve(client);
                }
            });
            return deferred.promise;
        });
    }

    /**
     * query
     * @return {Promise} []
     */
    async query(sql) {
        let connection = await this.getConnection();
        let startTime = Date.now();
        let fn = THINK.promisify(connection.query, connection);
        let promise = fn(sql).then(data => {
            this.release();
            if (this.config.log_sql) {
                THINK.log(sql, 'SQL', startTime);
            }
            return data;
        }).catch(err => {
            this.release();

            //when socket is closed, try it
            if (err.code === 'EPIPE') {
                this.close();
                return this.query(sql);
            }

            if (this.config.log_sql) {
                THINK.log(sql, 'SQL', startTime);
            }
            return Promise.reject(err);
        });
        return THINK.E(promise);
    }

    /**
     * execute sql
     * @param  {Array} args []
     * @return {Promise}         []
     */
    execute(...args) {
        return this.query(...args);
    }

    /**
     * close connection
     * @return {} []
     */
    close() {
        if (this.connection) {
            this.connection.end();
            this.connection = null;
        }
    }
}