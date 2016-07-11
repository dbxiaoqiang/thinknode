/**
 * Controller
 * @return
 */
var usernames = {};
var numUsers = 0;

export default class extends THINK.Controller {

    init(http){
        super.init(http);
    }
    indexAction(){
        //auto render template file index_index.html
        return this.display();
    }

    openAction(){
        var socket = this.http.socket;
        this.broadcast('new message', {
            username: socket.username,
            message: this.http.data
        });
    }
    adduserAction(){
        var socket = this.http.socket;
        var username = this.http.data;
        // we store the username in the socket session for this client
        socket.username = username;
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        this.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        this.broadcast('userjoin', {
            username: socket.username,
            numUsers: numUsers
        });
    }
    closeAction(){
        var socket = this.http.socket;
        // remove the username from global usernames list
        if (socket.username) {
            delete usernames[socket.username];
            --numUsers;
            // echo globally that this client has left
            this.broadcast('userleft', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    }
    chatAction(){
        var socket = this.http.socket;
        // we tell the client to execute 'chat'
        this.broadcast('chat', {
            username: socket.username,
            message: this.http.data
        });
    }
    typingAction(){
        var socket = this.http.socket;
        this.broadcast('typing', {
            username: socket.username
        });
    }
    stoptypingAction(){
        var socket = this.http.socket;
        this.broadcast('stoptyping', {
            username: socket.username
        });
    }
}