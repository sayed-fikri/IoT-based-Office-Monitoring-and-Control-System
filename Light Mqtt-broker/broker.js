
/* Include mosca library to start mqtt broker
 *  https://www.npmjs.com/package/mosca
 */
var mosca = require('mosca');

// Setup Mosca to listen on port 465 for native MQTT and port 443 for MQTT over websocket 
var settings = {
    port:1883,     //native mqtt
    http:{           //mqtt over websocket
        port:3001,
        bundle:true,
        static:"./"
    }

};

// Create and start MQTT broker with `settings` configuration  
var server = new mosca.Server(settings);

// Display a message when the MQTT broker is ready
server.on('ready', function(){
    console.log("MOsca @ mqtt = 1883 & mqtt-ws = 3001");
});

//  Display a message and a client id when the client is connected to the broker
server.on('clientConnected', function(client) {
    console.log("Connected :"+client.id);
});

//  Display a message and a client id when the client is disconnected from the broker
server.on('clientDisconnected', function(client) {
    console.log("Disconnected :"+client.id);
});


// Display the message published by the client

server.on('published', function(packet, client) {
    if(typeof client != 'undefined')
    console.log("From :"+client.id);      
    console.log("Topic : "+packet.topic);
    console.log("Message :"+packet.payload.toString());
});

