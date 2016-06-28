/**
 * @author bneufeld
 */


(function (ns, $, _, Backbone, io, accounting) {
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
	    	io: {},
	    	registered: false,
	    	doDebug: true
	    },
		initialize: function(options){
			console.log("Room.initialize(), id: ",this.get('id'));

			//console.log('index',options.index)
			var that = this;
			
			var socket = this.get('socket');
			var controller = this.get('controller');
			
			socket.on('connect', function() {
				console.log('socket.on(connect)');
				that.debug('Socket.connect()');
				controller.trigger('connected', that);
				
			});
			
			socket.on("ROOM_READY", function(data){
				console.log('ROOM_READY', data);
				controller.trigger('roomReady', data);
				
			})
			
			socket.on('PITCH_READY', function(data) {
				that.debug('PITCH_READY');
				
				controller.trigger('onPitchReady', data);

			});
			
			socket.on('PITCH_START', function(data) {
				console.log('PITCH_START');
				controller.trigger('onPitchStart', data);

			});
			
			socket.on('PITCH_COMPLETE', function(data) {
				console.log('PITCH_COMPLETE');
				controller.trigger('onPitchComplete', data);

			});
			
			socket.on('HIT_COMPLETE', function(data) {
				that.debug('HIT_COMPLETE');
				controller.trigger('onHitComplete', data);

			});
			
			socket.on('SWING_RETRY', function(data) {
				that.debug('SWING_RETRY');
				controller.trigger('onSwingRetry', data);

			});
			
			socket.on('COUNTER', function(counter) {
				//console.log('COUNTER', counter);
				controller.trigger('onCounter', counter);

			});
			
			socket.on('GAME_COMPLETE_SHARE', function(data) {
				//console.log('COUNTER', counter);
				controller.trigger('onGameCompleteShare', data);

			});
			
			socket.on('GAME_COMPLETE', function(counter) {
				//console.log('COUNTER', counter);
				controller.trigger('onGameComplete', counter);

			});
			
			socket.on("MOBILE_CONNECTION_ERROR", function(data) {
				console.log("MOBILE_CONNECTION_ERROR", data);
				//socket.disconnect();
				controller.trigger('onMobileConnectionError', data);
			});
			
			socket.on("disconnect", function() {
				console.log('socket.on(disconnect)');
				
				//console.log('socket.roomid: '+socket.get('roomid'))
				//console.log('socket.roomid: ' + socket.store.data.roomid);
				controller.trigger('disconnected', that);

			});

		},
		connect: function(gameCode){
			console.log('Room.connect(), gameCode:',gameCode);
			
			
			var that = this;
			var socket = this.get('socket');


			socket.emit('CONNECT_MOBILE', {
				gameCode : gameCode
			});

		},
		swingReady: function(data){
			this.get('socket').emit('SWING_READY', { room: this.get('id') });
		},
		batSelected: function(bat){
			console.log('room.batSelected(), bat: ', bat);
			this.set('bat', bat.get('id'));
			this.get('socket').emit('BAT_SELECTED', bat.get('id'));
		},
		startRecording: function(){
			this.debug('Room.startRecording()');
			
			this.get('swing').enable();

		},
		stopRecording: function(){
			console.log('Room.stopRecording()');
			this.debug('stopRecording()');
			this.get('swing').disable();

		},
		swingComplete: function(swing){
			this.debug(swing);
			this.get('socket').emit('SWING_COMPLETE', swing);
		},
		emit: function(event, data){
			//console.log('Room.emit(), ', event)
			if(!data) data = {};
			this.get('socket').emit(event, data);
		},
		debug: function(msg){
			if(doDebug == true){
				if(this.get('doDebug') == true){
					this.get('socket').emit('DEBUG_MOBILE', msg);
				}
			}
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
	
	models.Bat = Backbone.Model.extend({
		defaults: {
			accuracy: 1,
			power: 1,
			img: '',
			name: ''
		},
		initialize: function (options) {
			//console.log("ns.models.Bat.initialize()");

			this.controller = options.controller;
			this.urls = options.urls;
			
			//this.debug('Swing.intialize();');

			//_(this).bindAll('onMotionEvent', 'enable', 'disable');
			//this.bind('error', this.onError);
		}
	});
	
	models.Bats = Backbone.Collection.extend({
		model: models.Bat
	});
	
	models.Swing = Backbone.Model.extend({
		defaults: {
			startTime: +new Date(),
			isSwinging: false,
			isRecording: false,
			samples: [],
			bat: 0,
			doDebug: true
		},
		initialize: function (options) {
			//console.log("ns.models.Dealer.initialize()");

			this.controller = options.controller;
			this.urls = options.urls;
			
			this.debug('Swing.intialize();');
			//check if user 

			_(this).bindAll('onMotionEvent', 'enable', 'disable');
			//this.bind('error', this.onError);
		},
		enable: function(){
			this.debug('Swing.enable()');
			
			/*
			if(!window.DeviceOrientationEvent){
				alert('Your phone is not supported.');
			}
			*/
			
			var that = this;
			this.set('isRecording', true);
			this.set('isSwinging', false);
			this.set('startTime', +new Date());
			this.set('samples', []);
			
			window.addEventListener('devicemotion', that.onMotionEvent);
			
		},
		disable: function(){
			this.debug('Swing.disable()');
			var that = this;
			this.set('isRecording', false);
			this.set('isSwinging', false);
			window.removeEventListener('devicemotion', that.onMotionEvent);
			console.log(this)
			//this.debug(this);
			this.get('controller').trigger('onSwingComplete', this.get('samples'));
		},
		start: function(){
			console.log('Swing.start()');
		},
		stop: function(){
			console.log('Swing.stop()');
		},
		onMotionEvent: function(e){
			e.preventDefault();
			
			var that = this;
			
			var samples = this.get('samples');
			//var isSwinging = this.get('isSwinging');
			//var socket = this.get('socket');
			
			var a = e.acceleration || e.accelerationIncludingGravity;
			var d = {
				x : a.x,
				y : a.y
			};
			
			var options = {
				startTime: that.get('startTime'),
				userAgentString: that.get('device').vendor+', '+that.get('device').userAgent,
				bat: that.get('bat')
			}
			
			var accerationObj = new ns.models.AccelerationSample(d, options);
			
			samples.push(accerationObj);
			
			//-->this.debug(accerationObj);
/*
			//-->socket.emit('SERVER_DEBUG', 'data');

			if (samples[samples.length - 1].amount > 30 && !isSwinging) {
				this.set('isSwinging', true);
				
				socket.emit('SWING_START', {
					samples : samples[samples.length - 1]
				});
			}
			*/
		},
		debug: function(msg){
			if(doDebug == true){
				if(this.get('doDebug') == true){
					this.get('socket').emit('DEBUG_MOBILE', msg);
				}
			}
		},

	});
	

	models.AccelerationSample = Backbone.Model.extend({
		defaults : {
			x : null,
			y : null,
			z : null,
			amount : null,
			angle : null,
			angles: [],
			time : null,
			startTime: null
		},
		initialize: function (acceleration, options) {
			// store the raw data
			var x = acceleration.x || 0;
			var y = acceleration.y || 0;
			var z = acceleration.y || 0;
			
			// convert to a cumulative acceleration
			var amount = Math.sqrt( (x*x) + (y*y) );
			
			// .. and an angle
			var angle = (180/Math.PI) * Math.atan2(x, y);
			
			var angles = '['+this.round(acceleration.x,3)+', '+this.round(acceleration.y,3)+', '+this.round(acceleration.z,3)+']';
			
			// store the time
			var time = +new Date() - options.startTime;
			
			this.set({
				x: x,
				y: y,
				z: z,
				amount: amount,
				angle: angle,
				angles: angles,
				time: time,
				startTime: options.startTime,
				userAgent: options.userAgentString,
				bat: options.bat
			});
		},
		round: function (n, p) {
			p = p || 0;
			p = Math.pow(10, p);
			n *= p;
			n = Math.round(n);
			n /= p;
			return n;
		}
	}); 

	
	models.EnterGameCode = Backbone.Model.extend({
		defaults: {
			gameCodeIncorrect: false,
			gameCode: ''
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
			gameCode: {
				required: true,
				pattern: 'gameCode',
				msg: "msg: Game code not valid."
			},
			gameCodeIncorrect: {
				required: true,
				oneOf: [false],
				msg: "Game code is not registerd."
			}
		},
		save: function () {
			console.log("save()")
			var that = this;

			if (!this.isValid()) {
				return false;
			}
			
			// var socket = this.get('socket');
			
			var userData = {
				emailAddress: this.get('emailAddress')
			}
			/*
			socket.emit('USER_INFORMATION_LOGIN', userData, function(response){
				
			});
			
			*/

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
	
	
	models.UserInformation = Backbone.Model.extend({
	    defaults: {
			ddTitle			: '',
			tbFirstName		: '',
			tbLastName		: '',
			tbAddress		: '',
			tbApartment		: '',
			tbCity			: '',
			ddProvince		: '',
			tbEmailAddress	: '',
			tbPostalCode	: '',
			dealerCode		: '',
			model			: 'B5AXX',
			tbMethodOfContact:'',
			tbHomePhone		: '',
			tbCellPhone		: '',
			cbOptin			: 'false',
			tracking : {}
			
	    },
		initialize: function(options){
			//console.log("models.Dealer.initialize()");
			this.accounting = options.accounting;
			this.eventAggr = options.eventAggr;
			
			this.service = options.url.service;
			this.app = options.url.app;
			this.output = options.url.output;
			this.action = options.url.action;
			this.contextPage = options.url.contextPage;
			this.lang = options.url.lang;
			if(options.url.test) this.test = options.url.test;
			if(options.url.testUrl) this.testUrl = options.url.testUrl;
			//this.url
			_(this).bindAll('onError', 'save');
			this.bind('error', this.onError);
		},
		onError: function(model, error){
			//console.log('UserInformation.onError() is: '+error)
		},
		validation: {
			tbMethodOfContact: {
				required: true,
				msg: "msg: Method of contact not valid."
			},
			ddTitle: {
				required: true,
				msg: "msg: Title not valid."
			},
			tbFirstName: {
				required: true,
				pattern: 'userName',
				msg: "msg: First name not valid."
			},
			tbLastName: {
		      	pattern: 'userName',
			  	required: true,
				msg: "msg: Last name not valid."
		    },
			tbAddress: {
			  	required: true,
				msg: "msg: Address not valid."
		    },
			tbApartment: {
				required: false,
				msg: "msg: Apartment not valid."
			},
			tbCity: {
			 	required: true,
				msg: "msg: City not valid."
		    },
			ddProvince: {
			 	required: true,
				msg: "msg: Province not valid."
		    },
			tbEmailAddress: {
		      	pattern: 'email',
			  	required: true,
				msg: "msg: Email not valid."
		    },
			dealerCode: {
			 	required: true,
				msg: "msg: Dealer code not valid."
		    },
			model: {
			 	 required: true,
				msg: "msg: Model not valid."
		    },
			tbPostalCode: {
				required: true,
				pattern: 'postalcode',
				msg: "Postal Code not valid."
			},
			tbHomePhone: {
				required: false,
				pattern: 'phoneNumber',
				msg: "Home phone number not valid."
			},
			tbCellPhone: {
				required: false,
				pattern: 'phoneNumber',
				msg: "Cell phone number not valid."
			}

		},
		save: function(){
			//console.log("save()")
			var that = this;
			
			if(!this.isValid()){
				return false;
			}
		
			var data = {};
			$.ajax({
		        type: "POST",
		        url: that.url(),
		        dataType: that.output,
		        success: function(data){
					that.parseData(data)
				},
		        failure: function(error) {
				   this.eventAggr.trigger('serviceError', error);
		        },
				error:function(xhr, status, error) {
					this.eventAggr.trigger('serviceError', error);
               		//console.log('\nerror is: '+error+'\n'+'status is: '+status+'\n'+'xhr.statusText is: '+xhr.statusText+'\nxhr.status is: '+xhr.status);
        		}
		  });

		},
		url: function(){
			if(this.test) return this.testUrl
			
			
			
			var title = '&ddTitle='+this.get('ddTitle');
			var firstName = '&tbFirstName='+this.get('tbFirstName');
			var lastName = '&tbLastName='+this.get('tbLastName');
			var address = '&tbAddress='+this.get('tbAddress');
			var apt = '&tbApartment='+this.get('tbApartment');
			var city = '&tbCity='+this.get('tbCity');
			var province = '&ddProvince='+this.get('ddProvince');
			var email = '&tbEmailAddress='+this.get('tbEmailAddress');
			var pocode = '&tbPostalCode='+this.get('tbPostalCode');
			var dealerCode = '&dealerCode='+this.get('dealerCode');
			var vModel = '&model='+this.get('model');
			var contactMeth = '&tbMethodOfContact='+this.get('tbMethodOfContact');
			var homePhone = '&tbHomePhone='+this.get('tbHomePhone');
			var cellPhone = '&tbCellPhone='+this.get('tbCellPhone');
			var optIn = '&cbOptin='+this.get('cbOptin');			

			
			// payment option A
			var trim1 = '&trim1='+this.get('paymentOptionA').get('trim');
			var term1 = '&term1='+this.get('paymentOptionA').get('term');
			var paymentType1 = '&paymentType1='+ (this.get('paymentOptionA').get('type')).charAt(0);
			var paymentAmountLease1 = '&paymentAmountLease1='+this.get('paymentOptionA').get('downPayment');
			var paymentAmountFinance1 = '&paymentAmountFinance1='+this.get('paymentOptionA').get('downPayment');
			
			// payment option B
			var trim2 = '&trim2='+this.get('paymentOptionB').get('trim');
			var term2 = '&term2='+this.get('paymentOptionB').get('term');
			var paymentType2 = '&paymentType2='+ (this.get('paymentOptionB').get('type')).charAt(0);
			var paymentAmountLease2 = '&paymentAmountLease2='+this.get('paymentOptionB').get('downPayment');
			var paymentAmountFinance2 = '&paymentAmountFinance2='+this.get('paymentOptionB').get('downPayment');
			
			
			return this.service+'?app='+this.app+'&contextPage='+this.contextPage+'&output='+this.output+'&action='+this.action+'&lang='+this.lang+title+firstName+lastName+address+apt+city+province+email+pocode+dealerCode+vModel+contactMeth+cellPhone+homePhone+optIn+trim1+term1+paymentType1+paymentAmountLease1+paymentAmountFinance1+trim2+term2+paymentType2+paymentAmountLease2+paymentAmountFinance2;
		},
		parseData: function(data){
			//console.log(data)
			//console.log(data.serviceResponse.code)
			if(data.serviceResponse.code == -201 || data.serviceResponse.code == "-201"){
				//console.log(data.serviceResponse.response.validation.field)
				var invalidValues = {}
				_.each(data.serviceResponse.response.validation.field, function(errorItem){
					//console.log(errorItem.id)
					invalidValues[errorItem.id] = '';
				}, this);
				this.set(invalidValues, {forceUpdate: true});
			}
			
			this.eventAggr.trigger('sendToDealerOnSuccess', this);
		}
	});

	// add all the classes to the namespace models object
	ns.models = models;
	
}(app, jQuery, _, Backbone, io, accounting));