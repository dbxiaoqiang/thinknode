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
        if (isString(name) && arguments.length === 1) {
            return this.tVar[name];
        }
        if (isObject(name)) {
            for (var key in name) {
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
                return E('this http has being end');
            }
            yield T('view_init', _this.http, [templateFile, _this.tVar]);
            let content = yield _this.fetch(templateFile);
            content = yield _this.render(content, charset, contentType);
            return T('view_end', _this.http, [content, _this.tVar]);
        })();
    }

    /**
     * 渲染模版
     * @param  {[type]} content     [description]
     * @param  {[type]} charset     [description]
     * @param  {[type]} contentType [description]
     * @return {[type]}             [description]
     */
    render(content, charset, contentType) {
        if (!this.http.typesend) {
            charset = charset || C('encoding');
            contentType = contentType || C('tpl_content_type');
            this.http.header('Content-Type', contentType + '; charset=' + charset);
        }
        if (C('show_exec_time')) {
            this.http.sendTime();
        }
        return this.http.echo(content || '', charset || C('encoding'));
    }

    /**
     * 获取模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */
    fetch(templateFile) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let tpFile = templateFile;
            if (isEmpty(templateFile) || !isFile(templateFile)) {
                tpFile = _this2.http.templateFile;
                if (!isFile(tpFile)) {
                    return E(`can\'t find template file ${ tpFile }`);
                }
            }
            for (let v in _this2.tVar) {
                if (isPromise(_this2.tVar[v])) {
                    _this2.tVar[v] = yield _this2.tVar[v];
                }
            }
            let content = yield T('view_parse', _this2.http, { 'var': _this2.tVar, 'file': tpFile });
            return T('view_filter', _this2.http, content);
        })();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/11/26
    */