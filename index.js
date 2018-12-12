/*
*
*Start the server in nodejs
*
*/

//Dependencies

var http = require("http");
var url = require("url");
var fs = require("fs");

var StringDecoder = require('string_decoder').StringDecoder;

//Initialize HttpServer
var httpServer = http.createServer(function(request,response){
  //Parse the request
  var parsedUrl = url.parse(request.url,true);

  //Get path from parsed url
  var path = parsedUrl.pathname;

  // Remove unwanted data from url
  var trimmedUrl = path.replace(/^\/+|\/$/g,"");

  //Get the query string object
  var queryStringObject = parsedUrl.query;

  // Get the method of http request
  var method = request.method.toLowerCase();

  // Get headers from the requested API
  var headers = request.headers;

  //Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  //Event to catch Streamed data from request using request.on('data',fucnction(){}) event  and write it to buffer
  //Data event is called only when there is payload
  request.on('data',function(data){
    buffer += decoder.write(data);
  });
 //End event will be called every time at the end of the Stream
  request.on('end',function(){
    buffer += decoder.end();
    //Define choosenHandler
    var choosenHandler = typeof(router[trimmedUrl]) !== 'undefined' ? router[trimmedUrl] : handler.notfound;
    var data = {
      'trimmedPath' : trimmedUrl,
      'queryStringObject' : queryStringObject,
      'method' : method,
      'handler' : handler,
      'payload' : buffer
    }

    //Router the request to choosen  API
    choosenHandler(data,function(statusCode,payload){
      //Use the status code called back by the handler
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

      //Use the callback payload by the choosenHandler
      payload = typeof(payload) === 'object' ? payload : {};

      //Convert the payload to StringDecoder
      var payloadString = JSON.stringify(payload);

      //Return the response
      response.setHeader('content-Type','application/json');
      response.writeHead(statusCode);
      response.end(payloadString);
      console.log('Returning this response ', statusCode);
    });
  });
});

//HttpServer listening on httpPort
httpServer.listen(3000,function(){
  // console.log("listening on port "+config.httpPort);
  // console.log('working on environment  '+config.envName);
});


//Define handler
var handler = {};
//P handler
handler.hello = function(data,callback){
  callback(200,{"welcome message":"Hello,Welcome to my github assignment"});
};
//Create notfound handler
handler.notfound = function(data,callback){
  callback(404);
};
//Define router
var router = {
  'hello' : handler.hello
};
