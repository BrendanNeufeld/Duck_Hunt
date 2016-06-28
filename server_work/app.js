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
    colors: [
    	{
    		id: "yellow",
    		active: false,
    		uid: undefined
    	},
    	{
    		id: "red",
    		active: false,
    		uid: undefined
    	},
    	{
    		id: "green",
    		active: false,
    		uid: undefined
    	},
    	{
    		id: "magenta",
    		active: false,
    		uid: undefined
    	}
    ],
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
			hits: Number,
			roomId: String,
			active: Boolean,
			playerType: String,
			uid: Number,
			color: String,
			dead: Boolean
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
				hits: 0,
				roomId: '',
				active: false,
				playerType: 'hunter',
				uid: 0,
				color: '',
				dead: false
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
						UserModel.update({}, { loggedIn: false, active: false }, { multi: true }, function (err, numberAffected, raw) {
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
			
			restServer.get('userName/:userName/password/:password', function(req, res, next){
				console.log('params: ',req.params);
				
				var userParams = {
							userName : req.params.userName,
							emailAddress : '',
							password : req.params.password,
							type : '',
							socialId : 0,
							loggedIn: true,
							registered: true,
							score: 0,
							ranking: 0,
							hits: 0,
							roomId: '',
							active: false,
							playerType: 'hunter',
							color: ''
					};
					
				return that.userInfoSubmit(userParams, function(err, user){
					//console.log('err: ',err,', room: ',room);
					if (err){
						res.send(err);
						return next(err);
					}else{
						//console.log('room:', room);
						res.send({
							result: "SUCCESS",
							user: user
						});
						return next();
					}
				});
			});
			
			
			restServer.get('userName/:userName/roomId/:roomId/playerType/:playerType', function(req, res, next){
				console.log('params: ',req.params);
				
				return that.joinRoom(req.params, function(err, data){
					//console.log('err: ',err,', room: ',room);
					if (err){
						res.send(err);
						return next(err);
					}else{
						//console.log('room:', room);
						res.send({
							result: "SUCCESS",
							user: data
						});
						return next();
					}
				});
			});
			
			restServer.get('uid/:uid/hit/:duck', function(req, res, next){
				console.log('params: ',req.params);
				
				return that.registerHit(req.params, function(err, data){
					//console.log('err: ',err,', room: ',room);
					if (err){
						res.send(err);
						return next(err);
					}else{
						//console.log('room:', room);
						res.send({
							result: "SUCCESS",
							user: data
						});
						return next();
					}
				});
			});
			
			restServer.get('/leaveRoom/:uid', function(req, res, next){
				console.log('params: ',req.params);
				
				return that.leaveRoom(req.params, function(err, data){
					//console.log('err: ',err,', room: ',room);
					if (err){
						res.send(err);
						return next(err);
					}else{
						//console.log('room:', room);
						res.send({
							result: "SUCCESS",
							user: data
						});
						return next();
					}
				});
			});
			
			restServer.get('/uid/:uid/direction/:direction/score/:score', function(req, res, next){
				console.log('params: ',req.params);
				
				return that.flyDuck(req.params, function(err, data){
					//console.log('err: ',err,', room: ',room);
					if (err){
						res.send(err);
						return next(err);
					}else{
						//console.log('room:', room);
						res.send({
							result: "SUCCESS",
							user: data
						});
						//that.get('rooms').get(data.roomId)
						return next();
					}
				});
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
					var roomId;
					if(data.roomId){
						roomId = data.roomId;
					}else{
						roomId = rooms.generateRoomId();
					}
					var roomIndex = that.get('rooms').length;
					
					var room = _.find(that.get('rooms').models, function(room) {
						return room.get('id') == roomId;
					});
					
					if(room){
						room.flushUsers(function(){
							that.get('rooms').remove(room);
							//console.log(that.get('rooms'));
							that.get('rooms').add({
						
								index : roomIndex,
								id : roomId,
								registered : true,
								
								config: config,
								lang: data.lang,
								
								sockets: io.sockets,
								//mobileAppSocket : socket,
								desktopSocket: socket,
								
								UserModel: UserModel,
								
								colors: that.get('config').colors
								
							});
							fn({
								index : roomIndex,
								roomId: roomId,
								registered : true
			
							});
						});
					}else{
						that.get('rooms').add({
							
							index : roomIndex,
							id : roomId,
							registered : true,
							
							config: config,
							lang: data.lang,
							
							sockets: io.sockets,
							//mobileAppSocket : socket,
							desktopSocket: socket,
							
							UserModel: UserModel,
							colors: that.get('config').colors
							
						});
						fn({
							index : roomIndex,
							roomId: roomId,
							registered : true
		
						});
					}
					
					//console.log('room: ', room)
					
					socket.on("disconnect", function() {
						
						//////////////////////////////////////////////
						// Save Game, User and Swing data to data base
						//////////////////////////////////////////////
						console.log('disconnected, roomId: ', socket.store.data.roomId);
						var room = _.find(that.get('rooms').models, function(room) {
							return room.get('id') == socket.store.data.roomId;
						});
						
						if(room){
							room.flushUsers(function(){
								that.get('rooms').remove(room);
								console.log(that.get('rooms'));
							});
						}
						

					});
					
					console.log(that.get('rooms').models.length);
				});
				
				
				socket.on("JOIN_ROOM", function(data, fn) {
					console.log('socket.on(JOIN_ROOM )',data);
					that.joinRoom(data, fn);
				});
				
	
			});
		});
	},
	flyDuck: function(data, fn){
		console.log('flyDuck()',data)
		var UserModel = this.get('UserModel');
		var rooms = this.get('rooms');

		UserModel.find({
				'uid' : data.uid
			}).exec(function(err, result) {
				if (!err) {
					if (result.length < 1) {
						console.log('uid could NOT be found!');
						fn({
							result: "ERROR",
							type: 'FLY_DUCK',
							message: 'Could not find the user in the database, so user can not fly.'
						});
					}else{
						if(result[0].playerType != 'duck' || result[0].active == false){
							fn({
								result: "ERROR",
								type: 'FLY_DUCK',
								message: 'You are not a duck or you are not active in a room.'
							});
						}else{
							result[0].score = data.score;
							result[0].save(function(err){
								if(!err){
									var room = rooms.get(result[0].roomId);
									if(typeof room !== 'undefined') room.updateRanking();
									console.log('duck saved:', result[0]);
									room.get('desktopSocket').emit('DUCK_FLAP', {duck: result[0].color, direction: data.direction});
									fn(null, result[0]);
								}else{
									fn({
										result: "ERROR",
										type: 'SAVE',
										message: 'There was a problem saving the user.'
									});
								}
							});
						}
						
					}
				}else{
					fn({
						result: "ERROR",
						type: 'QUERY',
						message: 'There was a problem querying the database.'
					});
				}
			});

	},
	leaveRoom: function(data, fn){
		console.log('leaveRoom()',data);
		var UserModel = this.get('UserModel');
		var rooms = this.get('rooms');

		UserModel.find({
				'uid' : data.uid
			}).exec(function(err, result) {
				if (!err) {
					if (result.length < 1) {
						console.log('uid could NOT be found!');
						fn({
							result: "ERROR",
							type: 'LEAVE_ROOM',
							message: 'Could not find the user in the database, so there was no user to remove.'
						});
					}else{
						console.log('remove user from room: ', result[0].roomId);
						if(!result[0].active){
							fn({
								result: "ERROR",
								type: 'LEAVE_ROOM',
								message: 'The user is not active in a room'
							});
						}else{
							result[0].active = false;
							result[0].dead = false;
							//var color = result[0].color;
							
							result[0].save(function(err){
								if(!err){
									var room = rooms.get(result[0].roomId);
									if(room){
										
										if(result[0].playerType == "duck"){
											var colors = room.get('colors');
											for (var i = 0; i < colors.length; i++){
												if(colors[i].id == result[0].color){
													colors[i].active = false;
												}
											}
										}
										room.updateRanking();
									}
									
									
									fn(null, result[0]);
								}else{
									fn({
										result: "ERROR",
										type: 'SAVE',
										message: 'There was a problem saving the user.'
									});
								}
							});
						}
					}
				}else{
					fn({
						result: "ERROR",
						type: 'QUERY',
						message: 'There was a problem querying the database.'
					});
				}
			});
	},
	registerHit: function(data, fn){
		console.log('registerHit()', data);
		var that = this;
		var UserModel = this.get('UserModel');
		
		UserModel.find({
				'uid' : data.uid
			}).exec(function(err, result) {
				if (!err) {
					if (result.length < 1) {
						console.log('uid could NOT be found!');
						
						
					}else{
						console.log('found uid!');
						if(result[0].playerType != 'hunter' || result[0].active == false){
							fn({
								result: "ERROR",
								type: 'REGISTER_HIT',
								message: 'You are not a hunter or you are not active in a room.'
							});
							return;
						}
						result[0].hits += 1;
						result[0].score = result[0].hits;
						result[0].save(function(err) {
							if (err) {
								console.log('user, Error on save: ',err);
								//mobileAppSocket.emit('REGISTRATION_ERROR', err);
							} else {
								console.log('saved!');
								var room = _.find(that.get('rooms').models, function(room) {
									if ( typeof room.get('id') === 'undefined') {
										return undefined;
									}
									return room.get('id') == result[0].roomId;
								});
								if(room){
									console.log('duck: ',data.duck);
									console.log('roomId: ',room.get('id'));
									UserModel.find({'roomId':room.get('id'), 'color': data.duck }).exec(function(err, results) {
										if(results.length < 1){
											console.log('did NOT find a duck');
										}else{
											console.log('found a duck: ', results[0]);
											/*var colors = room.get('colors');
											for(var i=0; i<colors.length; i++){
												if(colors[i].id == data.duck){
													colors[i].active = false;
												}
											}*/
											//room.set('colors', colors);
											
											
											results[0].dead = true;
											results[0].save(function(err){
												room.updateRanking();
												that.leaveRoom({uid: results[0].uid}, function(){});
												room.get('desktopSocket').emit('HIT',{duck: data.duck});
												//return;
											});
											
											
											
										}
									});
									//room.updateRanking();
									//room.get('desktopSocket').emit('HIT',{duck: data.duck});
								}else{
									console.log('room could not be found');
								}
								console.log('callback');
								fn(null, result[0]);
							}
						});
						
						/*room.addUser(result[0], fn);
						that.userInfoSubmit({
							userName : data.userName,
							emailAddress : '',
							password : 'password',
							type : '',
							socialId : 0,
							loggedIn: true,
							registered: true,
							score: 0,
							ranking: 0,
							hits: 0,
							roomId: '',
							active: false,
							playerType: data.playerType,
							uid: result.length
						}, function(err, user){
							room.addUser(user, fn);
						});*/
					}
				} else {
					fn({
						result: "ERROR",
						type: 'QUERY',
						message: 'There was a problem querying the database.'
					});
				};
			});
		
	},
	joinRoom: function(data, fn){
		console.log('joinRoom()', data);
		
		var that = this;
		var UserModel = this.get('UserModel');
		var room = _.find(that.get('rooms').models, function(room) {
			if ( typeof room.get('id') === 'undefined') {
				return undefined;
			}
			return room.get('id') == data.roomId;
		});
		
		if(room){
			console.log('found your room!');
			
			if(data.playerType == "duck"){
				console.log('playerType is: duck!');
				var colors = room.get('colors');
				console.log('colors: ',colors);
				var colorAvailable = false;
				for (var i = 0; i< colors.length; i++){
					if(colors[i].active == false){
						data.color = colors[i].id;
						colors[i].active = true;
						colorAvailable = true;
						break;
					}
				}
				if(!colorAvailable){
					fn({
						result: "ERROR",
						type: 'REGISTARTION',
						message: 'There are no ducks (colors) availble.'
					});
					return;
				}
			}else{
				data.color = '';
			}
			console.log('data.color: ',data.color);
			
			UserModel.find({
				'userName' : data.userName
			}).exec(function(err, result) {
				if (!err) {
					if (result.length < 1) {
						
						console.log('user is NOT registered!');
						that.userInfoSubmit({
							userName : data.userName,
							emailAddress : '',
							password : 'password',
							type : 'custom',
							socialId : 0,
							loggedIn: true,
							registered: true,
							score: 0,
							ranking: 0,
							hits: 0,
							roomId: '',
							active: false,
							playerType: data.playerType,
							uid: undefined,
							color: data.color,
							dead: false
						}, function(err, user){
							room.addUser(user, fn);
						});
						
					}else{
						console.log('user is registered!');
						result[0].color = data.color;
						result[0].playerType = data.playerType;
						
						room.addUser(result[0], fn);
					}
				} else {
					fn({
						result: "ERROR",
						type: 'QUERY',
						message: 'There was a problem querying the database.'
					});
				};
			});
			
			
			
		}else{
			//ERROR HANDLING FOR NOT FINDING ROOM!
			fn({
				result: "ERROR",
				type: 'REGISTRATION',
				message: 'Could not find your room'
			});
			console.log('could not find your room: '+data.roomId);
		}
	},
	userInfoSubmit: function(data, fn){
		console.log('App.userInfoSubmit(), data:', data);
		
		var that = this;
		var UserModel = this.get('UserModel');

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
				
				var uid;
				UserModel.find({}).exec(function(err, results){
					if (!err) {
						uid = results.length;
						var userParams = {
						userName : data.userName,
						password : data.password,
						score : data.score,
						ranking : data.ranking,
						type : data.type,
						socialId : parseInt(Math.round(data.socialId)),
						loggedIn: true,
						registered: true,
						hits: 0,
						roomId: '',
						active: false,
						playerType: data.playerType,
						uid: uid,
						color: data.color,
						dead: false
					};
					var user = new UserModel(userParams);
					
					user.save(function(err) {
						if (err) {
							console.log('user, Error on save: ',err);
							//mobileAppSocket.emit('REGISTRATION_ERROR', err);
						} else {
							console.log('saved!');
							that.set('user', user);
							fn(null, user);
						}
					});
						
						
					}else{
						fn({
							result: "ERROR",
							type: 'QUERY',
							message: 'There was a problem querying the database.'
						});
						return;
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
	}/*,
	updateRanking: function(){
		console.log('App.updateRanking()');
		
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');
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

	}*/


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
		desktopSocket: undefined,
		UserModel: undefined,	//	new UserModel(config.defaults.user)
		user: undefined,
		users: undefined,
		leaderboard: [],
		duckLeaderboard: [],
		hunterLeaderboard: [],
		hunters: [],
		ducks: [],
		colors: [],

		userId: ''
    },
	initialize: function(options){
		
		console.log("Room.initialize(), id:",this.get('id'),', index:',this.get('index'));
		
		if (!options.desktopSocket) throw "You need to supply a desktopSocket!";

		var that = this;
		var desktopSocket = options.desktopSocket;
		var app = options.app;
		var config = this.get('config');
		this.set('staticText', config.staticText.get(options.lang));
		this.set('colors', config.colors);
		var colors = this.get('colors');
		
		
		for (var i=0; i<colors.length; i++){
			colors[i].active = false;
		}
		
		console.log('colors: ',this.get('colors'));
		console.log('config.colors: ',this.get('config').colors);
		
		desktopSocket.set(
			'roomIndex',
			options.index,
			function () {}
		);
		desktopSocket.set(
			'roomId',
			that.get('id'),
			function () {}
		);
		
		desktopSocket.set(
			'type',
			'desktop',
			function () {}
		);
		
		desktopSocket.on('GET_FACEBOOK_USER', function(data) {
			that.getFacebookUser(data);
		}); 
		
		desktopSocket.on('USER_INFORMATION_SUBMIT', function(data) {
			that.userInfoSubmit(data);
		});
		
		desktopSocket.on('USER_INFORMATION_LOGIN', function(data) {
			that.userInfoLogin(data);
		});
		
		desktopSocket.on('REMOVE_USER', function(user) {
			that.removeUser(user);
		});
		
		desktopSocket.on('UPDATE_SCORE', function(user) {
			that.updateScore(user);
		});
		
		desktopSocket.on('GET_REGISTERED_USERS', function(user) {
			that.updateRanking(user);
		});
		
		this.updateRanking();
		
		desktopSocket.emit('ROOM_READY', {
			roomId : that.get('id'),
			index : that.get('index')
		});

	},
	flushUsers: function(fn){
		console.log('room.flushUsers()');
		var that = this;
		this.get('UserModel').find({roomId: that.get('id')}).exec(function(err, results) {
			//console.log('results', results);
			if (!err) {
				for (var i = 0; i < results.length; i++){
					results[i].active = false;
					results[i].dead = false;
					results[i].save();
				}
				fn();
				
			}else{
				fn({
					result: "ERROR",
					type: "QUERY",
					message: "There was a problem querying the database."
				});
			}
		});
	},
	addUser: function(user, fn){
		//console.log('room.addUser()',user);
		console.log('room.addUser()');
		var that = this;
		var colors = that.get('colors');
		
		if(user.active){
				fn({
					result: "ERROR",
					type: "JOIN_ROOM",
					message: "You are already in room: "+user.roomId
				});
			}else{
				user.active = true;
				user.roomId = that.get('id');
				user.dead = false;
				/*
				var colors = that.get('colors');
				var colorAvailable = false;
				for (var i = 0; i< colors.length; i++){
					if(colors[i].active == false){
						data.color = colors[i].id;
						colors[i].active = true;
						colorAvailable = true;
						break;
					}
				}
				*/
				user.save(function(err){
					if(err){
							fn({
							result: "ERROR",
							type: 'SAVE',
							message: 'There was a problem saving the database.'
						});
					}else{
						that.updateRanking();
						
						if(user.playerType == "duck"){
							console.log('addUser: ',user.userName);
							that.get('desktopSocket').emit('DUCK_SPAWN', {duck_color: user.color, flag_label: user.userName});
						}
						
						//console.log(that.get('desktopSocket'));
						console.log('user added!');
						fn({
							result: "SUCCESS",
							user: {
								userName : user.userName,
								score : user.score,
								ranking : user.ranking,
								hits: user.hits,
								roomId: user.roomId,
								playerType: user.playerType,
								color: user.color,
								uid: user.uid
							}
						});
						
					};
				});
			};
						
	},
	updateRanking: function(){
		console.log('Room.updateRanking()');
		
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');
		var leaderboard = [];
		var hunterLeaderboard = [];
		var duckLeaderboard = [];
		
		//console.log('users',users);
		
		UserModel.find({roomId: that.get('id'), playerType: 'hunter', active: true}).exec(function(err, results) {
			//console.log('results', results);
			if (!err) {
				results.sort({score: -1});
				
				for(var i = 0; i < results.length; i++){
					//console.log('result',results[i]);
					results[i].ranking = i+1;
					results[i].save();
					hunterLeaderboard.push({
						userName: results[i].userName,
						score: results[i].score,
						ranking: results[i].ranking,
						hits: results[i].hits,
						playerType: results[i].playerType,
						uid: results[i].uid,
						active: results[i].active
					});
					
					
					
				}
				that.set('hunterLeaderboard', hunterLeaderboard);
				desktopSocket.emit('HUNTER_LEADERBOARD_UPDATE', hunterLeaderboard);
			} else {
				fn({
					result: "ERROR",
					type: 'QUERY',
					message: 'There was a problem querying the database.'
				});
			};
		});
		
		var colors = this.get('colors');
		
		/*
		for (var i = 0; i < colors.length; i++){
			colors[i].active = false;
		}
		*/
		UserModel.find({roomId: that.get('id'), playerType: 'duck', active: true}).exec(function(err, results) {
			//console.log('results', results);
			if (!err) {
				results.sort({score: -1});
				
				for(var i = 0; i < results.length; i++){
					//console.log('result',results[i]);
					results[i].ranking = i+1;
					results[i].save();
					duckLeaderboard.push({
						userName: results[i].userName,
						score: results[i].score,
						ranking: results[i].ranking,
						hits: results[i].hits,
						playerType: results[i].playerType,
						uid: results[i].uid,
						color: results[i].color,
						active: results[i].active,
						dead: results[i].dead
					});
					/*
					for(var i = 0; i< colors.length; i++){
						if(colors[i].id == results[0].color){
							colors[i].active = true;
						}
					}
					*/
				}
				that.set('duckLeaderboard', duckLeaderboard);
				desktopSocket.emit('DUCK_LEADERBOARD_UPDATE', duckLeaderboard);
			} else {
				fn({
					result: "ERROR",
					type: 'QUERY',
					message: 'There was a problem querying the database.'
				});
			};
		});
	},
	updateScore: function(user){
		console.log("Room.updateScore(), ",user);
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');
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
	userInfoLogin: function(data){
		console.log('Room.userInfoLogin()');
		
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');
		
		UserModel.find({
			'emailAddress' : data.emailAddress
		}).exec(function(err, result) {
			if (!err) {
				if (result.length < 1) {
					console.log('User doesnt exist in data base');
					
					that.get('desktopSocket').emit('LOGIN_ERROR', {
						type : 'emailAddressIncorrect',
						description : 'Wrong email!'
					});
					//that.get('desktopSocket').emit('LOGIN_ERROR', userParams);
				} else {
					console.log('User exists in data base, return all data');
					//console.log('result: ',result);
					//console.log('data: '+data)
					
					if(result[0].password != data.password){

						console.log('Wrong password');
						that.get('desktopSocket').emit('LOGIN_ERROR', {
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
		var desktopSocket = this.get('desktopSocket');
		
		UserModel.findById(result[0]._id, function(err, user) {
			if (!err) {
				//console.log('logged in: ', user.loggedIn);

				if (user.loggedIn) {
					console.log('user already logged in!');
					that.get('desktopSocket').emit('LOGIN_ERROR', {
						type : 'alreadyLoggedIn',
						description : 'You are already logged in!'
					});

				} else {
					//console.log('not logged in!')
					result[0].loggedIn = true;
					delete result[0].password;
					that.get('desktopSocket').emit('LOGIN_SUCCESS', result[0]);
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
		var desktopSocket = this.get('desktopSocket');

		UserModel.find({
			'socialId' : data.id
		}).exec(function(err, result) {
			if (!err) {
				if (result.length < 1) {
					desktopSocket.emit('FACEBOOK_USER_REGISTERATION_CREDENTIALS', data);
				} else {
					that.checkLoggedInStatus(result);
				}
			} else {
				desktopSocket.emit('REGISTRATION_ERROR', {type: 'queryError', description: 'getFacebookUser: socialId'});
			};
		});
	},
	roomReady: function(){
		var that = this;
		this.get('desktopSocket').emit('ROOM_READY', {
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