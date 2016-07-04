/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/9/24
 */

export default [

    {
        rule: '',
        func: {}
    }
    /*
    //restFul模式路由 test为资源，后面一个参数默认为资源ID
    [/(member)(?:\/(\S*))?/, "restful"],
    //系统默认restful请求分组为restful,可通过配置项restful_group修改
    //get请求member/1解析为 restful/member/get/resource/member/id/1
    //post请求member/1解析为 restful/member/post/resource/member/id/1
    //put请求member/1解析为 restful/member/put/resource/member/id/1
    //delete请求member/1解析为 restful/member/delete/resource/member/id/1
    */


    /*
    //将/list/2016/2/解析为 home/group/list/year/2016/month/2
    ["list/:year/:month", "home/group/list"],
    */


    /*
    [/^home\/(\S*)?/, {
        //将get请求 home/1/user解析为home/index/index/id/1/resource/user
        get: 'home/index/index/id/:1/resource/:2',
        //将post请求 home/1/user解析为home/index/add/id/1/resource/user
        post: 'home/index/add/id/:1/resource/:2',
        //将put请求 home/1/user解析为home/index/edit/id/1/resource/user
        put: 'home/index/edit/id/:1/resource/:2',
        //将delete请求 home/1/user解析为home/index/del/id/1/resource/user
        delete: 'home/index/del/id/:1/resource/:2'
    }]
    */
]
