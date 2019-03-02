var i2c = require('i2c-bus');
var BMP = require("./bmp");
var font = require('./font');
var font_arial = require('./font-arial');
var font_comicsms = require('./font-comicSansMS');
var font_microsotfsansserif = require('./font-microsoftSansSerif');
var font_verdana = require('./font-verdana');

var i2cBus = i2c.openSync(1);

//var FONT = ['Arial','Comic Sans MS','Microsoft Sans Serif','Verdana'];
//var FONT_SIZE = [8,10,12,14,20];
//var FONT_STYLE = ['Regular'];

var HBit = [0x80,0x40,0x20,0x10,0x08,0x04,0x02,0x01];

var OledSH1106 = function() {
	this.HEIGHT = 64;
	this.WIDTH = 128;
	this.ADDRESS = 0x3C;
	this.PROTOCOL = 'I2C';

	// create command buffers
	this.DISPLAY_OFF = 0xAE;
	this.DISPLAY_ON = 0xAF;
	this.SET_DISPLAY_CLOCK_DIV = 0xD5;
	this.SET_MULTIPLEX = 0xA8;
	this.SET_DISPLAY_OFFSET = 0xD3;
	this.SET_START_LINE = 0x00;
	this.CHARGE_PUMP = 0x8D;
	this.EXTERNAL_VCC = false;
	this.MEMORY_MODE = 0x20;
	this.SEG_REMAP = 0xA1; // using 0xA0 will flip screen
	this.COM_SCAN_DEC = 0xC8;
	this.COM_SCAN_INC = 0xC0;

	this.SET_COM_PINS = 0xDA;
	this.SET_CONTRAST = 0x81;
	this.SET_PRECHARGE = 0xd9;
	this.SET_VCOM_DETECT = 0xDB;

	this.DISPLAY_ALL_ON_RESUME = 0xA4;
	this.NORMAL_DISPLAY = 0xA6;

	this.COLUMN_ADDR = 0x21;
	this.PAGE_ADDR = 0xB0;

	this.INVERT_DISPLAY = 0xA7;
	this.ACTIVATE_SCROLL = 0x2F;
	this.DEACTIVATE_SCROLL = 0x2E;
	this.SET_VERTICAL_SCROLL_AREA = 0xA3;
	this.RIGHT_HORIZONTAL_SCROLL = 0x26;
	this.LEFT_HORIZONTAL_SCROLL = 0x27;
	this.VERTICAL_AND_RIGHT_HORIZONTAL_SCROLL = 0x29;
	this.VERTICAL_AND_LEFT_HORIZONTAL_SCROLL = 0x2A;

	this.cursor_x = 0;
    this.cursor_y = 0;
	this.cursor_yh = 0;
	
	this.X_START = 0;
	this.Y_START = 0;
	this.WIDTH_MAX = this.WIDTH;
	this.HEIGHT_MAX = this.HEIGHT;

	this.tabSize = 0;

	// new blank buffer
	//For version <6.0.0
	if(typeof Buffer.alloc == "undefined") {
		this.buffer = new Buffer((this.WIDTH * this.HEIGHT) / 8);
	}
	//For version >=6.0.0
	else {
		this.buffer = Buffer.alloc((this.WIDTH * this.HEIGHT) / 8);
	}
	this.buffer.fill(0x00);
	this.dispBuffAtPage = [];
	this.dispBuff = [
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0x80,0x20,0x40,0x10,0x28,0x18,0x0c,0x08,
			0x0c,0x08,0x04,0x06,0x00,0x0e,0x06,0x04,0x0c,0x00,0x0c,0x10,0x10,0x38,0x30,0x10,
			0xc0,0xc0,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x38,0x38,
			0x78,0xf8,0xf8,0xf8,0xf8,0xf8,0xf8,0x78,0x38,0x30,0x00,0x00,0x00,0x38,0x38,0x78,
			0xf8,0xf8,0xf8,0xf8,0xf8,0x78,0x38,0x38,0x00,0xf8,0xf8,0xf8,0xf8,0xf8,0x78,0x38,
			0x38,0x78,0xf8,0xf8,0xf8,0xf8,0xf8,0x38,0x38,0x78,0xf8,0xf8,0xf8,0xf8,0xf8,0x00,
			0x30,0x38,0x78,0x78,0xf8,0xf8,0xf8,0xf8,0xf8,0xf8,0xc0,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0xf0,0xf8,0xf8,0xf8,0xf8,0xf8,0xf8,0x78,0x38,0x38,0x00,
			0x00,0x00,0xa0,0xb0,0x4c,0x1a,0x07,0x03,0x00,0x00,0x00,0x00,0x11,0x3f,0x3f,0xbf,
			0xbf,0xbf,0xff,0xff,0x3f,0x3f,0xff,0xff,0xbf,0xbf,0xbf,0x3f,0x3f,0x1f,0x00,0x00,
			0x00,0x01,0x03,0x05,0x1e,0xa8,0xe0,0x40,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0xff,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x0f,0x0f,0x0f,0x03,0x00,0x00,0x00,
			0x00,0xff,0xff,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x01,0x0f,0x0f,0x0f,0x00,
			0x00,0x00,0x00,0x00,0xff,0xff,0xff,0x1f,0x7f,0xff,0xff,0xfe,0xf0,0x80,0x00,0x00,
			0x00,0x00,0xc0,0xf8,0xff,0x7f,0x1f,0xff,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,
			0x00,0xb4,0xb6,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x80,0xf0,0xfc,0x7e,0x1f,0xff,
			0xff,0x3f,0x0f,0x0f,0x00,0x00,0x0f,0x0f,0x3f,0xff,0xff,0xcf,0x3e,0xfc,0xf0,0x80,
			0x00,0x00,0x00,0x00,0x00,0x00,0x83,0xb7,0x32,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0xff,0xff,0xff,0xff,0xff,0x80,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0xff,0xff,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0xff,0xff,0xff,0x00,0x00,0x07,0x3f,0xff,0xff,0xff,0xfc,0xe0,
			0xf0,0xfe,0x7f,0x0f,0x03,0x00,0xff,0xff,0xff,0xff,0xff,0xff,0x00,0x00,0x00,0x00,
			0x00,0x01,0x0e,0x2e,0xb0,0xc0,0x00,0x00,0x00,0x00,0x07,0x3f,0x7f,0xf8,0xe0,0xc7,
			0x8f,0x1f,0x1c,0x1c,0x38,0x38,0x1c,0x1c,0x1f,0x8f,0xc7,0xe0,0xf8,0x7f,0x3f,0x07,
			0x00,0x00,0x00,0x00,0x40,0xd8,0x2e,0x0f,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x03,0x0f,0x3f,0x7f,0x7f,0xff,0xf8,0xf0,0xe0,0xe0,0xe0,0xe0,0xe0,0xf0,0xf8,
			0x7e,0x3f,0x1f,0x07,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xe0,0xe0,
			0xe0,0xf7,0xff,0xff,0xff,0xff,0xff,0xe0,0xe0,0xe0,0x00,0x00,0x00,0x00,0x00,0x00,
			0xe0,0xe0,0xe0,0xf0,0xff,0xff,0xff,0xf8,0xe0,0xe0,0xe0,0x01,0x0f,0x7f,0xff,0xff,
			0x1f,0x03,0x00,0xe0,0xe0,0xe0,0xf7,0xff,0xff,0xff,0xff,0xff,0xe0,0xe0,0xe0,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x03,0x0f,0x1e,0x08,0x18,0x30,0x00,0x60,0xa1,0xc3,
			0x47,0x87,0x07,0x87,0x8e,0x8e,0x06,0x87,0x07,0x87,0x43,0xc1,0x20,0x40,0x20,0x08,
			0x1c,0x0a,0x06,0x03,0x02,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x38,0x40,
			0x78,0x00,0x18,0x70,0x00,0x78,0x18,0x70,0x09,0x79,0x55,0x41,0x79,0x14,0x78,0x08,
			0x54,0x68,0x78,0x00,0x7c,0x04,0x78,0x00,0x00,0x00,0x04,0x7c,0x00,0x78,0x54,0x40,
			0x78,0x38,0x40,0x78,0x10,0x78,0x10,0x4c,0x4c,0x30,0x78,0x40,0x00,0x68,0x44,0x38,
			0x38,0x44,0x78,0x00,0x00,0x00,0x00,0x00,0x78,0x70,0x78,0x60,0x38,0x70,0x00,0x40,
			0x40,0x60,0x38,0x70,0x00,0x78,0x08,0x08,0x54,0x68,0x38,0x00,0x38,0x38,0x40,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,
			0x01,0x01,0x00,0x01,0x01,0x01,0x00,0x01,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00
	];

	var config = {
		'128x32': {
		'multiplex': 0x1F,
		'compins': 0x02,
		'coloffset': 0
		},
		'128x64': {
		'multiplex': 0x3F,
		'compins': 0x12,
		'coloffset': 0
		},
		'96x16': {
		'multiplex': 0x0F,
		'compins': 0x2,
		'coloffset': 0,
		}
	};

	// Setup i2c
	this.wire = i2cBus;

	var screenSize = this.WIDTH + 'x' + this.HEIGHT;
	this.screenConfig = config[screenSize];

	//this._initialise();
}

OledSH1106.prototype.initOLED = function() {
	try
	{
		this._initialise();
		return true;
	}
	catch (e)
	{
		console.log('Error on init OLED.');
	}
	return false;
}

OledSH1106.prototype._initialise = function() {
  	// sequence of bytes to initialise with
	var initSeq = [ 0xAE,       // 0 disp off
                    0xD5,       // 1 clk div
                    0x80,       // 2 suggested ratio
                    0xA8, 0x3F, // 3 set multiplex
                    0xD3, 0x00, // 5 display offset
                    0x40,       // 7 start line
                    0xAD, 0x8B, // 8 enable charge pump
                    0xA1,       // 10 seg remap 1, pin header at the top
                    0xC8,       // 11 comscandec, pin header at the top
                    0xDA, 0x12, // 12 set compins
                    0x81, 0x80, // 14 set contrast
                    0xD9, 0x22, // 16 set precharge
                    0xDB, 0x35, // 18 set vcom detect
                    0xA6,       // 20 display normal (non-inverted)
                    0xAF        // 21 disp on
                  ];

	this._transfer('cmd', initSeq);
}

// Write Command and Data to OLED
OledSH1106.prototype._transfer = function(type, arrayValue, fn) {
	try{
		this._waitUntilReady(function() {
			var bufferForSend;
			if (type === 'data') {
				control = 0x40;
				arrayValue.unshift(0x40);
			  } else if (type === 'cmd') {
				arrayValue.unshift(0x00);
			  } else {
				return;
			}

		  //For version <6.0.0
		  if(typeof Buffer.from == "undefined") {
			bufferForSend = new Buffer(arrayValue);
		  }
		  //For version >=6.0.0
		  else {
			bufferForSend = Buffer.from(arrayValue)
		  }
		//console.log(bufferForSend);
		  //this.wire.i2cWriteSync(this.ADDRESS, arrayValue.length, bufferForSend);
		  this.wire.i2cWrite(this.ADDRESS, 2, bufferForSend, function(err) {
			// Q: why fn is undefined?
			// A: because _transfer() is called with 2 arguments
			if(fn) {
			  fn();
			}
		  });
		}.bind(this));
	}
	catch(e){}
}

// Write Command and Data to OLED
OledSH1106.prototype._transferSync = function(type, arrayValue, fn) {
	try{
		this._waitUntilReady(function() {
			var bufferForSend;
			if (type === 'data') {
				control = 0x40;
				arrayValue.unshift(0x40);
			  } else if (type === 'cmd') {
				arrayValue.unshift(0x00);
			  } else {
				return;
			}

		  //For version <6.0.0
		  if(typeof Buffer.from == "undefined") {
			bufferForSend = new Buffer(arrayValue);
		  }
		  //For version >=6.0.0
		  else {
			bufferForSend = Buffer.from(arrayValue)
		  }
		//console.log(bufferForSend);
		  this.wire.i2cWriteSync(this.ADDRESS, arrayValue.length, bufferForSend);
		  /*this.wire.i2cWrite(this.ADDRESS, 2, bufferForSend, function(err) {
			// Q: why fn is undefined?
			// A: because _transfer() is called with 2 arguments
			if(fn) {
			  fn();
			}
		  });*/
		}.bind(this));
	}
	catch(e){}
}

// Read the response byte to see if this is the case
OledSH1106.prototype._waitUntilReady = function(callback) {
	var done, oled = this;

	function tick(callback) {
		oled._readI2C(function(byte) {
			// read the busy byte in the response
			busy = byte >> 7 & 1;
			if (!busy) {
				// if not busy, it's ready for callback
				//console.log('not busy');
				callback();
			}
			else {
				setTimeout(tick, 0);
			}
		});
	};

	setTimeout(function () {tick(callback) }, 0);
}

// Read a byte from the oled
OledSH1106.prototype._readI2C = function(fn) {
	//For version <6.0.0
	if(typeof Buffer.from == "undefined") {
		this.wire.i2cRead(this.ADDRESS, 0, new Buffer([0]), function(err, bytesRead, data) {
			// result is single byte
			if(typeof data === "object") {
				fn(data[0]);
			}
			else {
				fn(0);
			}
		});
	}
	//For version >=6.0.0
	else {
		var data=[0];
		this.wire.i2cReadSync(this.ADDRESS, 1, Buffer.from(data));
		fn(data[0]);
	}
}

// turn oled off
OledSH1106.prototype.turnOffDisplay = function() {
    this._transfer('cmd', [this.DISPLAY_OFF]);
}
  
// turn oled on
OledSH1106.prototype.turnOnDisplay = function() {
    this._transfer('cmd', [this.DISPLAY_ON]);
}
  
// invert pixels on oled
OledSH1106.prototype.invertDisplay = function(bool) {
    if (bool) {
      this._transfer('cmd', [this.INVERT_DISPLAY]); // inverted
    } else {
      this._transfer('cmd', [this.NORMAL_DISPLAY]); // non inverted
    }
}

// Clear Display
OledSH1106.prototype.clearDisplay = function() {
	var page = this.PAGE_ADDR;var i = 0;
	for (var p=0; p<(this.WIDTH * this.HEIGHT / 8); p+=this.WIDTH) {
		page = this.PAGE_ADDR | (i & 0x0F);
		this._transferSync('cmd', [page, 0x02, 0x10]);

		var buf = [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
        //this._transfer('data', buf);
        this._transferSync('data', buf);
		i++;
	}
	for(var i=0; i<this.dispBuff.length;i++)
	{
		this.dispBuff[i] = 0x00;
	}
}

// Make Dislay to All Screen
OledSH1106.prototype.makeDisplay = function() {
	var start = 0; var ends = 0;var page = this.PAGE_ADDR;var i = 0;
	for (var p=0; p<(this.WIDTH * this.HEIGHT / 8); p+=this.WIDTH) {
		page = this.PAGE_ADDR | (i & 0x0F);
        //this._transfer('cmd', [page, 0x02, 0x10]);
        this._transferSync('cmd', [page, 0x02, 0x10]);

		start = this.WIDTH * i;
		ends = this.WIDTH * (i+1) - 1;
		var buf = this.dispBuff.slice(start,ends);
        //this._transfer('data', buf);
        this._transferSync('data', buf);
		i++;
	}
}

OledSH1106.prototype.clearArea = function(x,y,width,height,now)
{
    var py = parseInt(y/8);
    var pym = y%8;
    var px = py*this.WIDTH + x;

    for(m=0;m<width;m++)
    {
        var bit='';
        for(i=0;i<height;i++)
        {
            bit = '0'+bit;
        }

        for(i=0;i<pym;i++)
        {
            bit +='1';
        }

        var mlen = bit.length%8;
        for(i=0;i<(8-mlen);i++)
        {
            bit = '1'+bit;
        }

        var len = bit.length/8;
        for(i=0;i<len;i++)
        {
            var str = bit.slice(i*8,(i+1)*8);
            idx = (len-1-i)*128 + px+m;
            this.dispBuff[idx] &= parseInt(str, 2);
            //console.log("------------" + bit + "=" + parseInt(str, 2) + " "+idx);
        }
    }

    now = true || now; 

    if(now)
        this.makeDisplay();
}

// Make Display At Specific Page {0-7}
OledSH1106.prototype.makeDisplayAtPage = function(arrayValue,page) {
	// copy data to disp buffer
	for(var i=0;i<arrayValue.length;i++) this.dispBuff[(page*this.WIDTH)+i] = arrayValue[i];

	page = this.PAGE_ADDR | (page & 0x0F);
	this._transfer('cmd', [page, 0x02, 0x10]);
	this._transfer('data', arrayValue);
}

OledSH1106.prototype._getFontObj = function(fonts,stye,size)
{
    var fontObj = null;
    if(fonts==font.FONT.ARIAL)
    {
        if(stye ==font.STYLE.REGULAR)
        {
            if(size==font.SIZE._8)
            {
                fontObj = font_arial.arial_8_regular;
            }
            else if(size==font.SIZE._10)
            {
                fontObj = font_arial.arial_10_regular;
            }
            else if(size==font.SIZE._12)
            {
                fontObj = font_arial.arial_12_regular;
            }
            else if(size==font.SIZE._14)
            {
                fontObj = font_arial.arial_14_regular;
            }
            else if(size==font.SIZE._20)
            {
                fontObj = font_arial.arial_20_regular;
            }
        }
    }
    else if(fonts==font.FONT.COMIC_SANS_MS)
    {
        if(stye ==font.STYLE.REGULAR)
        {
            if(size==font.FONT._8)
            {
                fontObj = font_comicsms.comicSansMS_8_regular;
            }
            else if(size==font.SIZE._10)
            {
                fontObj = font_comicsms.comicSansMS_10_regular;
            }
            else if(size==font.SIZE._12)
            {
                fontObj = font_comicsms.comicSansMS_12_regular;
            }
            else if(size==font.SIZE._14)
            {
                fontObj = font_comicsms.comicSansMS_14_regular;
            }
            else if(size==font.SIZE._20)
            {
                fontObj = font_comicsms.comicSansMS_20_regular;
            }
        }
    }
    else if(fonts==font.FONT.MICROSOFT_SANS_SERIF)
    {
        if(stye ==font.STYLE.REGULAR)
        {
            if(size==font.SIZE._8)
            {
                fontObj = font_microsotfsansserif.microsoftSansSerif_8_regular;
            }
            else if(size==font.SIZE._10)
            {
                fontObj = font_microsotfsansserif.microsoftSansSerif_10_regular;
            }
            else if(size==font.SIZE._12)
            {
                fontObj = font_microsotfsansserif.microsoftSansSerif_12_regular;
            }
            else if(size==font.SIZE._14)
            {
                fontObj = font_microsotfsansserif.microsoftSansSerif_14_regular;
            }
            else if(size==font.SIZE._20)
            {
                fontObj = font_microsotfsansserif.microsoftSansSerif_20_regular;
            }
        }
    }
    else if(fonts==font.FONT.VERDANA)
    {
        if(stye ==font.STYLE.REGULAR)
        {
            if(size==font.SIZE._8)
            {
                fontObj = font_verdana.verdana_8_regular;
            }
            else if(size==font.SIZE._10)
            {
                fontObj = font_verdana.verdana_10_regular;
            }
            else if(size==font.SIZE._12)
            {
                fontObj = font_verdana.verdana_12_regular;
            }
            else if(size==font.SIZE._14)
            {
                fontObj = font_verdana.verdana_14_regular;
            }
            else if(size==font.SIZE._20)
            {
                fontObj = font_verdana.verdana_20_regular;
            }
        }
    }

    return fontObj;
}

OledSH1106.prototype.writeString = function(font,stye,size, string) {
    var fontObj = this._getFontObj(font,stye,size);
    if(fontObj==null) return;
	var strLen  = string.length;
	var wordArr = string.split(' ');
	var len = wordArr.length, padding = 0, letspace = 1, leading = 2;
	var ilen = 0;

	for (var w = 0; w < len; w += 1) {
    	// put the word space back in
    	wordArr[w] += ' ';
    	var stringArr = wordArr[w].split(''),
        slen = stringArr.length;

		// loop through the array of each char to draw
		for (var i = 0; i < slen; i += 1) {
			// look up the position of the char, pull out the buffer slice
            var charBuf = this._findCharBuf(fontObj, stringArr[i]);
            this._putCharBuf(charBuf);
            // Add 1 Byte
            this.cursor_x++;
        }
        //this.makeDisplay();
    }
}

OledSH1106.prototype.newLine = function()
{
    this.cursor_x = this.X_START;

    if(this.cursor_y == 0)
    {
        this.cursor_y += 8;
    }
    else
    {
        this.cursor_y += this.cursor_yh;
        this.cursor_yh = 0;
    }
}

OledSH1106.prototype.blinkDisplay = function(period,callback)
{
    var a=1;var that=this;
    var ptr = setInterval(function(){
        if(a==0)
        {
            that.turnOnDisplay();
            a=1;
        }
        else
        {
            that.turnOffDisplay();
            a=0;
        }
    },period);
    callback(ptr);
}

// find where the character exists within the font object
OledSH1106.prototype._findCharBuf = function(font,c) {
    var cBufPos = font.lookup.indexOf(c);
    //console.log(cBufPos);
    var cBuf = font.fontData[cBufPos];

  	return cBuf;
}

OledSH1106.prototype._putCharBuf = function(data)
{
    var px = this.cursor_x+this.X_START;   //  0 - 127
    var py = this.cursor_y;   //  0 - 63
    //var pyh = this.cursor_yh;
    //console.log('Cursor X: '+px + " " + data.h);
    //console.log(data);

    var yh = py%8;
    var width = data.w;
    var wc = data.wc;
    var height = data.h;

	//if((px+width)>this.WIDTH) // Go next line
	if((px+width)>this.WIDTH_MAX) // Go next line
    {
        //console.log(this.cursor_yh);
        //console.log(py);
        px = this.X_START;
        this.cursor_x = 0;
        this.cursor_y += this.cursor_yh;
        this.cursor_yh = 0;
        yh = this.cursor_y%8;
        py += height;
    }

    if(this.cursor_yh<height)this.cursor_yh = height;

    // Get Page Display Index [0-7] 
    if(py>0)
    {
        px += parseInt(py/8)*this.WIDTH;
    }

    var init_pos = px;
    var loop = 0;
    var remain = 0;
 
    if(height>8)
    {
        loop = parseInt(height/8);
        remain = height%8;
    }
    
    //console.log("Loop: "+loop);
    //console.log("Remain: "+remain);
    
    var posx = 0;
    for(j=0;j<width;j++)
    {
        var xw = j%8;
        var out = '';
        var m=parseInt(j/8);
        var hei=yh;
        var n = (wc-1);
        posx = j + init_pos;

        var bit = '';
        for(i=0;i<loop;i++)
        {            
            for(h=0;h<8;h++)
            {
                var a = HBit[xw] & data.d[m];
                if(a>0)bit ='1'+bit;
                else bit ='0'+bit;
                m = m + 1 + n;
            }
        }

        if(remain > 0)
        {
            for(i=0;i<remain;i++)
            {
                var a = HBit[xw] & data.d[m];
                if(a>0)bit ='1'+bit;
                else bit ='0'+bit;
                m = m + 1 + n;
            }
        }

        for(i=0;i<yh;i++)
        {
            bit = bit + '0';
        }

        var mlen = bit.length%8;
        for(i=0;i<(8-mlen);i++)
        {
            bit = '0'+bit;
        }

        var len = bit.length/8;
        for(i=0;i<len;i++)
        {
            var str = bit.slice(i*8,(i+1)*8);
            //console.log("------------" + bit + "=" + parseInt(str, 2));
            var idx = (len-1-i)*128 + px + j;
            this.dispBuff[idx] |= parseInt(str, 2);
        }
    }

    this.cursor_x += width;
}

// set starting position of a text string on the oled
OledSH1106.prototype.setCursor = function(x, y) {
	this.cursor_x = x;
 	this.cursor_y = y;
}

OledSH1106.prototype.setCursorX = function(x) {
	this.cursor_x = x;
}

OledSH1106.prototype.setCursorY = function(y) {
 	this.cursor_y = y;
}

OledSH1106.prototype.setStartPosX = function(x)
{
	this.X_START = x;
}

OledSH1106.prototype.setMaxWidth = function(width)
{
	this.WIDTH_MAX = width;
}

OledSH1106.prototype._fillClear = function(len) {
	var buf = [];
	for(var i=0;i<len;i++) buf[i]=0x00;

	return buf;
}

// draw an image pixel array on the screen
OledSH1106.prototype.drawImage = function(img) {
	var k = 0;
	for(var i=0; i<img.height/8;i++)
	{
		for(var j=0;j<img.width;j++)
		{
			var x = j;
			var y = i*8;

			var pos = this._findPositionBuf(x,y);
			this.dispBuff[pos] = img.data[k++];
		}
	}
}

// draw an image pixel array on the screen
OledSH1106.prototype.drawBMPImage = function(filename) {
	var tbmp = new BMP(filename);
	var img = tbmp.getMonoData();

	var k = 0;
	for(var i=0; i<img.height/8;i++)
	{
		for(var j=0;j<img.width;j++)
		{
			var x = j;
			var y = i*8;

			var pos = this._findPositionBuf(x,y);
			this.dispBuff[pos] = img.data[k++];
		}
	}
}

// Start x, Position y, Width Line
OledSH1106.prototype.drawXLine = function(x,y,width)
{
    var py = parseInt(y/8);
    var pym = y%8;
    var px = py*this.WIDTH + x;
    for(i=0;i<width;i++)
    { 
        this.dispBuff[px] |= HBit[8-pym];
        px++;
    }
}

OledSH1106.prototype.drawYLine = function(x,y,height)
{
    var py = parseInt(y/8);
    var pym = y%8;
    var px = py*this.WIDTH + x;

    var bit='';
    for(i=0;i<height;i++)
    {
        bit = '1'+bit;
    }

    for(i=0;i<pym;i++)
    {
        bit +='0';
    }

    var mlen = bit.length%8;
    for(i=0;i<(8-mlen);i++)
    {
        bit = '0'+bit;
    }

    var len = bit.length/8;
    for(i=0;i<len;i++)
    {
        var str = bit.slice(i*8,(i+1)*8);
        idx = (len-1-i)*128 + px;
        this.dispBuff[idx] |= parseInt(str, 2);
        //console.log("------------" + bit + "=" + parseInt(str, 2) + " "+idx);
    }
}

OledSH1106.prototype.drawBox = function(x,y,width,height)
{
    this.drawXLine(x,y,width);
    this.drawXLine(x,y+height,width);
    this.drawYLine(x,y,height);
    this.drawYLine(x+width,y,height);
}

OledSH1106.prototype._findPositionBuf = function(x0, y0) {
	var pos = 0;
	if(y0 < 8)
	{
		pos = x0;
	}
	else if(y0 >= 8 && y0 < 16)
	{
		pos = x0 + 128;
	}
	else if(y0 >= 16 && y0 < 24)
	{
		pos = x0 + 256;
	}
	else if(y0 >= 24 && y0 < 32)
	{
		pos = x0 + 384;
	}
	else if(y0 >= 32 && y0 < 40)
	{
		pos = x0 + 512;
	}
	else if(y0 >= 40 && y0 < 48)
	{
		pos = x0 + 640;
	}
	else if(y0 >= 48 && y0 < 56)
	{
		pos = x0 + 768;
	}
	else if(y0 >= 56 && y0 < 64)
	{
		pos = x0 + 896;
	}

	return pos;
}

OledSH1106.prototype.rolesRight = function()
{

}

OledSH1106.prototype.textMoveRight = function(x,y,xstop,string,font,style,size)
{
    //this.writeString(font,style,size,string);
    //clearArea = function(x,y,width,height,now)
}

module.exports = new OledSH1106();
