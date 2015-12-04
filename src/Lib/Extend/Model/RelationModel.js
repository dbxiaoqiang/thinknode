/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/4
 */
import model from '../../Think/Model.js';

export default class extends model{
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
    setRelation(table, relation){
        let relationObj = {}, relationList = [];
        if(!isArray(relation)){
            relation = Array.of(relation);
        }
        relation.forEach( rel => {
            if(!isEmpty(rel.type)){
                switch (rel.type) {
                    case 2:
                        relationObj = this._getHasManyRelation(table, this.fields, rel);
                        break;
                    case 3:
                        relationObj = this._getManyToManyRelation(table, this.fields, rel);
                        break;
                    default:
                        relationObj = this._getHasOneRelation(table, this.fields, rel);
                        break;
                }
                relationList.push(relationObj);
                this.schema[relationObj.table] = this.setSchema(relationObj.table, relationObj.fields);
            }
        });
        this.schema[table] = this.setSchema(table, this.fields);
        return relationList;
    }

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */
    _getHasOneRelation(table, fields, relation) {
        let relationModel = D(relation.model);
        let relationTableName = relationModel.getTableName();
        this.fields[relationTableName] = {
            model : relationTableName
        };
        return {table: relationTableName, fields: relationModel.fields};
    }
    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */
    _getHasManyRelation(table, fields, relation) {
        let relationModel = D(relation.model);
        let relationTableName = relationModel.getTableName();
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
    }
    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */
    _getManyToManyRelation(table, fields, relation) {
        let relationModel = D(relation.model);
        let relationTableName = relationModel.getTableName();
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
}