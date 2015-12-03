/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/19
 */
'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

require('./Common/common.js');

require('./Common/function.js');

var _LibThinkAppJs = require('./Lib/Think/App.js');

var _LibThinkAppJs2 = _interopRequireDefault(_LibThinkAppJs);

var _default = (function () {
    function _default() {
        _classCallCheck(this, _default);

        //运行环境检测
        this.checkEnv();
        //加载核心
        this.loadCore();
        //加载框架文件
        this.loadFiles();
        //缓存框架
        this.loadAliasExport();
    }

    /**
     * check node env
     * @return {Boolean} []
     */

    _default.prototype.checkEnv = function checkEnv() {
        this.checkNodeVersion();
        this.checkDependencies();
    };

    /**
     * check node version
     * @return {} []
     */

    _default.prototype.checkNodeVersion = function checkNodeVersion() {
        var packageFile = THINK.ROOT_PATH + '/node_modules/thinknode/package.json';

        var _JSON$parse = JSON.parse(_fs2['default'].readFileSync(packageFile, 'utf-8'));

        var engines = _JSON$parse.engines;

        var needVersion = engines.node.substr(2);

        var nodeVersion = process.version;
        if (nodeVersion[0] === 'v') {
            nodeVersion = nodeVersion.slice(1);
        }

        if (needVersion > nodeVersion) {
            P(new Error('ThinkNode need node version >= ' + needVersion + ', current version is ' + nodeVersion + ', please upgrade it.'));
            console.log();
            process.exit();
        }
    };

    /**
     * check dependencies is installed before server start
     * @return {} []
     */

    _default.prototype.checkDependencies = function checkDependencies() {
        var packageFile = THINK.ROOT_PATH + '/package.json';
        if (!isFile(packageFile)) {
            return;
        }
        var data = JSON.parse(_fs2['default'].readFileSync(packageFile, 'utf8'));
        var dependencies = data.dependencies;
        for (var pkg in dependencies) {
            if (isDir(THINK.ROOT_PATH + '/node_modules/' + pkg)) {
                continue;
            }
            try {
                require(pkg);
            } catch (e) {
                P(new Error(' package `' + pkg + '` is not installed. please run \'npm install\' command before start server.'));
                console.log();
                process.exit();
            }
        }
    };

    /**
     * load alias
     * @param alias
     */

    _default.prototype.loadAlias = function loadAlias(alias) {
        for (var v in alias) {
            thinkCache(thinkCache.ALIAS, v, alias[v]);
        }
    };

    /**
     * load alias module export
     */

    _default.prototype.loadAliasExport = function loadAliasExport() {
        var alias = thinkCache(thinkCache.ALIAS);
        for (var key in alias) {
            if (thinkCache(thinkCache.ALIAS_EXPORT, key)) {
                continue;
            }
            thinkCache(thinkCache.ALIAS_EXPORT, key, thinkRequire(key));
        }
    };

    /**
     * flush alias
     */

    _default.prototype.flushAlias = function flushAlias(type) {
        thinkCache(thinkCache.ALIAS, type, null);
    };

    /**
     * flush alias module export
     */

    _default.prototype.flushAliasExport = function flushAliasExport(type) {
        thinkCache(thinkCache.ALIAS_EXPORT, type, null);
    };

    /**
     * load ext
     * @param ext
     * @param callback
     */

    _default.prototype.loadExt = function loadExt(ext, callback) {
        var g = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
        var tempDir = [];
        var tempType = '';
        var tempName = '';

        for (var type in ext) {
            (function (t) {
                ext[t] = ext[t] || [];
                ext[t].forEach(function (v) {
                    if (isDir(v)) {
                        try {
                            tempDir = _fs2['default'].readdirSync(v);
                        } catch (e) {
                            tempDir = [];
                        }
                        tempDir.forEach(function (f) {
                            if (isFile(v + f) && (v + f).indexOf('.js') > -1) {
                                tempName = f.replace(/.js/, '');
                                tempType = g == '' ? tempName : g + '/' + tempName;
                                callback(tempType, v + f);
                            }
                        });
                    }
                });
            })(type);
        }
        tempDir = null;
        tempType = null;
        tempName = null;
    };

    /**
     * 加载核心
     */

    _default.prototype.loadCore = function loadCore() {
        var core = {
            "Http": THINK.CORE_PATH + '/Http.js',
            "App": THINK.CORE_PATH + '/App.js',
            "Dispatcher": THINK.CORE_PATH + '/Dispatcher.js',
            "Controller": THINK.CORE_PATH + '/Controller.js',
            "Behavior": THINK.CORE_PATH + '/Behavior.js',
            "Model": THINK.CORE_PATH + '/Model.js',
            "View": THINK.CORE_PATH + '/View.js',
            "Cache": THINK.CORE_PATH + '/Cache.js',
            "Session": THINK.CORE_PATH + '/Session.js',
            "Log": THINK.CORE_PATH + '/Log.js'
        };
        this.loadAlias(core);
    };

    /**
     * 自动加载文件
     */

    _default.prototype.loadFiles = function loadFiles() {
        var _this = this;

        //加载配置
        C(null); //移除之前的所有配置
        THINK.CONF = require(THINK.THINK_PATH + '/Conf/config.js');
        //框架版本
        THINK.THINK_VERSION = THINK.CONF.think_version;
        //模型声明
        THINK.MODEL = [];
        //加载模式配置文件
        if (THINK.APP_MODE) {
            var modeFiles = [THINK.THINK_PATH + '/Conf/mode.js', THINK.APP_PATH + '/Common/conf/mode.js'];
            modeFiles.forEach(function (file) {
                if (!isFile(file)) {
                    return;
                }
                var conf = safeRequire(file);
                if (conf[THINK.APP_MODE]) {
                    THINK.CONF = extend(false, THINK.CONF, conf[THINK.APP_MODE]);
                }
            });
        }

        //框架路由
        if (THINK.CONF.url_route_on && isFile(THINK.THINK_PATH + '/Conf/route.js')) {
            THINK.CONF.url_route_rules = require(THINK.THINK_PATH + '/Conf/route.js');
        }
        //别名文件
        if (isFile(THINK.THINK_PATH + '/Conf/alias.js')) {
            this.loadAlias(require(THINK.THINK_PATH + '/Conf/alias.js'));
        }
        //加载标签行为
        if (THINK.CONF.app_tag_on && isFile(THINK.THINK_PATH + '/Conf/tag.js')) {
            THINK.CONF.tag = require(THINK.THINK_PATH + '/Conf/tag.js');
        }
        //加载多语言
        THINK.LANG = {};
        this.loadExt({
            "Lang": [THINK.THINK_PATH + '/Lang/']
        }, function (t, f) {
            THINK.LANG = extend(false, THINK.LANG, safeRequire(f));
        });

        //加载框架类
        this.loadExt({
            "Behavior": [THINK.THINK_PATH + '/Lib/Behavior/'],
            "Controller": [THINK.THINK_PATH + '/Lib/Extend/Controller/'],
            "Model": [THINK.THINK_PATH + '/Lib/Extend/Model/'],
            "Cache": [THINK.THINK_PATH + '/Lib/Driver/Cache/'],
            "Log": [THINK.THINK_PATH + '/Lib/Driver/Log/'],
            "Session": [THINK.THINK_PATH + '/Lib/Driver/Session/'],
            "Template": [THINK.THINK_PATH + '/Lib/Driver/Template/']
        }, function (t, f) {
            var _loadAlias;

            _this.loadAlias((_loadAlias = {}, _loadAlias[t] = f, _loadAlias));
        });
    };

    /**
     * 加载应用
     */

    _default.prototype.loadMoudles = function loadMoudles() {
        var _this2 = this;

        //加载应用函数库
        if (isFile(THINK.APP_PATH + '/Common/Common/function.js')) {
            require(THINK.APP_PATH + '/Common/Common/function.js');
        }
        //加载应用公共配置
        if (isFile(THINK.APP_PATH + '/Common/Conf/config.js')) {
            THINK.CONF = extend(false, THINK.CONF, require(THINK.APP_PATH + '/Common/Conf/config.js'));
        }
        //加载应用自定义路由
        if (THINK.CONF.url_route_on && isFile(THINK.APP_PATH + '/Common/Conf/route.js')) {
            THINK.CONF.url_route_rules = extend(false, THINK.CONF.url_route_rules, require(THINK.APP_PATH + '/Common/Conf/route.js'));
        }
        //加载多语言
        this.loadExt({
            "Lang": [THINK.APP_PATH + '/Common/Lang/']
        }, function (t, f) {
            _this2.flushAlias(t);
            _this2.flushAliasExport(t);
            THINK.LANG = extend(false, THINK.LANG, safeRequire(f));
        });

        //加载应用公共类
        this.loadExt({
            "Behavior": [THINK.APP_PATH + '/Common/Behavior/'],
            "Controller": [THINK.APP_PATH + '/Common/Controller/'],
            "Model": [THINK.APP_PATH + '/Common/Model/'],
            "Logic": [THINK.APP_PATH + '/Common/Logic/'],
            "Service": [THINK.APP_PATH + '/Common/Service/']
        }, function (t, f) {
            var _loadAlias2;

            _this2.flushAlias(t);
            _this2.flushAliasExport(t);
            _this2.loadAlias((_loadAlias2 = {}, _loadAlias2[t] = f, _loadAlias2));
        }, 'Common');
        //解析应用模块列表
        this.parseMoudleList();
    };

    /**
     * 解析应用模块列表
     */

    _default.prototype.parseMoudleList = function parseMoudleList() {
        var self = this;
        var filePath = THINK.APP_PATH;
        if (!isDir(filePath)) {
            var groupList = THINK.CONF.app_group_list.map(function (item) {
                return item.toLowerCase();
            });
            THINK.CONF.app_group_list = groupList;
            return;
        }
        var dirs = _fs2['default'].readdirSync(filePath);
        //禁止访问的分组
        var denyDirs = THINK.CONF.deny_group_list;
        var result = [];
        dirs.forEach(function (dir) {
            if (denyDirs.find(function (d) {
                if (d.toLowerCase() === dir.toLowerCase()) {
                    return false;
                } else {
                    return true;
                }
            })) {
                result.push(dir.toLowerCase());
                //加载模块类
                self.loadMoudleFiles(dir);
            }
        });

        THINK.CONF.app_group_list = extend(false, THINK.CONF.app_group_list, result);
    };

    /**
     * 加载模块文件
     * @param group
     */

    _default.prototype.loadMoudleFiles = function loadMoudleFiles(group) {
        var _this3 = this;

        //加载模块配置
        if (isFile(THINK.APP_PATH + '/' + group + '/Conf/config.js')) {
            THINK.CONF[group] = require(THINK.APP_PATH + '/' + group + '/Conf/config.js');
        }
        //加载模块类
        this.loadExt({
            "Behavior": [THINK.APP_PATH + '/' + group + '/Behavior/'],
            "Controller": [THINK.APP_PATH + '/' + group + '/Controller/'],
            "Model": [THINK.APP_PATH + '/' + group + '/Model/'],
            "Logic": [THINK.APP_PATH + '/' + group + '/Logic/'],
            "Service": [THINK.APP_PATH + '/' + group + '/Service/']
        }, function (t, f) {
            var _loadAlias3;

            _this3.flushAlias(t);
            _this3.flushAliasExport(t);
            _this3.loadAlias((_loadAlias3 = {}, _loadAlias3[t] = f, _loadAlias3));
        }, group);
    };

    /**
     * debug模式文件重载
     */

    _default.prototype.debug = function debug() {
        var _this4 = this;

        //清除require的缓存
        if (THINK.CONF.clear_require_cache) {
            (function () {
                //这些文件不清除缓存
                var retainFiles = THINK.CONF.debug_retain_files;
                setInterval(function () {
                    var _loop = function (file) {
                        var flag = retainFiles.find(function (item) {
                            //windows目录定界符为\
                            if (process.platform === 'win32') {
                                item = item.replace(/\//g, '\\');
                            }
                            if (file.indexOf(item) > -1) {
                                return true;
                            }
                        });
                        if (!flag) {
                            delete require.cache[file];
                        }
                    };

                    for (var file in require.cache) {
                        _loop(file);
                    }
                    _this4.loadMoudles();
                }, 1000);
            })();
        }
    };

    /**
     * 注册异常处理
     */

    _default.prototype.captureError = function captureError() {
        process.on('uncaughtException', function (err) {
            var msg = err.message;
            P(err, 'ERROR');
            if (msg.indexOf(' EADDRINUSE ') > -1) {
                process.exit();
            }
        });
    };

    /**
     * 记录日志
     */

    _default.prototype.log = function log() {
        //是否记录日志
        if (THINK.CONF.log_loged) {
            var cls = thinkRequire(THINK.CONF.log_type + 'Log');
            new cls().logConsole();
        }
    };

    /**
     * 应用加载
     */

    _default.prototype.start = function start() {
        //加载应用文件
        this.loadMoudles();
        //debug模式
        if (THINK.APP_DEBUG) {
            this.debug();
        } else {
            this.captureError();
        }
        //日志记录
        this.log();
    };

    /**
     * 应用运行
     */

    _default.prototype.run = function run() {
        this.start();
        return new _LibThinkAppJs2['default']().run();
    };

    return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];