'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {

    init(http) {
        this.http = http;
        this.tVar = {};
    }

    /**
     * 赋值
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    assign(name, value) {
        if (name === undefined) {
            return this.tVar;
        }
        if (THINK.isString(name) && arguments.length === 1) {
            return this.tVar[name];
        }
        if (THINK.isObject(name)) {
            for (let key in name) {
                this.tVar[key] = name[key];
            }
        } else {
            this.tVar[name] = value;
        }
    }

    /**
     * 输出模版
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    display(templateFile, charset, contentType) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (_this.http.isend) {
                return THINK.statusAction(_this.http, 403, 'this http has being end');
            }

            yield THINK.R('view_init', _this.http, [templateFile, _this.tVar]);
            let content = yield _this.fetch(templateFile);
            yield THINK.R('view_end', _this.http, [content, _this.tVar]);

            charset = charset || THINK.C('encoding');
            if (!_this.http.typesend) {
                contentType = contentType || THINK.C('tpl_content_type');
                _this.http.type(contentType, charset);
            }
            if (THINK.C('show_exec_time')) {
                _this.http.sendTime();
            }
            return _this.http.end(content || '', charset);
        })();
    }

    /**
     * 渲染模版
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    fetch(templateFile) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let tpFile = templateFile || _this2.http.templateFile;
            if (!tpFile || !THINK.isFile(tpFile)) {
                return THINK.statusAction(_this2.http, 404, `can\'t find template file ${ tpFile || '' }`);
            }
            for (let v in _this2.tVar) {
                if (THINK.isPromise(_this2.tVar[v])) {
                    _this2.tVar[v] = yield _this2.tVar[v];
                }
            }
            //内容过滤
            _this2.tVar = yield THINK.R('view_filter', _this2.http, _this2.tVar);
            //挂载所有变量到THINK.ViewVar
            THINK.ViewVar = _this2.tVar;
            //渲染模板
            return THINK.R('view_parse', _this2.http, { 'var': _this2.tVar, 'file': tpFile });
        })();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/26
    */