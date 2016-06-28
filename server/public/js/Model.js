/**
 * @author bneufeld
 */



(function (ns, $, _, Backbone, io, accounting, MediaElement, FB, sessvars) {
	"use strict";
	// Models
	var models = {};
	
	models.Model = Backbone.Model.extend({
		defaults: {
			isEnabled: true,
			isSelected: true
	    },
		initialize: function(){
			//console.log("models.Model.initialize()")
		}
		
	});
	
	models.Room = Backbone.Model.extend({
	    defaults: {
	    	id: '',
	    	index: '',
	    	socket: undefined,
	    	lang: '',
	    	disconnected: false
	    },
		initialize: function(options){
			//console.log("Game.initialize(), id: ",this.get('id'));
			//console.log('index',options.index)
			var that = this;

		},
		connect: function(){
			console.log('Room.connect()', this);
			
			var that = this;
			
			var urls = this.get('urls');
			//var winUrl = window.location.pathname; 
			var winUrl = window.location.href;
  
        	var url = winUrl.substring(0, winUrl.lastIndexOf('/') + 1);
			
			var socket = this.get('socket');
			
			var controller = this.get('controller');
			
			socket.on('connect-error', function(error) {
		          //console.log('Connection Error\n' + error);
		          controller.trigger('onError', {type: 'connection'});
		   });
		   
		   socket.on('DATABASE_ERROR', function(error) {
		          //console.log('Database Error\n' + error);
		          controller.trigger('onDatabaseError', {type: 'connection'});
		   });
		   
		   
		   socket.on('error', function(error) {
		          //console.log('Socket Error\n' + error);
		          controller.trigger('onError', {type: 'connection'});
		    })
		    
		   socket.on('disconnect', function(){
				that.set('disconnected', true);
				controller.trigger('onError', {type: 'connection'});
			})
		    
		    socket.on('SERVER_ERROR', function(data){
				controller.trigger('onError', {type: 'connection'});
			});
			//console.log('urls: ', urls.mobile)
			socket.on('connect', function() {
				//alert('mobileUrl', that.urls.mobile);
				socket.emit('CONNECT_DESKTOP', {
					lang: that.get('lang'),
					desktopUrl: url,
					mobileUrl: urls.mobile
				}, function(data) {
					//console.log(data)
				});
				
				controller.trigger('connected', that);
			});
			
			socket.on('ROOM_READY', function(data) {
				//console.log('ROOM_READY', data);
				that.set(data)
				controller.trigger('roomReady', that);
			});
			

			socket.on('MOBILE_CONNECT', function(data) {
				//console.log('CONNECT_MOBILE');
				
				controller.trigger('onMobileConnect', data);
				
				/*if (data.room == guid) {
					$('.url').html('YOU ARE NOW CONNECTED!');
					$('#connection-status').html('Click START on your mobile device to play.');
					$('#start-btn').css('display', 'inline');
					$('#qr-code').css('display', 'none');
				}*/

				return this;
			});

			socket.on('DEBUG_MOBILE', function(data) {
				//that.playGame(data);
				console.log('MOBILE DEBUG: ', data);
			});

			
			this.set('socket', socket);

		},
		setId: function() {
			var code = '';
			var alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789';
			while (code.length < 5) {
				var index = Math.round( Math.random() * (alphanum.length - 1) );
				code += alphanum.charAt(index);
			}
			return this.set('id', code);
		},
		url: function(){
	      return this.get("id");
	    }
	});
	
	models.Registration = Backbone.Model.extend({
		defaults: {
			
			userInformation: '',
			logIn: ''

		},
		initialize: function (options) {
			//console.log("ns.models.Dealer.initialize()");
			this.accounting = options.accounting;
			this.controller = options.controller;
			this.urls = options.urls;
			this.FB = options.FB;
			
			var that = this;
			var socket = options.socket;
			
			socket.on('TWITTER_OATH_TOKEN', function(data){
				that.controller.trigger('onTwitterOathToken', data);
			});
			
			socket.on('TWITTER_USER_REGISTERATION_CREDENTIALS', function(data){
				that.controller.trigger('registerWithTwitter', data);
			});
			
			socket.on('FACEBOOK_USER_REGISTERATION_CREDENTIALS', function(data){
				that.controller.trigger('registerWithFacebook', data);
			});
			
			socket.on('REGISTERED_USER', function(data){
				that.controller.trigger('onRegisteredUser', data);
			});
			
			socket.on('REGISTRATION_ERROR', function(data){
				//console.log('REGISTRATION_ERROR', data)
				that.controller.trigger('onRegistrationError', data);
			});
			
			socket.on('REGISTRATION_SUCCESS', function(data){
				that.controller.trigger('onRegistrationSuccess', data);
			});
			
			socket.on('LOGIN_ERROR', function(data){
				//console.log('REGISTRATION_ERROR', data)
				that.controller.trigger('onLoginError', data);
			});
			
			socket.on('LOGIN_SUCCESS', function(data){
				//console.log('REGISTRATION_ERROR', data)
				that.controller.trigger('onLoginSuccess', data);
			});
			
			socket.on('SEND_EMAIL_ERROR', function(data){
				//console.log('REGISTRATION_ERROR', data)
				that.controller.trigger('onSendEmailError', data);
			});
			
			socket.on('EMAIL_PASSWORD_SUCCESS', function(data){
				//console.log('REGISTRATION_ERROR', data)
				that.controller.trigger('onSendEmailSuccess', data);
			});
			
		},
		signUpWithFacebook: function(){
			console.log('Room.signUpWithFacebook()');
			var that = this;
			FB.getLoginStatus(function(response) {
				console.log("response: ", response);
				if (response.status === 'connected') {
					// the user is logged in and has authenticated your
					// app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed
					// request, and the time the access token
					// and signed request each expire
					var uid = response.authResponse.userID;
					var accessToken = response.authResponse.accessToken;
					
					console.log('FB.getLoginStatus(), the user is logged in and has authenticated your app');
						
					that.FB.api('/me', function(apiResponse) {
						$.extend(true, response, apiResponse);
						console.log('FB.api(respnse): ',response);
						//that.controller.trigger('registerWithFacebook', response);
						that.controller.trigger('onLoginStatus', {
				    		facebook: response,
				    		twitter: {}
				    	});
				    });
					
					
				} else if (response.status === 'not_authorized') {
					// the user is logged in to Facebook,
					// but has not authenticated your app
					console.log('FB.getLoginStatus(), the user is logged in, but has not authenticated your app');
					that.FB.login(function(response) {
						//console.log('FB.login(response): ',response);
						if (response.authResponse) {
							console.log('Welcome!  Fetching your information.... ');
							
							FB.api('/me', function(apiResponse) {
								console.log('Good to see you, ' + apiResponse.name + '.');
								console.log('FB.api(respnse): ',response);
								$.extend(true, response, apiResponse);
								//that.controller.trigger('registerWithFacebook', response);
								that.controller.trigger('onLoginStatus', {
						    		facebook: response,
						    		twitter: {}
						    	});
							});
							
						} else {
							console.log('User cancelled login or did not fully authorize.');
						}
					});
				} else {
					// the user isn't logged in to Facebook.
					//that.FB.login();

					that.FB.login(function(response) {
						//console.log('FB.login(response): ',response);
						if (response.authResponse) {
							console.log('Welcome!  Fetching your information.... ');
							
							FB.api('/me', function(apiResponse) {
								console.log('Good to see you, ' + apiResponse.name + '.');
								console.log('FB.api(respnse): ',response);
								$.extend(true, response, apiResponse);
								//that.controller.trigger('registerWithFacebook', response);
								that.controller.trigger('onLoginStatus', {
						    		facebook: response,
						    		twitter: {}
						    	});
							});
							
						} else {
							console.log('User cancelled login or did not fully authorize.');
						}
					}); 

					console.log('FB.getLoginStatus(), he user isnt logged in to Facebook.');
				}
			}); 
			

		},
		loginWithFacebook: function(){
			console.log('Room.loginWithFacebook()');
			var that = this;
			FB.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					// the user is logged in and has authenticated your
					// app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed
					// request, and the time the access token
					// and signed request each expire
					var uid = response.authResponse.userID;
					var accessToken = response.authResponse.accessToken;
					
					console.log('FB.getLoginStatus(), the user is logged in and has authenticated your app');
						
					that.FB.api('/me', function(apiResponse) {
						$.extend(true, response, apiResponse);
						console.log('FB.api(respnse): ',response);
						that.controller.trigger('onLoginStatus', {
				    		facebook: response,
				    		twitter: {}
				    	});
				    });
					
					
				} else if (response.status === 'not_authorized') {
					// the user is logged in to Facebook,
					// but has not authenticated your app
					console.log('FB.getLoginStatus(), the user is logged in, but has not authenticated your app');
					that.FB.login(function(response) {
						//console.log('FB.login(response): ',response);
						if (response.authResponse) {
							console.log('Welcome!  Fetching your information.... ');
							
							FB.api('/me', function(apiResponse) {
								console.log('Good to see you, ' + apiResponse.name + '.');
								console.log('FB.api(respnse): ',response);
								$.extend(true, response, apiResponse);
								//that.controller.trigger('registerWithFacebook', response);
								that.controller.trigger('onLoginStatus', {
						    		facebook: response,
						    		twitter: {}
						    	});
							});
							
						} else {
							console.log('User cancelled login or did not fully authorize.');
						}
					});
				} else {
					// the user isn't logged in to Facebook.
					//that.FB.login();

					that.FB.login(function(response) {
						//console.log('FB.login(response): ',response);
						if (response.authResponse) {
							console.log('Welcome!  Fetching your information.... ');
							
							FB.api('/me', function(apiResponse) {
								console.log('Good to see you, ' + apiResponse.name + '.');
								console.log('FB.api(respnse): ',response);
								$.extend(true, response, apiResponse);
								that.controller.trigger('onLoginStatus', {
						    		facebook: response,
						    		twitter: {}
						    	});
								//that.controller.trigger('registerWithFacebook', response);
							});
							
						} else {
							console.log('User cancelled login or did not fully authorize.');
						}
					}); 

					console.log('FB.getLoginStatus(), the user isnt logged in to Facebook.');
				}
			}); 
			

		},
		checkLoginStatus: function(){
			console.log('Room.checkLoginStatus()');
			var that = this;		
			$.when(that.checkFacebookLogin(), that.checkTwitterLogin())
		    .done(function(responseFb, responseTw){
				console.log('done')
		    	that.controller.trigger('onLoginStatus', {
		    		facebook: responseFb,
		    		twitter: responseTw
		    	});
		    });
		},
		checkFacebookLogin: function(){
			console.log('Registration.checkFacebookLogin()');
			
			var that = this;
			var fbDeferred = new $.Deferred();
			//var response = {};
			
			this.FB.getLoginStatus(function(response) {
				 
				console.log('FB.getLoginStatus: ',response)
				if (response.status === 'connected') {
					// the user is logged in and has authenticated your
					// app, and response.authResponse supplies
					// the user's ID, a valid access token, a signed
					// request, and the time the access token
					// and signed request each expire
					var uid = response.authResponse.userID;
					var accessToken = response.authResponse.accessToken;

					that.FB.api('/me', function(apiResponse) {

						$.extend(true, response, apiResponse);
						fbDeferred.resolve(response); 
						
				    });
				   
				    
					//that.testAPI();
				} else if (response.status === 'not_authorized') {
					// the user is logged in to Facebook,
					// but has not authenticated your app
					
					that.FB.api('/me', function(apiResponse) {
						$.extend(true, response, apiResponse);
						fbDeferred.resolve(response); 
				    });

					
				} else {
					// the user isn't logged in to Facebook.
					that.FB.api('/me', function(apiResponse) {
						$.extend(true, response, apiResponse);
						fbDeferred.resolve(response);
				    });

				}
				/*
				that.FB.Event.subscribe('auth.authResponseChange', function(response) {
					console.log('auth.authResponseChange: ',response)
					// Here we specify what we do with the response anytime this event occurs.
					if (response.status === 'connected') {
						console.log('auth.authResponseChange: logged in to the app');
						
						that.FB.api('/me', function(apiResponse) {
							$.extend(true, response, apiResponse);
							console.log('auth.authResponseChange(respnse): ',response);
							//response.registered = false;
							that.controller.trigger('registerWithFacebook', response);
							//fbDeferred.resolve(response); 
					    });
					    
					} else if (response.status === 'not_authorized') {
						console.log('auth.authResponseChange:logged in to FB but not the app');
						that.FB.login();
					} else {
						console.log('auth.authResponseChange: not logged in to FB and not the app');
						that.FB.login();
					}
				});
				*/
			});

			return fbDeferred.promise();

		},
		checkTwitterLogin: function(){
			console.log('Register.checkTwitterLogin()');
			var twDeferred = new $.Deferred();			
			twDeferred.resolve(sessvars.twitter);
			return twDeferred.promise();
		},
		getTwitterOathToken: function(){
			//console.log('Registration.getTwitterOathToken()');
			
			this.get('socket').emit('GET_TWITTER_OATH_TOKEN', {}, function(data) {
				//console.log(data);
			});
		},
		getFacebookUser: function(data){
			//console.log('Registration.getFacebookUser() ', data);
			
			this.get('socket').emit('GET_FACEBOOK_USER', data, function(data) {
				//console.log('GET_FACEBOOK_USER',data);
				//--that.set(data)
			});
			
		},
		getTwitterUser: function(sessvars){
			//console.log('Registration.getTwitterUser() ', sessvars);
			
			this.get('socket').emit('TWITTER_SESSION_VARS', sessvars);
			
			
		},
		emailPassword: function(user){
			//console.log('Registration.emailPassword() ', user);
			
			this.get('socket').emit('EMAIL_PASSWORD', user);
		}
	});
	
			
	models.UserInfoRegister = Backbone.Model.extend({
		defaults: {
			
			firstName: '',
			lastName: '',
			emailAddress: '',
			confirmEmail: '',
			userName: '',
			password: '',
			socialId: 0,
			login: 'custom',
			emailAddressUnique: true,
			userNameUnique: true,
			socialIdUnique: true,
			registered: false,
			type: 'pro'
			//twitter, facebook, custom

		},
		initialize: function (options) {
			//console.log("ns.models.Dealer.initialize()");
			this.accounting = options.accounting;
			this.controller = options.controller;
			this.urls = options.urls;
			
			//check if user 

			_(this).bindAll('onError', 'save');
			this.bind('error', this.onError);
		},
		onError: function (model, error) {
			//console.log('UserInformation.onError() is: '+error)
		},
		validation: {
			firstName: {
				required: true,
				pattern: 'name',
				msg: "msg: First name not valid."
			},
			lastName: {
				pattern: 'name',
				required: true,
				msg: "msg: Last name not valid."
			},
			userName: {
				pattern: 'userName',
				required: true,
				msg: "msg: User name not valid."
			},
			emailAddress: {
				required: true,
				pattern: 'email',
				msg: "msg: First name not valid."
			},
			confirmEmail: {
				required: true,
				pattern: 'email',
				equalTo: 'emailAddress',
				msg: "msg: First name not valid."
			},
			password: {
				pattern: 'password',
				required: true,
				msg: "msg: Password not valid."
			},
			emailAddressUnique: {
				required: true,
				oneOf: [true],
				msg: "msg: Email not unique."
			},
			userNameUnique: {
				oneOf: [true],
				required: true,
				msg: "msg: User Name not unique."
			},
			socialIdUnique: {
				oneOf: [true],
				required: true,
				msg: "msg: Social ID not unique."
			}
		},
		save: function () {
			//console.log("save()")
			var that = this;

			if (!this.isValid()) {
				return false;
			}
			

			var socket = this.get('socket');
			
			var userData = {
				firstName: this.get('firstName'),
				lastName: this.get('lastName'),
				userName: this.get('userName'),
				emailAddress: this.get('emailAddress'),
				password: this.get('password'),
				login: this.get('login'),
				twitterId: this.get('twitterId'),
				facebookId: this.get('facebookId'),
				socialId: this.get('socialId'),
				registered: this.get('registered'),
				type: this.get('type')
			}
			
			//console.log(this)
			
			socket.emit('USER_INFORMATION_SUBMIT', userData, function(response){
				
			})
			
			//var errorOptions = ns.config.staticText.get().errors.modelDataUnavailable;
			//that.eventAggr.trigger('errorMessage', errorOptions);

		},
		compare: function(o1, o2){
            for(var p in o1){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            for(var p in o2){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            return false;
		},
		url: function () {
			
		}
	});
	
	models.PracticeUserInfo = Backbone.Model.extend({
		defaults: {
			
			firstName: 'x',
			lastName: 'x',
			emailAddress: 'x@x.ca',
			confirmEmail: 'x',
			userName: '',
			password: 'x',
			socialId: 0,
			login: 'custom',
			emailAddressUnique: true,
			userNameUnique: true,
			socialIdUnique: true,
			registered: false,
			type: 'practice'
			//twitter, facebook, custom

		},
		initialize: function (options) {
			//console.log("ns.models.Dealer.initialize()");
			this.accounting = options.accounting;
			this.controller = options.controller;
			this.urls = options.urls;
			
			//check if user 

			_(this).bindAll('onError', 'save');
			this.bind('error', this.onError);
		},
		validation: {
			userName: {
				pattern: 'userName',
				required: true,
				msg: "msg: User name not valid."
			},
			userNameUnique: {
				oneOf: [true],
				required: true,
				msg: "msg: User Name not unique."
			}
		},
		onError: function (model, error) {
			//console.log('UserInformation.onError() is: '+error)
		},
		save: function () {
			//console.log("save()")
			var that = this;

			if (!this.isValid()) {
				return false;
			}
			

			var socket = this.get('socket');
			
			var userData = {
				firstName: this.get('firstName'),
				lastName: this.get('lastName'),
				userName: this.get('userName'),
				emailAddress: this.get('emailAddress'),
				password: this.get('password'),
				login: this.get('login'),
				twitterId: this.get('twitterId'),
				facebookId: this.get('facebookId'),
				socialId: this.get('socialId'),
				registered: this.get('registered'),
				type: this.get('type')
			}
			
			//console.log(this)
			
			socket.emit('PRACTICE_USER_INFORMATION_SUBMIT', userData, function(response){
				
			})
			
			//var errorOptions = ns.config.staticText.get().errors.modelDataUnavailable;
			//that.eventAggr.trigger('errorMessage', errorOptions);

		},
		compare: function(o1, o2){
            for(var p in o1){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            for(var p in o2){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            return false;
		},
		url: function () {
			
		}
	});
	
	models.UserInfoLogIn = Backbone.Model.extend({
		defaults: {
			emailAddress: '',
			password: '',
			passwordIncorrect: false,
			emailAddressIncorrect: false
		},
		initialize: function (options) {
			//console.log("ns.models.Dealer.initialize()");
			this.accounting = options.accounting;
			this.controller = options.controller;
			this.urls = options.urls;
			
			//check if user 

			_(this).bindAll('onError', 'save');
			this.bind('error', this.onError);
		},
		onError: function (model, error) {
			//console.log('UserInformation.onError() is: '+error)
		},
		validation: {
			emailAddress: {
				required: true,
				pattern: 'email',
				msg: "msg: First name not valid."
			},
			password: {
				pattern: 'password',
				required: true,
				msg: "msg: Password not valid."
			},
			passwordIncorrect: {
				required: true,
				oneOf: [false],
				msg: "msg: Password does not match email."
			},
			emailAddressIncorrect: {
				required: true,
				oneOf: [false],
				msg: "msg: Email is not registerd."
			}
		},
		save: function () {
			//console.log("save()")
			var that = this;

			if (!this.isValid()) {
				return false;
			}
			
			var socket = this.get('socket');
			
			var userData = {
				emailAddress: this.get('emailAddress'),
				password: this.get('password')
			}

			socket.emit('USER_INFORMATION_LOGIN', userData, function(response){
				
			});
			
			

		},
		compare: function(o1, o2){
            for(var p in o1){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            for(var p in o2){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            return false;
		},
		url: function () {
			
		}
	});
	
	models.UserInfoForgotPswd = Backbone.Model.extend({
		defaults: {
			emailAddress: '',
			emailAddressIncorrect: false
		},
		initialize: function (options) {
			//console.log("ns.models.Dealer.initialize()");
			this.accounting = options.accounting;
			this.controller = options.controller;
			this.urls = options.urls;
			
			//check if user 

			_(this).bindAll('onError', 'save');
			this.bind('error', this.onError);
		},
		onError: function (model, error) {
			//console.log('UserInformation.onError() is: '+error)
		},
		validation: {
			emailAddress: {
				required: true,
				pattern: 'email',
				msg: "msg: First name not valid."
			},
			emailAddressIncorrect: {
				required: true,
				oneOf: [false],
				msg: "msg: Email is not registerd."
			}
		},
		save: function () {
			//console.log("save()")
			var that = this;

			if (!this.isValid()) {
				return false;
			}
			
			var socket = this.get('socket');
			
			var userData = {
				emailAddress: this.get('emailAddress')
			}

			socket.emit('USER_INFORMATION_LOGIN', userData, function(response){
				
			});
			
			

		},
		compare: function(o1, o2){
            for(var p in o1){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            for(var p in o2){
                if(o1[p] !== o2[p]){
                    return true;
                }
            }
            return false;
		},
		url: function () {
			
		}
	});
	
	models.Player = Backbone.Model.extend({
		defaults: {
			
			firstName: '',
			lastName: '',
			userName: '',
			emailAddress: '',
			socialId: '',
			type: ''

		},
		initialize: function (options) {
		}
	});
	
	models.LeaderBoardSearch = Backbone.Model.extend({
	    defaults: {
	    	id: '',
	    	userName: '',
			ranking: 0,
			discount: 0,
			maxDistance: 0
	    },
	    initialize: function(options){
	    	//console.log('LeaderBoardSearch.initialize()');
	    	//console.log('userName: ', this.get('userName'));
	    }
	 }); 
	
	models.LeaderboardPlayer = Backbone.Model.extend({
	    defaults: {
	    	userName: '',
			ranking: '',
			//discount: 0,
			maxDistance: '',
			visibility: 'hidden',
			selected: '',
			page: 0
	    },
	    initialize: function(options){
	    	
	    }
	 });
	
	models.LeaderBoard = Backbone.Model.extend({
		defaults: {
			selectedPage: 1,
			selectedPlayer: '',
			pages: [],
			itemsPerPage: 10,
			games: undefined,
			totalPages: 0
		},
		initialize: function(options){
			//console.log('LeaderBoard.initialize(), ',options);
			var socket = options.socket;
			var controller = options.controller;
			var that = this;
			 
			socket.on('LEADERBOARD_UPDATE', function(data) {
				//console.log('LeaderBoard - LEADERBOARD_UPDATE', data);
				controller.trigger('leaderBoardUpdate', data);
			});
			
			//-->>this.bind('change:selectedPage', this.pageUpdate);
			//-->this.bind('change:selectedPlayer', this.playerUpdate);
			//this.bind('change:selectedPlayer', this.selectedPlayerUpdate);
			//this.bind('reset', this.test, 'reset');
			//this.bind('add', this.test, 'add');

		},
		test: function(name){
			console.log('Test: ', name)
			console.log(this.get('selectedPlayer'))
		},
		comparator: function(model) {
			return model.get("ranking");
		},
		pageUpdate: function(page){
			console.log('LeaderBoard.pageUpdate(), ', page);
			
			console.log('1. selectedPage is: ',this.get('selectedPage'));
			
			//console.log()
			
			if(page && (typeof page == 'number') && page < (this.get('totalPages')+1) && page > 0){
				console.log('2. selectedPage is: ',this.get('selectedPage'));
				this.set('selectedPage', page);
			}else{
				return;
			}
			
			console.log('3. selectedPage is: ',this.get('selectedPage'));
			
			var selPage = this.get('selectedPage');
			
			_.each(this.get('games').models, function(game){
				//this.add(view);
				
				if(game.get('page') == selPage){
					game.set('visibility', 'visible');
				}else{
					game.set('visibility', 'hidden');
				}

			},this);
				
			this.get('games').reset(this.get('games').models);
		},
		leaderBoardUpdate: function(data){
			//console.log('LeaderBoard.leaderBoardUpdate(), ',data);
			
			var itemsPerPg = this.get('itemsPerPage');
			var selPage = this.get('selectedPage');
			var pg = 0;
			var pages = [];
			
			for(var i =0; i<data.length; i++){
				data[i].page = Math.ceil((i+1)/itemsPerPg);
				if(data[i].page != pg){
					pg = data[i].page;
					pages.push(pg);
					
				}
				if(data[i].page == selPage){
					data[i].visibility = "visible";
				}else{
					data[i].visibility = "hidden";
				}
			}
			this.set({
				pages: pages,
				totalPages: pages.length
			})
			this.get('games').reset(data);
		},
		playerUpdate: function(selectedPlayer){
			//if(!selectedPlayer)	selectedPlayer = this.get('selectedPlayer');
			console.log('M.LeaderBoard.playerUpdate()');
			//console.log(this.get('games').models)
			
			//var selectedPlayer = this.get('selectedPlayer');
			console.log('selectedPlayer: ',selectedPlayer);
			
			_.each(this.get('games').models, function(item){
				item.set('visibility', 'hidden');
			});
			
			var game = _.find(this.get('games').models, function(gm) {
				return gm.get('userName') == selectedPlayer;
			});
			
			if(game){
				console.log('there is a game with that player name, on page: ', game.get('page'));
				game.set('selected', ' selected');
				//this.set('selectedPlayer', selectedPlayer);
				this.set({
					selectedPlayer: selectedPlayer,
					selectedPage: game.get('page')
				});
				
				this.pageUpdate(game.get('page'));
			}else{
				this.set({
					selectedPlayer: ''
				});
			}
			
			//this.get('games').reset(this.get('games').models);
			//console.log('game: ',game);
		}
	});
	
	models.Games = Backbone.Collection.extend({
		model: models.LeaderboardPlayer,
		initialize: function(options){
			//console.log('LeaderBoard.initialize(), ',options);
			var socket = options.socket;
			var controller = options.controller;
			var that = this;
			
			/*
			socket.on('LEADERBOARD_UPDATE', function(data) {
				//console.log('LeaderBoard - LEADERBOARD_UPDATE', data);
				controller.trigger('leaderBoardUpdate', data);
			});
			*/
			//this.bind('change', this.test, 'change');
			//this.bind('reset', this.test, 'reset');
			//this.bind('add', this.test, 'add');

		},
		comparator: function(model) {
			return model.get("ranking");
		},
		test: function(type){
			console.log('Leaderboard.test(), ',type)
		}
	});
	
	models.LandingLeaderBoard = Backbone.Collection.extend({
		//model: models.Leader,
		initialize: function(options){
			//console.log('LandingLeaderBoard.initialize(), ',options);
			var socket = options.socket;
			var that = this;
			 
			socket.on('LEADERBOARD_UPDATE', function(data) {
				//console.log('LeaderBoard - LEADERBOARD_UPDATE', data);
				that.reset(data);
				console.log(that)
			});
			
			socket.emit('LANDINGPAGE_CONNECT', {}, function(games){
				//console.log('games: ',games.results);
				that.reset(games.results);
				//console.log('LeaderBoard is: ',that.models);
			});
		},
		comparator: function(model) {
			return model.get("ranking");
		}
	});
	
	models.Game = Backbone.Model.extend({
	    defaults: {
	    	_id: '',
	    	active: false,
	    	index: '',
	    	socket: {},
	    	io: {},
	    	lang: '',
	    	player: undefined,
	    	swing: {},
			ranking: 0,
			discount: 0,
			hitTotal: 0,
			strikeTotal: 0,
			swingTotal: 0,
			swingsAllowed: 3,
			maxDistance: 0,
			complete: false,
			practiceRemainingSwings: 0,
			remainingSwings: 0
	    },
		initialize: function(options){
			//console.log("Game.initialize()");
			//console.log("Game.initialize(), id: ",this.get('id'));
			//console.log('index',options.index)
			var that = this;
			
			var socket = options.socket;
			var controller = that.get('controller');
			
			socket.on('GAME_READY', function(game) {
				console.log('GAME_READY', game);
				controller.trigger('gameReady', game);
			});
			
			socket.on('GAME_START', function(game) {
				//console.log('GAME_UPDATE', game);
				controller.trigger('onGameStart', game);
			});
			
			socket.on('BAT_SELECTED', function(data) {
				controller.trigger('onBatSelected', data);
			});
			
			socket.on('GAME_COMPLETE_SHARE', function(game) {
				controller.trigger('gameCompleteShare', game);
			});
			
			socket.on('GAME_COMPLETE', function(game) {
				controller.trigger('gameComplete', game);
			});
			
						// MOVE THIS TO GAME OBJECT
			socket.on('SWING_READY', function(data) {
				controller.trigger('onSwingReady', data);
			});
			
			socket.on('PITCH_READY', function(game) {
				//console.log('PITCH_START');
				controller.trigger('onPitchReady', game);
			});
			
			socket.on('PITCH_START', function(data) {
				//console.log('PITCH_START');
				controller.trigger('onPitchStart', data);
			});
			
			socket.on('COUNTER', function(counter) {
				//console.log('COUNTER', counter);
				controller.trigger('onCounter', counter);
			});
			socket.on('SWING_COMPLETE', function(swing) {
				//console.log('SWING_COMPLETE', swing);
				controller.trigger('swingComplete', swing);
			});
			
			socket.on('GAME_UPDATE', function(game) {
				//console.log('GAME_UPDATE', game);
				controller.trigger('onGameUpdate', game);
			});
			
			socket.on('SWING_RETRY', function(swing) {
				//console.log('SWING_RETRY', swing);
				controller.trigger('onSwingRetry', swing);
			});
			
			socket.on('LEADERBOARD_UPDATE', function(games) {
				//console.log('Game - LEADERBOARD_UPDATE, games: ', games);
				//console.log('game._id: ',that.get('_id'));
				var game = _.find(games, function(gm) {
					return gm._id == that.get('_id');
				});
				if(game)	controller.trigger('onGameUpdate', game);
			});
		},
		play: function(){
			//console.log('Game.play()');
			var socket = this.get('socket');
			socket.emit('PLAY_GAME');
		},
		/*connect: function(){
			console.log('Game.connect()');
			
			var that = this;
			
			
			
			socket.on('GAME_READY', function(data) {
				console.log('Game_READY');
				//console.log(data)
				that.set(data)
				that.get('controller').trigger('gameReady', that);
				//console.log(that)
			});


			socket.on('SWING_READY', function(socketId, data) {
				console.log('SWING_READY');

			}); 

			
			this.set('socket', socket);
			
			
			
		},*/
		countdownStart: function(){
			//console.log('Game.countdownStart()');
			this.get('socket').emit('COUNTDOWN_START', {});
		},
		pitchComplete: function(){
			//console.log('Game.pitchComplete()');
			this.get('socket').emit('PITCH_COMPLETE', {});
		},
		hitComplete: function(){
			//console.log('Game.hitComplete()');
			this.get('socket').emit('HIT_COMPLETE', {});
		},
		gameShared: function(){
			this.get('socket').emit('GAME_SHARED', {});
		},
		setId: function() {
			var code = '';
			var alphanum = 'abcdefghijklmnopqrstuvwxyz0123456789';
			while (code.length < 5) {
				var index = Math.round( Math.random() * (alphanum.length - 1) );
				code += alphanum.charAt(index);
			}
			return this.set('id', code);
		},
		url: function(){
	      return this.get("id");
	    }
	});
	
	models.GameConnect = Backbone.Model.extend({
	    defaults: {
	    	roomId: '',
	    	gameCode: '',
	    	mobileUrl: '',
	    	mobileUrlWtVars: '',
	    	bitlyRequestUrl: '',
	    	bitlyUser: '',
	    	bitlyKey: '',
	    	bitlyUrl: '',
			qrCodeUrl: ''
	    },
		initialize: function(options){
			//console.log("models.Video", options);
			//console.log(this)
		},
		gameCode: function(gameCode){
			//console.log('GameConnect.gameCode(), ',gameCode);
			
			this.set({
				gameCode: gameCode,
				mobileUrlWtVars: this.get('mobileUrl')+'#game/'+gameCode
			})
			
			//console.log('mobileUrl: ', this.get('mobileUrl'));
			
			this.generateBitlyQRCode();

			/*this.set({
				mobileBaseUrl: mobileBaseUrl,
				bitlyUrl: bitlyUrl,
				qrCodeUrl: qrCodeUrl
			})*/
			//'http://'+location.hostname+port+'/mobile.html?id='+guid;
		},
		generateBitlyQRCode: function () {
			//console.log('GameConnect.generateBitlyQRCode()');
			//console.log('bitlyRequestUrl: ',this.get('bitlyRequestUrl'))
			var that = this;
			
			$.ajax({
				url: that.get('bitlyRequestUrl'),
				data: {
					'login'		: that.get('bitlyUser'),
					'apiKey'	: that.get('bitlyKey'),
					'format'	: 'json',
					//'longUrl'	: mobileUrlWtVars
					//'longUrl'	: that.get('mobileUrl')
					//'longUrl'	: that.get('mobileUrl')+'#game/'+that.get('gameCode')
					'longUrl'	: that.get('mobileUrl')
				},
				dataType: 'jsonp',
				success: function (response) {
					console.log('bitlyRequestUrl, response: ',response);
					if(response.status_txt == "OK"){
						that.set({
							bitlyUrl: response.data.url,
							qrCodeUrl:'http://bit.ly/'+response.data.hash+'.qrcode'
						});
					}else{

						that.set({
							bitlyUrl: that.get('staticText').bitlyResponseErrorText,
							qrCodeUrl:that.get('staticText').bitlyResponseErrorText
						});
					}
				},
				error: function (error){
					that.set('bitlyUrl', that.get('staticText').bitlyResponseErrorText);
					//that.showMobileUrl();
				}
			});
		},
		url: function(){
	      return this.get("id");
	    }
	});
	
	models.Video = Backbone.Model.extend({
	    defaults: {
	    	id: 'default',
	    	value: 'undefined',
			text: 'Lorem ipsum',
			isSelected: false,
			sourceMp4: '',
			sourceOgv: '',
			sourceWebm: ''
	    },
		initialize: function(options){
			//console.log("models.Video", options);
			//console.log(this)
		},
		url: function(){
	      return this.get("id");
	    }
	});
	
	models.Videos = Backbone.Collection.extend({
		model: models.Video
	});


				
	models.TestModel = Backbone.Model.extend({
	    defaults: {
			id: 'default',
			value: 'undefined',
			text: 'Default',
			isSelected: false,
			h1Text: 'h1Text_string',
			caText: 'canada',
			usText: 'UnitedStates',
			mexText: 'Mexico'
	    },
		initialize: function(){
			//console.log("models.TestModel.initialize()");
			//console.log(this)
		}
	});

	////////////////////////////////////////////////////////////////////////////
	//	Dropdown option model
	
	models.DropDownOption = Backbone.Model.extend({
	    defaults: {
			id: 'default',
			value: 'undefined',
			text: 'Default',
			isSelected: false
	    },
		initialize: function(){
			//console.log("models.DropDownOption");
			//console.log(this)
		},
		url: function(){
	      return this.get("id");
	    }
	});

	
	models.MenuItem = Backbone.Model.extend({
	    defaults: {
			value: 'undefined',
			text: 'Default',
			isSelected: false
	    },
		initialize: function(){
			//console.log("models.DropDownOption");
			//console.log(this)
		},
		url: function(){
	      return this.get("id");
	    }
	});
	
	models.Menu = Backbone.Collection.extend({
		model: models.MenuItem
	});
	
	

	// add all the classes to the namespace models object
	ns.models = models;
	
}(app, jQuery, _, Backbone, io, accounting, MediaElement, FB, sessvars));