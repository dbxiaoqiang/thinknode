/**
 * Model
 * @return
 */
export default class extends THINK.Model {
    init(name, config){
        super.init(name, config);
        this.fields = {
            name: {
                type: 'string',
                size: 200
            }
        };
        this.validations = {

        };
        this.relation = [

        ];
    }


    _beforeAdd (data, options){
        return Pormise.resolve(data);
    }

    _afterAdd(data, options) {
        return Pormise.resolve(data);
    }

    _beforeDelete(options) {
        return Pormise.resolve(options);
    }

    _afterDelete(options) {
        return Pormise.resolve(options);
    }

    _beforeUpdate(data, options) {
        return Pormise.resolve(data);
    }

    _afterUpdate(data, options) {
        return Pormise.resolve(data);
    }

    _afterFind(result, options) {
        return Pormise.resolve(result);
    }

    _afterSelect(result, options) {
        return Pormise.resolve(result);
    }
}
