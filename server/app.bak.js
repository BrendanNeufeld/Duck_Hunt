// dependencies..
var socketio = require('socket.io'),
	express = require('express'),
	http = require('http'),
	url = require('url'),
	fs = require('fs'),
	os = require('os'),
	_ = require('underscore'),
	Backbone = require('backbone'),
	twitterAPI = require('node-twitter-api'),
	mongoose = require ("mongoose"),
	async = require('async'),
	nodemailer = require('nodemailer');

var config = {
	io_transports : ['websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'jsonp-polling'],
	twitter: {
		    consumerKey: '',
		    consumerSecret: '',
		    redirect : 'redirect.html'
	},
	urls: {
        development: {
        	serverPort: 8080,
        	mongoDb: 'mongodb://localhost/DukHunt'
        },
        staging: {
        	serverPort: 8080,
        	mongoDb: 'mongodb://localhost/DukHunt'
        },
        production: {
        	serverPort: 27017,
        	mongoDb: 'mongodb://localhost/DukHunt'
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
			firstName : {
				type : String,
				validate : /^[A-Za-z0-9 -]{1,20}$/,
				trim : true
			},
			lastName : {
				type : String,
				validate : /^[A-Za-z0-9 -]{1,20}$/,
				trim : true
			},
			userName : {
				type : String,
				validate : /^[A-Za-z0-9 \._-]{3,20}$/
			},
			emailAddress : {
				type : String,
				validate : /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
			},
			password : {
				type : String,
				validate : /^[A-Za-z0-9 -]{1,20}$/
			},
			login : String,
			socialId : Number,
			gameId: String,
			loggedIn: Boolean,
			gameCode: String,
			type: String,
			registered: String
		}),
		gameSchema : new mongoose.Schema({
			gameCode: String,
			swingTotal: Number,
			hitTotal: Number,
			strikeTotal: Number,
			maxDistance: Number,
			ranking: Number,
			discount: Number,
			swings: Array,
			swingsAllowed: Number,
			remainingSwings: Number,
			complete: Boolean,
			sharesAllowed: Number,
			sharesTotal: Number,
			shareAdditionalSwings: Number,
			
			practiceSharesAllowed: Number,
			practiceGameRanking: Number,
			proGameRanking: Number,
			
			practiceSwings: Array,
			practiceSwingTotal: Number,
			practiceSwingsAllowed: Number,
			practiceRemainingSwings: Number,
			practiceSwingsComplete: Boolean,
			practiceHitTotal: Number,
			practiceStrikeTotal: Number,
			practiceMaxDistance: Number,
			
			firstName: String,
			lastName: String,
			userName: String,
			userId: String,
			active: Boolean,
			registered: Boolean,
			type: String
		}),
		supportSchema : new mongoose.Schema({
			mobileBrowser: String,
			userAgent: String,
			vendor: String,
			deviceMotionSupport: String,
			deviceOrientationSupport: String,
			url: String
		}),
		swingSchema : new mongoose.Schema({
			firstName: String,
			lastName: String,
			userName: String,
			userId: String,
			gameId: String,
			type: String,
			result: String,
			bat: Number,
			description: String
		}),
		defaults: {
			user: {
				firstName : '',
				lastName : '',
				userName : '',
				emailAddress : '',
				password : '',
				type : '',
				socialId : undefined,
				gameId: undefined,
				loggedIn: false,
				gameCode: '',
				registered: false
			},
			game: {
				gameCode: '',
				swingTotal: 0,
				hitTotal: 0,
				strikeTotal: 0,
				maxDistance: 0,
				ranking: 0,
				discount: 0,
				swings: [],
				swingsAllowed: 3,
				remainingSwings: 3,
				complete: false,
				sharesAllowed: 3,
				sharesTotal: 0,
				shareAdditionalSwings: 3,
				
				practiceSharesAllowed: 0,
				practiceGameRanking: 0,
				proGameRanking: 0,
				
				practiceSwings: [],
				practiceSwingTotal: 0,
				practiceSwingsAllowed: 1,
				practiceSwingsComplete: false,
				practiceHitTotal: 0,
				practiceStrikeTotal: 0,
				practiceMaxDistance: 0,
				practiceRemainingSwings: 3,
				
				firstName: '',
				lastName: '',
				userName: '',
				userId: undefined,
				active: false,
				registered: false,
				type: 'pro',
				page: undefined
			},
			swing: {
				distance: 0,
				discount: 0,
				maxSample: {},
				result: 'miss',
				bat: 0,
				description: ''
			}
			
		}
	},
	staticText : {
		en : {
			
			email : {
				// sender info
				from : '<sluggerSupport@taxi.com>',
				appName : 'The Priceless Bat',
				mobileBodyCopy: 'Click this url on your mobile device.'
			},
		},
		fr : {

		},
		get : function(lang) {
			if(!lang)	lang
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
		nodemailer: undefined,
		
		io: {},
		users: [],
		games: [],
		pitches: [],
		twitter: undefined,
		twitterAPI: undefined,
		mailTransport: undefined
    },
	initialize: function(options){
		console.log("\n\r\n\rApp.initialize()");
		
		var that = this;
		
		var config = this.get('config');
		
		var mongoose = this.get('mongoose');
		var dbUrl = config.urls.get().mongoDb;
		var dbConnection;
		var userSchema = config.schemas.userSchema;
		var gameSchema = config.schemas.gameSchema;
		var swingSchema = config.schemas.swingSchema;
		var supportSchema = config.schemas.supportSchema;
		var UserModel;
		var GameModel;
		var SwingModel;
		var SupportModel;

		var expressServer;
		var serverPort = config.urls.get().serverPort;
		var express = this.get('express');
		var httpServer;
		var socketio = this.get('socketio');
		var io;
		
		var mailTransport;
		var twitterAPI = this.get('twitterAPI');
		
		var rooms = new models.Rooms([], {});
		this.set('rooms', rooms);
		
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
						GameModel = dbConnection.model('games', gameSchema);
						that.set('GameModel', GameModel);
						SupportModel = dbConnection.model('deviceSupport', supportSchema);
						that.set('SupportModel', SupportModel);

						UserModel.update({}, { loggedIn: false }, { multi: true }, function (err, numberAffected, raw) {
							if (err) {
								console.log('ERROR updating UserModel.loggedIn: ' + dbUrl + '. ' + err);
								callback(err, null);
							} else {
								//callback(null, 'success');
								that.updateLeaderboard(callback);
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
				that.set('io', io);
				callback(null, 'success');
			});
		},
		function(callback) {
			
			mailTransport = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");
			callback(null, 'success');
		
		}], function(err, results) {
			//console.log('err: ',err,', results: ',results);
			that.get('rooms').sockets = io.sockets;
			io.sockets.on('connection', function (socket) {
				
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
						desktopUrl: data.desktopUrl,
						mobileUrl: data.mobileUrl,
						
						sockets: io.sockets,
						desktopSocket : socket,
						twitterAPI: twitterAPI,
						mailTransport: mailTransport,
						
						UserModel: UserModel,
						GameModel: GameModel,
						SupportModel: SupportModel
						
					});
					fn({
						index : roomIndex,
						id : roomId,
						registered : true
	
					});
	
					socket.on("disconnect", function() {
						
						//////////////////////////////////////////////
						// Save Game, User and Swing data to data base
						//////////////////////////////////////////////
						
						//-->mongoose.connection.close();
						//typeof socket.store.data.roomi !== 'undefined'
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
						
						var game = room.get('game');
						if ( typeof game !== 'undefined') {
							
							if(game.type == 'practice'){
								console.log('----------------------->Practice game so remove it!');
								game.remove();
							}else{
								console.log('----------------------->Pro game so save game!');
								game.active = false;
								game.save(function(err) {
									if (err) {
										console.log('game, Error on save: ', err);
									} else {
										console.log('disconnect: game saved!');
									}
								});
							}
						}

						if(typeof room.get('mobileSocket') !== 'undefined'){
							room.get('mobileSocket').disconnect();
							delete room.get('mobileSocket');
							room.set('mobileSocket', undefined);
						}
						
						delete room.get('desktopSocket');
						room.set('desktopSocket', undefined);
						that.get('rooms').remove(room);
						
						console.log('desktopSocket.on(disconnect)');
	
					});
					delete roomId;
					delete roomIndex;				
				});
				
				 socket.on("MOBILE_DATA", function(data) {
				 	console.log('MOBILE_DATA: ', data);

				 	var deviceSupport = new SupportModel(data);
					deviceSupport.save(function (err) {
					  if (err){
					  	
					  } else{
					  	console.log('device data saved!');
					  }
					  
					});
				 	/*
					var games = GameModel.find({});
					games.sort({
						maxDistance : -1
					})
					games.exec(function(err, results) {
						if (err) {
							
						} else {
							fn({results: results});
						}
					});
					*/
				 });
				 
				 
				socket.on("CONNECT_MOBILE", function(data, fn) {
					console.log('CONNECT_MOBILE: mobile client connecting with gameCode: ' + data.gameCode);				

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
					};
				}); 
	
			});
		});
	},
	updateLeaderboard: function(updateCallback){
		console.log('App.updateLeaderboard()');
		
		var that = this;
		var rooms = this.get('rooms');
		
		var practiceGameQuery = this.get('GameModel').find({type: 'practice'}).remove();
		var practiceUserQuery = this.get('UserModel').find({type: 'practice'}).remove();
		
		var functions = [];
		var rankingQuery = this.get('GameModel').find({type: 'pro'});
		//var rankingQuery = this.get('GameModel').find({type: 'pro'});
		rankingQuery.sort({maxDistance: -1});
		rankingQuery.exec(function(err, results) {
			if (err){
				if(updateCallback)	updateCallback('error', null);
			}else{
				
				for(var i = 0; i < results.length; i++){
					
					results[i].proGameRanking = results[i].ranking = results[i].practiceGameRanking = i+1;
					
					if(results[i].type == 'practice'){
						console.log('---------------->Practice GAme!!!!!!!!');
					}
					//results[i].ranking = i+1;
					//results[i].practiceGameRanking = i+1;
					//results[i].proGameRanking = i+1;
					
					functions.push((function(result) {
						return function(callback) {
							//result.save(callback);
							result.save(function(err){
								if(err){
									callback('error', null);
								}else{
									callback(null, result);
								};
							});
						};
					})(results[i]));
				}
				async.parallel(functions, function(err, results) {
					//console.log(err);
					//console.log('results: ',results);
					if(err){
						// ADD ERRORHANDLING!
						if (updateCallback) {
							updateCallback(err, null);
						} else {
							return err;
						};
					}else{
						if (updateCallback) {
							//rooms.updateRanking(results);
							updateCallback(null, results);
						} else {
							return results;
						};
					}
				}); 
			};
		});
	}
}); 


models.Room = Backbone.Model.extend({
    defaults: {
    	
    	id: '',
    	index: '',
    	registered: false,
    	
    	config: config,
		lang: '',
		desktopUrl: '',
		
		app: undefined,
		desktopSocket : undefined,
		mobileSocket: undefined,
		twitterAPI: undefined,
		mailTransport: undefined,
		
		UserModel: undefined,	//	new UserModel(config.defaults.user)
		GameModel: undefined,
		game: undefined,
		user: undefined,

		twitter: undefined,
		twitterRequestToken: undefined,
		twitterRequstTokenSecret: undefined,
		twitterResults: undefined,

		gameId: '',
		userId: ''
    },
	initialize: function(options){
		
		console.log("Room.initialize(), id: ",this.get('id'),', index: ',this.get('index'));
		if (!options.desktopSocket) throw "You need to supply a desktopSocket!";
		_(this).bindAll('getTwitterRequestToken', 'getTwitterAccessToken');
		
		var that = this;
		var desktopSocket = options.desktopSocket;
		var app = options.app;
		var config = this.get('config');
		this.set('staticText', config.staticText.get(options.lang));
		
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

		this.set('twitter', new twitterAPI({
		    consumerKey: config.twitter.consumerKey,
		    consumerSecret: config.twitter.consumerSecret,
		    callback: this.get('desktopUrl') + config.twitter.redirect
		}));
		
		desktopSocket.on('GET_FACEBOOK_USER', function(data) {
			that.getFacebookUser(data);
		}); 

		desktopSocket.on('GET_TWITTER_OATH_TOKEN', function(data) {
			that.getTwitterRequestToken();
		}); 

		desktopSocket.on('TWITTER_SESSION_VARS', function(data) {
			that.getTwitterAccessToken(data);
		});
		
		desktopSocket.on('USER_INFORMATION_SUBMIT', function(data) {
			that.userInfoSubmit(data);
		});
		
		desktopSocket.on('USER_INFORMATION_LOGIN', function(data) {
			that.userInfoLogin(data);
		});
		
		desktopSocket.on('EMAIL_PASSWORD', function(data) {
			that.emailPassword(data);
		});
		
		desktopSocket.on('PLAY_GAME', function(data) {
			that.playGame(data);
		});
		
		desktopSocket.on('COUNTDOWN_START', function(data){
			that.countdownStart(data);
		});
		
		desktopSocket.on('PITCH_COMPLETE', function(data){
			that.pitchComplete(data);
		});
		
		desktopSocket.on('HIT_COMPLETE', function(hit) {
			that.hitComplete(hit);
		});
		
		desktopSocket.on('GAME_SHARED', function(data) {
			that.gameShared(data);
		});
		
		desktopSocket.on('PRACTICE_USER_INFORMATION_SUBMIT', function(data) {
			that.practiceUserInfoSubmit(data);
		});

		//console.log('Room.initialize() - calling Room.updateLeaderboard()')
		this.updateLeaderboard(function(){
			desktopSocket.emit('ROOM_READY', {
				id : that.get('id'),
				index : that.get('index')
			});
		});

	},
	mobileSocket: function(socket){
		console.log('room.mobileSocket()');
		//console.log(this.get('game').gameCode)
		var that = this;
		socket.set('roomIndex', that.get('index'), function() {
		});
		socket.set('roomId', that.get('id'), function() {
		});

		socket.set('type', 'mobile', function() {
		});
		
		socket.on('BAT_SELECTED', function(bat) {
			console.log('BAT_SELECTED: ', bat);
			that.get('desktopSocket').emit('BAT_SELECTED', bat);
			that.get('desktopSocket').emit('GAME_START', that.get('game'));
		});
		
		socket.on('SWING_READY', function(data) {
			//that.get('desktopSocket').emit('SWING_READY', data);
			that.get('desktopSocket').emit('PITCH_START');
			socket.emit('PITCH_START');
		});
		
		socket.on('SWING_COMPLETE', function(swing) {
			that.analyseSwing(swing);
		});

		socket.on('DEBUG_MOBILE', function(msg) {
			console.log('DEBUG_MOBILE: ', msg);
			that.get('desktopSocket').emit('DEBUG_MOBILE', msg);
		});
		
		this.set('mobileSocket', socket);
		
		var data = {
			roomId : that.get('id'),
			roomIndex : that.get('index'),
			gameCode: that.get('game').gameCode
		};
		
		socket.emit('ROOM_READY', data);
		
		this.get('desktopSocket').emit('MOBILE_CONNECT', data);
		
		var game = this.get('game');

		if (game.swingTotal >= game.swingsAllowed) {
			//desktopSocket.emit('GAME_COMPLETE_SHARE', game);
			//console.log('game.sharesTotal: ',game.sharesTotal,' game.sharesAllowed: ',game.sharesAllowed)
			if (game.sharesTotal < game.sharesAllowed) {
				this.get('desktopSocket').emit('GAME_COMPLETE_SHARE', game);
				socket.emit('GAME_COMPLETE_SHARE', game);
			} else {
				this.get('desktopSocket').emit('GAME_COMPLETE', game);
				socket.emit('GAME_COMPLETE_SHARE', game);
			}

		} else {
			this.get('desktopSocket').emit('PITCH_READY', game);
		}
	},
	updateLeaderboard: function(updateCallback){
		console.log('Room.updateLeaderboard()');
		//console.log(this.collection.models)
		
		var that = this;
		var sockets = this.get('sockets');
		
		// each room is a part of a 'rooms' collection, stored in its collection property
		var collection = this.collection;
		var functions = [];
		
		// return all active/inactive games for leaderboard
		var rankingQuery = this.get('GameModel').find({});
		
		// sort the games according to their maxDistance
		rankingQuery.sort({maxDistance: -1});
		
		rankingQuery.exec(function(err, results) {
			if (err){
				if(updateCallback)	updateCallback('error', null);
			}else{
				
				// loop through the sorted rankingQuery
				var proRanking = 1;
				
				for(var i = 0; i < results.length; i++){

					if(results[i].type == 'practice'){
						results[i].practiceGameRanking = i+1;
					}else{
						results[i].practiceGameRanking = i+1;
						results[i].proGameRanking = proRanking;
						proRanking +=1;
					}
					functions.push((function(result) {
						return function(callback) {
							//result.save(callback);
							result.save(function(err){
								if(err){
									callback('error', null);
								}else{
									callback(null, result);
								};
							});
						};
					})(results[i]));
				}
				async.parallel(functions, function(err, results) {
					
					if(err){
						// ADD ERRORHANDLING!
						if (updateCallback) {
							updateCallback(err, null);
						} else {
							return err;
						};
					}else{
						if (updateCallback) {
							//if(that.get('io') !== 'undefined')	io.sockets.emit('LEADERBOARD_UPDATE', results);
							collection.updateRanking(results, updateCallback);
							//updateCallback(null, results);
						} else {
							return results;
						};
					}
				}); 
			};
		});
	},
	userInfoSubmit: function(data){
		//console.log('Room.userInfoSubmit()', data);
		
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');

		async.parallel([
		function(callback) {
			
			UserModel.find({
				'emailAddress' : data.emailAddress
			}).exec(function(err, result) {
				if (!err) {
					if (result.length < 1) {
						callback(null, null);
					} else {
						callback(null, 'emailAddress');
					}
				} else {
					callback('emailAddress', null);
				};
			});
		},
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
			//console.log('UserInfoSubmit(), results: ',results,', err: ',err);
			console.log('UserInfoSubmit()');
			var duplicates = [];
			
			for(var i = 0; i< results.length; i++){
				if(results[i] != null){
					duplicates.push(results[i]);
				}
			}
			//console.log('duplicates: ',duplicates);

			if (!duplicates.length) {
				console.log('no duplicates go ahead and save!', data);
				
				var userParams = {
					firstName : data.firstName,
					lastName : data.lastName,
					userName : data.userName,
					emailAddress : data.emailAddress,
					password : data.password,
					type : data.type,
					login: data.login,
					socialId : parseInt(Math.round(data.socialId)),
					loggedIn: true,
					registered: true
				};
				var user = new UserModel(userParams);
				
				user.save(function(err) {
					if (err) {
						console.log('user, Error on save: ',err);
						desktopSocket.emit('REGISTRATION_ERROR', {
							type : 'saveError',
							description : 'userInfoSubmit: user.save()'
						});
					} else {
						console.log('saved!');
						that.set('user', user);
						//that.set('userId', user._id);
						delete userParams.password;
						//that.userInfo(userParams);
						desktopSocket.emit('REGISTRATION_SUCCESS', userParams);
					}
				});

			} else {
				console.log('not saved!');
				desktopSocket.emit('REGISTRATION_ERROR', {
					type : 'duplicateEntry',
					description : 'duplicatEntries',
					values: results
				});
			}
		});
	},
	practiceUserInfoSubmit: function(data){
		//console.log('Room.practiceUserInfoSubmit()', data);
		
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');

		async.parallel([
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
			//console.log('UserInfoSubmit(), results: ',results,', err: ',err);

			var duplicates = [];
			
			for(var i = 0; i< results.length; i++){
				if(results[i] != null){
					duplicates.push(results[i]);
				}
			}
			//console.log('duplicates: ',duplicates);

			if (!duplicates.length) {
				console.log('no duplicates go ahead and save!');
				
				var userParams = {
					firstName : data.firstName,
					lastName : data.lastName,
					userName : data.userName,
					emailAddress : data.emailAddress,
					password : data.password,
					type : data.type,
					login: data.login,
					socialId : parseInt(Math.round(data.socialId)),
					loggedIn: true,
					registered: false
				};
				var user = new UserModel(userParams);
				
				user.save(function(err) {
					if (err) {
						console.log('user, Error on save: ',err);
						desktopSocket.emit('REGISTRATION_ERROR', {
							type : 'saveError',
							description : 'userInfoSubmit: user.save()'
						});
					} else {
						console.log('saved!');
						that.set('user', user);
						//that.set('userId', user._id);
						delete userParams.password;
						//that.userInfo(userParams);
						desktopSocket.emit('REGISTRATION_SUCCESS', userParams);
					}
				});

			} else {
				console.log('not saved!');
				desktopSocket.emit('REGISTRATION_ERROR', {
					type : 'duplicateEntry',
					description : 'duplicatEntries',
					values: results
				});
			}
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
	emailPassword: function(data){
		console.log('Room.emailPassword()');
		
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');
		var mailTransport = this.get('mailTransport');
		var staticText = this.get('staticText');
		
		UserModel.find({
			'emailAddress' : data.emailAddress
		}).exec(function(err, result) {
			if (!err) {
				if (result.length < 1) {
					console.log('User doesnt exist in data base');
					
					desktopSocket.emit('SEND_EMAIL_ERROR', {
						type : 'emailAddressIncorrect',
						description : 'Wrong email!'
					});
					//desktopSocket.emit('LOGIN_ERROR', userParams);
				} else {
					console.log('User exists in data base, return all data');

					console.log(result[0].firstName +' '+ result[0].lastName + ' <' + result[0].emailAddress + '>');
					
					var testEmail = '"Receiver Name" <brendanjneufeld@gmail.com>';
					var userEmail = result[0].firstName +' '+ result[0].lastName + ' <' + result[0].emailAddress + '>';
					
					var emailMessage = {
						// sender info
						from : staticText.email.appName+staticText.email.from,
						// Comma separated list of recipients
						to : userEmail,
						// Subject of the message
						subject : staticText.email.appName,
						// plaintext body
						text : result[0].password,
						// HTML body
						html : '<p><b>'+result[0].password+'</b><br/>'+that.get('desktopUrl')+'</p>',
					};
					
					mailTransport.sendMail(emailMessage, function(error) {
						if (error) {
							console.log('Error occured');
							console.log(error.message);
							return;
						}else{
							desktopSocket.emit('EMAIL_PASSWORD_SUCCESS', {emailAddress: result[0].emailAddress});
						}
						console.log('Message sent successfully!');
					}); 
				}
				
			} else {
				
				console.log('Query error');

			};

		});
		
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
	getTwitterRequestToken: function(){
		console.log('Room.getTwitterRequestToken()');
		
		var that = this;
		var desktopSocket = this.get('desktopSocket');
		
		this.get('twitter').getRequestToken(function(error, requestToken, requestTokenSecret, results){
		    if (error) {
		        console.log("Error getting OAuth request token : " + error);
		        
		        desktopSocket.emit('REGISTRATION_ERROR', {type: 'apiError', description: 'getTwitterRequestToken'});
		        //that.gameReady('')

		    } else {
		    	console.log(requestToken, requestTokenSecret, results);
		    	 
		    	 var data = {
		    	 	requestToken: requestToken,
		    	 	requestTokenSecret: requestTokenSecret,
		    	 	results: results
		    	 };

				that.set({
					twitterRequestToken : requestToken,
					twitterRequstTokenSecret : requestTokenSecret,
					twitterResults : results
				});
		    	 
				 desktopSocket.emit('TWITTER_OATH_TOKEN', data);

		    }
		});
		
	},
	getTwitterAccessToken: function(data){

		console.log('Room.getTwitterAccessToken()');
		console.log('oauth_token: ',data.oauth_token);
		console.log('oauth_verifier: ',data.oauth_verifier);
		console.log('requestTokenSecret: ',data.requestTokenSecret);
		
		var that = this;
		var twitter = this.get('twitter');
		var desktopSocket = this.get('desktopSocket');
		
		twitter.getAccessToken(data.oauth_token, data.requestTokenSecret, data.oauth_verifier, function(error, accessToken, accessTokenSecret, results) {
			if (error) {
				//console.log(error);
				console.log('twitter.getAccessToken() ERROR: ',error);
				desktopSocket.emit('REGISTRATION_ERROR', {type: 'apiError', description: 'getTwitterAccessToken'});
			} else {

				twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, response) {
					if (error) {
						console.log('twitter.verifyCredentials() ERROR: ',error);
						desktopSocket.emit('REGISTRATION_ERROR', {type: 'apiError', description: 'twitter.verifyCredentials()'});
						//something was wrong with either accessToken or accessTokenSecret
						//start over with Step 1
					} else {
						//accessToken and accessTokenSecret can now be used to make api-calls (not yet implemented)
						//data contains the user-data described in the official Twitter-API-docs
						//you could e.g. display his screen_name
						that.getTwitterUserRegistrationStatus(data);
					}
				}); 
				//store accessToken and accessTokenSecret somewhere (associated to the user)
				//Step 4: Verify Credentials belongs here
			}
		}); 
	},
	getTwitterUserRegistrationStatus: function(data){
		// CHECK IF USER IS ALREADY REGISTERED!!
		console.log('Room.getTwitterUserRegistrationStatus()', data);
		
		var that = this;
		var UserModel = this.get('UserModel');
		var desktopSocket = this.get('desktopSocket');
		
		UserModel.find({'socialId':data.id}).exec(function(err, result) {
			if (!err) {
				// handle result
				console.log('USER_INFORMATION_SUBMIT socialId query: ',result);

				if(result.length < 1){
					//console.log('USER_INFORMATION_SUBMIT socialId query, USER NOT REGISTERED!');
					desktopSocket.emit('TWITTER_USER_REGISTERATION_CREDENTIALS', data);
				}else{
					//console.log('USER_INFORMATION_SUBMIT socialId query, USER REGISTERED!');
					that.checkLoggedInStatus(result);
					//delete result[0].password;
					//desktopSocket.emit('REGISTERED_USER', result[0]);
				}
				
			} else {
				desktopSocket.emit('REGISTRATION_ERROR', {type: 'queryError', description: 'getTwitterUserRegistrationStatus: socialId'});
				console.log('ERROR: ',result,err);
				// error handling
			};
		}); 
	},
	userInfo: function(user){
		console.log('Room.userInfo()');
		this.set('userInfo', new models.User(user));
		//console.log(this.get('userInfo'))
		
	},
	playGame: function(){
		console.log('Room.playGame(), gameId: ',this.get('user').gameId);
		
		var that = this;
		var app = this.get('app');
		var GameModel = this.get('GameModel');
		var desktopSocket = this.get('desktopSocket');
		var mobileSocket = this.get('mobileSocket');
		var sockets = this.get('sockets');
		var mobileUrl = this.get('mobileUrl');
		
		var gameId = this.get('user').gameId;
		var userId = this.get('user')._id;
		var userType = this.get('user').type;
		var defaults = this.get('config').schemas.defaults.game;
		defaults.userId = userId;
		defaults.userName = this.get('user').userName;
		defaults.firstName = this.get('user').firstName;
		defaults.lastName = this.get('user').lastName;
		defaults.active = true;
		
		async.waterfall([
		function(callback) {
			// DETERMINE IF THE USER HAS ALREADY BEEN PLAYING
			if(gameId){
				//	THE USER OBJECT HAS A GAME ID, SO USER HAS PLAYED, SO FIND THEIR GAME
				console.log('there is a gameId: ',gameId);
				GameModel.findById(gameId, function(err, game) {			
					if(!err){
						//console.log('game: ', game);
						//	RETURN THE USERS PREVIOUSLY PLAYED GAME
						callback(null, game);
					}else{
						console.log('step1 error!');
						callback(err, null);
					}				
				});
			}else{
				//	THERE IS NO STORED GAME ID SO GO TO NEXT STEP
				console.log('there is NO gameId');
				callback(null, null);
			}
		},
		function(game, callback) {
			if(!game && userId){
				// THERE IS NO GAME BUT MAKE SURE THERE ARE NO GAMES WITH THIS USER ID ALREADY
				console.log('there is no game but there is a userId: ', userId);
				GameModel.find({
					'userId' : userId
				}).exec(function(err, games) {
					console.log('query games for userId returned: ',games);
					if(games && games.length > 0 && games.length < 2){
						// THERE IS A GAME WITH THIS USER ID SO RETURN IT
						//console.log('found a game with userId: ',userId, ', games: ', games);
						callback(null, games[0]);

					}else if(games && games.length > 1){
						callback("More than one game with same user id!", games);
						// ADD ERROR HANDLING!!!
					}else{
						callback(null, null);
					}
				});
				
			}else if(!game && !userId){
				console.log('there is NO game or userId, weird!');
				callback(null, null);
			}else{
				// A GAME WAS FOUND IN THE PREVIOUS QUERY!
				callback(null, game);
			}
		},
		function(game, callback) {
			if(!game){
				// OK WE HAVE CHECKED EVERYTHING, THERE IS NO STORED GAME SO INITIALIZE A NEW ONE!
				console.log('there is no game so create a new one!');
				console.log('userType', that.get('user').type);
				defaults.gameCode = that.generateGameCode();
				
				var user = that.get('user');
				if(user.type == 'practice'){
					defaults.sharesAllowed = defaults.practiceSharesAllowed;
					defaults.practiceSharesAllowed = 0;
					defaults.practiceSwingsAllowed = 0;
					defaults.practiceRemainingSwings = 0;
					defaults.practiceSwingsComplete = true;
				}
				
				
				defaults.type = user.type;
				console.log('gameType', defaults.type);
				var game = new GameModel(defaults);
				
				callback(null, game);
				
				/*
				that.updateLeaderboard(function(){
					callback(null, game);
				})
				
				
				GameModel.find({}).exec(function(err, games) {
					game.ranking = games.length + 1;
					callback(null, game);
				});
				*/
				
			}else{
				// A GAME WAS FOUND IN THE PREVIOUS QUERY! 
				//console.log('there is a game so pass it along: ',game);
				callback(null, game);
			}
		}], function(err, game) {
			//console.log('err: ',err,', game: ', game);
			var user = that.get('user');
			that.set('game', game);
			
			var mailTransport = that.get('mailTransport');
			var staticText = that.get('staticText');
			var gameDefaults = that.get('config').schemas.defaults.game;
					
			game.active = true;
			game.userId = userId;
			
			//game.swingsAllowed = gameDefaults.swingsAllowed;
			//game.practiceSwingsAllowed = gameDefaults.practiceSwingsAllowed;
			game.sharesAllowed = gameDefaults.sharesAllowed;
			game.practiceSharesAllowed = gameDefaults.practiceSharesAllowed;
			game.shareAdditionalSwings = gameDefaults.shareAdditionalSwings;
			
			if((game.practiceSwingTotal  >= game.practiceSwingsAllowed) || game.practiceSwingsAllowed == 0){
				//--game.type = "pro"
				game.practiceSwingsComplete = true;
				game.practiceRemainingSwings = 0;
				//console.log('1--------------------> something is fd!!!');
			}else{
				game.practiceRemainingSwings = game.practiceSwingsAllowed - game.practiceSwingTotal;
				//console.log('2--------------------> something is fd!!!');
				//game.type = "pro"
				//game.practiceSwingsComplete = true;
			}
			
			if((game.swingTotal  >= game.swingsAllowed) || game.swingsAllowed == 0){
				game.complete = true;
				game.remainingSwings = 0;
			}else{
				game.remainingSwings = game.swingsAllowed - game.swingTotal;
			}
			
			
			
			
			game.save(function(err) {
				
				console.log('game saved!');
				
				if (err) {
					console.log('user, Error on save: ', err);
					// ADD ERROR HANDLING!!!
				} else {

					user.gameId = game._id;
					user.gameCode = game.gameCode;
					user.save(function(err) {
						if (err) {
							// ADD ERROR HANDLING
							console.log('error saving user.gameId, ', err);
						} else {
							console.log('user.gameId saved!');
						}
					});
					
					if (game.swingTotal >= game.swingsAllowed) {
						//console.log('game.sharesTotal: ',game.sharesTotal,' game.sharesAllowed: ',game.sharesAllowed)
						if (game.sharesTotal < game.sharesAllowed) {
							desktopSocket.emit('GAME_COMPLETE_SHARE', game);
							if(mobileSocket)	mobileSocket.emit('GAME_COMPLETE_SHARE', game);
						} else {
							desktopSocket.emit('GAME_COMPLETE', game);
							if(mobileSocket)	mobileSocket.emit('GAME_COMPLETE_SHARE', game);
						}

					} else {
						//if(that.get('io') !== 'undefined')	io.sockets.emit('LEADERBOARD_UPDATE', results);
							//updateCallback(null, results);
						
						that.updateLeaderboard(function(err, results){
							//console.log('------------err: ',err,', results: ',results);
							desktopSocket.emit('GAME_READY', game);
							//sockets.emit('LEADERBOARD_UPDATE', results);
							
							//email start
							//console.log(result[0].firstName +' '+ result[0].lastName + ' <' + result[0].emailAddress + '>')
							
							//var testEmail = '"Receiver Name" <brendan.neufeld@taxi.ca>';
							var testEmail = '"Receiver Name" <brendanjneufeld@gmail.com>';
							var userEmail = user.firstName +' '+user.lastName + ' <' + user.emailAddress + '>';

							var emailMessage = {
								// sender info
								from : staticText.email.appName+staticText.email.from,
								// Comma separated list of recipients
								to : userEmail,
								// Subject of the message
								subject : staticText.email.appName,
								// plaintext body
								//text : result[0].password,
								text : staticText.email.mobileBodyCopy+mobileUrl,
								// HTML body
								html : '<p>'+staticText.email.mobileBodyCopy+'</p><p>'+mobileUrl+'</p>',
								/*html : '<p>'+staticText.email.mobileBodyCopy+'</p><p>'+mobileUrl+'#game/'+user.gameCode+'</p>',*/
							};
							
							/*mailTransport.sendMail(emailMessage, function(error) {
								if (error) {
									console.log('Error occured');
									console.log(error.message);
									return;
								}else{
									//desktopSocket.emit('EMAIL_PASSWORD_SUCCESS', {emailAddress: result[0].emailAddress});
								}
								console.log('Message sent successfully!');
							});*/
							//email end
							
						});
					}
				}
			});
		});
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
	countdownStart: function(){
		console.log('Room.countdownStart()');
		var that = this;
		var counter = 3;
		var desktopSocket = this.get('desktopSocket');
		var mobileSocket = this.get('mobileSocket');
		
		var startInt = setInterval(function() {
			console.log('counter: ',counter);
			if (counter == 0) {
				desktopSocket.emit('PITCH_START');
				if (mobileSocket) mobileSocket.emit('PITCH_START');
				clearInterval(startInt);
			} else {
				desktopSocket.emit('COUNTER', counter);
				if (mobileSocket) mobileSocket.emit('COUNTER', counter);
			}
			counter -= 1;
		}, 1000); 
	},
	pitchComplete: function(data){
		console.log('Room.pitchComplete()');
		if(this.get('mobileSocket')) this.get('mobileSocket').emit('PITCH_COMPLETE');
	},
	hitComplete: function(data){
		console.log('Room.hitComplete()');
		
		var that = this;
		//console.log('hitComplete - game: ',game)
		var desktopSocket = this.get('desktopSocket');
		var mobileSocket = this.get('mobileSocket');
		var game = that.get('game');
		
		this.updateLeaderboard(function(err, results) {
			//console.log(results);
			//console.log(game);
			if (game.swingTotal >= game.swingsAllowed) {

				if (game.sharesTotal < game.sharesAllowed) {
					desktopSocket.emit('GAME_COMPLETE_SHARE', game);
					if(mobileSocket)	mobileSocket.emit('GAME_COMPLETE_SHARE', game);
				} else {
					desktopSocket.emit('GAME_COMPLETE', game);
					if(mobileSocket)	mobileSocket.emit('GAME_COMPLETE_SHARE', game);
				}

			} else {
				if(mobileSocket)	mobileSocket.emit('HIT_COMPLETE');
				desktopSocket.emit('PITCH_READY', game);
			}
		});

					


		
	},
	gameShared: function(data){
		console.log('Room.gameShared()');
		
		var that = this;
		var game = this.get('game');
		
		game.sharesTotal +=1;
		game.swingsAllowed += game.shareAdditionalSwings;
		game.remainingSwings = game.swingsAllowed - game.swingTotal;
		
		var data = {
			roomId : that.get('id'),
			roomIndex : that.get('index'),
			gameCode: that.get('game').gameCode
		};
		
		

		game.save(function(err) {
			if (err) {
				console.log('user, Error on save: ', err);
				// ADD ERROR HANDLING!!!
			} else {
				//that.get('desktopSocket').emit('MOBILE_CONNECT', data);

				that.get('desktopSocket').emit('PITCH_READY', game);
				that.get('desktopSocket').emit('GAME_START', game);
				if ( typeof that.get('mobileSocket') !== 'undefined') {
					that.get('mobileSocket').emit('PITCH_READY', game);
				}
				
			}
		});


		/*
		var game_params = {
			swingTotal : game.swingTotal,
			hitTotal : 0,
			strikeTotal : 0,
			maxDistance : 0,
			ranking : this.get('ranking'), // games.length
			player : {
				firstName : this.get('firstName'),
				lastName : this.get('lastName'),
				userName : this.get('userName'),
				emailAddress : this.get('emailAddress'),
				_id : this.get('_id')
			}
		};
		*/
		//desktopSocket.emit('GAME_READY', game);
		
		
	},
	analyseSwing: function(swingSamples){
		//console.log('Room.analyseSwing()', swingSamples);

		//swings.push(swing)
		var that = this;
		var game = this.get('game');
		var GameModel = this.get('GameModel');
		var swing = {};
		var accelerationSamples = [];
		var desktopSocket = this.get('desktopSocket');
		var mobileSocket = this.get('mobileSocket');
		
		/*
		var hitTotal;
		var maxDistance;
		var strikeTotal;
		var swingTotal;
		var swings;
		*/
		
		for(var i=0; i<swingSamples.length; i++){
			accelerationSamples.push(Number(swingSamples[i].amount));
		};
		
		//console.log('accelerationSamples: ',accelerationSamples)
		var largest = Math.max.apply(Math, accelerationSamples);
		
		var largestIndex;
		for(var i=0; i<swingSamples.length; i++){
			if(swingSamples[i].amount == largest){
				largestIndex = i;
				swing.maxSample = swingSamples[i];
			}
		};
		
		if(!swing.maxSample){
			console.log('!swing.maxSample');
			console.log(swingSamples);
			desktopSocket.emit('SWING_RETRY', {});
			if(mobileSocket)	mobileSocket.emit('SWING_RETRY', {});
			return;
		}
		
		swing.direction = "";
		swing.distance = Math.round(swing.maxSample.amount*3.75);
		
		if (swing.maxSample.time > 3500 && swing.maxSample.time < 4000 && swing.maxSample.amount > 30) {
			swing.result = "hit";
			if (swing.maxSample.time < 3550) {
				swing.result = "foul";
				swing.direction = "left";
				swing.description = "foulLeft";
				swing.distance = 0;
			}else if (swing.maxSample.time < 3680) {
				swing.direction = "left";
				if(swing.distance < 300){
					swing.description = "grounderLeft";
				}else if(swing.distance < 400){
					swing.description = "hitLeft";
				}else{
					swing.description = "homerLeft";
				}

			} else if (swing.maxSample.time < 3820) {
				swing.direction = "centre";
				if(swing.distance < 300){
					swing.description = "grounderCentre";
				}else if(swing.distance < 400){
					swing.description = "hitCentre";
				}else{
					swing.description = "homerCentre";
				}
			} else if (swing.maxSample.time < 3950) {
				swing.direction = "right";
				if(swing.distance < 300){
					swing.description = "grounderRight";
				}else if(swing.distance < 400){
					swing.description = "hitRight";
				}else{
					swing.description = "homerRight";
				}
			} else if (swing.maxSample.time < 4000) {
				swing.direction = "right";
				swing.description = "foulRight";
				swing.result = "foul";
				swing.distance = 0;
			}

		} else {
			swing.result = "miss";
			swing.description = "strike";
			swing.direction = "";
			swing.distance = 0;
		}
		
		//
		
		//-->game.swings.push(swing);
		//-->game.swingTotal = game.swings.length;
		
		//
		//swingTotal = game.swings.length;
		//swings = game.swings;
		//swings.push(swing);
		//
		
		if(game.swingTotal >= game.swingsAllowed){
			//game.complete = true;
		}
		
		/*
		var maxSwing = _.max(game.swings, function(swing) {
			return swing.distance;
		}); 
		*/
		//console.log('maxSwing: ', maxSwing.distance);
		
		//-->game.maxDistance = maxSwing.distance;
		
		//
		//maxDistance = maxSwing.distance;
		//
		
		//console.log('game.practiceSwingTotal: ',game.practiceSwingTotal);
		//console.log('game.practiceSwingsAllowed: ',game.practiceSwingsAllowed);
		
		

		var maxSwing;
		
		if(game.practiceSwingTotal  < game.practiceSwingsAllowed){
			//Still in practice swing mode
			swing.type = "practice";
			
			if(swing.result == "hit"){
				game.practiceHitTotal += 1;
			}else{
				game.practiceStrikeTotal += 1;
			}
			
			game.practiceSwings.push(swing);
			game.practiceSwingTotal = game.practiceSwings.length;
			
			game.practiceRemainingSwings = game.practiceSwingsAllowed - game.practiceSwingTotal;
			
			maxSwing = _.max(game.practiceSwings, function(swing) {
				return swing.distance;
			});
			
			game.practiceMaxDistance = maxSwing.distance;
			
			if(game.practiceSwingTotal  == (game.practiceSwingsAllowed)){
				game.practiceSwingsComplete = true;
			}
			
		}else{
			// game play
			
			swing.type = "pro";
			
			if(swing.result == "hit"){
				game.hitTotal += 1;
			}else{
				game.strikeTotal += 1;
			}
			
			game.swings.push(swing);
			game.swingTotal = game.swings.length;
			game.remainingSwings = game.swingsAllowed - game.swingTotal;
			
			
			
			maxSwing = _.max(game.swings, function(swing) {
				return swing.distance;
			});
			game.maxDistance = maxSwing.distance;
			game.practiceSwingsComplete = true;
		}
		//console.log('game: ',game);
		game.save(function(err) {
			if (err) {
				// ADD ERROR HANDLING
				console.log('error saving game.swings, ', err);
			} else {
				console.log('game.swings saved!');
				// Get the ranking
				if(swing.type == 'practice'){
					desktopSocket.emit('SWING_COMPLETE', swing);
					desktopSocket.emit('GAME_UPDATE', game);
				}else{

					that.updateLeaderboard(function(err, results) {
						desktopSocket.emit('SWING_COMPLETE', swing);
						desktopSocket.emit('GAME_UPDATE', game);
					});

				}
				
			}
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
		  //console.log('Rooms.add(), id: '+room.get('id'));
		});
	},
	generateRoomId: function() {
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
	updateRanking: function(results, callback){
		console.log('Rooms.updateRanking()');
		//console.log('Rooms.updateRanking() models.length is: ',this.models.length);
		var that = this;
		
		// Update live games (not just the database)
		_.each(this.models, function(room){
			//console.log('room.game: ', room.get('game'));
			
			// get the game for each room
			var roomGame = room.get('game');

			// if the room has a game (games are not initialized until a mobile device connects)
			if (roomGame) {
				
				var matchingResult = _.find(results, function(res) {
					return String(res._id) == String(roomGame._id);
				});
				
				if (matchingResult) {
					if(roomGame.type == 'practice'){
						roomGame.ranking = matchingResult.practiceGameRanking;
					}else{
						roomGame.ranking = matchingResult.proGameRanking;
					}
				}
			}
			
			var proGames = [];

			if (roomGame && roomGame.type == 'practice') {
				for (var i = 0; i < results.length; i++) {
					results[i].ranking = i+1;
				}
				room.get('desktopSocket').emit('LEADERBOARD_UPDATE', results);
			} else {
				for (var i = 0; i < results.length; i++) {
					if (results[i].type == 'pro') {
						results[i].ranking = results[i].proGameRanking;
						proGames.push(results[i]);
					}
				}
				room.get('desktopSocket').emit('LEADERBOARD_UPDATE', proGames);
			}
			
		});
		
		//that.sockets.emit('LEADERBOARD_UPDATE', results);
		callback(null, results);
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
	nodemailer: nodemailer,
	twitterAPI: twitterAPI
});