
var gpio = require('wiringpi-node');
var mfrc522 = require("mfrc522-rpi");
var request = require('request');
var http = require('http');
var nfcExit = require('./lib/nfcexit');

/* Default HTTP server request options
 *  Use "GET" method
 *  Create json type body for nfc,button and time
 *  Set headers to application/json
 */



setInterval(function () {
    request({
        uri: "http://192.168.42.49:8000?heartbeat=1",
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function (error, response, body) {
        console.log(body);
    });
}, 5000);




var uidEnter = null;
var holdEnter = null;

// Function to get timestamp
function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "/" + month + "/" + day + " @ " + hour + ":" + min + ":" + sec;
}

var beep = 0;
var doorAlert = null;
var gapTimeout = null;
var newGapState = 0;
var gapState = 0;
var MagneticLock = 4; //7; //4
var BuzzerSound = 19;  //24; //19
var DoorGapSensor = 6; //22; //6
var Led1 = 16;  //27; //16

gpio.wiringPiSetupGpio();

gpio.pinMode(Led1, gpio.OUTPUT);
gpio.pinMode(MagneticLock, gpio.OUTPUT);
gpio.pinMode(BuzzerSound, gpio.OUTPUT);

gpio.digitalWrite(Led1, gpio.LOW); //LOW ON, HIGH OFF
gpio.digitalWrite(BuzzerSound, gpio.LOW); //LOW OFF, HIGH ON
gpio.digitalWrite(MagneticLock, gpio.LOW); //LOW ACTIVE HIGH INACTIVE




mfrc522.initWiringPi(0);


//NFC Enter
setInterval(function () {
    mfrc522.reset();

    //# Scan for cards
    var response = mfrc522.findCard();
    if (!response.status) {
        gpio.digitalWrite(Led1, gpio.HIGH);
        return;
    }
    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
        gpio.digitalWrite(Led1, gpio.HIGH);
        return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    var uidHex = uid[0].toString(16) + uid[1].toString(16) + uid[2].toString(16) + uid[3].toString(16);

    if(uidEnter == null || uidEnter!=uidHex){
        if(holdEnter!=null){
            clearTimeout(holdEnter);
        }
        holdEnter = setTimeout(function(){
            uidEnter = null;
        },2000);
        uidEnter = uidHex;
        enterRequest(uidHex.toUpperCase());
    }else{
        if(holdEnter!=null){
            clearTimeout(holdEnter);
        }
        holdEnter = setTimeout(function(){
            uidEnter = null;
        },2000);
    }
    //# Stop
    mfrc522.stopCrypto();
}, 500);
//NFC Exit
nfcExit.on('uid',function(uid){
    exitRequest(uid);
});


function exitRequest(uid){
    console.log("Exit Request : "+uid);
    request({
        uri: "http://192.168.42.49:8000?reqExit="+uid,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function (error, response, body) {
        console.log(body);
        var res = JSON.parse(body);
        console.log(res.authorization);
        if(res.authorization){
            console.log("Exit granted");
            gpio.digitalWrite(MagneticLock, gpio.HIGH);
            gpio.digitalWrite(BuzzerSound, gpio.HIGH);
            setTimeout(function(){
                gpio.digitalWrite(BuzzerSound, gpio.LOW);
            },500);
            setTimeout(function () {
                gpio.digitalWrite(MagneticLock, gpio.LOW);
                if(gpio.digitalRead(DoorGapSensor)){
                    doorAlert = setInterval(function(){
                        if(beep){
                            beep = 0;
                        }else{
                            beep = 1;
                        }
                        gpio.digitalWrite(BuzzerSound, beep);
                    },50);
                }
            }, 5000);

        }else{
            console.log("Exit denied");
            gpio.digitalWrite(MagneticLock, gpio.LOW);
            gpio.digitalWrite(BuzzerSound, gpio.HIGH);
            setTimeout(function(){
                gpio.digitalWrite(BuzzerSound, gpio.LOW);
            },1000);
        }
    });
}

function enterRequest(uid){
    console.log("Enter Request : "+uid);
    request({
        uri: "http://192.168.42.49:8000?reqEnter="+uid,
        method: "GET",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10
    }, function (error, response, body) {
        var res = JSON.parse(body);
        console.log(res.authorization);
        if(res.authorization){
            console.log("Enter granted");
            gpio.digitalWrite(MagneticLock, gpio.HIGH);
            gpio.digitalWrite(BuzzerSound, gpio.HIGH);
            setTimeout(function(){
                gpio.digitalWrite(BuzzerSound, gpio.LOW);
            },500);
            setTimeout(function () {
                gpio.digitalWrite(MagneticLock, gpio.LOW);
                if(gpio.digitalRead(DoorGapSensor)){
                    doorAlert = setInterval(function(){
                        if(beep){
                            beep = 0;
                        }else{
                            beep = 1;
                        }
                        gpio.digitalWrite(BuzzerSound, beep);
                    },50);
                }
            }, 5000);
        }else{
            console.log("Enter denied");
            gpio.digitalWrite(MagneticLock, gpio.LOW);
            gpio.digitalWrite(BuzzerSound, gpio.HIGH);
            setTimeout(function(){
                gpio.digitalWrite(BuzzerSound, gpio.LOW);
            },1000);
        }
    });
}

console.log("Door Status : "+gpio.digitalRead(DoorGapSensor));
if(gpio.digitalRead(DoorGapSensor)){
    doorAlert = setInterval(function(){
        if(beep){
            beep = 0;
        }else{
            beep = 1;
        }
        gpio.digitalWrite(BuzzerSound, beep);
    },50);
}

function doorStatus(state){
    console.log("Door Status : "+state);
    if(!state){
        if(doorAlert!=null){
            clearInterval(doorAlert);
        }
        gpio.digitalWrite(BuzzerSound, gpio.LOW);
    }
}



gpio.wiringPiISR(DoorGapSensor, gpio.INT_EDGE_BOTH, function(delta) {
    newGapState = gpio.digitalRead(DoorGapSensor);
    if(gapTimeout != null){
       clearTimeout(gapTimeout);
    }
    gapTimeout = setTimeout(function(){
        if(newGapState==gapState){
            return;
        }
        gapState = newGapState;
        doorStatus(gapState);
    },250);
});