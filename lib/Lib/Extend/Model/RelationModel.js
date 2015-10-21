/**
 * 高级模型
 * @return {[type]} [description]
 */
module.exports = Model(function () {
    'use strict';
    return {
        /**
         * 关联定义
         * relation: [{
                type: 1, //类型 1 one2one 2 one2many 3 many2many
                model: 'Home/Profile', //对应的模型名
            }]
         * @type {Object}
         */

        /**
         * 设置本次使用的relation
         * @param table
         * @param relation
         * @returns {Array}
         */
        setRelation: function (table, relation) {
            var self = this, relationObj = {}, relationList = [];
            if(!isArray(relation)){
                var temp = [];
                temp.push(relation);
                relation = temp;
            }
            relation.forEach(function (rel) {
                if(!isEmpty(rel.type)){
                    switch (rel.type) {
                        case 2:
                            relationObj = self._getHasManyRelation(table, self.fields, rel);
                            break;
                        case 3:
                            relationObj = self._getManyToManyRelation(table, self.fields, rel);
                            break;
                        default:
                            relationObj = self._getHasOneRelation(table, self.fields, rel);
                            break;
                    }
                    relationList.push(relationObj);
                    self.schema[relationObj.table] = self.setSchema(relationObj.table, relationObj.fields);
                }
            });
            this.schema[table] = this.setSchema(table, this.fields);
            return relationList;
        },
        /**
         *
         * @param table
         * @param fields
         * @param relation
         * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
         * @private
         */
        _getHasOneRelation: function (table, fields, relation) {
            var relationModel = D(relation.model);
            var relationTableName = relationModel.getTableName();
            this.fields[relationTableName] = {
                model : relationTableName
            };
            return {table: relationTableName, fields: relationModel.fields};
        },
        /**
         *
         * @param table
         * @param fields
         * @param relation
         * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
         * @private
         */
        _getHasManyRelation: function (table, fields, relation) {
            var relationModel = D(relation.model);
            var relationTableName = relationModel.getTableName();
            this.fields[relationTableName] = {
                collection : relationTableName,
                via: table
            };
            if(!relationModel.fields.hasOwnProperty('table')){
                relationModel.fields[table] = {
                    model: table
                };
            }
            return {table: relationTableName, fields: relationModel.fields};
        },
        /**
         *
         * @param table
         * @param fields
         * @param relation
         * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
         * @private
         */
        _getManyToManyRelation: function (table, fields, relation) {
            var relationModel = D(relation.model);
            var relationTableName = relationModel.getTableName();
            this.fields[relationTableName] = {
                collection : relationTableName,
                via: table,
                dominant: true
            };
            if(!relationModel.fields.hasOwnProperty('table')){
                relationModel.fields[table] = {
                    collection: table,
                    via: relationTableName
                };
            }
            return {table: relationTableName, fields: relationModel.fields};
        }
    };
});