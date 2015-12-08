/**
 * Model
 * @return
 */
export default class extends THINK.Model {
    init(name, config){
        super.init(name, config);

        this.fields = {

        };
        this.validations = {

        };
        this.relation = [

        ];
    }


    _beforeAdd (data, options){
        return getPromise(data);
    }

    _afterAdd(data, options) {
        return getPromise(data);
    }

    _beforeDelete(options) {
        return getPromise(options);
    }

    _afterDelete(options) {
        return getPromise(options);
    }

    _beforeUpdate(data, options) {
        return getPromise(data);
    }

    _afterUpdate(data, options) {
        return getPromise(data);
    }

    _afterFind(result, options) {
        return getPromise(result);
    }

    _afterSelect(result, options) {
        return getPromise(result);
    }
}