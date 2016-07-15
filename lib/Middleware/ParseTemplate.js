'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
exports.default = class extends THINK.Middleware {
    init(http) {
        this.http = http;
        this.options = THINK.C('tpl_engine_config');
        let key = THINK.hash((0, _stringify2.default)(this.options));
        if (!(key in THINK.INSTANCES.TPLENGINE)) {
            //get tpl pase engine instance
            let engine = THINK.C('tpl_engine_type');
            let clsEngine = THINK.adapter(`${ THINK.ucFirst(engine) }Template`);
            THINK.INSTANCES.TPLENGINE[key] = new clsEngine(this.options);
        }
        this.handle = THINK.INSTANCES.TPLENGINE[key];
    }

    run(data) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            //将模版文件路径写入到http对象上，供writehtmlcache里使用
            _this.http._tplfile = data.file;
            let engine = THINK.C('tpl_engine_type');
            //不使用模版引擎，直接返回文件内容
            if (!engine) {
                return THINK.getFileContent(data.file);
            }
            return yield _this.handle.fetch(data.file, data.var);
        })();
    }
};