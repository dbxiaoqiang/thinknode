/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
import controller from '../../Think/Controller';

export default class extends controller{

    init(http){
        super.init(http);
        this.http.isRestful = true;
        //资源名
        this.resource = ucfirst(this.get('resource'));
        //资源id
        this.id = this.get('id') || 0;
        //实例化对应的模型
        let cls = D(`${this.http.group}/${this.resource}`);
        this.model = cls.config ? cls : D(`Common/${this.resource}`);
    }

    async getAction(){
        if(!isEmpty(this.id)){
            try{
                let pk = await this.model.getPk();
                let data = await this.model.where(getObject(pk, this.id)).find();
                return this.success(data);
            }catch (e){
                return this.error(e);
            }
        }else{
            try{
                let data = await this.model.select();
                return this.success(data);
            }catch (e){
                return this.error(e);
            }
        }
    }

    async postAction(){
        try{
            let pk = await this.model.getPk();
            let data = this.post();
            data[pk] && delete data[pk];
            if(isEmpty(data)){
                return this.error('data is empty');
            }
            let rows = await this.model.add(data);
            return this.success(rows);
        }catch (e){
            return this.error(e);
        }
    }

    async deleteAction(){
        try{
            if(!this.id){
                return this.error('params error');
            }
            let pk = await this.model.getPk();
            let rows = await this.model.where(getObject(pk, this.id)).delete();
            return this.success(rows);
        }catch (e){
            return this.error(e);
        }
    }

    async putAction(){
        try{
            if (!this.id) {
                return this.error('params error');
            }
            let pk = await this.model.getPk();
            let data = this.post();
            data[pk] && delete data[pk];
            if(isEmpty(data)){
                return this.error('data is empty');
            }
            let rows = await this.model.where(getObject(pk, this.id)).update(data);
            return this.success(rows);
        }catch (e){
            return this.error(e);
        }
    }
}