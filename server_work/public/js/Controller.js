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
            "popup/:popup" : "popupRoute",
            "*other": "defaultRoute"
        },
        videoRoute: function(video){
        	this.model.get('navigation').set('text', video);
        	this.main.get('screens').get('gameScreen').get('videos').show(video);
        },
        howToPlayRoute: function(){
        	this.onPlayBallClickHandler();
        },
        debugRoute: function(debug){
        	//console.log('debugRoute: ',debug);
        	
        	this.main.get('debug').visible(true);
        },
        popupRoute: function(popup){
        	this.main.get('popups').show(popup);
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
            
            //console.log('environment: ',this.urls.environment)
            
            this.socket = io.connect(this.urls.socketIO, {
				transports : ['websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'xhr-multipart', 'jsonp-polling'],
				'try multiple transports' : true
			});
			
			//alert(that.urls.environment)
			//alert(that.urls.fb_app_id)
			//console.log('urls: ',that.urls);
			
			
			FB.init({
			 appId: that.urls.fb_app_id, // App ID
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
            _.bindAll(this, "testEvent");
            this.bind("testEvent", this.testEvent);
            
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
            
            _.bindAll(this, "playForFunBtnClick");
            this.bind("playForFunBtnClick", this.playForFunBtnClick);
            
            _.bindAll(this, "signUpWithTwitterBtnClick");
            this.bind("signUpWithTwitterBtnClick", this.signUpWithTwitterBtnClick);
            
            _.bindAll(this, "signUpWithFacebookBtnClick");
            this.bind("signUpWithFacebookBtnClick", this.signUpWithFacebookBtnClick);
            
            _.bindAll(this, "loginWithFacebookBtnClick");
            this.bind("loginWithFacebookBtnClick", this.loginWithFacebookBtnClick);
            
            _.bindAll(this, "loginWithTwitterBtnClick");
            this.bind("loginWithTwitterBtnClick", this.loginWithTwitterBtnClick);
            
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
            
            _.bindAll(this, "practiceUserNameSubmitOnClick");
            this.bind("practiceUserNameSubmitOnClick", this.practiceUserNameSubmitOnClick);
            
            _.bindAll(this, "registerBackBtnClick");
            this.bind("registerBackBtnClick", this.registerBackBtnClick);
            
            _.bindAll(this, "registerOptionsBackBtnClick");
            this.bind("registerOptionsBackBtnClick", this.registerOptionsBackBtnClick);
            
            _.bindAll(this, "loginBackBtnClick");
            this.bind("loginBackBtnClick", this.loginBackBtnClick);
            
            _.bindAll(this, "practiceUserNameBackBtnClick");
            this.bind("practiceUserNameBackBtnClick", this.practiceUserNameBackBtnClick);
            
            _.bindAll(this, "onGameStartNextBtnClick");
            this.bind("onGameStartNextBtnClick", this.onGameStartNextBtnClick);
            
            _.bindAll(this, "leaderBoardUpdate");
            this.bind("leaderBoardUpdate", this.leaderBoardUpdate);
            
            _.bindAll(this, "onLeaderboardClickEventHandler");
            this.bind("onLeaderboardClickEventHandler", this.onLeaderboardClickEventHandler);
            
            _.bindAll(this, "onLeaderboardSearchBtnClick");
            this.bind("onLeaderboardSearchBtnClick", this.onLeaderboardSearchBtnClick);
            
             _.bindAll(this, "onTwitterClickEventHandler");
            this.bind("onTwitterClickEventHandler", this.onTwitterClickEventHandler);
            
             _.bindAll(this, "onFacebookClickEventHandler");
            this.bind("onFacebookClickEventHandler", this.onFacebookClickEventHandler);
            
            _.bindAll(this, "onPageSelection");
            this.bind("onPageSelection", this.onPageSelection);
            
            _.bindAll(this, "onPlayBallClickHandler");
            this.bind("onPlayBallClickHandler", this.onPlayBallClickHandler);
            
            _.bindAll(this, "onShowPreviousPopup");
            this.bind("onShowPreviousPopup", this.onShowPreviousPopup);
            
            _.bindAll(this, "onRetryBtnClick");
            this.bind("onRetryBtnClick", this.onRetryBtnClick);
            
            _.bindAll(this, "onBatSelected");
            this.bind("onBatSelected", this.onBatSelected);
            
            _.bindAll(this, "onGameStart");
            this.bind("onGameStart", this.onGameStart);
            
			//console.log(ns.config.environment.get())
			
            //_(this).bindAll('categorySelection', 'vehicleSelection', 'modelYearSelection', 'vehicleModelSelection','categoriesOnLoad','locationSelection','modelPackageSelection','incentiveSelection','productSelection');
            
            //var player = new MediaElementPlayer('#player2');
            //player.play();
            ////////////////////////////////////////////////////////////////////////////
            // Initialize Models
            ////////////////////////////////////////////////////////////////////////////
            

            this.model.set({
            
                controller: this,
               
               videos: new ns.models.Videos(ns.config.videos.get().data),
               
               errorMessage: new Backbone.Model(this.staticText.errors.connectionError),

			   room: new ns.models.Room({
					urls: ns.config.urls.get(),
					controller: this,
					lang: this.lang,
					socket: this.socket,
					staticText: this.staticText,
					meta: {
					}
				}),
				registration: new ns.models.Registration({
					urls:ns.config.urls.get(),
                    accounting:this.accounting,
                    controller:this,
                    socket: this.socket,
                    FB: FB,
					userInfoRegister:new ns.models.UserInfoRegister({
                        urls:ns.config.urls.get(),
                        accounting:this.accounting,
                        controller:this,
                        FB: FB,
                        socket: this.socket,
                        facebook: {},
                        twitter: {}
                    }),
                    userInfoLogin:new ns.models.UserInfoLogIn({
                        urls:ns.config.urls.get(),
                        accounting:this.accounting,
                        controller:this,
                        FB: FB,
                        socket: this.socket
                    }),
                    loggedIn: new Backbone.Model({
                    	firstName: '',
                    	lastName: '',
                    	userName: 'xxx'
                    }),
                    userInfoForgotPswd: new ns.models.UserInfoForgotPswd({
                    	urls:ns.config.urls.get(),
                        accounting:this.accounting,
                        controller:this,
                        FB: FB,
                        socket: this.socket
                    }),
                    practiceUserInfo: new ns.models.PracticeUserInfo({
                    	urls:ns.config.urls.get(),
                        accounting:this.accounting,
                        controller:this,
                        socket: this.socket
                    })
				}),
				game: new ns.models.Game({
					urls:ns.config.urls.get(),
                    accounting:this.accounting,
                    controller:this,
                    socket: this.socket,
                    FB: FB,
                    gameConnect: new ns.models.GameConnect({
                    	bitlyRequestUrl: this.urls.bitlyRequestUrl,
				    	bitlyUser: this.urls.bitlyUser,
				    	bitlyKey: this.urls.bitlyKey,
				    	mobileUrl: this.urls.mobile,
				    	staticText: this.staticText
				    	//mobileUrl: location.protocol+'//'+location.host+this.urls.mobile
                    }),
                    counter: new Backbone.Model({
                    	count: this.staticText.gameGetReadyInstructions
                    }),
                    swing: new Backbone.Model({
                    	result: '',
                    	distance: 0,
                    	direction: '',
                    	type: '',
                    	bat: 0,
                    	description: ''
                    })
                    //->player: new ns.models.Player(),
				}),
				/*leaderBoard: new ns.models.LeaderBoard({
					controller:this,
                    socket: this.socket
				}, []),*/
				leaderBoard: new ns.models.LeaderBoard({
					controller:this,
                    socket: this.socket,
                    selectedPlayer: '',
                    selectedPage: 1,
                    pages: [],
                    itemsPerPage: this.staticText.leaderBoardNumItemsPerPg,
                    games: new ns.models.Games({
                    	controller:this,
                    	socket: this.socket
                    },[])
				}),
				debug: new Backbone.Model({gameId: this.staticText.none, statusMessage: this.staticText.notConnected}),
				testCollection: new Backbone.Collection({},[])
            });
            

           //console.log(ns.config.videos.get());
           
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
			
			/*
			var marginTop = $(window).height() - $('article[role="main"]').height()-$('header').height();
			$('article[role="main"]').css('margin-top', marginTop);
			*/
			
			
			/*
			this.footer = new ns.views.View({
				el: $('footer').get(0),
				text: ns.config.staticText.get(),
				id: 'footer'
				}
			);
			*/
			
			this.header.add(new ns.views.ListBaseClass({
            	id: 'headerRanking',
                text: this.staticText,
                data: {title: ''},
                content: 'ol',
                controller: this,
                template: ns.config.templates.get('header-ranking-tmpl'),
                collection: this.model.get('leaderBoard').get('games'),
                childViewConstructor: ns.views.ListItemBaseClass,
                childTemplate: ns.config.templates.get('header-ranking-item-tmpl')
			}))
			
			this.header.add(new ns.views.BaseClass({
            	id: 'navGameStats',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('nav-games-stats-tmpl'),
                model: this.model.get('game'),
                isVisible: true
            }));
			this.header.get('navGameStats').visible(false);
			
			this.header.add(new ns.views.HeaderNav({
				id: 'headerNav',
                text: this.staticText,
                model: new Backbone.Model({}),
                controller: this,
                template: ns.config.templates.get('header-nav-tmpl'),
                isVisible: false,
                //isEnabled: true,
                isCollapsed: false
			}))
			
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
			this.main.add(new ns.views.Screens({
				id: 'screens',
				text: this.staticText,
				template: ns.config.templates.get('screens-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this
			}));
			
			this.main.get('screens').add(new ns.views.Screen({
            	id: 'landingScreen',
                text: this.staticText,
                data: {id: 'landing-screen'},
                controller: this,
                template: ns.config.templates.get('screen-tmpl'),
                model: new Backbone.Model(),
                isVisible: false
            }));
            
            this.main.get('screens').get('landingScreen').add(new ns.views.Screen({
            	id: 'landingAnimation',
                text: this.staticText,
                data: {},
                controller: this,
                template: ns.config.templates.get('landing-animation-tmpl'),
                model: new Backbone.Model(),
                isVisible: false
            }));
            
            
            
			this.main.get('screens').add(new ns.views.Screen({
            	id: 'gameScreen',
                text: this.staticText,
                data: {id: 'game-screen'},
                controller: this,
                template: ns.config.templates.get('screen-tmpl'),
                model: new Backbone.Model(),
                isVisible: false
            }));
			
            this.main.get('screens').get('gameScreen').add(new ns.views.VideosView({
            	id: 'videos',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('videos-tmpl'),
                collection: this.model.get('videos'),
                childViewConstructor: ns.views.VideoView,
                childTemplate: ns.config.templates.get('video-tmpl'),
                isVisible: false
            }));
            
            this.main.get('screens').get('gameScreen').get('videos').initializePlayers(ns.config.videos.get().options);
            
            /*
            this.main.get('screens').get('gameScreen').add(new ns.views.BaseClass({
            	id: 'gameStats',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('games-stats-tmpl'),
                model: this.model.get('game'),
                isVisible: true
            }));
            */
            /*
            this.main.get('screens').get('gameScreen').add(new ns.views.BaseClass({
            	id: 'swingStats',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('swing-stats-tmpl'),
                model: this.model.get('game').get('swing'),
                isVisible: true
            }));
            */
            //this.main.get('videos').show('pitch');
            
			//var player = new MediaElementPlayer($('#pitch'));
			//player.play();
			//console.log('videos collection ',this.model.get('videos'))
			
			/*
			this.main.add(new ns.views.VideoView({
            	id: 'player2',
                text: this.staticText,
                model: this.model.get('testModel'),
                controller: this,
                template: ns.config.templates.get('video-tmpl'),
                isVisible: true,
                isEnabled: true,
                isCollapsed: false
            }));
            
            //navigation
			this.main.add(new ns.views.BaseClass({
            	id: 'navigation',
                text: this.staticText,
                model: this.model.get('navigation'),
                controller: this,
                template: ns.config.templates.get('navigation-tmpl'),
                isVisible: true,
                isEnabled: true,
                isCollapsed: false
            }));
            
            
			this.main.get('navigation').add(new ns.views.NavList({
            	id: 'navList',
                text: this.staticText,
                data: {text: ''},
                controller: this,
                //content: 'ul',
                template: ns.config.templates.get('nav-list-tmpl'),
                collection: this.model.get('videos'),
                childViewConstructor: ns.views.NavItem,
                childTemplate: ns.config.templates.get('nav-item-tmpl')
            }));
            
			*/  
            
            
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
			
            this.main.get('popups').add(new ns.views.LeaderboardPopup({
				id: 'leaderboardPopup',
				text: this.staticText,
				data: {leaderboardTitle: this.staticText.leaderboardTitle},
				template: ns.config.templates.get('leaderboard-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('leaderBoard'),
				content: '#leaderboard-wrapper'
			}));
			
			/*
			this.main.get('popups').get('leaderboardPopup').add(new ns.views.Loader({
            	id: 'LeaderboardLoader',
                text: this.staticText,
                data: {leaderboardTitle: this.staticText.leaderboardTitle},
                controller: this,
                template: ns.config.templates.get('leaderboard-tmpl'),
                collection: this.model.get('leaderBoard').get('games'),
                childViewConstructor: ns.views.BaseClass,
                childTemplate: ns.config.templates.get('leaderboard-item-tmpl')
            }));
			*/

			this.main.get('popups').get('leaderboardPopup').add(new ns.views.LeaderboardGames({
            	id: 'LeaderboardGames',
                text: this.staticText,
                data: {leaderboardTitle: this.staticText.leaderboardTitle},
                controller: this,
                template: ns.config.templates.get('leaderboard-tmpl'),
                collection: this.model.get('leaderBoard').get('games'),
                childViewConstructor: ns.views.BaseClass,
                childTemplate: ns.config.templates.get('leaderboard-item-tmpl')
            }));
            
            
            
            //this.model.get('leaderBoard').set('selectedPage', 2);
            
            
            //this.main.get('popups').get('leaderboardPopup').page(3);
            
            /*
            this.main.get('popups').get('leaderboard').add(new ns.views.LeaderBoardSearch({
				id: 'leaderboardSearch',
				text: this.staticText,
				template: ns.config.templates.get('leaderboard-search-tmpl'),
				//isEnabled	: false,
				isVisible: true,
				controller: this		
			}), { selector: 'table' });
            */
           
            //this.main.get('popups').show('leaderboard');
            
            //	LEADERBOARD!!!
            /*
			 this.main.get('popups').get('leaderboardSearch').add(new ns.views.LeaderBoard({
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
			*/
			
			this.main.get('popups').add(new ns.views.UserInformationForm({
				id: 'userInformationForm',
				text: this.staticText,
				template: ns.config.templates.get('UserInfoRegister-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('registration').get('userInfoRegister')
				//content: '#update-province-dropdown'
				//event		: 'sendToDealerClick'
				//model		:this.model.get('selection')		
			}));
			
			this.main.get('popups').add(new ns.views.RegistrationOptions({
				id: 'registrationOptions',
				text: this.staticText,
				template: ns.config.templates.get('register-options-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: new Backbone.Model()
				//content: '#update-province-dropdown'
				//event		: 'sendToDealerClick'
				//model		:this.model.get('selection')		
			}));
			
			this.main.get('popups').add(new ns.views.LogIn({
				id: 'logIn',
				text: this.staticText,
				template: ns.config.templates.get('login-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('registration').get('userInfoLogin')	
			}));
			
			this.main.get('popups').add(new ns.views.ForgotPswd({
				id: 'forgotPassword',
				text: this.staticText,
				template: ns.config.templates.get('forgot-pswd-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('registration').get('userInfoForgotPswd')
			}));
			
			this.main.get('popups').add(new ns.views.LoggedIn({
				id: 'loggedIn',
				text: this.staticText,
				template: ns.config.templates.get('loggedIn-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('registration').get('loggedIn')	
			}));
			
			this.main.get('popups').add(new ns.views.Popup({
				id: 'errorPopup',
				text: this.staticText,
				template: ns.config.templates.get('error-popup-tmpl'),
				//isEnabled	: false,
				event: 'onRetryBtnClick',
				isVisible: false,
				controller: this,
				model: this.model.get('errorMessage')		
			}));
            
            this.main.get('popups').add(new ns.views.Popup({
				id: 'gameConnectPopup',
				text: this.staticText,
				template: ns.config.templates.get('game-connect-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('game').get('gameConnect')
			}));
			
			this.main.get('popups').add(new ns.views.Popup({
				id: 'swingRetry',
				text: this.staticText.errors.swingRetryError,
				template: ns.config.templates.get('swing-retry-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: new Backbone.Model(),
				event: 'retrySwingBtnClick'
			}));
			
			this.main.get('popups').add(new ns.views.Screen({
				id: 'gameConnected',
				text: this.staticText,
				template: ns.config.templates.get('game-connected-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: new Backbone.Model()
			}));
			
			this.main.get('popups').add(new ns.views.Screen({
				id: 'proGameIntro',
				text: this.staticText,
				template: ns.config.templates.get('pro-game-intro-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('game'),
			}));
			
			this.main.get('popups').add(new ns.views.Screen({
				id: 'practiceSwingsIntro',
				text: this.staticText,
				template: ns.config.templates.get('practice-swings-intro-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('game'),
				event: "closePopUp"
			}));
			
			this.main.get('popups').add(new ns.views.GameComplete({
				id: 'gameCompleteSharePopup',
				text: this.staticText,
				template: ns.config.templates.get('game-complete-share-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('game')
			}));
			
			this.main.get('popups').add(new ns.views.Popup({
            	id: 'swingStats',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('swing-stats-tmpl'),
                model: this.model.get('game').get('swing'),
                isVisible: false
            }));
			/*
			this.main.get('overlays').add(new ns.views.Overlay({
            	id: 'swingStats',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('swing-stats-tmpl'),
                model: this.model.get('game').get('swing'),
                isVisible: false
            }));
			*/
			/*
			this.main.get('popups').get('gameCompleteSharePopup').add(new ns.views.BaseClass({
            	id: 'leaderBoard',
                text: this.staticText,
                data: {},
                controller: this,
                template: ns.config.templates.get('your-rank-tmpl'),
                model: this.model.get('game')
			}))
			*/
			this.main.get('popups').add(new ns.views.GameComplete({
				id: 'gameComplete',
				text: this.staticText,
				template: ns.config.templates.get('game-complete-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('game')
			}));
			
			/*this.main.get('popups').get('gameComplete').add(new ns.views.BaseClass({
            	id: 'leaderBoard',
                text: this.staticText,
                data: {},
                controller: this,
                template: ns.config.templates.get('your-rank-tmpl'),
                model: this.model.get('game')
			}))
			*/
			
			this.main.get('popups').add(new ns.views.PracticeUserName({
				id: 'practiceUserName',
				text: this.staticText,
				template: ns.config.templates.get('practice-user-name-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('registration').get('practiceUserInfo')	
			}));
			
			
			/* LEADERBOARD!!!
			 this.main.get('popups').get('gameCompleteSharePopup').add(new ns.views.ListBaseClass({
            	id: 'leaderBoard',
                text: this.staticText,
                data: {title: ''},
                controller: this,
                template: ns.config.templates.get('leaderboard-tmpl'),
                collection: this.model.get('leaderBoard'),
                childViewConstructor: ns.views.ListItemBaseClass,
                childTemplate: ns.config.templates.get('leaderboard-item-tmpl')
			}))
			 */
			
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
			
			this.main.get('overlays').add(new ns.views.LandingIntroAnimation({
            	id: 'introAnimation',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('landing-animation-tmpl'),
                model: new Backbone.Model(),
                isVisible: true
            }));
			
			//hide these???
			/*this.main.get('overlays').add(new ns.views.Overlay({
            	id: 'swingStats',
                text: this.staticText,
                data: {title: 'Lorem ipsum'},
                controller: this,
                template: ns.config.templates.get('swing-stats-tmpl'),
                model: this.model.get('game').get('swing'),
                isVisible: false
            }));
			*/
			
			this.main.get('overlays').add(new ns.views.Overlay({
				id: 'gameGetReady',
				text: this.staticText,
				template: ns.config.templates.get('game-get-ready-overlay-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('game').get('counter')
			}));
			
            this.start();
            
        },
        start: function(){
        	//console.log('Controller.start()');
            Backbone.history.start({
                pushState: false,
                root: ns.config.urls.get().game
            });
            
            this.model.get('room').connect();
            
            //this.main.get('screens').show('landingScreen');
            
            
            if(!sessvars.twitter){
            	console.log('no twitter session vars!')
				this.main.get('screens').show('gameScreen');

				//this.main.get('screens').get('gameScreen').get('videos').show('lightsOn');
				this.main.get('screens').get('gameScreen').get('videos').play('lightsOn');
				//this.main.get('screens').get('gameScreen').get('videos').play('lightsOn');

				this.main.get('overlays').show('introAnimation'); 

            }
           
            
            ///////////////////
            
            //this.main.get('screens').show('gameScreen');
            //this.main.get('screens').get('gameScreen').get('videos').show('pitch');
            
            ///////////////////
           /* window.onload = function() {
				var marginTop = $(window).height() - $('article[role="main"]').height();
				$('article[role="main"]').css('margin-top', marginTop);
			};
            
            $(window).load(function() {
            	var marginTop = $(window).height() - $('article[role="main"]').height();
				$('article[role="main"]').css('margin-top', marginTop);
				
            });
            $(window).resize(function() {
				var marginTop = $(window).height() - $('article[role="main"]').height();
			  $('article[role="main"]').css('margin-top', marginTop);
			});
			*/
            //this.main.get('screens').show('landingIntro');
        },
        connected: function(room){
        	//console.log('Controller.connected()');
        	this.model.get('debug').set({statusMessage: this.staticText.connected});
        },
        roomReady: function(room){
        	console.log('Controller.roomReady(), room: ', room);
        	
        	if(sessvars.twitter){
        		var twitterResponse = sessvars.twitter;
        		console.log('twitterResponse',twitterResponse);
        		sessvars.$.clearMem();
        		this.model.get('registration').getTwitterUser(twitterResponse);
        		this.main.get('screens').show('gameScreen');
        		this.main.get('screens').get('gameScreen').get('videos').play('pitcherLoop');
				//this.main.get('screens').get('gameScreen').get('videos').show('pitcherLoop');
				//this.main.get('screens').get('gameScreen').get('videos').play('pitcherLoop');
				$('header').addClass('opaque');
				$('header').removeClass('transparent');
        	}
        		
        	this.model.get('debug').set({roomId: room.get('id'), statusMessage: this.staticText.connected});
        	
        	//--->this.model.get('registration').checkLoginStatus();
        },
        onVideoEvent: function(data){
        	//console.log('controller.onVideoEvent(), ',data);
        	var that = this;
    		switch(data.id) {
    			case "lightsOn":
					switch(data.type) {
						case "loadeddata":
							$('#page-preloader').remove();
							break;
						case "loadstart":
							break;
						case "play":
							 
							break;
						case "ended":
							
							$('img#instruction-step1').addClass('opaque');
							$('img#instruction-step1').removeClass('transparent');
							
							var sec = 0;
							var animInt = setInterval(function() {
								sec+=1;
								if(sec == 1){
									$('img#instruction-step2').addClass('opaque');
									$('img#instruction-step2').removeClass('transparent');
								}else if(sec == 2){
									$('img#instruction-step3').addClass('opaque');
									$('img#instruction-step3').removeClass('transparent');
									$('#instruction-cta > img').addClass('opaque');
									$('#instruction-cta > img').removeClass('transparent');
									$('header').addClass('opaque');
									$('header').removeClass('transparent');
									clearInterval(animInt);
								}else if(sec == 3){
									
								}
							}, 1000);
							
							this.main.get('screens').get('gameScreen').get('videos').play('pitcherToMound');
							
							break;
						default:
					}
					break;
				case "pitcherToMound":
					switch(data.type) {
						case "loadstart":
							break;
						case "play":
							break;
						case "ended":
							this.main.get('screens').get('gameScreen').get('videos').play('pitcherLoop');
							
							break;
						default:
					}
					break;
				case "pitcherLoop":
					switch(data.type) {
						case "loadstart":
							break;
						case "play":
							$('#page-preloader').remove();
							break;
						case "ended":
							break;
						default:
					}
					break;
				case "pitch":
					switch(data.type) {
						case "loadstart":
							break;
						case "play":
							that.main.get('popups').hide();
							break;
						case "ended":
							that.model.get('game').pitchComplete();
							
							break;
						default:
					}
					break;
				default:
					switch(data.type) {
						case "loadstart":
							break;
						case "play":
							that.main.get('popups').show('swingStats');
							break;
						case "ended":
							this.main.get('screens').get('gameScreen').get('videos').play('pitcherLoop');
							that.main.get('popups').hide();
							that.model.get('game').hitComplete();
							break;
						default:
					}
					break;
			}
        },
       swingComplete: function(swing){
        	console.log('controller.swingComplete()', swing);
        	if(swing.result == 'hit'){
        		swing.distance = swing.distance+'&nbsp;<sup>'+this.staticText.feet+'<sup>';
        	}else if(swing.result == 'miss') {
        		swing.distance = this.staticText.strike;
        	}else if(swing.result == 'foul') {
        		swing.distance = this.staticText.foulBall;
        	}
        	this.main.get('screens').get('gameScreen').get('videos').play(swing.description);
        	this.model.get('game').get('swing').set(swing);
        	this.main.get('popups').show('swingStats');
        	
        },
        leaderBoardUpdate: function(data){
        	this.model.get('leaderBoard').leaderBoardUpdate(data);
        },
        onLeaderboardClickEventHandler: function(e){
        	console.log('Controller.onLeaderboardClickEventHandler()', e);
        	this.main.get('popups').show('leaderboardPopup');
        },
        onLeaderboardSearchBtnClick: function(val){
        	console.log('Controller.onLeaderboardSearchBtnClick()', val);
        	//this.main.get('popups').get('leaderboardPopup').page(2);
        	//this.model.get('leaderBoard').selectedPlayer(val);
        	this.main.get('popups').get('leaderboardPopup').player(val);
        	// this.model.get('leaderBoard').set('selectedPlayer', val);
        },
        onPageSelection: function(page){
        	console.log('Controller.onPageSelection()', page);
        	this.main.get('popups').get('leaderboardPopup').page(page);
        },
        onShowPreviousPopup: function(){
        	console.log('Controller.onShowPreviousPopup()');
        	this.main.get('popups').showPreviousTo('leaderboardPopup');
        },
        onPlayBallClickHandler: function(){
        	console.log('Controller.onPlayBallClickHandler()');
        	this.main.get('overlays').hide();
        	this.main.get('popups').show('registrationOptions');
        	//this.main.get('screens').get('gameScreen').get('videos').play('pitcherToMound');
        },
        onTwitterClickEventHandler: function(e){
        	console.log('Controller.onTwitterClickEventHandler()', twttr);
        	var tweetUrl = encodeURIComponent(this.urls.tweetUrl);
        	/*
        	twttr.ready(function (twttr) {
			    twttr.events.bind('tweet', function(e){
			    	alert('sldfkjsdlfkj')
			    });
			});
        	twttr.events.bind('tweet', function (event) {
			             alert('testing');
			});
			*/
			window.open('https://twitter.com/share?url='+tweetUrl, '1374691288056', 'width=550,height=400,toolbar=0,menubar=0,location=0,status=1,scrollbars=1,resizable=1,left=0,top=0');
			//return false;

        },
        onFacebookClickEventHandler: function(){
        	//console.log('Controller.onFacebookClickEventHandler()', e);
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
					
					//game.gameShared();
					//alert('share posted')
				} else {
					console.log('Post was not published.');
				}
			});
        },
        loginBtnClick: function(model){
        	//console.log('Controller.loginBtnClick()');
        	//---------->this.model.get('registration').checkLoginStatus();
        	this.main.get('popups').show('logIn');
        },
        playForFunBtnClick: function(model){
        	console.log('Controller.playForFunBtnClick()');
        	this.main.get('popups').show('practiceUserName');
        },
        registerBackBtnClick: function(){
        	console.log('Controller.backBtnClickEventHandler()');
        	this.main.get('popups').show('registrationOptions');
        },
        registerOptionsBackBtnClick: function(){
        	console.log('Controller.backBtnClickEventHandler()');
        	location.href = this.urls.root;
        },
        loginBackBtnClick: function(){
        	this.main.get('popups').show('registrationOptions');
        },
        practiceUserNameBackBtnClick: function(){
        	this.main.get('popups').show('registrationOptions');
        },
        onGameStartNextBtnClick: function(model){
        	console.log('Controller.onGameStartNextBtnClick()');
        	this.main.get('popups').show('proGameIntro');
        },
        practiceUserNameSubmitOnClick: function(model){
        	console.log('Controller.practiceUserNameSubmitOnClick()');
        	this.model.get('registration').get('practiceUserInfo').save();
        },
        registerBtnClick: function(model){
        	//console.log('Controller.registerBtnClick()');
        	this.main.get('popups').show('userInformationForm');
        	
        },
        getFacebookUser: function(response){
        	
        },
        getTwitterUser: function(response){
        	
        },
        onLoginStatus: function(response){
        	console.log('Controller.onLoginStatus()', response);
        	
        	if (response.facebook.status === 'connected'){
        		//console.log('connected')
        		this.model.get('registration').getFacebookUser(response.facebook);
        	}else if (response.twitter){
        		sessvars.$.clearMem();
        		this.model.get('registration').getTwitterUser(response.twitter);
        	}else{
        		// show log in options dialogue
        		this.main.get('popups').show('registrationOptions');
        		//-->this.main.get('popups').show('logIn');
        	}
        	
        },
		registerWithFacebook: function(response){
        	console.log('Controller.registerWithFacebook()', response);
        	
        	if(this.model.get('registration').get('registered')){
        		return;
        	}
        	       	
			var userObj = {
				firstName : response.first_name,
				lastName : response.last_name,
				userName : response.username,
				facebook : response,
				socialId : response.id,
				login : 'facebook'
			}
			
			this.model.get('registration').get('userInfoRegister').set(userObj, {forceUpdate: true});
			this.model.get('registration').get('userInfoLogin').set(userObj, {forceUpdate: true});
			this.main.get('popups').show('userInformationForm');
			
			//console.log(this.model.get('registration').get('userInfoRegister'))
        	
        },
        registerWithTwitter: function(data){
        	console.log('Controller.registerWithTwitter(), ', data);
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
				login : 'twitter',
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
						console.log('duplicates: ', data.values)
						var duplicates = {}
						for(var i = 0; i < data.values.length; i++){
							duplicates[data.values[i]+'Unique'] = false;
						}
						console.log('duplicates: ',duplicates)
						this.model.get('registration').get('userInfoRegister').set(duplicates, {silent: true});
						this.model.get('registration').get('userInfoRegister').isValid(true);
						this.model.get('registration').get('userInfoRegister').set({socialIdUnique: true, socialId: ''}, {silent: true});
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
        onRetryBtnClick: function(){
        	location.reload();
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
        registerSubmitOnClick: function(model){
        	//console.log('Controller.registerSubmitOnClick()', model);
        	this.model.get('registration').get('userInfoRegister').save();
        },
        loginSubmitOnClick: function(model){
        	//console.log('Controller.loginSubmitOnClick()', model);
        	this.model.get('registration').get('userInfoLogin').save();
        },
        signUpWithFacebookBtnClick: function(model){
        	this.model.get('registration').signUpWithFacebook();
        },
        loginWithFacebookBtnClick: function(model){
        	console.log('Controller.loginWithFacebookBtnClick()');
        	this.model.get('registration').loginWithFacebook();
        },
        loginWithTwitterBtnClick: function(model){
        	console.log('Controller.loginWithFacebookBtnClick()');
        	this.model.get('registration').getTwitterOathToken();
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
        	/*this.model.get('registration').get('userInfoRegister').set({
        		registered: true
        	}, {silent: true});*/
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
        	this.header.get('headerRanking').visible(false);
        	this.header.get('navGameStats').visible(true);
        },
        gameCompleteShare: function(game){
        	console.log('controller.gameCompleteShare()', game);
        	this.main.get('popups').show('gameCompleteSharePopup');
        	this.header.get('headerRanking').visible(false);
        	this.header.get('navGameStats').visible(true);
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
        	this.header.get('headerRanking').visible(false);
        	this.header.get('navGameStats').visible(true);
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
        	this.main.get('popups').show('gameConnected');
        	//this.main.get('popups').show('proGameIntro');
        },
        onBatSelected: function(bat){
        	//alert('onBatSelected');
        	
        	
        	//this.main.get('popups').show('practiceSwingsIntro');
        	var game = this.model.get('game');
        	console.log('onBatSelected, data is: ', game, "bat: ",bat);
        	
        	//if(game.practiceSwingTotal  == (game.practiceSwingsAllowed)
        	
        	if((game.get('practiceSwingsComplete') == false || game.get('practiceSwingsComplete') == 'false') && game.get('type') == 'pro'){
        		console.log('you have practice swings!');
        		this.main.get('popups').show('practiceSwingsIntro');
        		//--->>>this.main.get('popups').show('practiceSwingsIntro');
        	}else{
        		console.log('no practice swings OR you are in a practice game, start your game!');
        		this.main.get('popups').show('proGameIntro');
        	}
    	
        	
        },
        onSwingReady: function(e){
        	console.log('Controller.onSwingReady()');
        	var that = this;
        	//this.main.get('popups').show('gameScreen');
        	this.main.get('popups').hide();
        	this.main.get('screens').get('gameScreen').get('videos').show('pitch');
        	
        	/*
        	this.model.get('game').get('counter').set('count', this.staticText.gameGetReadyInstructions);
        	this.main.get('overlays').show('gameGetReady');
        	
        	this.model.get('game').countdownStart();
        	*/
        },
        onGameStart: function(game){
        	console.log('Controller.onGameStart()');
        	var game = this.model.get('game');
        	console.log('Controller.onGameStart(), ', game);
        	
        	if((game.get('practiceSwingsComplete') == false || game.get('practiceSwingsComplete') == 'false') && game.get('type') == 'pro'){
        		console.log('you have practice swings!');
        		this.main.get('popups').show('practiceSwingsIntro');
        	}else{
        		console.log('no practice swings (pro/practice game), start your game!');
        		this.main.get('popups').show('proGameIntro');
        	}
        	
        },
        onCounter: function(count){
        	console.log('Controller.onCounter()', count);
        	this.model.get('game').get('counter').set('count', count);
        },
        onPitchReady: function(game){
        	console.log('Controller.onPitchReady()', game);
        	//this.model.get('game').set(data);
        	this.onGameUpdate(game);
        	/*
        	if((game.practiceSwingsComplete == false || game.practiceSwingsComplete == 'false') && game.type == 'pro'){
        		console.log('you have practice swings!');
        		this.main.get('popups').show('practiceSwingsIntro');
        	}else{
        		console.log('no practice swings OR you are in a practice game, start your game!');
        		this.main.get('popups').show('proGameIntro');
        	}
        	*/
        	
        },
        onPitchStart: function(data){
        	console.log('Controller.onPitchStart()', data);
        	this.main.get('popups').hide();
        	this.main.get('screens').show('gameScreen');
        	this.main.get('screens').get('gameScreen').get('videos').play('pitch');
        	
        },
        onGameUpdate: function(game){
        	console.log('Controller.onGameUpdate()', game);
        	this.model.get('game').set(game);
        	
        	if(game.practiceRemainingSwings == Number(0) && game.swingTotal ==  Number(0) && game.type == 'pro'){
        		this.main.get('popups').show('proGameIntro');
        	}
        	
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
            
            //this.model.get('mainMenu').reset([{text: 'Item Five', id: 'menu-item-5'},{text: 'Item Six', id: 'menu-item-6'},{text: 'Item Seven', id: 'menu-item-7'},{text: 'Item Eight', id: 'menu-item-8'}]);

        },
        testEvent: function(value){
        	console.log('controller.testEvent()')
        	//console.log(value);
        	this.navigate("country1/" + value, {
                trigger: true,
                replace: false
            });
            
            //this.model.get('mainMenu').reset([{text: 'Item Five', id: 'menu-item-5'},{text: 'Item Six', id: 'menu-item-6'},{text: 'Item Seven', id: 'menu-item-7'},{text: 'Item Eight', id: 'menu-item-8'}]);

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



