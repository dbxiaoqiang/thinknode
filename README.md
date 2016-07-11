# 介绍
-----

[![npm version](https://badge.fury.io/js/thinknode.svg)](https://badge.fury.io/js/thinknode)
[![Build Status](https://travis-ci.org/richenlin/thinknode.svg?branch=master)](https://travis-ci.org/richenlin/thinknode)
[![Dependency Status](https://david-dm.org/richenlin/thinknode.svg)](https://david-dm.org/richenlin/thinknode)

ThinkNode 是一款使用 ES6/7 特性全新开发的 Node.js MVC 框架，使用 async/await 或者 Promise 解决了 Node.js 中异步嵌套的问题,让开发 Node.js 项目更加简单、高效。

# 特性

1. 使用 ES6/7 全新特性来开发项目
2. C(Core) + A(Adapter) + M(Middleware) 架构,合理解耦方便扩展
3. 支持 Mysql,MongoDB,postgresSql 等多种数据库,且书写语法一致
4. Model 预加载机制,支持动态加载,动态切换数据源
5. 开发模式下代码自动更新,无需重启 Node 服务
6. 支持Http、WebSocket、Restful等多种访问方式
7. 支持 File、Redis、Memcache 等多种Session及Cache
8. 支持切面编程,支持 __before，_berore_xxx, _after_xxx 等多种魔术方法
9. 支持 ejs 模版引擎,可以自行扩展其他解析引擎
10. 支持国际化和多主题

## async/await 示例
src/Admin/Controller/IndexController.js
```
export default class extends THINK.Controller {
    //构造方法
    init(http){
        //调用父类构造方法
        super.init(http);
        this.model = THINK.M('Home/User');
    }
    
    //控制器默认方法
    async indexAction () {
        let userInfo = await this.model.where({id: 1}).find();
        this.set('userInfo', userInfo);
        return this.display();
    }
}
```

## Promise 示例
src/Admin/Controller/IndexController.js
```
export default class extends THINK.Controller {
    //构造方法
    init(http){
        //调用父类构造方法
        super.init(http);
        this.model = THINK.M('Home/User');
    }
    
    //控制器默认方法
    indexAction () {
        return this.model.where({id: 1}).find().then(userInfo => {
            this.set('userInfo', userInfo);
            return this.display();
        }).catch(e => {
            return this.error(e.message);
        });
    }
}
```

# 文档

## ThinkNode 2.0 文档
[https://www.gitbook.com/book/richenlin/thinknode-doc/](https://www.gitbook.com/book/richenlin/thinknode-doc/)

## ThinkNode 3.0 文档
[https://www.gitbook.com/book/richenlin/thinknode3-doc/](https://www.gitbook.com/book/richenlin/thinknode3-doc/)

### 2.x to 3.x 升级方法
**注意: ThinkNode3.x相比2.x变化较大,如果在原有项目中升级,请按照以下方法:**

1. ThinkNode3移除了全局函数库,例如isEmpty,isString等修改为THINK.isEmtpy,THINK.isString.可参考/thinknode/lib/Util/Lib.js及/thinknode/lib/Common/function.js两个文件内的函数进行项目内搜索替换
   仅保留了一个全局函数echo.名称有修改的函数:
   THINK.thinkCache修改为THINK.cache
   THINK.thinkRequire修改为THINK.require,用法也有所改变,THINK.require默认仅返回配置alias.js中定义的类,因此2.x中继承父类thinkRequire('Home/IndexController')要修改为THINK.require('Home/Index', 'Controller')
   THINK.mkdir修改为THINK.mkDir
   THINK.rmdir修改为THINK.rmDir
   

2. ThinkNode3移除了Behavior,请将原有Behavior类修改继承THINK.Middleware,放入Middleware目录,使用THINK.use('xxx', http, data)调用;

3. ThinkNode3移除了Logic,请将原有Logic类修改继承THINK.Service,放入Service目录,使用THINK.X('xxx', '', config)调用;

4. ThinkNode3移除了Tag机制,改为Middleware,可以使用THINK.use(name, obj, type)进行动态挂载

5. ThinkNode3简化了Controller,Service,Model,Adapter,Middleware文件命名方式,原IndexController.js简化为Index.js,参考此规则进行修改

6. ThinkNode3将框架原有Driver(包括日志,缓存,session,模板引擎)变更为Adapter,使用THINK.adapter进行加载,项目中如果使用了thinkRequire('RedisCache')请修改为THINK.adapter('RedisCache')

7. 在2.x版本中,如果项目中包含Commmon/Commmon/function.js,将function.js文件移到Commmon/Util/function.js

8. ThinkNode3将多语言文件放入Conf目录,项目中包含Common/Lang文件夹,请将Common/Lang移到Common/Conf/Lang

9. ThinkNode3抛弃了函数式调用框架,使用实例化类的方式,修改项目首页 www/index.js文件内容
```
    var path = require('path');
    var thinknode = require('thinknode');
    //root path
    var rootPath = path.dirname(__dirname);
    //thinknode instantiation
    var instance = new thinknode({
        ROOT_PATH: rootPath,
        APP_PATH: rootPath + path.sep + 'App',
        RESOURCE_PATH: __dirname,
        RUNTIME_PATH: rootPath + path.sep + 'Runtime',
        APP_DEBUG: true
    });
    //app run
    instance.run();
```

# 快速开始

## 全局安装ThinkNode_kit

```sh
npm install -g thinknode_kit
```

## 创建项目


### 在合适的位置执行命令

```sh
thinknode new project_name
```

## 安装依赖

```sh
npm install
```

## 项目编译(开发模式下需要)

项目目录下的src目录是使用es6/7来写的源码,开启编译监听后会自动编译成为es5兼容代码到App目录

### 开启项目编译监听

```sh
cd project_path
npm run watch-compile
```

## 新打开一个命令窗口,启动服务

```sh
npm start
```

## 开始访问

打开浏览器，访问http://localhost:3000 


# 贡献者

richenlin
richerdlee
lsliangshan

# 协议

MIT
