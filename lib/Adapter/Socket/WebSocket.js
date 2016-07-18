'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _Base = require('../../Core/Base');

var _Base2 = _interopRequireDefault(_Base);

var _Thttp = require('../../Core/Thttp');

var _Thttp2 = _interopRequireDefault(_Thttp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _Base2.default {

    init(options) {
        this.server = options.server;
        this.app = options.app;
    }

    /**
     * run
     * @return {} []
     */
    run() {
        let socketio = require('socket.io');
        let io = socketio(this.server);
        this.io = io;
        //Sets the path v under which engine.io and the static files will be served. Defaults to /socket.io.
        if (THINK.config('websocket_path')) {
            io.path(THINK.config('websocket_path'));
        }
        if (THINK.config('websocket_allow_origin')) {
            io.origins(THINK.config('websocket_allow_origin'));
        }
        let messages = THINK.config('websocket_messages');
        let msgKeys = (0, _keys2.default)(messages);
        let open = messages.open;
        delete messages.open;
        let close = messages.close;
        delete messages.close;

        let self = this;
        io.on('connection', socket => {

            //open connection
            if (open) {
                self.message(open, undefined, socket);
            }
            //listen disonnection event
            if (close) {
                socket.on('disconnect', () => {
                    self.message(close, undefined, socket);
                });
            }

            //listen list of message type
            msgKeys.forEach(msgKey => {
                socket.on(msgKey, msg => {
                    self.message(messages[msgKey], msg, socket);
                });
            });
        });
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
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            let request = socket.request;
            if (url[0] !== '/') {
                url = `/${ url }`;
            }
            request.url = url;
            let http = yield new _Thttp2.default(request, THINK.extend({}, request.res)).run('SOCKET');
            http.pathname = url;
            http.method = 'ws';
            http.url = url;
            http.data = data;
            http.isWebSocket = true;
            http.socket = socket;
            http.io = _this.io;

            http.socketEmit = _this.emit;
            http.socketBroadcast = _this.broadcast;

            return _this.app.exec(http).then(function () {
                return THINK.statusAction(http, 200);
            }).catch(function (err) {
                return THINK.statusAction(http, 500, err);
            });
        })();
    }

    /**
     * check origin allowed
     * @param  {String}  origin []
     * @return {Boolean}        []
     */
    isOriginAllowed(origin) {
        let allowOrigins = THINK.config('websocket_allow_origin');
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