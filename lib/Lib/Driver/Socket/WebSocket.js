/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/12/9
 */
'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _regeneratorRuntime = require('babel-runtime/regenerator')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _ThinkBase = require('../../Think/Base');

var _ThinkBase2 = _interopRequireDefault(_ThinkBase);

var _ThinkHttp = require('../../Think/Http');

var _ThinkHttp2 = _interopRequireDefault(_ThinkHttp);

var _default = (function (_base) {
    _inherits(_default, _base);

    function _default() {
        _classCallCheck(this, _default);

        _base.apply(this, arguments);
    }

    _default.prototype.init = function init(server, app) {
        this.server = server;
        this.app = app;
    };

    /**
     * run
     * @return {} []
     */

    _default.prototype.run = function run() {
        var socketio, io, messages, msgKeys, open, close;
        return _regeneratorRuntime.async(function run$(context$2$0) {
            var _this = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
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
                    msgKeys = _Object$keys(messages);
                    open = messages.open;

                    delete messages.open;
                    close = messages.close;

                    delete messages.close;

                    thinkCache(thinkCache.WEBSOCKET, io.sockets.sockets);

                    io.on('connection', function (socket) {

                        //open connection
                        if (open) {
                            _this.message(open, undefined, socket);
                        }
                        //listen disonnection event
                        if (close) {
                            socket.on('disconnect', function () {
                                _this.message(close, undefined, socket);
                            });
                        }

                        //listen list of message type
                        msgKeys.forEach(function (msgKey) {
                            socket.on(msgKey, function (msg) {
                                _this.message(messages[msgKey], msg, socket);
                            });
                        });
                    });

                case 13:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Mixed} data  []
     * @return {}       []
     */

    _default.prototype.emit = function emit(event, data) {
        return this.socket.emit(event, data);
    };

    /**
     * broadcast socket data
     * @param  {String} event       []
     * @param  {Mixed} data        []
     * @param  {Boolean} containSelf []
     * @return {}             []
     */

    _default.prototype.broadcast = function broadcast(event, data, containSelf) {
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

    _default.prototype.message = function message(url, data, socket) {
        var request, http;
        return _regeneratorRuntime.async(function message$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    request = socket.request;

                    if (url[0] !== '/') {
                        url = '/' + url;
                    }
                    request.url = url;
                    context$2$0.next = 5;
                    return _regeneratorRuntime.awrap(new _ThinkHttp2['default'](request, extend({}, request.res)).run());

                case 5:
                    http = context$2$0.sent;

                    http.pathname = url;
                    http.method = 'ws';
                    http.url = url;
                    http.data = data;
                    http.isWebSocket = true;
                    http.socket = socket;
                    http.io = this.io;

                    http.socketEmit = this.emit;
                    http.socketBroadcast = this.broadcast;

                    return context$2$0.abrupt('return', this.app.listener(http));

                case 16:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    /**
     * check origin allowed
     * @param  {String}  origin []
     * @return {Boolean}        []
     */

    _default.prototype.isOriginAllowed = function isOriginAllowed(origin) {
        var allowOrigins = C('websocket_allow_origin');
        if (!allowOrigins) {
            return true;
        }
        var info = _url2['default'].parse(origin);
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

    return _default;
})(_ThinkBase2['default']);

exports['default'] = _default;
module.exports = exports['default'];