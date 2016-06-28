(function() {
	
	var fname = "public/notifications.log";

	var express = require('express');

	var http = require('http');
	var path = require('path');
	var faye = require("faye");
	var fs = require("fs");
	// var socketIO = require('socket.io');
	var app = express();
	var restify = require('restify');

	// all environments
	app.configure(function() {
		app.set('port', process.env.PORT || 3001);
	    app.use(app.router);
	    app.use(express.static(path.join(__dirname, 'public')));
	    return app.use("/components", express.static(path.join(__dirname, 'components')));

	});
		
	var server = http.createServer(app);
	server.listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port'));
	});


	// var io = socketIO.listen(server, {transports:['flashsocket', 'websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']});

	// io.sockets.on('connection', function (socket) {
	//   socket.emit('news', { hello: 'world' });
	//   socket.on('my other event', function (data) {
	//     console.log(data);
	//   });
	// });



	new faye.NodeAdapter({
		mount: '/faye',
		timeout: 45
	}).attach(server);

	// var socket = new faye.Client("http://localhost:" + (app.get("port")) + "/faye");

	// socket.subscribe("/event/buyer", function(cmd) {

	function writeFile(type, action) {
		var _name;
		
		var dataToWrite = "action";

		fs.exists("public/" + type, function(exists) {
			if (exists) {
				fs.appendFile("public/" + type, dataToWrite, function (err) {
					if (err) throw err;
					console.log('The ' + dataToWrite + ' was appended to file!');
				});
			} else {
				console.log("log doesn't exist");
				fs.writeFile("public/" + type, dataToWrite, { mode: 0777 }, function(err) {
				    if(err) {
				        console.log(err);
				    } else {
				        console.log("The file was saved!");
				    }
				}); 
			}
		});
	}

	function readFile(type, res) {
	 	//res.send('seller ' + req.params.name);
		
		fs.readFile("public/" + type, function (err, data) {
			if (err) throw err;
			console.log(data.toString('utf-8'));
			res.send(data.toString('utf-8'));

			fs.writeFile("public/" + type, "", { mode: 0777 }, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("The file was emptied!");
			    }
			});
		});
	}

	// function buyerRequest(req, res, next) {
	// 	res.send('buyer ' + req.params.name);
	// 	buyerReq(req.params.name);
	// }

	function actionHandler(req, res, next) {
		
		var action = req.params.event;
		
		if (action == "emailSent") {
			console.log("the email has been sent");
			res.send("success");
			writeFile("email", action);
		} else if (action == "bookingConfirmed") {
			console.log("the booking is confirmed");
			writeFile("booking", action);
			res.send("success");
		}

	}

	function requestHandler(req, res, next) {
		var request = req.params.action;

		if (request == "emailSent") {
			console.log("yes, the email has been sent");
			readFile("email", res);
		} else if (request == "bookingConfirmed") {
			console.log("yes, the booking is confirmed");
			readFile("booking", res);
		}
	}



	var restServer = restify.createServer({ name: "KAR Notification Server", version: "1.0.0" });
	
	restServer.get('/action/:event', actionHandler);
	restServer.head('/action/:event', actionHandler);

	restServer.get('/request/:action', requestHandler);
	restServer.head('/request/:action', requestHandler);	


	restServer.listen(8080, function() {
	  console.log('%s listening at %s', restServer.name, restServer.url);
	});
	// var socket2global;

	// var server2 = net.createServer(function(socket2) {

	// 	socket2global = socket2;
	// 	socket2.on("connect", function(client){
	// 	    console.log('new flash client connected')
	// 	});

	// 	var data_buffer = ''; 

	// 	socket2.on('data', function(data) {
	// 	    console.log('received data'+data);
	// 	    // do stuff with data 
	// 	});


	// });

	// server2.listen(1337, '127.0.0.1');

}).call(this);
