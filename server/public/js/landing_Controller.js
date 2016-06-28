/**
 * @author bneufeld
 */
////////////////////////////////////////////////////////////////////////////////
// defines the controller
////////////////////////////////////////////////////////////////////////////////

(function(ns, $, _, Backbone, io, accounting, MediaElementPlayer, FB, sessvars){

    var Controller = Backbone.Router.extend({
        routes: {
            "video/:video": "videoRoute",
            "debug/:debug": "debugRoute",
            "*other": "defaultRoute"
        },
        videoRoute: function(video){
        	//console.log('country1: '+country1)
        	this.model.get('navigation').set('text', video);
        	this.main.get('screens').get('gameScreen').get('videos').show(video);
            //just direct to root of url and set categoryID to 'cars'
          //console.log("defaultRoute, You attempted to reach:" + other);
        },
        debugRoute: function(debug){
        	console.log('debugRoute: ',debug);
        	this.main.get('debug').visible(true);

        },
        defaultRoute: function(error){

        },
        
        ////////////////////////////////////////////////////////////////////////////
        //INITIALIZE ALL OBJECTS FOR THE APPLICATION
        ////////////////////////////////////////////////////////////////////////////
        
        initialize: function(options){
            //console.log("Controller.initialize()")
            
            // START!
           
            var that = this;
            
            this.model = options.model;
            this.view = options.view;
            
			
            this.staticText = ns.config.staticText.get();
            this.lang = ns.config.lang.get();
            this.urls = ns.config.urls.get();
            
            this.formatting = ns.config.formatting.get();
            this.accounting = accounting;
            this.accounting.settings = this.formatting.currencySettings;
            this.accounting.percentSettings = this.formatting.percentSettings;
            
            this.socket = io.connect(this.urls.socketIO, {
				transports : ['websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'xhr-multipart', 'jsonp-polling'],
				'try multiple transports' : true
			});
			
			FB.init({
			 appId: '650611834964955', // App ID
			 // channelUrl: '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel File
			 status: true, // check login status
			 cookie: true, // enable cookies to allow the server to access the session
			 xfbml: true // parse XFBML
			});

			//sessvars.$.debug();
			

            ////////////////////////////////////////////////////////////////////////////
            // Bind Events
            ////////////////////////////////////////////////////////////////////////////
            
            _.extend(this, Backbone.Events);
            // fired when categories (allVehicles) are loaded from ws request //
            
            _.bindAll(this, "navItemOnClick");
            this.bind("navItemOnClick", this.navItemOnClick);
            
            _.bindAll(this, "roomReady");
            this.bind("roomReady", this.roomReady);

            _.bindAll(this, "connected");
            this.bind("connected", this.connected);
            
            _.bindAll(this, "connectionError");
            this.bind("connectionError", this.connectionError);
            
            _.bindAll(this, "disconnected");
            this.bind("disconnected", this.disconnected);
            
            _.bindAll(this, "onServerError");
            this.bind("onServerError", this.onServerError);
            
            _.bindAll(this, "onRegistrationError");
            this.bind("onRegistrationError", this.onRegistrationError);
            
            _.bindAll(this, "onError");
            this.bind("onError", this.onError);
            
            _.bindAll(this, "onDatabaseError");
            this.bind("onDatabaseError", this.onDatabaseError);
            
            _.bindAll(this, "roomNotAvailble");
            this.bind("roomNotAvailble", this.roomNotAvailble);
            
            _.bindAll(this, "onSwingReady");
            this.bind("onSwingReady", this.onSwingReady);

			
			
			_.bindAll(this, "closePopUp");
            this.bind("closePopUp", this.closePopUp);
            
            _.bindAll(this, "registerSubmitOnClick");
            this.bind("registerSubmitOnClick", this.registerSubmitOnClick);
            
            _.bindAll(this, "registerBtnClick");
            this.bind("registerBtnClick", this.registerBtnClick);
            
            _.bindAll(this, "loginBtnClick");
            this.bind("loginBtnClick", this.loginBtnClick);
            
            _.bindAll(this, "signUpWithTwitterBtnClick");
            this.bind("signUpWithTwitterBtnClick", this.signUpWithTwitterBtnClick);
            
            _.bindAll(this, "onTwitterOathToken");
            this.bind("onTwitterOathToken", this.onTwitterOathToken);
            
            _.bindAll(this, "registerWithFacebook");
            this.bind("registerWithFacebook", this.registerWithFacebook);
            
			_.bindAll(this, "registerWithTwitter");
            this.bind("registerWithTwitter", this.registerWithTwitter);
            
            _.bindAll(this, "onLoginStatus");
            this.bind("onLoginStatus", this.onLoginStatus);
            
			_.bindAll(this, "onRegisteredUser");
            this.bind("onRegisteredUser", this.onRegisteredUser);
            
            _.bindAll(this, "onRegistrationSuccess");
            this.bind("onRegistrationSuccess", this.onRegistrationSuccess);
            
			_.bindAll(this, "loginSubmitOnClick");
            this.bind("loginSubmitOnClick", this.loginSubmitOnClick);
            
            _.bindAll(this, "onLoginError");
            this.bind("onLoginError", this.onLoginError);
            
			_.bindAll(this, "onLoginSuccess");
            this.bind("onLoginSuccess", this.onLoginSuccess);
            
            _.bindAll(this, "forgotPswdBtnClick");
            this.bind("forgotPswdBtnClick", this.forgotPswdBtnClick);
            
            _.bindAll(this, "emailPswdBtnClick");
            this.bind("emailPswdBtnClick", this.emailPswdBtnClick);
            
			_.bindAll(this, "onSendEmailError");
            this.bind("onSendEmailError", this.onSendEmailError);
            
			_.bindAll(this, "onSendEmailSuccess");
            this.bind("onSendEmailSuccess", this.onSendEmailSuccess);
            
            _.bindAll(this, "playGame");
            this.bind("playGame", this.playGame);
            
            _.bindAll(this, "gameReady");
            this.bind("gameReady", this.gameReady);
            
            _.bindAll(this, "gameCompleteShare");
            this.bind("gameCompleteShare", this.gameCompleteShare);
            
            _.bindAll(this, "gameComplete");
            this.bind("gameComplete", this.gameComplete);
            
            _.bindAll(this, "onMobileConnect");
            this.bind("onMobileConnect", this.onMobileConnect);
            
            _.bindAll(this, "onCounter");
            this.bind("onCounter", this.onCounter);
            
            _.bindAll(this, "onPitchReady");
            this.bind("onPitchReady", this.onPitchReady);
            
            _.bindAll(this, "onPitchStart");
            this.bind("onPitchStart", this.onPitchStart);
            
            _.bindAll(this, "onVideoEvent");
            this.bind("onVideoEvent", this.onVideoEvent);
            
            _.bindAll(this, "swingComplete");
            this.bind("swingComplete", this.swingComplete);
            
            _.bindAll(this, "onGameUpdate");
            this.bind("onGameUpdate", this.onGameUpdate);
            
            _.bindAll(this, "onSwingRetry");
            this.bind("onSwingRetry", this.onSwingRetry);
            
            _.bindAll(this, "retrySwingBtnClick");
            this.bind("retrySwingBtnClick", this.retrySwingBtnClick);
            
            _.bindAll(this, "fbShareBtnClick");
            this.bind("fbShareBtnClick", this.fbShareBtnClick);
            
            _.bindAll(this, "onFindPlayer");
            this.bind("onFindPlayer", this.onFindPlayer);
            
			//console.log(ns.config.environment.get())
			
            //_(this).bindAll('categorySelection', 'vehicleSelection', 'modelYearSelection', 'vehicleModelSelection','categoriesOnLoad','locationSelection','modelPackageSelection','incentiveSelection','productSelection');
            
            //var player = new MediaElementPlayer('#player2');
            //player.play();
            ////////////////////////////////////////////////////////////////////////////
            // Initialize Models
            ////////////////////////////////////////////////////////////////////////////
            
           
            this.model.set({
               controller: this,
               navigation: new Backbone.Model({text: 'Lorem Ipsum'}),
               errorMessage: new Backbone.Model(this.staticText.errors.connectionError),
               leaderBoard: new ns.models.LandingLeaderBoard({
					controller:this,
                    socket: this.socket
				},[]),
				leaderboardSearch: new ns.models.LeaderBoardSearch(),
				debug: new Backbone.Model({gameId: this.staticText.none, statusMessage: this.staticText.notConnected})
            });
            

            ////////////////////////////////////////////////////////////////////////////
            // Initialize Views
            ////////////////////////////////////////////////////////////////////////////
            
            this.header = new ns.views.View({
				el: $('header').get(0),
				text: ns.config.staticText.get(),
				id: 'header'
				}
			);
			
			this.main = new ns.views.View({
				el: $('article[role="main"]').get(0),
				text: ns.config.staticText.get(),
				id: 'main'
				}
			);
			
			this.footer = new ns.views.View({
				el: $('footer').get(0),
				text: ns.config.staticText.get(),
				id: 'footer'
				}
			);
			
			
			
			this.main.add(new ns.views.BaseClass({
            	id: 'debug',
                text: this.staticText,
                model: this.model.get('debug'),
                controller: this,
                template: ns.config.templates.get('debug-tmpl'),
                isVisible: false,
                //isEnabled: true,
                isCollapsed: false
            }));
			
            ////////////////////////////////////////////////////////////////////////////
			//	Screens View 
			////////////////////////////////////////////////////////////////////////////
			/*this.main.add(new ns.views.Screens({
				id: 'screens',
				text: this.staticText,
				template: ns.config.templates.get('screens-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this
			}))*/
			
			this.main.add(new ns.views.LeaderBoardSearch({
            	id: 'leaderboardSearch',
                text: this.staticText,
                data: {id: 'leaderboard-search'},
                controller: this,
                template: ns.config.templates.get('leaderboard-search-tmpl'),
                model: this.model.get('leaderboardSearch'),
                isVisible: true
            }));
            
            //	LEADERBOARD!!!
			 this.main.get('leaderboardSearch').add(new ns.views.LeaderBoard({
            	id: 'leaderBoard',
                text: this.staticText,
                data: {title: ''},
                controller: this,
                template: ns.config.templates.get('leaderboard-tmpl'),
                collection: this.model.get('leaderBoard'),
                childViewConstructor: ns.views.BaseClass,
                childTemplate: ns.config.templates.get('leaderboard-item-tmpl'),
                content: 'table'
			}))
            
			this.main.add(new ns.views.BaseClass({
            	id: 'landingIntro',
                text: this.staticText,
                data: {id: 'landing-intro'},
                controller: this,
                template: ns.config.templates.get('landing-intro-tmpl'),
                model: new Backbone.Model(),
                isVisible: true
            }));

            
            
            
            ////////////////////////////////////////////////////////////////////////////
			//	Pop ups View 
			////////////////////////////////////////////////////////////////////////////
			this.main.add(new ns.views.Popups({
				id: 'popups',
				text: this.staticText,
				template: ns.config.templates.get('popups-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this		
			}));
			
			this.main.get('popups').add(new ns.views.Popup({
				id: 'errorPopup',
				text: this.staticText,
				template: ns.config.templates.get('error-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('errorMessage')		
			}));
			

			
			
			////////////////////////////////////////////////////////////////////////////
			//	Overlays View 
			////////////////////////////////////////////////////////////////////////////
			this.main.add(new ns.views.Overlays({
				id: 'overlays',
				text: this.staticText,
				template: ns.config.templates.get('overlays-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this		
			}));		
			
            this.start();
            
        },
        start: function(){
        	//console.log('Controller.start()');
            Backbone.history.start({
                pushState: false,
                root: ns.config.urls.get().game
            });
            
            //this.model.get('leaderboard').connect();
           // this.main.get('screens').show('landingIntro');
            //this.main.get('screens').show('landingIntro');
        },
        onFindPlayer: function(userName){
        	console.log('Controller.onFindPlayer()', userName);
        	this.main.get('leaderboardSearch').get('leaderBoard').show(userName);
        },
        connected: function(room){
        	//console.log('Controller.connected()');
        	this.model.get('debug').set({statusMessage: this.staticText.connected});
        },
        roomReady: function(room){
        	//console.log('Controller.roomReady(), room: ', room);
        	this.model.get('debug').set({roomId: room.get('id'), statusMessage: this.staticText.connected});
        	this.model.get('registration').checkLoginStatus();
        },
        onLoginStatus: function(response){
        	console.log('Controller.onLoginStatus()', response);
        	
        	if (response.facebook.status === 'connected'){
        		this.model.get('registration').getFacebookUser(response.facebook);
        	}else if (response.twitter){
        		sessvars.$.clearMem();
        		this.model.get('registration').getTwitterUser(response.twitter);
        	}else{
        		// show log in options dialogue
        		this.main.get('popups').show('registrationOptions');
        	}
        	
        },
		registerWithFacebook: function(response){
        	//console.log('Controller.registerWithFacebook()', response);
        	
        	if(this.model.get('registration').get('registered')){
        		return;
        	}
        	       	
			var userObj = {
				firstName : response.first_name,
				lastName : response.last_name,
				userName : response.username,
				facebook : response,
				socialId : response.id,
				type : 'facebook'
			}
			
			this.model.get('registration').get('userInfoRegister').set(userObj, {forceUpdate: true});
			this.main.get('popups').show('userInformationForm');
			
			//console.log(this.model.get('registration').get('userInfoRegister'))
        	
        },
        registerWithTwitter: function(data){
        	
        	if(this.model.get('registration').get('registered')){
        		return;
        	}
        	
        	this.main.get('popups').show('userInformationForm');
        	
        	var fullNameArr = data.name.split(' ');
        	var firstName = fullNameArr[0];
        	var lastName = fullNameArr[1];
        	
        	var userObj = {
				firstName : firstName,
				lastName : lastName,
				userName : data.screen_name,
				twitter : data,
				type : 'twitter',
				socialId: data.id
			}
			
			this.model.get('registration').get('userInfoRegister').set(userObj, {forceUpdate: true});
			this.main.get('popups').show('userInformationForm');
			
        	//console.log('Controller.registerWithTwitter()', data);
        },
        onRegistrationSuccess: function(user){
        	console.log('Controller.onRegistrationSuccess()', user);
        	this.onRegisteredUser(user);        	
        },
        onError: function(data){
        	//console.log('Controller.onError() ',data.type);
				
				switch(data.type) {
					case 'connection':
						this.model.get('errorMessage').set(this.staticText.errors.connectionError);
						this.main.get('popups').show('errorPopup');
						this.main.get('screens').show('gameScreen');
						this.model.get('debug').set({statusMessage: this.staticText.disconnected});
						break;
					default:
				}
        },
        onDatabaseError: function(data){
        	//console.log('Controller.onDatabaseError() ',data.type);
				
				switch(data.type) {
					case 'connection':
						this.model.get('errorMessage').set(this.staticText.errors.databaseConnectionError);
						this.main.get('popups').show('errorPopup');
						this.model.get('debug').set({statusMessage: this.staticText.disconnected});
						break;
					default:
				}			
        },
        onRegistrationError: function(data){
        	//console.log('onRegistrationError: '+data.type+', '+data.description);
        	
        	switch(data.type) {
					case 'duplicateEntry':
						//console.log('duplicates: ', data.values)
						var duplicates = {}
						for(var i = 0; i < data.values.length; i++){
							duplicates[data.values[i]+'Unique'] = false;
						}
						this.model.get('registration').get('userInfoRegister').set(duplicates, {silent: true});
						this.model.get('registration').get('userInfoRegister').isValid(true);
						break;
					case 'queryError':

						break;
					case 'apiError':

						break;
					default:

				}
        },
        onLoginError: function(data){
        	//console.log('onLoginError: '+data.type+', '+data.description);

        	switch(data.type) {
					case 'passwordIncorrect':
						this.model.get('registration').get('userInfoLogin').set('passwordIncorrect', true, {silent: true});
						this.model.get('registration').get('userInfoLogin').isValid(true);
						break;
					case 'emailAddressIncorrect':
						this.model.get('registration').get('userInfoLogin').set('emailAddressIncorrect', true, {silent: true});
						this.model.get('registration').get('userInfoLogin').isValid(true);
						break;
					case 'alreadyLoggedIn':
						this.model.get('errorMessage').set(this.staticText.errors.loginError);
						this.main.get('popups').show('errorPopup');
						break;
					case 'queryError':

						break;
					case 'apiError':

						break;
					default:
				}
        },
        onSendEmailError: function(data){
        	//console.log('Controller.onSendEmailError()', data);
        	
        	switch(data.type) {
					case 'emailAddressIncorrect':
						this.model.get('registration').get('userInfoForgotPswd').set('emailAddressIncorrect', true, {silent: true});			
						this.model.get('registration').get('userInfoForgotPswd').isValid(true);
						break;
					case 'queryError':
						break;
					case 'apiError':
						break;
					default:
				}
        },
        onSendEmailSuccess: function(data){
        	//console.log('Controller.onSendEmailSuccess()');
        	this.model.get('registration').get('userInfoLogin').set(data);
        	this.main.get('popups').show('logIn');
        },
        onLoginSuccess: function(user){
        	//console.log('Controller.onLoginSuccess()');
        	this.onRegisteredUser(user);
        	
        },
        forgotPswdBtnClick: function(data){
        	//console.log('Controller.forgotPswdBtnClick()', data);
        	
        	this.main.get('popups').show('forgotPassword');
        	///this.model.get('registration').emailPassword(data);
        	
        },
        emailPswdBtnClick: function(data){
        	//console.log('Controller.emailPswdBtnClick()', data);
        	this.model.get('registration').emailPassword(data);
        },
        connectionError: function(room){
        	//console.log('Controller.connectionError()');

        	this.model.get('debug').set({statusMessage: this.staticText.disconnected});
        	this.main.get('popups').show('errorPopup');

        },
        onServerError: function(data){
        	this.model.get('debug').set(data);
        	//alert('onServerError')
        },
        roomNotAvailble: function(room){
        	//console.log('Controller.roomNotAvailble()');
        	this.model.get('debug').set({roomId: this.staticText.gameNotAvailable});
        	//this.main.get('startButton').visible(false);
        },
        disconnected: function(room){
        	//console.log('Controller.disconnected()');
        	this.model.get('debug').set({statusMessage: this.staticText.disconnected});
        	//this.main.get('startButton').visible(false);
        },
        closePopUp: function(){
        	this.main.get('popups').hide();
        },
        registerBtnClick: function(model){
        	//console.log('Controller.registerBtnClick()');
        	this.main.get('popups').show('userInformationForm');
        	
        },
        loginBtnClick: function(model){
        	//console.log('Controller.loginBtnClick()');
        	this.main.get('popups').show('logIn');
        },
        registerSubmitOnClick: function(model){
        	//console.log('Controller.registerSubmitOnClick()', model);
        	this.model.get('registration').get('userInfoRegister').save();
        },
        loginSubmitOnClick: function(model){
        	//console.log('Controller.loginSubmitOnClick()', model);
        	this.model.get('registration').get('userInfoLogin').save();
        },
        signUpWithTwitterBtnClick: function(model){
        	this.model.get('registration').getTwitterOathToken();
        	//console.log('Controller.signUpWithTwitterBtnClick()');
        },
        onTwitterOathToken: function(data){
        	
        	//console.log('Controller.onTwitterOathToken()', data);

        	sessvars.twitter = {requestTokenSecret: data.requestTokenSecret}
        	
        	window.location.href = 'https://twitter.com/oauth/authenticate?oauth_token='+data.requestToken;
        	
        },
        onRegisteredUser: function(data){
        	console.log('Controller.onRegisteredUser()', data);
        	//this.main.get('popups').show('loggedIn');
        	this.model.get('registration').set('registered', true);
        	this.model.get('registration').get('loggedIn').set('userName', data.userName)
        	this.model.get('game').play();
        },
        gameReady: function(game){
        	console.log('controller.gameReady()', game);
        	//this.model.get('debug').set({roomId: room.get('id'), statusMessage: this.staticText.connected});
        	this.model.get('game').get('gameConnect').gameCode(game.gameCode);
        	this.onGameUpdate(game);
        	this.model.get('debug').set({gameId: game.gameCode});
        	this.main.get('popups').show('gameConnectPopup');
        },
        gameCompleteShare: function(game){
        	console.log('controller.gameCompleteShare()', game);
        	this.main.get('popups').show('gameCompleteSharePopup');
        	this.onGameUpdate(game);
        	/*this.model.get('game').set(game);
        	//this.model.get('debug').set({roomId: room.get('id'), statusMessage: this.staticText.connected});
        	this.main.get('popups').hide();
        	this.model.get('debug').set({gameId: game.get('gameCode')});
        	this.model.get('game').get('gameConnect').gameCode(game.get('gameCode'));
        	this.main.get('popups').show('gameConnectPopup');
        	*/
        },
        gameComplete: function(game){
        	console.log('controller.gameComplete()', game);
        	this.main.get('popups').show('gameComplete');
        	this.onGameUpdate(game);
        	//this.model.get('game').set(game);
        	//this.model.get('debug').set({roomId: room.get('id'), statusMessage: this.staticText.connected});
        	/*this.main.get('popups').hide();
        	this.model.get('debug').set({gameId: game.get('gameCode')});
        	this.model.get('game').get('gameConnect').gameCode(game.get('gameCode'));
        	this.main.get('popups').show('gameConnectPopup');
        	*/
        },
        playGame: function(data){
        	console.log('controller.playGame()', data);
        	this.model.get('game').play();
        },
        onMobileConnect: function(data){
        	console.log('Controller.onMobileConnect()', data);
        	
        	//this.main.get('popups').show('pitchInstructions');
        },
        onSwingReady: function(e){
        	console.log('Controller.onSwingReady()');
        	var that = this;
        	//this.main.get('popups').show('gameScreen');
        	this.main.get('popups').hide();
        	this.main.get('screens').get('gameScreen').get('videos').show('pitchVideo');
        	this.model.get('game').get('counter').set('count', this.staticText.gameGetReadyInstructions);
        	this.main.get('overlays').show('gameGetReady');
        	
        	this.model.get('game').countdownStart();
        	
        	//this.main.get('popups').show('getReady');
        	//this.model.set('state', 'SWING_READY');
        	//this.model.get('room').emit('SWING_READY', { room: this.model.get('room').get('id') });
        	//alert('Controller.onSwingReady()');
        },
        onCounter: function(count){
        	console.log('Controller.onCounter()', count);
        	this.model.get('game').get('counter').set('count', count);
        },
        onPitchReady: function(game){
        	console.log('Controller.onPitchReady()', game);
        	//this.model.get('game').set(data);
        	this.onGameUpdate(game);
        	this.main.get('popups').show('pitchInstructions');
        },
        onPitchStart: function(data){
        	console.log('Controller.onPitchStart()', data);
        	this.main.get('popups').hide();
        	this.main.get('screens').show('gameScreen');
        	this.main.get('screens').get('gameScreen').get('videos').play('pitchVideo');
        	
        },
        onVideoEvent: function(data){
        	//console.log('controller.onVideoEvent(), ',data);
        	var that = this;
    		switch(data.id) {
				case "pitchVideo":
					switch(data.type) {
						case "loadstart":
							//console.log(data.id+", "+data.type);
							break;
						case "play":
							//console.log(data.id+", "+data.type);
							that.main.get('overlays').hide();
							break;
						case "ended":
							//console.log(data.id+", "+data.type);
							//--this.main.get('overlays').show('swingStats');
							that.model.get('game').pitchComplete();
							
							break;
						default:
					}
					break;
				case "hitCentreVideo":
					switch(data.type) {
						case "loadstart":
							//console.log(data.id+", "+data.type);
							break;
						case "play":
							//console.log(data.id+", "+data.type);
							that.main.get('overlays').show('swingStats');
							break;
						case "ended":
							//console.log(data.id+", "+data.type);
							that.model.get('game').hitComplete();
							that.main.get('overlays').hide();
							
							break;
						default:
					}
					break;
				case "hitRightVideo":
					switch(data.type) {
						case "loadstart":
							//console.log(data.id+", "+data.type);
							break;
						case "play":
							//console.log(data.id+", "+data.type);
							that.main.get('overlays').show('swingStats');
							break;
						case "ended":
							//console.log(data.id+", "+data.type);
							that.model.get('game').hitComplete();
							that.main.get('overlays').hide();
							
							break;
						default:
					}
					break;
				case "hitLeftVideo":
					switch(data.type) {
						case "loadstart":
							//console.log(data.id+", "+data.type);
							break;
						case "play":
							//console.log(data.id+", "+data.type);
							that.main.get('overlays').show('swingStats');
							break;
						case "ended":
							//console.log(data.id+", "+data.type);
							that.main.get('overlays').hide();
							that.model.get('game').hitComplete();
							break;
						default:
					}
					break;
				default:

			}
        },
        swingComplete: function(swing){
        	console.log('controller.swingComplete()', swing);
        	
        	
        	
        	if(swing.type == 'hit'){
        		swing.type = this.staticText.hit;
        		swing.distance = swing.distance+this.staticText.feet;
        		switch(swing.direction) {
					case "left":
						//this.main.get('screens').get('gameScreen').get('videos').show('hitLeftVideo');
						this.main.get('screens').get('gameScreen').get('videos').play('hitLeftVideo');
						break;
					case "centre":
						//this.main.get('screens').get('gameScreen').get('videos').show('hitCentreVideo');
						this.main.get('screens').get('gameScreen').get('videos').play('hitCentreVideo');
						break;
					case "right":
						//this.main.get('screens').get('gameScreen').get('videos').show('hitRightVideo');
						this.main.get('screens').get('gameScreen').get('videos').play('hitRightVideo');
						break;
					default:
	        	}
        	}else{
        		//Don't do anything?
        		var that = this;
        		swing.type = this.staticText.strike;
        		swing.distance = "";
        		that.main.get('overlays').show('swingStats');
        		myVar = setTimeout(function(){
        			that.main.get('overlays').hide();
					that.model.get('game').hitComplete();
        		}, 2000);
        	}
        	
        	this.model.get('game').get('swing').set(swing);
        	this.main.get('overlays').show('swingStats');
        	
        },
        onGameUpdate: function(game){
        	console.log('Controller.onGameUpdate()');
        	this.model.get('game').set(game);
        },
        onSwingRetry: function(swing){
        	//console.log('controller.onSwingRetry()');
        	this.main.get('popups').show('swingRetry');
        },
        retrySwingBtnClick: function(){
        	//console.log('controller.retrySwingBtnClick()');
        },
        fbShareBtnClick: function(){
        	console.log('Controller.fbShareBtnClick()')
        	
        	var game = this.model.get('game');
        	var facebook = this.staticText.social.facebook;
        	
			FB.ui({
				method : 'feed',
				name : facebook.name,
				link : facebook.link,
				picture : facebook.picture,
				description : facebook.description
			}, function(response) {
				console.log('FB.ui, response: ',response)
				if (response && response.post_id) {
					
					game.gameShared();
					//alert('share posted')
				} else {
					console.log('Post was not published.');
				}
			});

        	//-->window.open('https://www.facebook.com/sharer/sharer.php?app_id='+facebook.app_id+'&sdk=joey&u=http%3A%2F%2F'+facebook.url+'&display=popup','sharer','toolbar=0,status=0,width=580,height=325');
        	//https://www.facebook.com/sharer/sharer.php?app_id=650611834964955&sdk=joey&u=http%3A%2F%2Fwww.foobar.com%2F&display=popuphttp://www.facebook.com/sharer.php?s=100&amp;p[title]=foo&amp;p[summary]=bar&amp;p[url]=https://www.foobar.com/&amp;p[images][0]=https://www.foobar.com/thumb.gif','sharer','toolbar=0,status=0,width=580,height=325'
        },
        navItemOnClick: function(value){
        	//console.log('controller.navItemOnClick()');
        	this.navigate(value, {
                trigger: true,
                replace: false
            });
            
        },
        getCookie: function(c_name){
		    //console.log('getCookie');
		    var i,x,y,ARRcookies=document.cookie.split(";");
            for (i=0;i<ARRcookies.length;i++){
              x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
              y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
              x=x.replace(/^\s+|\s+$/g,"");
              if (x==c_name)
                {
                return unescape(y);
                }
              }
		},
		getCookieVar: function(params){
		    //console.log('getCookieVar')
		    var cookie = this.getCookie(params.cookie);
		    if(cookie != null && cookie != undefined && cookie.indexOf("&") > -1 && cookie.indexOf(params.value) > -1){
		        var cookieVarsArr = cookie.split("&");
                //console.log('cookieVarsArr',cookieVarsArr)		       
		        
		        for (var c=0; c<cookieVarsArr.length; c++){
		            //console.log('cookieVarsArr'+cookieVarsArr[c])
                    if(cookieVarsArr[c].indexOf(params.value) > -1){
                        //console.log('WTF!!!!', cookieVarsArr[c], params.value)
                       var cookieValArr = cookieVarsArr[c].split('=');
                        var cookieVal = cookieValArr[1];
                        return cookieVal;
                    }
                
                }
                return '';
		    }
		    return '';
		},
		setCookie: function(key, value){
			var expires = "";
				var date = new Date();
				date.setTime(date.getTime() + (360 * 24 * 60 * 60 * 1000));
				expires = "; expires=" + date.toGMTString();
				document.cookie = key + "=" + value + expires + "; path=/";
		},
		getUrlParameter: function (key, url) {
			var queryString = (url) ? url : self.location.search;

			function storeQueryData(queryString) {
				var strQueryString = queryString.split('?')[1];
				if (strQueryString) {
					var strQueryFields = strQueryString.split(/&/);
					var info = {};
					for (var i = 0; i < strQueryFields.length; i++) {
						var fieldInfo = strQueryFields[i].split(/=/, 2);
						info[fieldInfo[0]] = unescape(fieldInfo[1]);
					}
					return info;
				} else {
					return null;
				}
			}
			// set data object
			var data = storeQueryData(queryString);
			if (data && data[key]) {
				return data[key];
			} else {
				return null;
			}
		}
        
    });
    
    ns.Controller = Controller
    
}(app, jQuery, _, Backbone, io, accounting, MediaElementPlayer, FB, sessvars));



