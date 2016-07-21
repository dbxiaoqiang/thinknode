'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * socket base class
 */
exports.default = class extends _Base2.default {
    /**
     * init
     * @return {} []
     */
    init() {
        this.connection = null;
        //query queue nums
        this.queueNums = 0;
        //auto close socket timer
        this.closeTimer = 0;
    }

    /**
     * log connection
     * @return {} []
     */
    logConnect(str, type) {
        //log mongodb connection infomation
        if (this.config.log_connect) {
            THINK.log(colors => {
                return `Connect ${ type } with ` + colors.magenta(str);
            }, 'SOCKET');
        }
    }

    /**
     * auto close socket on cli mode
     * @return {Promise} []
     */
    autoClose(promise) {
        if (!THINK.C('auto_close_socket')) {
            return promise;
        }

        let close = () => {
            this.queueNums--;
            if (this.queueNums === 0) {
                this.closeTimer = setTimeout(() => {
                    this.close();
                }, 3000);
            }
        };

        clearTimeout(this.closeTimer);

        this.queueNums++;
        return promise.then(data => {
            close();
            return data;
        }).catch(err => {
            close();
            return _promise2.default.reject(err);
        });
    }

    /**
     * close socket connection
     * @return {} []
     */
    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }

    /**
     * get instance
     * @param  {Object} config []
     * @return {Object}        []
     */
    static getInstance(config, type) {
        let extraKeys = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        return instance;
    }
};