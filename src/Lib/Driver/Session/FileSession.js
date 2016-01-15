/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/2
 */
import filecache from '../Cache/FileCache';

export default class extends filecache {
    init(options) {
        super.init(options);

        //cache keystore
        this.cacheStore = thinkCache.SESSION;
        //cache auto refresh
        this.updateExpire = true;
    }
}