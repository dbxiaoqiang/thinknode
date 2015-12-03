import path from 'path';

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
export default class {
    /**
     * constructor
     * @param  {Object} http []
     * @return {}      []
     */
    constructor(...args) {
        this.init(...args);
    }

    /**
     * init
     * @param  {Object} http []
     * @return {}      []
     */
    init() {

    }

    /**
     * before magic method
     * @return {} []
     */
    __before() {
        return getPromise();
    }

    /**
     * get current class filename
     * @return {} []
     */
    filename() {
        let filename = this.__filename || __filename;
        return path.basename(filename, '.js');
    }
}