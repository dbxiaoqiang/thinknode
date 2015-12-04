/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/4
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Array$of = require('babel-runtime/core-js/array/of')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _ThinkModelJs = require('../../Think/Model.js');

var _ThinkModelJs2 = _interopRequireDefault(_ThinkModelJs);

var _default = (function (_model) {
    _inherits(_default, _model);

    function _default() {
        _classCallCheck(this, _default);

        _model.apply(this, arguments);
    }

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

    _default.prototype.setRelation = function setRelation(table, relation) {
        var _this = this;

        var relationObj = {},
            relationList = [];
        if (!isArray(relation)) {
            relation = _Array$of(relation);
        }
        relation.forEach(function (rel) {
            if (!isEmpty(rel.type)) {
                switch (rel.type) {
                    case 2:
                        relationObj = _this._getHasManyRelation(table, _this.fields, rel);
                        break;
                    case 3:
                        relationObj = _this._getManyToManyRelation(table, _this.fields, rel);
                        break;
                    default:
                        relationObj = _this._getHasOneRelation(table, _this.fields, rel);
                        break;
                }
                relationList.push(relationObj);
                _this.schema[relationObj.table] = _this.setSchema(relationObj.table, relationObj.fields);
            }
        });
        this.schema[table] = this.setSchema(table, this.fields);
        return relationList;
    };

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */

    _default.prototype._getHasOneRelation = function _getHasOneRelation(table, fields, relation) {
        var relationModel = D(relation.model);
        var relationTableName = relationModel.getTableName();
        this.fields[relationTableName] = {
            model: relationTableName
        };
        return { table: relationTableName, fields: relationModel.fields };
    };

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */

    _default.prototype._getHasManyRelation = function _getHasManyRelation(table, fields, relation) {
        var relationModel = D(relation.model);
        var relationTableName = relationModel.getTableName();
        this.fields[relationTableName] = {
            collection: relationTableName,
            via: table
        };
        if (!relationModel.fields.hasOwnProperty('table')) {
            relationModel.fields[table] = {
                model: table
            };
        }
        return { table: relationTableName, fields: relationModel.fields };
    };

    /**
     *
     * @param table
     * @param fields
     * @param relation
     * @returns {{table: (*|type[]), fields: (*|fields|{name, status}|{name, starttime, endtime, status, type}|{})}}
     * @private
     */

    _default.prototype._getManyToManyRelation = function _getManyToManyRelation(table, fields, relation) {
        var relationModel = D(relation.model);
        var relationTableName = relationModel.getTableName();
        this.fields[relationTableName] = {
            collection: relationTableName,
            via: table,
            dominant: true
        };
        if (!relationModel.fields.hasOwnProperty('table')) {
            relationModel.fields[table] = {
                collection: table,
                via: relationTableName
            };
        }
        return { table: relationTableName, fields: relationModel.fields };
    };

    return _default;
})(_ThinkModelJs2['default']);

exports['default'] = _default;
module.exports = exports['default'];