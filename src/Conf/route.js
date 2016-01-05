/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/9/24
 */

export default [
    //{rule: '/user/:id/customer/:customer', route: 'restful', method: 'get'},
    {rule:/(user)(?:\/(\S*))?/, route: 'restful'},
    //{rule: '/user/:id', route: 'restful', method: 'get'},
    {rule: '/test/:id/:id', route:'normal', action: 'Home/Index/index?id=:1&a=:2'},
]