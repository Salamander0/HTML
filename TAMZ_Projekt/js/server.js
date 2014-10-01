var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    response.writeHead(404);
    response.end();
});

    var port = 8804;
    var server_start_message = (new Date()) + ' Websocket server is listening on port ' + port;

var clients = [];
var chat_rooms = {};

var allowed_protocol = 'chat';

var connection_id = 0;

server.listen(port, function() {
    console.log(server_start_message);
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    var connection = request.accept('chat', request.origin);
    connection.id = connection_id++;
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var msgObj = JSON.parse(message.utf8Data);
            
            if (msgObj.type === 'intro') {
                connection.nickname = msgObj.nickname;
                connection.chatroom = msgObj.chatroom;

                if (chat_rooms[msgObj.chatroom] !== undefined) {
                    chat_rooms[msgObj.chatroom].push(connection);
                } else {
                    chat_rooms[msgObj.chatroom] = [connection];
                }

                connection.sendUTF(JSON.stringify({
                    type: 'welcome',
                    userId:connection.id
                }));

                broadcast_chatters_list(msgObj.chatroom);
            } else if (msgObj.type === 'message') {

                message_to_send = JSON.parse(message.utf8Data);
                message_to_send['sender'] = connection.id.toString();
                message_to_send = JSON.stringify(message_to_send);

                console.log(message_to_send)
                broadcast_message(message_to_send, msgObj.chatroom);
            }
        } else {
            connection.sendUTF('Invalid message');
        }
    });
    

    connection.on('close', function(reasonCode, description) {
        var chatroom = connection.chatroom;
        var users = chat_rooms[chatroom];

        for (var i in users) {
            if (connection.id === users[i].id) {
                chat_rooms[chatroom].splice(i, 1);
                broadcast_chatters_list(connection.chatroom);
            }
        }
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    
    function broadcast_message(message, chatroom) {
        var users = chat_rooms[chatroom];

        for (var i in users) {
            users[i].sendUTF(message);
        }
    }
    
    function broadcast_chatters_list(chatroom) {
        var nicklist = [];
        var msg_to_send;
        var users = chat_rooms[chatroom];
        
        for (var i in users) {
            nicklist.push(users[i].nickname);
        }
        
        msg_to_send = JSON.stringify({
            type: 'nicklist',
            nicklist: nicklist
        });

        broadcast_message(msg_to_send, chatroom);
    }


});
