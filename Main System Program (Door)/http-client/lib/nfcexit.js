/**
 * Created by Abdul Hadi on 2/7/2017.
 */

var SerialPort  = require('serialport');
var comPort = '/dev/ttyS0';
var baudRate = 9600;

var EventEmitter  = require('events').EventEmitter;
module.exports = new EventEmitter();

var RX_HEADER   = 0;
var RX_ID       = 1;
var RX_UID      = 2;
var RX_ERR      = 3;

var RX_STATE = RX_HEADER;
var uidSize = 0;
var uidCount = 0;

var uidArray;
var uidBuffer = '';

//Open serial port
xport = new SerialPort(comPort,{
    parser: SerialPort.parsers.raw,
    baudRate: baudRate
});

//Register data receive listener
xport.on('data',function(data){
    for(var i=0; i<data.length;i++){
        serialRx(data[i]);
    }

});

xport.on('open',function(){
    //console.log('Serial Port opened ...');
});

xport.on('error', function(err) {
    console.log('Error: ', err.message);
});

var serialRx = function(data){
    //console.log("data serial" + data.toString());

    switch(RX_STATE){
        case RX_HEADER:
            //console.log('RX_HEADER');
            if(data!=0x7E){
                //console.log('Not equal to 7E');
                return;
            }
            uidArray = new Array();
            RX_STATE=RX_ID;
            break;
        case RX_ID:
            //console.log('RX_ID');
            uidSize = data;
            if(uidSize<4 || uidSize>10){
                RX_STATE=RX_HEADER;
                return;
            }
            uidCount = 0;
            RX_STATE=RX_UID;
            break;
        case RX_UID:
            //console.log('RX_UID '+uidCount+'/'+uidSize);
            uidCount++;
            uidArray.push(data);
            if(uidCount<uidSize){
                return;
            }
            RX_STATE=RX_ERR;
            break;
        case RX_ERR:
            //console.log('RX_ERR');
            if(data!=0xFF){
                RX_STATE=RX_ERR;
                return;
            }
            RX_STATE=RX_HEADER;

            uidBuffer = Buffer.from(uidArray);
            //console.log(uidBuffer.toString('hex').toUpperCase());
            module.exports.emit('uid',uidBuffer.toString('hex').toUpperCase());
            break;
    }
};

module.exports.doorOpened = function(){
    xport.write('1');
}

module.exports.doorClosed = function(){
    xport.write('0');
}

module.exports.doorReject = function(){
    xport.write('2');
}