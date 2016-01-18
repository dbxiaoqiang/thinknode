'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _Base = require('../../Think/Base');

var _Base2 = _interopRequireDefault(_Base);

var _Http = require('../../Think/Http');

var _Http2 = _interopRequireDefault(_Http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(server, app) {
        this.server = server;
        this.app = app;
    };

    /**
     * run
     * @return {} []
     */

    _class.prototype.run = function () {
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            var _this2 = this;

            var socketio, io, messages, msgKeys, open, close;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            socketio = require('socket.io');
                            io = socketio(this.server);

                            this.io = io;
                            //Sets the path v under which engine.io and the static files will be served. Defaults to /socket.io.
                            if (C('websocket_path')) {
                                io.path(C('websocket_path'));
                            }
                            if (C('websocket_allow_origin')) {
                                io.origins(C('websocket_allow_origin'));
                            }
                            messages = C('websocket_messages');
                            msgKeys = (0, _keys2.default)(messages);
                            open = messages.open;

                            delete messages.open;
                            close = messages.close;

                            delete messages.close;

                            thinkCache(THINK.CACHES.WEBSOCKET, io.sockets.sockets);

                            io.on('connection', function (socket) {

                                //open connection
                                if (open) {
                                    _this2.message(open, undefined, socket);
                                }
                                //listen disonnection event
                                if (close) {
                                    socket.on('disconnect', function () {
                                        _this2.message(close, undefined, socket);
                                    });
                                }

                                //listen list of message type
                                msgKeys.forEach(function (msgKey) {
                                    socket.on(msgKey, function (msg) {
                                        _this2.message(messages[msgKey], msg, socket);
                                    });
                                });
                            });

                        case 13:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));
        return function run() {
            return ref.apply(this, arguments);
        };
    }();

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
        var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(url, data, socket) {
            var request, http;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            request = socket.request;

                            if (url[0] !== '/') {
                                url = '/' + url;
                            }
                            request.url = url;
                            _context2.next = 5;
                            return new _Http2.default(request, extend({}, request.res)).run();

                        case 5:
                            http = _context2.sent;

                            http.pathname = url;
                            http.method = 'ws';
                            http.url = url;
                            http.data = data;
                            http.isWebSocket = true;
                            http.socket = socket;
                            http.io = this.io;

                            http.socketEmit = this.emit;
                            http.socketBroadcast = this.broadcast;

                            return _context2.abrupt('return', this.app.listener(http));

                        case 16:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));
        return function message(_x, _x2, _x3) {
            return ref.apply(this, arguments);
        };
    }();

    /**
     * check origin allowed
     * @param  {String}  origin []
     * @return {Boolean}        []
     */

    _class.prototype.isOriginAllowed = function isOriginAllowed(origin) {
        var allowOrigins = C('websocket_allow_origin');
        if (!allowOrigins) {
            return true;
        }
        var info = _url2.default.parse(origin);
        var hostname = info.hostname;
        if (isString(allowOrigins)) {
            return allowOrigins === hostname;
        } else if (isArray(allowOrigins)) {
            return allowOrigins.indexOf(hostname) > -1;
        } else if (isFunction(allowOrigins)) {
            return allowOrigins(hostname, info);
        }
        return false;
    };

    return _class;
}(_Base2.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    15/12/9
                    */

exports.default = _class;