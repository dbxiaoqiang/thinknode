## 介绍

ThinkNode 是一款使用 ES6/7 特性全新开发的 Node.js MVC 框架，使用 ES7 中`async/await`，或者ES6 中的 `Promise` 特性彻底解决了 Node.js 中异步嵌套的问题。同时吸收了国内外众多框架的设计理念和思想(ThinkPHP/ThinkJS/Sails.js)，让开发 Node.js 项目更加简单、高效。


## 特性

* 使用 ES6/7 全部特性来开发项目
* C(Core) + B(Behavior) + D(Driver)架构
* 使用第三方ORM Waterline 支持 Mysql,MongoDB,postgresSql,SQLite 等多种数据库
* 开发模式下代码自动更新,无需重启 Node 服务
* 支持Http、命令行、WebSocket、Restful等多种访问方式
* 支持 File、Redis、Memcache 等多种Session及Cache
* Model 预加载机制,支持动态加载,动态切换数据源
* 支持 ejs,jade 等多种模版引擎
* 支持切面编程,支持 __before，__after 等多种魔术方法
* 支持国际化和多主题

## 安装ThinkNode

```sh
npm install -g thinknode
```

## 创建项目


### 在合适的位置执行命令

```sh
thinknode new project_path
```

## 安装依赖

```sh
npm install
```

## 项目编译(开发模式下需要)

项目目录下的src目录是使用es6/7来写的源码,开启编译监听后会自动编译成为es5兼容代码到App目录

###开启项目编译监听

```sh
cd project_path
npm run watch-compile
```

## 新打开一个命令窗口,启动服务

```sh
npm start
```

## 开始访问

打开浏览器，访问http://127.0.0.1:3000,会看到如下内容:

```
["Hello ThinkNode!", "A Node.js MVC framework used full ES6/7 features"]
```

## 贡献者

richen 
richerdlee
lsliangshan

## 协议

MIT