// Control Using MQTT
/*
+-----+-----+----------------------+------+---+---Pi 3---+---+------+----------------------+-----+-----+

Device Physical wpi BCM
Fluorescent Lighting 
WPi 27

+-----+-----+----------------------+------+---+---Pi 3---+---+------+----------------------+-----+-----+
*/
var mqtt = require('mqtt');
var gpio = require('wiringpi-node');



//------------------------------------ IO ------------------------------------------

var Lighting1 = 27;

gpio.wiringPiSetup();


gpio.pinMode(Lighting1,gpio.OUTPUT);
gpio.digitalWrite(Lighting1, gpio.LOW);


//--------------------------------------- MQTT --------------------------

// User API KEY
var apikey = '';

// Device Developer ID
var devid = '';

var url = 'mqtt://192.168.42.49' ; // use mqtts for secure connection
// Uncomment following line to enable secure connection
//var TRUSTED_CA_LIST = __dirname + '/ca.crt'; // the ca.crt file in this case in the same folder this code will be

var settings = {
  port: 1883,   // use 8883 for secure connection 
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  //username: '',
  //password: '',
 // ,rejectUnauthorized : false, // uncomment to enable secure connection
 // ca: TRUSTED_CA_LIST         // uncomment to enable secure connection
	//keepalive: 86400,
	 
};

// Data format
var data = {
	//"device_developer_id": devid,
	"data": {}
 };

// Connect to MQTT broker
var client = mqtt.connect(url, settings);

/* Upon connected to the broker, 
 * 	  - Subscribe to "message/io.data" topic
 *	  - Publish a "hello message" tp "message/io.data" topic
 */ 
client.on('connect', function () {
	console.log("Connected to broker");
	client.subscribe('io.data');
})

/* Upon connected receiveing a message, 
 * 	  - Display the message for all the topics that we have subscribed
 */ 
client.on('message', function (topic, message) {
	// message is Buffer 
	try{
		console.log(message.toString());
		var data = JSON.parse(message.toString());
		parseCommand(data);
	}catch(e){console.log('Error: '+e);}
});

function parseCommand(cmd)
{
	// {cmd:'led',option:{sub:''}}
	// exp: {cmd:'led',option:{sub:'on',sub2:'1'}}
	// exp: {cmd:'buzzer',option:{sub:'on'}}
	// exp: {cmd:'oled',option:{sub:'',txt:'Tutorial',font:0x01,style:0x01,size:0x01}}
	switch (cmd.cmd) {
		case 'light':
			if(cmd.option.sub =='on')
			{
				if(cmd.option.sub2 == '1')
				{
					gpio.digitalWrite(Lighting1,gpio.HIGH);
					console.log('Fluorescent Ligthing off');
				}
				
			}
			else if(cmd.option.sub =='off')
			{
				if(cmd.option.sub2 == '1')
				{
					gpio.digitalWrite(Lighting1,gpio.LOW);
					console.log('Fluorescent Ligthing on')
				}
				
			}
			break;
	
	}
}




