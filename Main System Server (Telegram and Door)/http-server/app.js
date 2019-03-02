// Load the http module to create an http server.
const Bot = require('node-telegram-bot-api');
const request = require('request');

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'ams'
});
connection.connect();

const token = '572119888:AAHL14mOYkVxrz1pIZWExln4p4KGk0N_d1c';

var http = require('http');
var url = require('url');

console.log("Starting server");
var host = "192.168.42.49";
var port ="8000"

var isAlive = false;
var telegramId = 330441680;
const bot = new Bot(token, {polling: true});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  console.log(chatId);
  console.log(msg);
  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});

// Emptied the record

// Configure our HTTP server to respond all requests.

//Timer (Expired)
var timerExpired = null;
var timerCount = 7500;

var server = http.createServer(function (request, response) {

  var q = url.parse(request.url, true).query;
  //console.log(q);

  if(q.heartbeat ==1){
    //Wait for "data" receive event
    if(timerExpired == null){
      timerExpired = setTimeout(connectionDead,timerCount);
    }else{
      clearTimeout(timerExpired);
      timerExpired = setTimeout(connectionDead,timerCount);
    }
    
    if(!isAlive){
      console.log("Connection is alive" + request.url);
      bot.sendMessage(telegramId, "Client alive. The device is connected to the server");
    }
    isAlive = true;
    response.writeHead(200, {"Content-type":"text/plain"});
    response.end("Client connected to server");  

    return;
  }

  if(typeof q.reqEnter != 'undefined'){
    console.log("User Enter : "+q.reqEnter);
    verifyUser("Enter",q.reqEnter,response);
    return;
  }

  if(typeof q.reqExit != 'undefined'){
    console.log("User Exit : "+q.reqExit);
    verifyUser("Exit",q.reqExit,response);  
    return;
  }

  console.log("Unknown request!");
});



// Listen on port 8000
server.listen(port,host, function(){
  console.log("Listening " + host + ":" +port);
  if(timerExpired == null){
     timerExpired = setTimeout(connectionDead,timerCount);
  }else{
    clearTimeout(timerExpired);
    timerExpired = setTimeout(connectionDead,timerCount);
  }

  //bot.sendMessage(telegramId, "Listening" + host + ":" +port);
});

function connectionDead(){
  //No heart beat
  console.log("Client timeout");
  bot.sendMessage(telegramId, "Client timeout..The device is disconnected from the server");
  isAlive = false;
  //send message to telegram
}

/*// Function to get timestamp if necessary
function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + "/" + month + "/" + day + " @ " + hour + ":" + min + ":" + sec;
}*/

function verifyUser(action,uid,response){
  var auth = {
    authorization:0
  };

  connection.query('SELECT `id`,`name` FROM `users` WHERE `uid`= ?', [uid],function (error, results, fields) {
    if (error){
      console.log(error);
      response.writeHead(200, {"Content-type":"application/json"});
      response.end(JSON.stringify(auth)); 
      return 0;
    }
    if(results.length < 1){
      console.log("Records Found : 0");
      response.writeHead(200, {"Content-type":"application/json"});
      response.end(JSON.stringify(auth)); 
      return 0;
    }
    console.log("Records Found : "+results.length);
    console.log(results[0].name);
    auth.authorization = 1;
    response.writeHead(200, {"Content-type":"application/json"});
    response.end(JSON.stringify(auth));  

    updateLog(action,results[0].name);
  });
}

function updateLog(action,name){
  var date = new Date();
  bot.sendMessage(telegramId, date+" : ("+action+")"+name);
  var sql = "INSERT INTO log (action, name) VALUES (?,?)";
  connection.query(sql, [action,name],function (error, results, fields) {
    if (error){
      console.log(error);
      return;
    }
    console.log("Updated : "+results.insertId);    
  });
}