/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/12/3
 */

export default class extends THINK.Controller{

    init(http){
        super.init(http);
        //资源名
        this.resource = this.get('resource');
        //资源id
        this.id = this.get('id') | 0;
        //实例化对应的模型
        this.model = D(`${this.http.group}/${this.resource}`);
    }

    async getAction(){
        if(this.id){
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
            return this.model.add(data);
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