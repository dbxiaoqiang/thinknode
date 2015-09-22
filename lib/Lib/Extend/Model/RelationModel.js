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

        _relationLink: {},
        /**
         * 初始化数据库
         * @return {[type]} [description]
         */
        initDb: function (table) {
            if (this.db) {
                return getPromise(this.db);
            }
            var self = this;
            table = table || this.getTableName();
            if(!isEmpty(self.relation)){
                this._relationLink = self.setRelation(self.relation);
            }

            var promises;
            var configKey = md5(JSON.stringify([this.config,table]));
            if (!THINK.dbInstances[configKey]) {
                if (THINK.dbClient.collections && THINK.dbClient.collections.hasOwnProperty(table)) {
                    promises = getPromise(THINK.dbClient);
                } else {
                    if(!isEmpty(self._relationLink)){
                        THINK.dbClient.loadCollection(self.schema[table]);
                        THINK.dbClient.loadCollection(self.schema[self._relationLink['relation']]);
                    }else{
                        if (isEmpty(self.schema[table])) {
                            self.schema[table] = self.setSchema(table, self.fields);
                        }
                        THINK.dbClient.loadCollection(self.schema[table]);
                    }
                    promises = new Promise(function (fulfill, reject) {
                        THINK.dbClient.initialize(self.dbOptions, function (err, ontology) {
                            if (err) reject(err);
                            else fulfill(ontology);
                        });
                    });
                }
                THINK.dbInstances[configKey] = promises.then(function (client) {
                    self.model = client.collections[table];
                    return self.model;
                });
            }
            this.db = THINK.dbInstances[configKey];
            return getPromise(this.db);
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