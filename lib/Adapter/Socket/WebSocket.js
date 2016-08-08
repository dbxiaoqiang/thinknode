'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/9
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(options) {
        this.server = options.server;
        this.app = options.app;
    };

    /**
     * run
     * @return {} []
     */


    _class.prototype.run = function run() {
        var socketio = require('socket.io');
        var io = socketio(this.server);
        this.io = io;
        //Sets the path v under which engine.io and the static files will be served. Defaults to /socket.io.
        if (THINK.config('websocket_path')) {
            io.path(THINK.config('websocket_path'));
        }
        if (THINK.config('websocket_allow_origin')) {
            io.origins(THINK.config('websocket_allow_origin'));
        }
        var messages = THINK.config('websocket_messages');
        var msgKeys = (0, _keys2.default)(messages);
        var open = messages.open;
        delete messages.open;
        var close = messages.close;
        delete messages.close;

        var self = this;
        io.on('connection', function (socket) {

            //open connection
            if (open) {
                self.message(open, undefined, socket);
            }
            //listen disonnection event
            if (close) {
                socket.on('disconnect', function () {
                    self.message(close, undefined, socket);
                });
            }

            //listen list of message type
            msgKeys.forEach(function (msgKey) {
                socket.on(msgKey, function (msg) {
                    self.message(messages[msgKey], msg, socket);
                });
            });
        });
    };

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Mixed} data  []
     * @return {}       []
     */


    _class.prototype.emit = function emit(event, data) {
        return this.socket.emit(event, data);
    };

    /**
     * broadcast socket data
     * @param  {String} event       []
     * @param  {Mixed} data        []
     * @param  {Boolean} containSelf []
     * @return {}             []
     */


    _class.prototype.broadcast = function broadcast(event, data, containSelf) {
        if (containSelf) {
            this.io.sockets.emit(event, data);
        } else {
            this.socket.broadcast.emit(event, data);
        }
    };

    /**
     * deal message
     * @param  {String} url  []
     * @param  {Mixed} data []
     * @return {}      []
     */


    _class.prototype.message = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(url, data, socket) {
            var request, http;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            request = socket.request;

                            if (url[0] !== '/') {
                                url = '/' + url;
                            }
                            request.url = url;
                            _context.next = 5;
                            return THINK.Http.run(request, THINK.extend({}, request.res), 'SOCKET');

                        case 5:
                            http = _context.sent;

                            http.pathname = url;
                            http.method = 'ws';
                            http.url = url;
                            http.data = data;
                            http.isWebSocket = true;
                            http.socket = socket;
                            http.io = this.io;

                            http.socketEmit = this.emit;
                            http.socketBroadcast = this.broadcast;

                            return _context.abrupt('return', this.app.exec(http).then(function () {
                                return THINK.statusAction(http, 200);
                            }).catch(function (err) {
                                return THINK.statusAction(http, 500, err);
                            }));

                        case 16:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function message(_x, _x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return message;
    }();

    /**
     * check origin allowed
     * @param  {String}  origin []
     * @return {Boolean}        []
     */


    _class.prototype.isOriginAllowed = function isOriginAllowed(origin) {
        var allowOrigins = THINK.config('websocket_allow_origin');
        if (!allowOrigins) {
            return true;
        }
        var info = _url2.default.parse(origin);
        var hostname = info.hostname;
        if (THINK.isString(allowOrigins)) {
            return allowOrigins === hostname;
        } else if (THINK.isArray(allowOrigins)) {
            return allowOrigins.indexOf(hostname) > -1;
        } else if (THINK.isFunction(allowOrigins)) {
            return allowOrigins(hostname, info);
        }
        return false;
    };

    return _class;
}(_Base2.default);

exports.default = _class;