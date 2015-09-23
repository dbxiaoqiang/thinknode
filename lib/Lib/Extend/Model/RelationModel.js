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
                model: 'Home/Profile', //对应的模型名
            }
         * @type {Object}
         */

        /**
         * 设置本次使用的relation
         * @param table
         * @param relation
         * @returns {*|{table, relation}}
         */
        setRelation: function (table, relation) {
            var self = this;
            if(!isEmpty(relation.type)){
                switch (relation.type) {
                    case 2:
                        return self._getHasManyRelation(table, this.fields, relation);
                    case 3:
                        return self._getManyToManyRelation(table, this.fields, relation);
                    default:
                        return self._getHasOneRelation(table, this.fields, relation);
                }
            }
        },
        /**
         *
         * @param table
         * @param fields
         * @param relation
         * @returns {{table: *, relation: (*|type[])}}
         * @private
         */
        _getHasOneRelation: function (table, fields, relation) {
            var relationModel = D(relation.model);
            this.relationTableName = relationModel.getTableName();
            fields[this.relationTableName] = {
                model : this.relationTableName
            };
            this.schema[this.relationTableName] = this.setSchema(this.relationTableName, relationModel.fields);
            this.schema[table] = this.setSchema(table, fields);
            return {table: table, relation: this.relationTableName};
        },
        /**
         *
         * @param table
         * @param fields
         * @param relation
         * @returns {{table: *, relation: (*|type[])}}
         * @private
         */
        _getHasManyRelation: function (table, fields, relation) {
            var relationModel = D(relation.model);
            this.relationTableName = relationModel.getTableName();
            fields[this.relationTableName] = {
                collection : this.relationTableName,
                via: table
            };
            relationModel.fields[table] = {
                model: table
            };
            this.schema[this.relationTableName] = this.setSchema(this.relationTableName, relationModel.fields);
            this.schema[table] = this.setSchema(table, fields);
            return {table: table, relation: this.relationTableName};
        },
        /**
         *
         * @param table
         * @param fields
         * @param relation
         * @returns {{table: *, relation: (*|type[])}}
         * @private
         */
        _getManyToManyRelation: function (table, fields, relation) {
            var self = this;
            var relationModel = D(relation.model);
            this.relationTableName = relationModel.getTableName();
            fields[this.relationTableName] = {
                collection : this.relationTableName,
                via: table,
                dominant: true
            };
            relationModel.fields[table] = {
                collection: table,
                via: this.relationTableName
            };
            this.schema[this.relationTableName] = this.setSchema(this.relationTableName, relationModel.fields);
            this.schema[table] = this.setSchema(table, fields);
            return {table: table, relation: this.relationTableName};
        }
    };
});