/**
 * NodeJS Websocket Server
 *
 * @author Vincent Ceulemans
 *
 */
console.log("Starting..."); 

var WebSocketServer = require('ws').Server; 
webSocketServer = new WebSocketServer({port: 8080});

var connections = []; 

webSocketServer.on('connection',
    function(ws) {
        console.log("Incoming Connection.");

        //Add to connections array 
        connections.push(ws);

        //Hookup event handler. 
        ws.on('message',
            function(message) {
                console.log('Received: %s', message);
                for(var i = 0; i < connections.length; i++){
                    var connection = connections[i];
                    
                    //If connection does not equal the originating connection. 
                    if(connection != ws){
                        connection.send(message); 
                    }
                } 
            }
        );
    }
);
