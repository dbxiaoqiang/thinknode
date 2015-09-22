var Waterline = require('waterline');
/**
 * 高级模型
 * @return {[type]} [description]
 */
module.exports = Model(function () {

    'use strict';

    return {
        /**
         * 关联定义
         * relation: {
                type: 1, //类型 1 one2one 2 one2many 3 many2many
                model: 'Profile', //对应的模型名
            }
         * @type {Object}
         */
        /**
         * 初始化数据库
         * @return {[type]} [description]
         */
        initDb: function () {
            var self = this, promises;
            this.adapter = this.configKey;
            this.dbOptions.connections = {};
            this.dbOptions.connections[this.configKey] = {
                adapter: this.config.db_type,
                host: this.config.db_host,
                port: this.config.db_port,
                database: this.config.db_name,
                user: this.config.db_user,
                password: this.config.db_pwd
            };
            if(!isEmpty(this.relation)){
                this._relationLink = this.setRelation(this.relation);
            }
            if (!THINK.dbInstances[this.configKey]) {
                if (THINK.dbClient.collections && THINK.dbClient.collections.hasOwnProperty(this.trueTableName)) {
                    promises = getPromise(THINK.dbClient);
                } else {
                    if(!isEmpty(self._relationLink)){
                        THINK.dbClient.loadCollection(self.schema[self.trueTableName]);
                        THINK.dbClient.loadCollection(self.schema[self._relationLink['relation']]);
                    }else{
                        if (isEmpty(self.schema[this.trueTableName])) {
                            self.schema[this.trueTableName] = self.setSchema(self.trueTableName, self.fields);
                        }
                        THINK.dbClient.loadCollection(self.schema[self.trueTableName]);
                    }
                    THINK.dbClient.loadCollection(self.schema[self.trueTableName]);
                    promises = new Promise(function (fulfill, reject) {
                        THINK.dbClient.initialize(self.dbOptions, function (err, ontology) {
                            if (err) reject(err);
                            else fulfill(ontology);
                        });
                    });
                }
                THINK.dbInstances[this.configKey] = promises.then(function (client) {
                    self.model = client.collections[self.trueTableName];
                    return self.model;
                });
            }
            return getPromise(THINK.dbInstances[this.configKey]);
        },
        /**
         * 设置本次使用的relation
         * @param fields
         * @param relation
         */
        setRelation: function (relation) {
            var self = this;
            if(!isEmpty(relation.type)){
                switch (relation.type) {
                    case 2:
                        return self._getHasManyRelation(this.fields, relation);
                    case 3:
                        return self._getManyToManyRelation(this.fields, relation);
                    default:
                        return self._getHasOneRelation(this.fields, relation);
                }
            }
        },
        /**
         *
         * @param fields
         * @param relation
         * @private
         */
        _getHasManyRelation: function (fields, relation) {
            var self = this;
            var tableName = this.getTableName();
            var relationModel = D(relation.model);
            this.relationTableName = relationModel.getTableName();
            fields[this.relationTableName] = {
                collection : this.relationTableName,
                via: 'owner'
            };
            relationModel.fields['owner'] = {
                model: tableName
            };
            this.schema[this.relationTableName] = this.setSchema(this.relationTableName, relationModel.fields);
            this.schema[tableName] = this.setSchema(tableName, fields);
            return {table: tableName, relation: this.relationTableName};
        },
        /**
         *
         * @param fields
         * @param relation
         * @private
         */
        _getManyToManyRelation: function (fields, relation) {
            var self = this;
            var tableName = this.getTableName();
            var relationModel = D(relation.model);
            this.relationTableName = relationModel.getTableName();
            fields[this.relationTableName] = {
                collection : this.relationTableName,
                via: 'owners',
                dominant: true
            };
            relationModel.fields['owners'] = {
                collection: tableName,
                via: this.relationTableName
            };
            this.schema[this.relationTableName] = this.setSchema(this.relationTableName, relationModel.fields);
            this.schema[tableName] = this.setSchema(tableName, fields);
            return {table: tableName, relation: this.relationTableName};
        },
        /**
         *
         * @param fields
         * @param relation
         * @private
         */
        _getHasOneRelation: function (fields, relation) {
            var self = this;
            var tableName = this.getTableName();
            var relationModel = D(relation.model);
            this.relationTableName = relationModel.getTableName();
            fields[this.relationTableName] = {
                model : this.relationTableName
            };
            this.schema[this.relationTableName] = this.setSchema(this.relationTableName, relationModel.fields);
            this.schema[tableName] = this.setSchema(tableName, fields);
            return {table: tableName, relation: this.relationTableName};
        }
    };
});