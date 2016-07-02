'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

var _Thttp = require('../../Core/Thttp');

var _Thttp2 = _interopRequireDefault(_Thttp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {

    init(server, app) {
        this.server = server;
        this.app = app;
    }

    /**
     * run
     * @return {} []
     */
    run() {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let socketio = require('socket.io');
            let io = socketio(_this.server);
            _this.io = io;
            //Sets the path v under which engine.io and the static files will be served. Defaults to /socket.io.
            if (THINK.C('websocket_path')) {
                io.path(THINK.C('websocket_path'));
            }
            if (THINK.C('websocket_allow_origin')) {
                io.origins(THINK.C('websocket_allow_origin'));
            }
            let messages = THINK.C('websocket_messages');
            let msgKeys = (0, _keys2.default)(messages);
            let open = messages.open;
            delete messages.open;
            let close = messages.close;
            delete messages.close;

            let self = _this;
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
        })();
    }

    /**
     * emit socket data
     * @param  {String} event []
     * @param  {Mixed} data  []
     * @return {}       []
     */
    emit(event, data) {
        return this.socket.emit(event, data);
    }

    /**
     * broadcast socket data
     * @param  {String} event       []
     * @param  {Mixed} data        []
     * @param  {Boolean} containSelf []
     * @return {}             []
     */
    broadcast(event, data, containSelf) {
        if (containSelf) {
            this.io.sockets.emit(event, data);
        } else {
            this.socket.broadcast.emit(event, data);
        }
    }

    /**
     * deal message
     * @param  {String} url  []
     * @param  {Mixed} data []
     * @return {}      []
     */
    message(url, data, socket) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let request = socket.request;
            if (url[0] !== '/') {
                url = `/${ url }`;
            }
            request.url = url;
            let http = yield new _Thttp2.default(request, THINK.extend({}, request.res)).run();
            http.pathname = url;
            http.method = 'ws';
            http.url = url;
            http.data = data;
            http.isWebSocket = true;
            http.socket = socket;
            http.io = _this2.io;

            http.socketEmit = _this2.emit;
            http.socketBroadcast = _this2.broadcast;

            return _this2.app.listener(http);
        })();
    }

    /**
     * check origin allowed
     * @param  {String}  origin []
     * @return {Boolean}        []
     */
    isOriginAllowed(origin) {
        let allowOrigins = THINK.C('websocket_allow_origin');
        if (!allowOrigins) {
            return true;
        }
        let info = _url2.default.parse(origin);
        let hostname = info.hostname;
        if (THINK.isString(allowOrigins)) {
            return allowOrigins === hostname;
        } else if (THINK.isArray(allowOrigins)) {
            return allowOrigins.indexOf(hostname) > -1;
        } else if (THINK.isFunction(allowOrigins)) {
            return allowOrigins(hostname, info);
        }
        return false;
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    15/12/9
    */