var fs = require("fs");

function BmpDecoder(files) {
	this.buffer = fs.readFileSync(files);
  	this.pos = 0;
  	this.flag = this.buffer.toString("utf-8", 0, this.pos += 2);
  	if (this.flag != "BM") throw new Error("Invalid BMP File");
  	this.parseHeader();
}

BmpDecoder.prototype.parseHeader = function() {
  this.fileSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.reserved = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.offset = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.headerSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.width = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.height = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.planes = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.bitPP = this.buffer.readUInt16LE(this.pos);
  this.pos += 2;
  this.compress = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.rawSize = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.hr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.vr = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.colors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;
  this.importantColors = this.buffer.readUInt32LE(this.pos);
  this.pos += 4;

  if(this.bitPP === 16 && this.is_with_alpha){
    this.bitPP = 15
  };
  if (this.bitPP < 15) {
    var len = this.colors === 0 ? 1 << this.bitPP : this.colors;
    this.palette = new Array(len);
    for (var i = 0; i < len; i++) {
      var blue = this.buffer.readUInt8(this.pos++);
      var green = this.buffer.readUInt8(this.pos++);
      var red = this.buffer.readUInt8(this.pos++);
      var quad = this.buffer.readUInt8(this.pos++);
      this.palette[i] = {
        red: red,
        green: green,
        blue: blue,
        quad: quad
      };
    }
  }
}

BmpDecoder.prototype.getMonoData = function() {
	this.pos = this.offset;
	var buf = [], bufData = [];
  	try {
		this.monoData = [];
    	var bitn = "bit" + this.bitPP;
    	var len = this.width * this.height * 4;
    	this.data = new Buffer(len);

    	this[bitn]();

    	for(var i=0;i<this.monoData.length;i++)
		{
		  	if(typeof this.monoData[i] !== 'undefined')
		  	{
				if(this.monoData[i] > 0x78)
					buf.push(0x01);
				else
					buf.push(0x00);
			}
  		}

		if(this.height < 8)
		{
			for(var i=0;i<this.width;i++)
			{
				var b = '';
				for(var j=this.height-1;j>=0;j--)
				{
					b += buf[i+j*this.width] + '';
					//console.log(b);
				}
				bufData.push(parseInt(b, 2));
				//console.log(parseInt(b, 2));
			}
		}
		else
		{
			var loc = 0;
			var pages = Math.floor(this.height/8,1);
			var yrem = this.height%8;
			for(var h=0;h<pages;h++)
			{
				for(var i=0;i<this.width;i++)
				{
					var b = '';
					for(var j=7;j >= 0; j--)
					{
						b += buf[i+j*this.width + h*this.width*8] + '';
						loc++;
					}
					bufData.push(parseInt(b, 2));
					//console.log(parseInt(b, 2));
				}
			}

			if(yrem > 0)
			{
				for(var i=0;i<this.width;i++)
				{
					var b = '';
					for(var j=yrem-1;j>=0;j--)
					{
						b += buf[i+j*this.width + loc] + '';
						//console.log(b);
					}
					bufData.push(parseInt(b, 2));
					//console.log(parseInt(b, 2));
				}
			}

		}
  	} catch (e) {
    	console.log("bit decode error:" + e);
    	return {data:null,width:0,height:0};
  	}
	//for(var i=0;i<bufData.length;i++)
	//{
	//  	console.log(bufData[i]);
  	//}

	return {data:bufData,width:this.width,height:this.height};
}

BmpDecoder.prototype.bit1 = function() {
	var xlen = Math.ceil(this.width / 8);
  	var mode = xlen%4;
  	for (var y = this.height - 1; y >= 0; y--) {
    	for (var x = 0; x < xlen; x++) {
      		var b = this.buffer.readUInt8(this.pos++);
      		//console.log('buf: ' + b + ' pos: ' + this.pos);
      		var location = y * this.width * 4 + x*8*4;
      		for (var i = 0; i < 8; i++) {
        		if(x*8+i<this.width){
        	 		var rgb = this.palette[((b>>(7-i))&0x1)];
          			this.data[location+i*4] = rgb.blue;
          			this.data[location+i*4 + 1] = rgb.green;
          			this.data[location+i*4 + 2] = rgb.red;
          			this.data[location+i*4 + 3] = 0xFF;

          			this.monoData[location+i*4 + 2] = rgb.red;
        		}else{
          			break;
      	 	 	}
      		}
    	}

    	if (mode != 0){
      		this.pos+=(4 - mode);
    	}
  	}
};

BmpDecoder.prototype.bit8 = function() {
	var mode = this.width%4;
  	for (var y = this.height - 1; y >= 0; y--) {
    	for (var x = 0; x < this.width; x++) {
      		var b = this.buffer.readUInt8(this.pos++);
      		var location = y * this.width * 4 + x*4;
      		if(b < this.palette.length) {
        		var rgb = this.palette[b];
        		this.data[location] = rgb.blue;
        		this.data[location + 1] = rgb.green;
        		this.data[location + 2] = rgb.red;
        		this.data[location + 3] = 0xFF;

        		this.monoData[location + 2] = red;
      		} else {
        		this.data[location] = 0xFF;
        		this.data[location + 1] = 0xFF;
        		this.data[location + 2] = 0xFF;
        		this.data[location + 3] = 0xFF;

        		this.monoData[location + 2] = 0xFF;
      		}
    	}
    	if (mode != 0){
    	  this.pos+=(4 - mode);
    	}
  	}
};

BmpDecoder.prototype.bit24 = function() {
	//when height > 0
  	for (var y = this.height - 1; y >= 0; y--) {
    	for (var x = 0; x < this.width; x++) {
    		var blue = this.buffer.readUInt8(this.pos++);
      		var green = this.buffer.readUInt8(this.pos++);
      		var red = this.buffer.readUInt8(this.pos++);
      		var location = y * this.width * 4 + x * 4;
      		this.data[location] = red;
      		this.data[location + 1] = green;
      		this.data[location + 2] = blue;
      		this.data[location + 3] = 0xFF;

 			this.monoData[location] = red;
    	}
    	//skip extra bytes
    	this.pos += (this.width % 4);
  	}
};

module.exports = BmpDecoder;