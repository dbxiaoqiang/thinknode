/**
 * mongodb数据库
 * @return {[type]} [description]
 */

'use strict';

var mongoose = require('mongoose');
module.exports = Class({
    init: function (config) {
        this.handle = null;
        this.deferred = null;
        this.config = config;
        this.mongoose = mongoose;
    },
    /**
     * 连接，虽然mongoose在连接之前会缓存所有的执行命令
     * 但为了后续切换需要，这里通过Promise来保证连接后才执行命令
     * @return {[type]} [description]
     */
    connect: function () {
        if (this.handle) {
            return this.deferred.promise;
        }
        var self = this;
        var deferred = getDefer();
        //创建连接
        var config = extend({
            db_host: '127.0.0.1',
            db_port: 27017
        }, this.config);

        var connection;
        if(isEmpty(config.db_dsn)){
            config.db_dsn = 'mongodb://';
            if(config.db_user){
                config.db_dsn += config.db_user + ':' + config.db_pwd + '@';
            }
            //mongodb://user:pass@localhost:port/database,mongodb://anotherhost:port,mongodb://yetanother:port
            config.db_dsn += config.db_host + ':' + config.db_port + '/' + config.db_name;
            connection = mongoose.createConnection(config.db_dsn);
        }else{
            var opt = { mongos: true };
            connection = mongoose.createConnection(config.db_dsn,opt);
        }
        connection.on('open', function () {
            deferred.resolve(connection);
        });
        connection.on('error', function () {
            self.close();
            deferred.resolve(connection);
        });
        //连接句柄
        this.handle = connection;
        //把上一次的promise reject
        if (this.deferred) {
            this.deferred.reject(new Error('connection closed'));
        }
        this.deferred = deferred;
        return this.deferred.promise;
    },
    /**
     * 关闭连接
     * @return {[type]} [description]
     */
    close: function () {
        if (this.handle) {
            this.handle.close();
            this.handle = null;
        }
    }
});