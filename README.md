# 介绍
-----

[![npm version](https://badge.fury.io/js/thinknode.svg)](https://badge.fury.io/js/thinknode)
[![Build Status](https://travis-ci.org/richenlin/thinknode.svg?branch=master)](https://travis-ci.org/richenlin/thinknode)
[![Dependency Status](https://david-dm.org/richenlin/thinknode.svg)](https://david-dm.org/richenlin/thinknode)

ThinkNode 是一款使用 ES6/7 特性全新开发的 Node.js MVC 框架，使用 async/await 或者 Promise 解决了 Node.js 中异步嵌套的问题,让开发 Node.js 项目更加简单、高效。

# 特性
-----

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
src/Admin/Controller/Index.js
```
export default class extends THINK.Controller {
    //构造方法
    init(http){
        //调用父类构造方法
        super.init(http);
        this.model = THINK.model('Home/User', '');
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
src/Admin/Controller/Index.js
```
export default class extends THINK.Controller {
    //构造方法
    init(http){
        //调用父类构造方法
        super.init(http);
        this.model = THINK.model('Home/User', '');
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
-----

## ThinkNode 2.0 文档
[https://www.gitbook.com/book/richenlin/thinknode-doc/](https://www.gitbook.com/book/richenlin/thinknode-doc/)

## ThinkNode 3.0 文档
[https://www.gitbook.com/book/richenlin/thinknode3-doc/](https://www.gitbook.com/book/richenlin/thinknode3-doc/)

webstorm代码提示插件:  File --> Import Settings 选择 /node_modules/thinknode/doc/webstrom_thinknode_settings.jar

### 2.x to 3.x 升级方法
请参考ThinkNode 3.0 文档"升级"章节进行升级

# 快速开始
-----

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

## 启动服务

```sh
npm start
```

## 开始访问

打开浏览器，访问http://localhost:3000 


# 贡献者
-----

richenlin
richerdlee
lsliangshan

# 协议
-----

MIT
