## 介绍

ThinkNode是ThinkJs的fork,在ThkinkJs 1.x的基础上,增加了以下特性：

* 将系统配置类全局变量全部放入THINK命名空间
* 完整实现了ThinkPHP相同的独立分组模式，各分组完全解耦
* 去除APP执行流程中分散的异常捕获，统一由APP类catch，便于错误跟踪和定位
* 增加I方法获取get和post等传输的参数，自动实现安全过滤
* 改进http.res.end调用机制，防止致命异常导致的node崩溃
* 使用第三方ORM Waterline 支持mysql, mongo, postgres, redis, and more
* 其他优化...

## 协议

MIT
