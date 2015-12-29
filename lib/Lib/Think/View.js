/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <ric3000(at)163.com>
 * @license    MIT
 * @version    15/11/26
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init(http) {
        this.http = http;
        this.tVar = {};
    };

    /**
     * 赋值
     * @param  {[type]} name  [description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */

    _default.prototype.assign = function assign(name, value) {
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
    };

    /**
     * 输出模版
     * @param  {[type]} templateFile [description]
     * @param  {[type]} charset      [description]
     * @param  {[type]} contentType  [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */

    _default.prototype.display = function display(templateFile, charset, contentType) {
        var content;
        return _regeneratorRuntime.async(function display$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    if (!this.http.isend) {
                        context$2$0.next = 2;
                        break;
                    }

                    return context$2$0.abrupt('return', E('this http has being end'));

                case 2:
                    context$2$0.next = 4;
                    return _regeneratorRuntime.awrap(T('view_init', this.http, this.tVar));

                case 4:
                    context$2$0.next = 6;
                    return _regeneratorRuntime.awrap(this.fetch(templateFile));

                case 6:
                    content = context$2$0.sent;
                    context$2$0.next = 9;
                    return _regeneratorRuntime.awrap(this.render(content, charset, contentType));

                case 9:
                    content = context$2$0.sent;
                    return context$2$0.abrupt('return', T('view_end', this.http, { content: content, 'var': this.tVar }));

                case 11:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * 渲染模版
     * @param  {[type]} content     [description]
     * @param  {[type]} charset     [description]
     * @param  {[type]} contentType [description]
     * @return {[type]}             [description]
     */

    _default.prototype.render = function render(content, charset, contentType) {
        if (!this.http.typesend) {
            charset = charset || C('encoding');
            contentType = contentType || C('tpl_content_type');
            this.http.header('Content-Type', contentType + '; charset=' + charset);
        }
        if (C('show_exec_time')) {
            this.http.sendTime();
        }
        return this.http.echo(content || '', charset || C('encoding'));
    };

    /**
     * 获取模版内容
     * @param  {[type]} templateFile [description]
     * @param  {[type]} content      [description]
     * @return {[type]}              [description]
     */

    _default.prototype.fetch = function fetch(templateFile) {
        var tpFile, v, content;
        return _regeneratorRuntime.async(function fetch$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    tpFile = templateFile;

                    if (!(isEmpty(templateFile) || !isFile(templateFile))) {
                        context$2$0.next = 7;
                        break;
                    }

                    context$2$0.next = 4;
                    return _regeneratorRuntime.awrap(T('view_template', this.http, templateFile));

                case 4:
                    tpFile = context$2$0.sent;

                    if (isFile(tpFile)) {
                        context$2$0.next = 7;
                        break;
                    }

                    return context$2$0.abrupt('return', E('can\'t find template file ' + tpFile));

                case 7:
                    context$2$0.t0 = _regeneratorRuntime.keys(this.tVar);

                case 8:
                    if ((context$2$0.t1 = context$2$0.t0()).done) {
                        context$2$0.next = 16;
                        break;
                    }

                    v = context$2$0.t1.value;

                    if (!isPromise(this.tVar[v])) {
                        context$2$0.next = 14;
                        break;
                    }

                    context$2$0.next = 13;
                    return _regeneratorRuntime.awrap(this.tVar[v]);

                case 13:
                    this.tVar[v] = context$2$0.sent;

                case 14:
                    context$2$0.next = 8;
                    break;

                case 16:
                    context$2$0.next = 18;
                    return _regeneratorRuntime.awrap(T('view_parse', this.http, { 'var': this.tVar, 'file': tpFile }));

                case 18:
                    content = context$2$0.sent;
                    return context$2$0.abrupt('return', T('view_filter', this.http, content));

                case 20:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    return _default;
})(_Base2['default']);

exports['default'] = _default;
module.exports = exports['default'];