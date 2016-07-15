/**
 * Controller
 * @return
 */

export default class extends THINK.Ext.RestfulController {
    init(http){
        super.init(http);
    }

    __before(){
        echo('auth check');
        //通过header传值来判定权限
        //let token = this.header('token');
    }
}
