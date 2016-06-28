/**
 * @author bneufeld
 */
////////////////////////////////////////////////////////////////////////////////
// defines the controller
////////////////////////////////////////////////////////////////////////////////

(function(ns, $, _, Backbone, io, accounting){

    var Controller = Backbone.Router.extend({
        routes: {
            "game/:gameCode": "gameRoute",
            "popup/:popup" : "popupRoute",
            "screen/:screen" : "screenRoute",
            "*other": "defaultRoute"
        },
        gameRoute: function(gameCode){
        	console.log('gameRoute: '+gameCode);
        	
        	this.model.get('enterGameCode').set({
				gameCode : gameCode
			});
        	this.model.get('room').connect(gameCode);
        },
        popupRoute: function(popup){
        	this.main.get('popups').show(popup);
        },
        screenRoute: function(screen){
        	this.main.get('screens').show(screen);
        },
        defaultRoute: function(error){
        	//console.log('error: '+error);

        	this.main.get('screens').show('enterGameCodeScreen');
        	//this.enterGameCode();
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
            this.accounting = options.accounting;
            this.accounting.settings = this.formatting.currencySettings;
            this.accounting.percentSettings = this.formatting.percentSettings;
            
            
			this.socket = io.connect(this.urls.socketIO, {
				transports : ['websocket', 'xhr-polling', 'flashsocket', 'htmlfile', 'xhr-multipart', 'jsonp-polling'],
				'try multiple transports' : true
			}); 
			
			/*
			this.socket = new io.Socket('localhost', {
				port : 8080
			});
			
			this.socket = io(this.urls.socketIO);*/
			//this.socket = new io.Socket(this.urls.socketIO); 

            
           
            ////////////////////////////////////////////////////////////////////////////
            // Bind Events
            ////////////////////////////////////////////////////////////////////////////
            
            _.extend(this, Backbone.Events);
            // fired when categories (allVehicles) are loaded from ws request //
            _.bindAll(this, "testEvent");
            this.bind("testEvent", this.testEvent);
            
            _.bindAll(this, "submitGameCodeBtnClick");
            this.bind("submitGameCodeBtnClick", this.submitGameCodeBtnClick);
            
            _.bindAll(this, "connected");
            this.bind("connected", this.connected);
            
            _.bindAll(this, "disconnected");
            this.bind("disconnected", this.disconnected);
            
            _.bindAll(this, "roomNotAvailble");
            this.bind("roomNotAvailble", this.roomNotAvailble);
            
            _.bindAll(this, "roomReady");
            this.bind("roomReady", this.roomReady);
            
            _.bindAll(this, "swingReady");
            this.bind("swingReady", this.swingReady);
            
            _.bindAll(this, "onMobileConnectionError");
            this.bind("onMobileConnectionError", this.onMobileConnectionError);
            
            _.bindAll(this, "closePopUp");
            this.bind("closePopUp", this.closePopUp);
            
            _.bindAll(this, "onCounter");
            this.bind("onCounter", this.onCounter);
            
            _.bindAll(this, "onPitchStart");
            this.bind("onPitchStart", this.onPitchStart);
            
            _.bindAll(this, "onPitchComplete");
            this.bind("onPitchComplete", this.onPitchComplete);
            
            _.bindAll(this, "onSwingComplete");
            this.bind("onSwingComplete", this.onSwingComplete);
            
            _.bindAll(this, "onHitComplete");
            this.bind("onHitComplete", this.onHitComplete);
            
            _.bindAll(this, "onReconnectBtnClick");
            this.bind("onReconnectBtnClick", this.onReconnectBtnClick);
            
            _.bindAll(this, "onSwingRetry");
            this.bind("onSwingRetry", this.onSwingRetry);
            
            _.bindAll(this, "onGameCompleteShare");
            this.bind("onGameCompleteShare", this.onGameCompleteShare);
            
            _.bindAll(this, "onPitchReady");
            this.bind("onPitchReady", this.onPitchReady);
            
            _.bindAll(this, "onSelectBatClickHandler");
            this.bind("onSelectBatClickHandler", this.onSelectBatClickHandler);
               
            //_(this).bindAll('categorySelection', 'vehicleSelection', 'modelYearSelection', 'vehicleModelSelection','categoriesOnLoad','locationSelection','modelPackageSelection','incentiveSelection','productSelection');
            
            
            ////////////////////////////////////////////////////////////////////////////
            // Initialize Models
            ////////////////////////////////////////////////////////////////////////////
            


			this.model.set({

				controller : this,

				connection : 'DISCONNECTED',

				state : 'SWING_NOT_READY',
				// SWING_NOT_READY, SWING_READY, PITCH_START, SWING_START, SWING_COMPLETE, PITCH_COMPLETE

				testModel : new ns.models.TestModel(),
				mainMenu : new ns.models.Menu(),
				room : new ns.models.Room({
					urls: ns.config.urls.get(),
					controller: this,
					lang: this.lang,
					socket: this.socket,
					meta: {
						
					},
					swing: new ns.models.Swing({
						urls: ns.config.urls.get(),
						controller: this,
						lang: this.lang,
						socket: this.socket
					}),
					selectedBat: new ns.models.Bat({
						urls : ns.config.urls.get(),
						accounting : this.accounting,
						controller : this,
						socket : this.socket
					})
				}),
				enterGameCode : new ns.models.EnterGameCode({
					urls : ns.config.urls.get(),
					accounting : this.accounting,
					controller : this,
					socket : this.socket
				}),
				counter: new Backbone.Model({
                	count: this.staticText.gameGetReadyInstructions
                }),
                bats: new ns.models.Bats(this.staticText.bats, {}),
                
				//message: new Backbone.Model({roomId: this.staticText.none, statusMessage: this.staticText.notConnected}),
				debug : new Backbone.Model({
					gameId : this.staticText.none,
					statusMessage : this.staticText.notConnected
				}),
				errorMessage: new Backbone.Model(this.staticText.errors.connectionError),
				//mainMenu: new ns.models.Menu([{text: 'Item One'},{text: 'Item Two'},{text: 'Item Three'},{text: 'Item Four'}])
			}); 

            //console.log('bats: ',this.staticText.bats)
            //console.log('bats: ',this.model.get('bats'))
           
            ////////////////////////////////////////////////////////////////////////////
            // Initialize Views
            ////////////////////////////////////////////////////////////////////////////
            
            ////////////////////////////////////////////////////////////////////////////
            //Example View
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
			/*
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
            */
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
			}))
			
			/*
			this.main.get('screens').add(new ns.views.Screen({
				id: 'landingIntro',
				text: this.staticText,
				template: ns.config.templates.get('landing-intro-screen-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: new Backbone.Model()		
			}));
			*/
			
			this.main.get('screens').add(new ns.views.EnterGameCodePopup({
				id: 'enterGameCodeScreen',
				text: this.staticText,
				template: ns.config.templates.get('enter-game-code-screen-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('enterGameCode')
			}));
			/*
			this.main.get('screens').add(new ns.views.Popup({
				id: 'errorPopup',
				text: this.staticText,
				template: ns.config.templates.get('connection-error-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('enterGameCode'),
				event: 'onReconnectBtnClick',
			}));
			*/
			this.main.get('screens').add(new ns.views.Popup({
				id: 'errorPopup',
				text: this.staticText,
				template: ns.config.templates.get('connection-error-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				event: 'onReconnectBtnClick',
				model: this.model.get('errorMessage')		
			}));
			
			this.main.get('screens').add(new ns.views.Carousel({
				id: 'batSelectionView',
				text: this.staticText,
				data: {title: ''},
				content: 'ul',
				template: ns.config.templates.get('bat-selection-screen-tmpl'),
				isVisible: false,
				controller: this,
				collection: this.model.get('bats'),
                childViewConstructor: ns.views.ListItemBaseClass,
                childTemplate: ns.config.templates.get('bat-selection-screen-item-tmpl')
			}));
			/*
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
			*/
			this.main.get('screens').add(new ns.views.Screen({
				id: 'startScreen',
				text: this.staticText,
				template: ns.config.templates.get('start-screen-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: new Backbone.Model()		
			}));
            
            this.main.get('screens').get('startScreen').add(new ns.views.Button({
            	id: 'startButton',
                text: this.staticText,
                model: new Backbone.Model(),
                controller: this,
                event: 'swingReady',
                template: ns.config.templates.get('button-tmpl'),
                isVisible: true,
                isEnabled: true,
                isCollapsed: false
            }));
            
            this.main.get('screens').add(new ns.views.Screen({
				id: 'gameGetReady',
				text: this.staticText,
				template: ns.config.templates.get('game-get-ready-screen-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: this.model.get('counter')
			}));
			
			this.main.get('screens').add(new ns.views.Screen({
				id: 'batModeScreen',
				text: this.staticText,
				template: ns.config.templates.get('game-bat-mode-screen-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: new Backbone.Model()
			}));
			
			this.main.get('screens').add(new ns.views.Screen({
				id: 'gameComplete',
				text: this.staticText,
				template: ns.config.templates.get('game-complete-share-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				model: new Backbone.Model()
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
			

			/*
			this.main.get('popups').add(new ns.views.Popup({
				id: 'errorPopup',
				text: this.staticText,
				template: ns.config.templates.get('connection-error-popup-tmpl'),
				//isEnabled	: false,
				isVisible: false,
				controller: this,
				event: 'onReconnectBtnClick',
				model: this.model.get('errorMessage')		
			}));
            */
			
            this.start();
            
        },
        start: function(){
        	console.log('start!');
        	var that = this;
        	
            Backbone.history.start({
                pushState: false,
                root: ns.config.urls.get().mobile
            });
            
            //prevent scrolling
            $(document).bind('touchmove', function(e) {
			  e.preventDefault();
			});
            
			var deviceSupportMsg = "";
			var mobileBrowser = window.mobilecheck();
			var userAgent = navigator.userAgent;
			var vendor = navigator.vendor;
			var deviceMotionSupport = "false";
			if ((window.DeviceMotionEvent) || ('listenForDeviceMovement' in window)) {
	       		deviceMotionSupport = "true";
			}else{
				deviceSupportMsg = this.staticText.deviceNotSupported;
			};
			var deviceOrientationSupport = "false";
			if(window.DeviceOrientationEvent){
	       		deviceOrientationSupport = "true";
			}
			
			var device = {
				mobileBrowser: mobileBrowser,
				userAgent: userAgent,
				deviceMotionSupport: deviceMotionSupport,
				deviceOrientationSupport: deviceOrientationSupport,
				url: window.location.href,
				vendor: vendor
			}
			
			this.socket.emit('MOBILE_DATA', device);
			
			this.model.get('room').get('swing').set('device', device);
			
			if(deviceSupportMsg){
				alert(deviceSupportMsg);
			}

        },
        hideAddressbar: function(){
        	alert('hideAddressbar');
			if (document.height < window.outerHeight) {
				document.body.style.height = (window.outerHeight + 50) + 'px';
			}

			setTimeout(function() {
				window.scrollTo(0, 1);
			}, 50);
        	/*if (navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('Android') != -1) {
					//window.scrollTo(0, 1);				
			}*/
        },
        enterGameCode: function(){
        	console.log('Controller.enterGameCode()');
        	this.main.get('screens').show('enterGameCodeScreen');
        	//this.main.get('screens').show('landingIntro');
        },
        submitGameCodeBtnClick: function(gameCode){
        	console.log('Controller.enterGameCode()', gameCode);
        	
        	location.hash = "#game/"+gameCode;
        	//this.hideAddressbar();
        	
        	/*
			this.model.get('enterGameCode').set({
				gameCode : gameCode
			});

        	this.model.get('room').connect(gameCode);
        	*/
        },
        onMobileConnectionError: function(data){
        	console.log('onMobileConnectionError: '+data.type+', '+data.description);
        	
        	switch(data.type) {
					case 'gameNotFound':
						console.log('gameNotFound');
						
						this.model.get('enterGameCode').set({
							gameCodeIncorrect: true
						});
						this.model.get('enterGameCode').isValid(true);
						this.main.get('screens').show('enterGameCodeScreen');
						
        				//this.main.get('screens').show('landingIntro');
						/*
						this.model.get('errorMessage').set(this.staticText.errors.databaseConnectionError);
						this.main.get('popups').show('errorPopup');
						*/
						break;
					case 'queryError':

						break;
					case 'apiError':

						break;
					default:

				}
        },
        connected: function(room){
        	console.log('Controller.connected()');
        	//this.main.get('popups').hide();
        	this.model.get('debug').set({statusMessage: this.staticText.connected});
        	//this.model.get('message').set({roomId: room.get('id'), statusMessage: this.staticText.connected});
        	//-->>this.main.get('startButton').visible(true);
        },
        disconnected: function(room){
        	console.log('Controller.disconnected()');
        	//alert('disconnected!');
        	this.model.get('debug').set({statusMessage: this.staticText.disconnected});
        	//this.main.get('startButton').visible(false);
        	
        	this.model.get('errorMessage').set(this.staticText.errors.mobileConnectionError);
			this.main.get('screens').show('errorPopup');
			//this.main.get('screens').show('enterGameCodeScreen');
        },
        roomReady: function(data){
        	console.log('Controller.roomReady()', data);
        	console.log(this.model.get('room'));
        	
        	this.model.get('room').set(data);
        	
        	
        	this.main.get('screens').show('batSelectionView');
        	this.main.get('popups').hide();
        	this.model.get('debug').set({gameId: data.gameCode});
        	
        },
        roomNotAvailble: function(room){
        	this.model.get('message').set({roomId: this.staticText.roomNotAvailable});
        	this.main.get('startButton').visible(false);
        },
        onSelectBatClickHandler: function(bat){
        	console.log('Controller.onSelectBatClickHandler()', bat);
        	this.model.get('room').batSelected(bat);
        	this.model.get('room').set('slectedBat', bat);
        	this.model.get('room').get('swing').set('bat', bat.get('id'));
        	
        	
        	this.main.get('screens').show('startScreen');
        	this.main.get('popups').hide();
        },
        closePopUp: function(){
        	this.main.get('popups').hide();
        },
        swingReady: function(e){
        	console.log('Controller.swingReady()');
        	this.model.set('state', 'SWING_READY');
        	
        	this.model.get('room').swingReady();
        	
        	/*
        	this.main.get('screens').show('gameGetReady');
        	this.model.get('counter').set('count', this.staticText.gameGetReadyInstructions);
        	*/
        },
        onCounter: function(count){
        	console.log('Controller.onCounter()', count);
        	this.model.get('counter').set('count', count);
        },
        onPitchStart: function(data){
        	console.log('Controller.onPitchStart()', data);
        	//this.main.get('popups').hide();
        	this.main.get('screens').show('batModeScreen');
        	this.model.get('room').startRecording();
        	
        },
        onPitchComplete: function(data){
        	console.log('Controller.onPitchComplete()', data);
        	this.model.get('room').stopRecording();
        	//this.main.get('popups').hide();
        	/*this.main.get('screens').show('batModeScreen');
        	this.model.get('room').startRecording();
        	*/
        },
        onSwingComplete: function(swing){
        	this.model.get('room').swingComplete(swing);
        	//this.main.get('screens').show('startScreen');
        },
        onHitComplete: function(swing){
        	//this.main.get('screens').show('startScreen');
        	this.onPitchReady();
        },
        onPitchReady: function(){
        	this.main.get('screens').show('startScreen');
        },
        onSwingRetry: function(data){
        	console.log('Controller.onSwingRetry()', data);
        	this.model.get('errorMessage').set(this.staticText.errors.mobileConnectionError);
			this.main.get('screens').show('errorPopup');
			//this.main.get('screens').show('enterGameCodeScreen');
        },
        onGameCompleteShare: function(data){
        	this.main.get('popups').hide();
        	this.main.get('screens').show('gameComplete');
        },
        onReconnectBtnClick: function(){
        	location.reload();
        },
        testEvent: function(value){
        	console.log('controller.testEvent()')
        	//console.log(value);
        	this.navigate("country1/" + value, {
                trigger: true,
                replace: false
            });
            
            //this.model.get('mainMenu').reset([{text: 'Item Five', id: 'menu-item-5'},{text: 'Item Six', id: 'menu-item-6'},{text: 'Item Seven', id: 'menu-item-7'},{text: 'Item Eight', id: 'menu-item-8'}]);
        }
        
    });
    
    ns.Controller = Controller
    
}(app, jQuery, _, Backbone, io, accounting));



