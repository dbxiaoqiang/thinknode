/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/3
 */
import controller from '../../Core/Controller';

export default class extends controller{

    init(http){
        super.init(http);
        this.http.isRestful = true;
        //资源名
        this.resource = THINK.ucFirst(this.get('resource'));
        //资源id
        this.id = this.get('id') || 0;
        //实例化对应的模型
        let cls = THINK.model(`${this.http.group}/${this.resource}`, {});
        this.model = cls.config ? cls : THINK.model(`Common/${this.resource}`, {});
    }

    async getAction(){
        if(!THINK.isEmpty(this.id)){
            try{
                let pk = await this.model.getPk();
                let data = await this.model.where(THINK.getObject(pk, this.id)).find();
                return this.success('', data);
            }catch (e){
                return this.error(e.message);
            }
        }else{
            try{
                let data = await this.model.select();
                return this.success(data);
            }catch (e){
                return this.error(e.message);
            }
        }
    }

    async postAction(){
        try{
            let pk = await this.model.getPk();
            let data = this.post();
            data[pk] && delete data[pk];
            if(THINK.isEmpty(data)){
                return this.error('data is empty');
            }
            let rows = await this.model.add(data);
            return this.success(rows);
        }catch (e){
            return this.error(e.message);
        }
    }

    async deleteAction(){
        try{
            if(!this.id){
                return this.error('params error');
            }
            let pk = await this.model.getPk();
            let rows = await this.model.where(THINK.getObject(pk, this.id)).delete();
            return this.success(rows);
        }catch (e){
            return this.error(e.message);
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
            if(THINK.isEmpty(data)){
                return this.error('data is empty');
            }
            let rows = await this.model.where(THINK.getObject(pk, this.id)).update(data);
            return this.success(rows);
        }catch (e){
            return this.error(e.message);
        }
    }
}
