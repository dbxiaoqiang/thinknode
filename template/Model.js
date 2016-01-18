/**
 * Model
 * @return
 */
export default class extends THINK.Model {
    init(name, config){
        super.init(name, config);

        // 实际数据表名（包含表前缀）
        this.trueTableName = '';
        // 是否自动迁移(默认安全模式)
        this.safe = false;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = [];
    }

    //新增前置魔术方法
    _beforeAdd (data, options){
        return getPromise(data);
    }
    //新增后置魔术方法
    _afterAdd(data, options) {
        return getPromise(data);
    }
    //删除前置魔术方法
    _beforeDelete(options) {
        return getPromise(options);
    }
    //删除后置魔术方法
    _afterDelete(options) {
        return getPromise(options);
    }
    //更新前置魔术方法
    _beforeUpdate(data, options) {
        return getPromise(data);
    }
    //更新后置魔术方法
    _afterUpdate(data, options) {
        return getPromise(data);
    }
    //单条查询后置魔术方法
    _afterFind(result, options) {
        return getPromise(result);
    }
    //多条查询后置魔术方法
    _afterSelect(result, options) {
        return getPromise(result);
    }
}