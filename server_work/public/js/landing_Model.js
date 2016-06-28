/**
 * @author bneufeld
 */



(function (ns, $, _, Backbone) {
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
	
}(app, jQuery, _, Backbone));