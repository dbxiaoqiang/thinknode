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
        name: 'Profile', //获取数据后，追加到原有数据里的key
        key: 'id', 
        fKey: 'user_id', //关联的key
     * }
         * @type {Object}
         */
        relation: {},
        relationTableName: '',
        /**
         * 初始化模型
         * @param table
         * @returns {*}
         */
        initModel: function (table) {
            var self = this, promises;
            table = table || this.getTableName();
            if (isEmpty(table)) {
                table = '_temp';//空模型创建临时表
            }
            return this.initDb().then(function (db) {
                if (db.client.collections && db.client.collections.hasOwnProperty(table)) {
                    promises = getPromise(db.client);
                } else {
                    var _schema = self.schema;
                    if(!isEmpty(self.relation)){
                        _schema = self.setRelation(self.relation);
                    }
                    for(var v in _schema){
                        (function () {
                            return db.client.loadCollection(_schema[v]);
                        })();
                    }
                    promises = new Promise(function (fulfill, reject) {
                        db.client.initialize(db.options, function (err, ontology) {
                            if (err) reject(err);
                            else fulfill(ontology);
                        });
                    });
                }
                return promises.then(function (client) {
                    self.model = client.collections[table];
                    return self.model;
                });
            });
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
                        return self._getBelongsToRelation(this.fields, relation);
                    case 3:
                        return self._getHasManyRelation(this.fields, relation);
                    case 4:
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
        _getBelongsToRelation: function (fields, relation) {

        },
        /**
         *
         * @param fields
         * @param relation
         * @private
         */
        _getHasManyRelation: function (fields, relation) {

        },
        /**
         *
         * @param fields
         * @param relation
         * @private
         */
        _getManyToManyRelation: function (fields, relation) {

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
            this.schema[this.relationTableName] = self.setSchema(tableName, relationModel.fields);
            this.schema[tableName] = self.setSchema(tableName, fields);
            return this.schema;
        },
        /**
         * 查询一条数据
         * @return 返回一个promise
         */
        find: function (options) {
            var self = this;
            var parsedOptions = {};
            return this.parseOptions(options, {limit: 1}).then(function (options) {
                parsedOptions = options;
                return self.initModel(options.tableName);
            }).then(function (model) {
                return model.find(self.parseDeOptions(parsedOptions)).populate(self.relationTableName);
            }).then(function (data) {
                return self._afterFind(data[0] || {}, parsedOptions);
            });
        },
    };
});