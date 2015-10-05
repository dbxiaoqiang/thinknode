## 介绍

ThinkNode是一款基于Promise的Node.js MVC框架，借鉴于ThinkPHP。具有如下特性：

* 使用Promise，解决了异步嵌套的问题
* 支持Http、命令行、WebSocket、Restful等多种访问方式
* C(Core) + B(Behavior) + D(Driver)架构
* 封装了Db、Session、Cache等功能
* 使用第三方ORM Waterline 支持mongodb, mysql, postgresSql
* 应用独立分组模式,各分组完全解耦
* 独特的动态模型结构,支持动态切换和定义数据源
* 开发模式下修改后立即生效


## 创建项目


### 在合适的位置创建一个新目录，new_dir_name为你想创建的文件夹名字
```
mkdir new_dir_name; 
```
### 创建package.json文件

### 将框架引入package.json的dependencies
```
"dependencies": {
    "thinknode": ">=1.3.3",
    ...
  },
```
### 安装
```
npm install
```
### 在 new_dir_name下创建www目录
```
mkdir ./www;
```
### 在www目录下新建项目入口index.js文件,内容如下
```
import path from 'path';
global.THINK = {};
//网站根目录
THINK.ROOT_PATH = path.dirname(__dirname);
//开启调试模式，线上环境需要关闭调试功能
THINK.APP_DEBUG = true;
//加载框架
require('thinknode');
```
### 开始运行
node www/index.js

执行后，打开浏览器，访问http://127.0.0.1:3000,会看到如下内容:

```
["Hello ThinkNode!","A Node.js MVC Framework Based on Promise"]
```

看到这个内容后，说明项目已经成功创建。

项目目录App,项目公共目录Commmon,Home分组等已经自动创建(独立分组说明可参看thinkphp文档)

## 贡献者

richen 
richerdlee
lsliangshan

## 协议

MIT