/**
 * Controller
 * @return
 */

export default class extends THINK.Controller {

    init(http){
        super.init(http);
    }
    __before(){
        console.log('__before');
    }
    __empty(){
        return this.json('can\'t find action');
    }
    _before_index(){
        console.log('_before_index');
    }
    indexAction () {
        return this.json(["Hello ThinkNode!", "A Node.js MVC framework used full ES6/7 features"]);
    }

    addAction () {
        return this.deny(403);
    }

    editAction () {
        return this.deny(403);
    }

    delAction () {
        return this.deny(403);
    }

    sortAction () {
        return this.deny(403);
    }

    copyAction () {
        return this.deny(403);
    }
}