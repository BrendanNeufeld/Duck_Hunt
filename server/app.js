// dependencies..
var socketio = require('socket.io'),
	express = require('express'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	os = require('os'),
	_ = require('underscore'),
	Backbone = require('backbone'),
	mongoose = require ("mongoose"),
	restify = require('restify'),
	async = require('async');

var config = {
	//io_transports : ['flashsocket'],
	io_transports : ['websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'jsonp-polling'],
	urls: {
        development: {
        	serverPort: 8080,
        	mongoDb: 'mongodb://localhost/DukHunt',
        	twitter: {
			    consumerKey: '',
			    consumerSecret: '',
			    redirect : 'redirect.html'
			}
        },
        production: {
        	serverPort: 27017,
        	mongoDb: 'mongodb://localhost/DukHunt',
        	twitter: {
			    consumerKey: '',
			    consumerSecret: '',
			    redirect : 'redirect.html'
			}
        },
        get: function(environment){
        	if (!environment){
        		
        		var environment = 'production';
        		var hostName = os.hostname();
        		
        		if(hostName.indexOf("local") > -1 || hostName.indexOf("dev")){
        			environment = 'development';
        		}else if(hostName.indexOf("staging") > -1){
        			environment = 'staging';
        		}else{
        			environment = 'production';
        		}
        	} 
            
            return this[environment];
        }
    },
	schemas : {
		userSchema : new mongoose.Schema({
			userName : {
				type : String,
				validate : /^[A-Za-z0-9 \._-]{3,20}$/
			},
			password : {
				type : String,
				validate : /^[A-Za-z0-9 -]{1,20}$/
			},
			login : String,
			socialId : Number,
			loggedIn: Boolean,
			type: String,
			registered: String,
			score: Number,
			ranking: Number,
			hits: Number
		}),
		defaults: {
			user: {
				userName : '',
				emailAddress : '',
				password : '',
				type : '',
				socialId : undefined,
				loggedIn: false,
				registered: false,
				score: 0,
				ranking: 0,
				hits: 0
			}
		}
	},
	staticText : {
		// English static text
		en : {
			
			email : {
				// sender info
				from : '',
				appName : '',
				mobileBodyCopy: ''
			},
		},
		// French static text
		fr : {
			email : {
				// sender info
				from : '',
				appName : '',
				mobileBodyCopy: ''
			},
		},
		get : function(lang) {
			if(!lang)	lang;
			return this[lang];
		}
	}
};

var models = {};

models.App = Backbone.Model.extend({
	defaults: {
		config: undefined,
		async: undefined,
		mongoose: undefined,
		express: undefined,
		io: {},
		restify: undefined,
		
		users: []
    },
	initialize: function(options){
		console.log("\n\r\n\rApp.initialize()");
		
		var that = this;
		
		var config = this.get('config');
		
		var mongoose = this.get('mongoose');
		var dbUrl = config.urls.get().mongoDb;
		var dbConnection;
		var userSchema = config.schemas.userSchema;
		var UserModel;

		var expressServer;
		var serverPort = config.urls.get().serverPort;
		var express = this.get('express');
		var httpServer;
		var socketio = this.get('socketio');
		var io;
		
		var rooms = new models.Rooms([], {});
		this.set('rooms', rooms);
		
		var restServer;
		var restify = this.get('restify');
		//var restServer = this.get('restify').createServer({ name: "KAR Notification Server", version: "1.0.0" });
	
		
		async.parallel([
		function(callback) {
			// create database connection and initialize models
			dbConnection = mongoose.createConnection(dbUrl, function(err, res) {
					if (err) {
						console.log('ERROR connecting to: ' + dbUrl + '. ' + err);
						callback(err, null);
					} else {
						console.log('Succeeded connected to: ' + dbUrl);
						
						UserModel = dbConnection.model('users', userSchema);
						that.set('UserModel', UserModel);
						UserModel.update({}, { loggedIn: false }, { multi: true }, function (err, numberAffected, raw) {
							if (err) {
								console.log('ERROR updating UserModel.loggedIn: ' + dbUrl + '. ' + err);
								callback(err, null);
							} else {
								callback(null, 'success');
								//that.updateLeaderboard(callback);
							}
						  	console.log('The number of updated documents was %d', numberAffected);
						  	console.log('The raw response from Mongo was ', raw);
						});
					}
				}, {server : {poolSize : 20}
			});
		},
		function(callback) {
			expressServer = express();
			// configure the express server
			expressServer.configure(function() {
				expressServer.set('port', process.env.PORT || serverPort);
				// expressServer.set('views', __dirname + '/views');
				// expressServer.set('view engine', 'jade');
				expressServer.use(express.favicon());
				// expressServer.use(express.logger('dev'));
				expressServer.use(express.bodyParser());
				// expressServer.use(express.methodOverride());
				// expressServer.use(express.cookieParser('your secret here'));
				// expressServer.use(express.session());
				// expressServer.use(expressServer.router);
				// expressServer.use(require('less-middleware')({ src: __dirname + '/public' }));
				expressServer.use(express.static(__dirname + '/public'));
			});
			expressServer.configure('development', function() {
				expressServer.use(express.errorHandler());
			});
			expressServer.get('/', function(req, res) {
				console.log('handling request for ' + req.url);
			});
			
			httpServer = http.createServer(expressServer).listen(expressServer.get('port'), function() {
				console.log("Express http server listening on port " + expressServer.get('port'));
				io = socketio.listen(httpServer);
				io.set('transports', config.io_transports);
				io.set('log level', 2);
				io.set('flash policy port', 843);
				that.set('io', io);
				callback(null, 'success');
			});
		},
		function(callback) {
			restServer = restify.createServer({ name: "KAR Notification Server", version: "1.0.0" });
			/*restServer.get('/action/:event', actionHandler);
			restServer.head('/action/:event', actionHandler);
		
			restServer.get('/request/:action', requestHandler);
			restServer.head('/request/:action', requestHandler);*/
			
			restServer.use(restify.CORS());
			restServer.use(restify.bodyParser());
		
			restServer.listen(8090, function() {
			  console.log('%s listening at %s', restServer.name, restServer.url);
			  callback(null, 'success');
			});
			//restServer.use(restify.bodyParser());
			
			
		}], function(err, results) {
			console.log('err: ',err,', results: ',results);
			
			restServer.get('/userName/:userName/password/:password', function(req, res, next){
				console.log('params: ',req.params);
				
			});
			
			restServer.get('/roomId/:roomId/userName/:userName', function(req, res, next){
				//var room = req.params.room;
				//var user = req.params.userId;
				console.log('params: ',req.params);
				
				//console.log('next: ',next)
				//return next(new restify.InvalidArgumentError("I just don't like you"));
				//return next(new restify.ConflictError("I just don't like you"));
				//that.joinRoom(req.params);
				
				/*res.send({
						type:'success',
						message: '',
						data: {
							value: 'stringvalue'
						}
					}
				);
				*/
				return that.joinRoom(req.params, function(err, room){
					//console.log('err: ',err,', room: ',room);
					if (err){
						res.send(err);
						return next(err);
					}else{
						//console.log('room:', room);
						res.send({
							result: "SUCCESS",
							room: room
						});
						return next();
					}
				});

				///res.send(err);
				/*if (action == "emailSent") {
					console.log("the email has been sent");
					res.send("success");
					writeFile("email", action);
				} else if (action == "bookingConfirmed") {
					console.log("the booking is confirmed");
					writeFile("booking", action);
					res.send("success");
				}*/
				//console.log('get');
			});
			restServer.head('/action/:event', function(req, res, next){
				console.log('get');
			});
		
			restServer.get('/request/:action', function(req, res, next){
				console.log('request');
			});
			restServer.head('/request/:action', function(req, res, next){
				console.log('request');
			});
			
			that.get('rooms').sockets = io.sockets;
			io.sockets.on('connection', function (socket) {
				
				//////////////////////
				// MOBILE APP CONNECTIONS
				//////////////////////
				
				//////////////////////
				// DESKTOP CONNECTIONS
				//////////////////////
				
				socket.on("CONNECT_DESKTOP", function(data, fn) {
					console.log('\r\n\DESKTOP CONNECTION: ', data);
					// data - lang, desktopUrl, 
					var roomId = rooms.generateRoomId();
					var roomIndex = that.get('rooms').length;
					
					that.get('rooms').add({
						
						index : roomIndex,
						id : roomId,
						registered : true,
						
						config: config,
						lang: data.lang,
						
						sockets: io.sockets,
						mobileAppSocket : socket,
						
						UserModel: UserModel
						
					});
					fn({
						index : roomIndex,
						id : roomId,
						registered : true
	
					});
				});
				
				
				socket.on("JOIN_ROOM", function(data, fn) {
					console.log('socket.on(JOIN_ROOM )',data);		
					
					//var roomId = data.roomId;
					
					
					that.joinRoom(data, fn);
					
					
					//console.log(that.get('rooms').models)
					/*
					if(room && !room.get('mobileSocket')){
						console.log('no mobile socket, add this mobile socket to the room!');
						room.mobileSocket(socket);
						
					}else if (room && room.get('mobileSocket')){
						console.log('There is a room but a mobile device is already connected!');
						room.get('mobileSocket').disconnect();
						room.mobileSocket(socket);
						// DISCONNECT THE OTHER MOBILE DEVICE AND CONNECT THIS ONE.
						
					}else{
						// NO ROOM
						console.log('There is no game with your game code!');

						socket.emit('MOBILE_CONNECTION_ERROR', {
							type : 'gameNotFound',
							description : 'There is no game with your game code!'
						});
					};
					*/
				});
				
				socket.on("CONNECT_MOBILE", function(data, fn) {
					/*console.log('CONNECT_MOBILE: user: '+data.userName+' connecting to room: ' + data.roomId);		
					
					var roomId = data.roomId;
					
					var room = _.find(that.get('rooms').models, function(room) {
						if ( typeof room.get('game') === 'undefined') {
							return undefined;
						}
						return room.get('game').gameCode == data.gameCode;
					}); 

					if(room && !room.get('mobileSocket')){
						console.log('no mobile socket, add this mobile socket to the room!');
						room.mobileSocket(socket);
						
					}else if (room && room.get('mobileSocket')){
						console.log('There is a room but a mobile device is already connected!');
						room.get('mobileSocket').disconnect();
						room.mobileSocket(socket);
						// DISCONNECT THE OTHER MOBILE DEVICE AND CONNECT THIS ONE.
						
					}else{
						// NO ROOM
						console.log('There is no game with your game code!');

						socket.emit('MOBILE_CONNECTION_ERROR', {
							type : 'gameNotFound',
							description : 'There is no game with your game code!'
						});
					};*/
				});
				
				/*socket.on("JOIN_ROOM", function(data, fn) {
					console.log('\r\n\JOIN_ROOM: roomId: ', data.roomId, ', userName: '+data.userName);
				});*/
				
				socket.on("CONNECT_MOBILE_APP", function(data, fn) {
					console.log('\r\n\MOBILE APP CONNECTION: ', data.lang);
					// data - lang, desktopUrl, 
					/*var roomId = data.roomId;
					var roomIndex = that.get('rooms').length;
					
					that.get('rooms').add({
						
						index : roomIndex,
						id : roomId,
						registered : true,
						
						config: config,
						lang: data.lang,
						
						sockets: io.sockets,
						mobileAppSocket : socket,
						
						UserModel: UserModel
s
					});
					
	
					socket.on("disconnect", function() {
						
						//////////////////////////////////////////////
						// Save Game, User and Swing data to data base
						//////////////////////////////////////////////
						
						var room = _.find(that.get('rooms').models, function(room) {
							return room.get('id') == socket.store.data.roomId;
						});

						var user = room.get('user');
						if ( typeof user !== 'undefined') {
							
							if(user.type == 'practice'){
								console.log('Practice user so remove it!');
								user.remove();
							}else{
								console.log('log user out!');
								user.loggedIn = false;
								user.save(function(err) {
									if (err) {
										console.log('user, Error on save: ', err);
									} else {
										console.log('disconnect user saved!');
									}
								});
							}
						}
						
						delete room.get('mobileAppSocket');
						room.set('mobileAppSocket', undefined);
						that.get('rooms').remove(room);
						
						console.log('mobileAppSocket.on(disconnect)');
	
					});
					delete roomId;
					delete roomIndex;	*/			
				}); 
	
			});
		});
	},
	response: function(data){
		
	},
	joinRoom: function(data, fn){
		console.log('joinRoom()', data);
		
		var that = this;
		var room = _.find(that.get('rooms').models, function(room) {
			if ( typeof room.get('id') === 'undefined') {
				return undefined;
			}
			return room.get('id') == data.roomId;
		});
		
		if(room){
			console.log('found your room!');
			/*console.log(room.get('leaderboard'))
			var roomUser = _.find(room.get('leaderboard'), function(roomUsr) {
				if ( typeof room.get('roomUsr') === 'undefined') {
					return undefined;
				}
				return roomUsr.get('userName') == data.userName;
			});*/
			var leaderboard = room.get('leaderboard');
			for(var i = 0; i < leaderboard.length; i++){
				if(leaderboard[i].userName == data.userName){
					console.log('match!');
				}
			}
			
			/*UserModel.find({
				'userName' : data.userName
			}).exec(function(err, result) {
				if (!err) {
					if (result.length < 1) {
						//callback(null, null);
						
					} 
				} else {
					//room.add()
					callback('userName', null);
				};
			});*/
			room.userInfoSubmit({
							userName : data.userName,
							emailAddress : '',
							password : 'password',
							type : '',
							socialId : 0,
							loggedIn: true,
							registered: true,
							score: 0,
							ranking: 0,
							hits: 0
						}, fn);
			//console.log('roomUser',roomUser)
			
			
			
		}else{
			//ERROR HANDLING FOR NOT FINDING ROOM!
			fn({
				result: "ERROR",
				type: 'REGISTRATION',
				message: 'Could not find your room'
			});
			console.log('could not find your room!');
		}
	}


}); 

models.Room = Backbone.Model.extend({
    defaults: {
    	
    	id: '',
    	index: '',
    	registered: false,
    	
    	config: config,
		lang: '',
		mobileAppUrl: '',
		
		app: undefined,
		mobileAppSocket: undefined,
		UserModel: undefined,	//	new UserModel(config.defaults.user)
		user: undefined,
		users: undefined,
		leaderboard: [],

		userId: ''
    },
	initialize: function(options){
		
		console.log("Room.initialize(), id:",this.get('id'),', index:',this.get('index'));
		if (!options.mobileAppSocket) throw "You need to supply a mobileAppSocket!";

		var that = this;
		var mobileAppSocket = options.mobileAppSocket;
		var app = options.app;
		var config = this.get('config');
		this.set('staticText', config.staticText.get(options.lang));
		
		mobileAppSocket.set(
			'roomIndex',
			options.index,
			function () {}
		);
		mobileAppSocket.set(
			'roomId',
			that.get('id'),
			function () {}
		);
		
		mobileAppSocket.set(
			'type',
			'desktop',
			function () {}
		);
		
		mobileAppSocket.on('GET_FACEBOOK_USER', function(data) {
			that.getFacebookUser(data);
		}); 
		
		mobileAppSocket.on('USER_INFORMATION_SUBMIT', function(data) {
			that.userInfoSubmit(data);
		});
		
		mobileAppSocket.on('USER_INFORMATION_LOGIN', function(data) {
			that.userInfoLogin(data);
		});
		
		mobileAppSocket.on('REMOVE_USER', function(user) {
			that.removeUser(user);
		});
		
		mobileAppSocket.on('UPDATE_SCORE', function(user) {
			that.updateScore(user);
		});
		
		mobileAppSocket.on('GET_REGISTERED_USERS', function(user) {
			that.updateRanking(user);
		});
		
		this.updateRanking();
		
		mobileAppSocket.emit('ROOM_READY', {
			id : that.get('id'),
			index : that.get('index')
		});

	},
	
	updateScore: function(user){
		console.log("Room.updateScore(), ",user);
		var that = this;
		var UserModel = this.get('UserModel');
		var mobileAppSocket = this.get('mobileAppSocket');
		UserModel.find({
					'userName' : user.userName
			}).exec(function(err, result) {
			if (!err) {
				if(result.length >0){
					result[0].score = user.score;
					//console.log('result: ',result);
					result[0].save(function(err){
						if(err){
							console.log('"updateScore" SAVE ERROR');
						}else{
							that.updateRanking();
						};
					});
				}
				
				
			} else {
				console.log('"UserModel" QUERY ERROR');
			};
		});
	},
	removeUser: function(user){
		console.log('Room.removeUser()', user);
		if(!user.userName)	return;
		var that = this;
		this.get('UserModel').find({userName: user.userName}).remove(function(){
			that.updateRanking();
		});
		
	},
	userInfoSubmit: function(data, fn){
		console.log('Room.userInfoSubmit(), data:', data);
		
		var that = this;
		var UserModel = this.get('UserModel');
		var mobileAppSocket = this.get('mobileAppSocket');

		async.parallel([
		function(callback) {
			console.log('check socialId');

			if (data.socialId != 0 && data.socialId != '0' && data.socialId != undefined) {
				UserModel.find({
					'socialId' : data.socialId
				}).exec(function(err, result) {
					if (!err) {
						if (result.length < 1) {
							callback(null, null);
						} else {

							callback(null, 'socialId');
						}
					} else {
						callback('socialId', null);
					};
				});
			}else{
				callback(null, null);
			}

		},
		function(callback) {
			UserModel.find({
				'userName' : data.userName
			}).exec(function(err, result) {
				if (!err) {
					if (result.length < 1) {
						callback(null, null);
					} else {
						callback(null, 'userName');
					}
				} else {
					callback('userName', null);
				};
			}); 
		}],
		function(err, results) {
			console.log('UserInfoSubmit(), results: ',results,', err: ',err);
			console.log('UserInfoSubmit()');
			var duplicates = [];
			//var that = this;
			
			for(var i = 0; i< results.length; i++){
				if(results[i] != null){
					duplicates.push(results[i]);
				}
			}
			//console.log('duplicates: ',duplicates);
			if (!duplicates.length) {
				console.log('no duplicates go ahead and save!', data);
				
				var userParams = {
					userName : data.userName,
					password : data.password,
					score : data.score,
					ranking : data.ranking,
					type : data.type,
					socialId : parseInt(Math.round(data.socialId)),
					loggedIn: true,
					registered: true,
					hits: 0
				};
				var user = new UserModel(userParams);
				
				user.save(function(err) {
					if (err) {
						console.log('user, Error on save: ',err);
						//mobileAppSocket.emit('REGISTRATION_ERROR', err);
					} else {
						console.log('saved!');
						that.set('user', user);
						delete userParams.password;
						//mobileAppSocket.emit('REGISTRATION_SUCCESS', userParams);
						//--that.addUser(userParams)
						that.updateRanking();
						var room = {
							leaderboard: that.get('leaderboard'),
							id: that.get('id')
						}
						
						fn(null, room);
						
						
				
						
					}
				});

			} else {
				console.log('not saved! duplicates: ',duplicates);
				
				fn({
					result: "ERROR",
					type: 'REGISTRATION',
					message: 'Not saved! Duplicates were found'
				});
				
				/*mobileAppSocket.emit('REGISTRATION_ERROR', {
					type : 'duplicateEntry',
					description : 'Duplicate Entries',
					values: results
				});*/
			}
		});
	},
	updateRanking: function(){
		console.log('Room.updateRanking()');
		
		var that = this;
		var UserModel = this.get('UserModel');
		var mobileAppSocket = this.get('mobileAppSocket');
		var leaderboard = [];
		//console.log('users',users);
		
		UserModel.find({}).exec(function(err, results) {
			//console.log('results', results);
			if (!err) {
				results.sort({score: -1});
				
				for(var i = 0; i < results.length; i++){
					//console.log('result',results[i]);
					results[i].ranking = i+1;
					results[i].save();
					leaderboard.push({
						userName: results[i].userName,
						score: results[i].score,
						ranking: results[i].ranking,
						hits: results[i].hits
					});
				}
				that.set('leaderboard', leaderboard);
				
				//console.log('leaderbord: ',that.get('leaderbord'));
				//mobileAppSocket.emit('REGISTRED_USERS', results);
			} else {
				console.log('"UserModel" QUERY ERROR');
			};
		});

	},
	userInfoLogin: function(data){
		console.log('Room.userInfoLogin()');
		
		var that = this;
		var UserModel = this.get('UserModel');
		var mobileAppSocket = this.get('mobileAppSocket');
		
		UserModel.find({
			'emailAddress' : data.emailAddress
		}).exec(function(err, result) {
			if (!err) {
				if (result.length < 1) {
					console.log('User doesnt exist in data base');
					
					that.get('mobileAppSocket').emit('LOGIN_ERROR', {
						type : 'emailAddressIncorrect',
						description : 'Wrong email!'
					});
					//that.get('mobileAppSocket').emit('LOGIN_ERROR', userParams);
				} else {
					console.log('User exists in data base, return all data');
					//console.log('result: ',result);
					//console.log('data: '+data)
					
					if(result[0].password != data.password){

						console.log('Wrong password');
						that.get('mobileAppSocket').emit('LOGIN_ERROR', {
							type : 'passwordIncorrect',
							description : 'Wrong password!'
						});

					}else{
						//console.log('Password matches');
						//console.log('user: ', result[0])
						that.checkLoggedInStatus(result);
					}
				}
			} else {
				console.log('Query error');
			};
		}); 
	},
	checkLoggedInStatus: function(result){
		console.log('checkLoggedInStatus');
		var that = this;
		var UserModel = this.get('UserModel');
		var mobileAppSocket = this.get('mobileAppSocket');
		
		UserModel.findById(result[0]._id, function(err, user) {
			if (!err) {
				//console.log('logged in: ', user.loggedIn);

				if (user.loggedIn) {
					console.log('user already logged in!');
					that.get('mobileAppSocket').emit('LOGIN_ERROR', {
						type : 'alreadyLoggedIn',
						description : 'You are already logged in!'
					});

				} else {
					//console.log('not logged in!')
					result[0].loggedIn = true;
					delete result[0].password;
					that.get('mobileAppSocket').emit('LOGIN_SUCCESS', result[0]);
				}
			}

			user.loggedIn = true;
			user.save();
			that.set('user', user);
		}); 

	},
	userInfo: function(user){
		console.log('Room.userInfo()');
		this.set('userInfo', new models.User(user));
		//console.log(this.get('userInfo'))
		
	},
	generateGameCode: function() {
		//console.log('Games.generateGameId()');
		var code = '';
		var alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789';
		while (code.length < 5) {
			var index = Math.round( Math.random() * (alphanum.length - 1) );
			code += alphanum.charAt(index);
		}
		//-->code = 'pe5fk';	// REMOVE!!!
		return code;
	},
	getFacebookUser: function(data){
		console.log('Room.getFacebookUser()');
		var that = this;
		var UserModel = this.get('UserModel');
		var mobileAppSocket = this.get('mobileAppSocket');

		UserModel.find({
			'socialId' : data.id
		}).exec(function(err, result) {
			if (!err) {
				if (result.length < 1) {
					mobileAppSocket.emit('FACEBOOK_USER_REGISTERATION_CREDENTIALS', data);
				} else {
					that.checkLoggedInStatus(result);
				}
			} else {
				mobileAppSocket.emit('REGISTRATION_ERROR', {type: 'queryError', description: 'getFacebookUser: socialId'});
			};
		});
	},
	roomReady: function(){
		var that = this;
		this.get('mobileAppSocket').emit('ROOM_READY', {
			id : that.get('id'),
			index : that.get('index')
		});
	}
});

models.Rooms = Backbone.Collection.extend({
	model: models.Room,
	initialize: function(){
		console.log('Rooms.initialize()');
		
		_(this).bindAll('add', 'remove', 'reset');

		this.on("add", function(room) {
		  console.log('Adding room with id: '+room.get('id'));
		});
	},
	generateRoomId: function() {
		console.log('Rooms.generateRoomId()');
		var code = '';
		var alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789';
		while (code.length < 5) {
			var index = Math.round( Math.random() * (alphanum.length - 1) );
			code += alphanum.charAt(index);
		}
		code = 'demo';	// REMOVE!!!
		return code;
	}
});


this.models = models;

// INITIALIZE MODELS
this.app = new this.models.App({
	config: config,
	async: async,
	mongoose: mongoose,
	express: express,
	socketio: socketio,
	restify: restify
});