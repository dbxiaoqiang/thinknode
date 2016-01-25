'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _jade = require('jade');

var _jade2 = _interopRequireDefault(_jade);

var _Base = require('../../Think/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
exports.default = class extends _Base2.default {

    init() {
        let config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = extend(false, C('tpl_engine_config'), config);
    }

    /**
     *
     * @param templateFile
     */
    fetch(templateFile, data) {
        this.config.filename = templateFile;
        let content = getFileContent(templateFile);
        return _jade2.default.compile(content, this.config)(data);
    }
};