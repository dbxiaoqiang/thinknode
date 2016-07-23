'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * socket base class
 */

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    /**
     * init
     * @return {} []
     */

    _class.prototype.init = function init() {
        this.connection = null;
        //query queue nums
        this.queueNums = 0;
        //auto close socket timer
        this.closeTimer = 0;
    };

    /**
     * log connection
     * @return {} []
     */


    _class.prototype.logConnect = function logConnect(str, type) {
        //log mongodb connection infomation
        if (this.config.log_connect) {
            THINK.log(function (colors) {
                return 'Connect ' + type + ' with ' + colors.magenta(str);
            }, 'SOCKET');
        }
    };

    /**
     * auto close socket on cli mode
     * @return {Promise} []
     */


    _class.prototype.autoClose = function autoClose(promise) {
        var _this2 = this;

        if (!THINK.config('auto_close_socket')) {
            return promise;
        }

        var close = function close() {
            _this2.queueNums--;
            if (_this2.queueNums === 0) {
                _this2.closeTimer = setTimeout(function () {
                    _this2.close();
                }, 3000);
            }
        };

        clearTimeout(this.closeTimer);

        this.queueNums++;
        return promise.then(function (data) {
            close();
            return data;
        }).catch(function (err) {
            close();
            return _promise2.default.reject(err);
        });
    };

    /**
     * close socket connection
     * @return {} []
     */


    _class.prototype.close = function close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    };

    /**
     * get instance
     * @param  {Object} config []
     * @return {Object}        []
     */


    _class.getInstance = function getInstance(config, type) {
        var extraKeys = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

        return instance;
    };

    return _class;
}(_Base2.default);

exports.default = _class;