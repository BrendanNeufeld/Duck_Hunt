/* -*- mode:js; tab-width: 4; indent-tabs-mode: t; js-indent-level: 4 -*- */
/**
 * @author bneufeld
 */

"use strict";

////////////////////////////////////////////////////////////////////////////////
// defines the views
////////////////////////////////////////////////////////////////////////////////

(function(ns, $, _, Backbone, io, accounting){
	
	
	var views = {};


	////////////////////////////////////////////////////////////////////////////
	// Base Class - All views inherit these methods and properties
	////////////////////////////////////////////////////////////////////////////
	
	views.BaseClass = Backbone.View.extend({
		//childViews: {},
		childViews: [],
		id: 'default',
		text: {},
		data: {},
		isSelected: false,
		isVisible: true,
		isEnabled: true,
		isCollapsed: false,
		isCollapsable: false,
		isRendered: false,
		initialize: function(options){
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.controller) throw "You need to supply a controller!";
			
			_.extend(this, options);
			//console.log(this.id+'.initialize()');
			
			if(!this.model){
				this.model = new Backbone.Model();
			}
			this.$el = $(this.template(_.extend(this.text, this.data, this.model.toJSON())));
			//if(!this.$content)	this.$content = (this.content) ? this.$(this.content) : this.$el;
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;
			
			this.childViews = [];
			
			_(this).bindAll('add', 'remove', 'reset');
			
			this.model.bind('change', this.render, this);
			
			if(FB){
				FB.XFBML.parse();
			}
			//this.model.bind('isVisible', this.toggleVisible, this);
			//this.model.bind('change', this.render, this);
			//this.model.bind('change', this.render, this);
			this.start();
		},
		start: function(){
			//this is used by subclasses for extra initialization directives
			return this;
		},
		render:function(model){
			//console.log(this.id+".render()");
			//if(this.id == "leaderboardPopup") alert("sdlkfjsdlfkj")

			this.isRendered = true;

			this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;

			/*for(var each in this.childViews){
				//this.childViews[each].render();
				//this.$el.append(this.childViews[each].$el);
				var view = this.childViews[each];
				view.meta.selector[view.meta.method](view.$el);
			}*/
			

			if(this.childViews.length > 0){
				for(var i = 0; i < this.childViews.length; i++){
					var view = this.childViews[i];
					view.render();
					
					if(view.meta.selector){
						view.meta.selector[view.meta.method](view.$el);
					}else {
						this.$content[view.meta.method](view.$el);
					}

					//this.$content.append(view.$el);
					//--->view.meta.selector[view.meta.method](view.$el);
				}
			}
			if(FB){
				FB.XFBML.parse();
			}
			
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();
			
			this.rendered();
				
			return this;
		},
		rendered: function(obj){
			
		},
		reset: function(model){
			//console.log("BaseClass.reset()")

			if(model) this.model = model;

			if(this.childViews.length > 0){
				for(var i = 0; i < this.childViews.length; i++){
					this.childViews[i].remove();
				}
			}
			this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;

			if(this.childViews.length > 0){
				for(var i = 0; i < this.childViews.length; i++){
					this.add(this.childViews[i], this.childViews[i].meta);
				}
			}
			
			if(FB){
				FB.XFBML.parse();
			}
			
			//this.toggleVisible();
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();

			return this;
			
		},
		get: function(id){
			//console.log("views.BaseClass.getView("+id+")");
			if (!id)	return this;

			var childView = _.find(this.childViews, function(view) {
				return view.id == id;
			}); 
			
			if(childView) return childView;
			else return undefined;

		},
		add: function(view, options){
			//console.log(this.id+'.addxx('+view.id+')');
			
			

			var childView = _.find(this.childViews, function(cView) {
				return cView.id == view.id;
			});
			
			if (childView) throw "You can not add two views with the same id: "+childView.id+' to: '+this.id;
			
			//console.log("!***********");
			var defaults = {
				method: 'append',
				options: {},
				selector: ''
			 }
			 
			if(options){		
				_.extend(defaults, options);
			 };

			view.parent = this;
			view.meta = defaults;
			this.childViews.push(view);

			if(defaults.selector){
				defaults.selector[defaults.method](view.$el);
			}else{
				this.$content[defaults.method](view.$el);
			}
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();

			return view;
		},
		remove: function(id){
			
			if(id){
				for(var i = 0; i < this.childViews.length; i++){
					if(this.childViews[i].id == id){
						this.childViews[i].remove();
					}else{
						return undefined;
					}
				}

			}else{

				for(var i = 0; i < this.childViews.length; i++){
					this.childViews[i].remove();
				}
				
				this.model.unbind('change', this.render, this);
				this.$el.remove();
				this.isRendered = false;
			}
			
			return this;
		},
		destroy: function(id){
			
			if(id){
				for(var i = 0; i < this.childViews.length; i++){
					if(this.childViews[i].id == id){
						this.childViews[i].remove();
						delete this.childViews[id];
					}else{
						return undefined;
					}
				}
				//this.childViews[id].remove();
				//delete this.childViews[id];
				return this;
			}else{
				/*for(var each in this.childViews){
					this.childViews[each].remove();
					this.childViews[each].destroy();
					this.childViews[each] = null;
				}*/
				for(var i = 0; i < this.childViews.length; i++){
					this.childViews[i].remove();
					this.childViews[i].destroy();
					this.childViews[i] = null;
				}
				this.model.unbind('change', this.render, this);
				this.remove();
				delete this;
			}
			return this;
			
		},
		children: function(){
			return this.childViews;
		},
		enabled: function(boel){
			//console.log('views.BaseClass.enabled('+boel+')');
			if(boel == undefined || (this.isEnabled == undefined))	return this.isEnabled;
			
			if (this.isEnabled != boel) {
				this.isEnabled = boel;
				this.toggleEnabled();
			}
			
			return this;
			
		},
		selected: function(boel){
			if(boel == undefined)	return this.isSelected;
			
			if (this.isSelected != boel) {
				this.isSelected = boel;
				this.toggleSelected();
			}
			
			return this;
		},
		visible: function(boel){
			//console.log(this.id+'.visible('+boel+')');
			//if(this.id == 'debug')	alert(boel);
			if(boel == undefined || (this.isVisible == undefined))	return this.isVisible;
			
			if (this.isVisible != boel) {
				this.isVisible = boel;
				this.toggleVisible();
			}
			
			return this;

		},
		collapsed: function(boel){
			if(boel == undefined)	return this.isCollapsed;
			
			if (this.isCollapsed != boel) {
				this.isCollapsed = boel;
				this.toggleCollapsed();
			}
			
		},
		toggleCollapsed: function(){
			
		},
		toggleSelected:function(){
			//console.log('views.BaseClass.toggleSelected')
			if(this.model.get('isSelected') == true){
				this.$el.addClass('selected');
			}else if(this.model.get('isSelected') == false){
				this.$el.removeClass('selected');
			}
		},
		toggleVisible: function(){
			//console.log("toggleVisible: "+this.model.get("id"))
			/*if(this.id == "message"){
				console.log('toggleVisible, isVisible: ', this.isVisible);
				console.log('$el: ',this.$el)
			}*/
			
			if(this.isVisible == true){
				this.$el.addClass('visible');
				this.$el.removeClass('hidden');
			}else if(this.isVisible == false){
				this.$el.removeClass('visible');
				this.$el.addClass('hidden');
			}
			
			/*
			if(this.id == "message"){
				console.log('toggleVisible, isVisible: ', this.isVisible);
				console.log('$el: ',this.$el)
			}
			*/
		},
		toggleEnabled: function(){
			//console.log('views.BaseClass.toggleEnabled')
			if(this.isEnabled == true){
				this.$el.addClass('enabled');
				this.$el.removeClass('disabled');
				this.$el.css('opacity', '1')
			}else if(this.isEnabled == false) {
				this.$el.removeClass('enabled');
				this.$el.addClass('disabled');
				this.$el.css('opacity', '.5')
			}

		}
	});

	////////////////////////////////////////////////////////////////////////////
	//	List Base Class - Extends BaseClass
	////////////////////////////////////////////////////////////////////////////

	views.ListBaseClass = views.BaseClass.extend({
		childViews: [],
		id: 'default',
		text: {},
		data: {},
		isSelected: false,
		isVisible: true,
		isEnabled: true,
		isCollapsed: false,
		isCollapsable: false,
		isRendered: false,
		initialize: function(options){

			if (!options.template) throw "You need to supply a template!";
			if (!options.controller) throw "You need to supply a controller!";
			
			_.extend(this, options);
			//console.log(this.id+'.initialize()');
			
			if(!this.model){
				this.model = new Backbone.Model();
			}
			this.$el = $(this.template(_.extend(this.text, this.data, this.model.toJSON())));
			//if(!this.$content)	this.$content = (this.content) ? this.$(this.content) : this.$el;
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;
			
			_(this).bindAll('add', 'remove', 'reset', 'get');
			
			this.model.bind('change', this.render, this);
			this.collection.bind('reset', this.reset, this);
			this.collection.bind('add', this.add, this);
			
			//console.log(this.collection)
			//this.model.bind('change', this.render, this);
			//this.model.bind('change', this.render, this);
			//this.render();
			this.start();
			
		},
		start: function(){
			//console.log('views.ListBaseClass.start()')
			this.reset();
			//this is used by subclasses for extra initialization directives
			return this;
		},
		render:function(model){
			//console.log(this.id+".render()");
			if(this.id == 'leaderBoard')	console.log(this.id+".render()");
			
			this.isRendered = true;

			this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;
			
			if(this.childViews.length > 0){
				_.each(this.childViews, function(view){
					//this.add(view);
					view.render();
					view.meta.selector[view.meta.method](view.$el);
					
					//
					/*if(!view.isRendered){
						view.render();
						this.$content.meta.selector[view.meta.method](view.$el);
					}*/
				},this);
			}
			
			//console.log(this.childViews);
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();
			
			//this.rendered();
			
			return this;
			
			// dthis.reset();
		},
		rendered: function(){
			//console.log('ListBaseCalss.rendered()');
		},
		reset: function(collection){
			
			_.each(this.childViews, function(view){
				view.remove();
				/*view.destroy();
				view = null;*/
			},this);
			
			this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;
			
			this.childViews = [];
			
			_.each(this.collection.models, function(model){
				//console.log(model.get('id'))
				 this.add(new this.childViewConstructor({
				      model : model,
					  controller : this.controller,
					  template : this.childTemplate,
					  text: this.text,
					  data: this.data,
					  id: model.get('id')
				    }));
			}, this);
			

			this.rendered();
			
			return this;
			
		},
		add: function(view, options){
			//console.log(this.id+'.add('+view.id+')');

			var defaults = {
				method: 'append',
				options: {},
				selector: this.$content
			 }
				 
			if(options){
				_.extend(defaults, options);
			 };
			 
			view.parent = this;
			view.meta = defaults;
			view.render();
			this.childViews.push(view);
			
			defaults.selector[defaults.method](view.$el);

			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();
			
			return view;
		},
		remove: function(id){
			/*if(id){
				return this.childViews[id].remove();
			}else{
				for(var each in this.childViews){
					this.childViews[each].remove();
				}
				this.model.unbind('change', this.render, this);
				this.$el.remove();
				this.isRendered = false;
			}*/
			return this;
		},
		destroy: function(id){
			/*if(id){
				this.childViews[id].remove();
				delete this.childViews[id];
				return this;
			}else{
				for(var each in this.childViews){
					this.childViews[each].remove();
					this.childViews[each].destroy();
					this.childViews[each] = null;
				}
				this.model.unbind('change', this.render, this);
				this.remove();
				delete this;
			}*/
			return this;
			
		},
		show: function(id){
			if (!id) throw "You need to supply an id!";
			
			//console.log('show()', id);
			
			var childView = this.get(id);
			//console.log(childView.id)
			
			if(!childView){
				return undefined
			}else{
				
				_.each(this.childViews, function(view){
					if(view.id != id){
						view.visible(false);
					}
				 
				}, this);
				
				childView.visible(true);
			}
			
			return this;
		},
		children: function(){
			return this.childViews;
		}

	});
////////////////////////////////////////////////////////////////////////////
	// Base Class - All views inherit these methods and properties
	////////////////////////////////////////////////////////////////////////////
	
	views.ListItemBaseClass = Backbone.View.extend({
		//childViews: {},
		childViews: null,
		id: 'default',
		text: {},
		data: {},
		isSelected: false,
		isVisible: true,
		isEnabled: true,
		isCollapsed: false,
		isCollapsable: false,
		isRendered: false,
		initialize: function(options){
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.controller) throw "You need to supply a controller!";
			
			_.extend(this, options);
			//console.log(this.id+'.initialize()');
			
			if(!this.model){
				this.model = new Backbone.Model();
			}
			this.$el = $(this.template(_.extend(this.text, this.data, this.model.toJSON())));
			//if(!this.$content)	this.$content = (this.content) ? this.$(this.content) : this.$el;
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;
			
			_(this).bindAll('add', 'remove', 'reset');
			
			this.model.bind('change', this.render, this);
			//this.model.bind('isVisible', this.toggleVisible, this);
			//this.model.bind('change', this.render, this);
			//this.model.bind('change', this.render, this);
			this.start();
		},
		start: function(){
			//this is used by subclasses for extra initialization directives
			return this;
		},
		render:function(model){
			//console.log(this.id+".render()");
			
			this.isRendered = true;

			this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
			this.$content = (this.content) ? this.$el.find(this.content) : this.$el;

			/*for(var each in this.childViews){
				//this.childViews[each].render();
				//this.$el.append(this.childViews[each].$el);
				var view = this.childViews[each];
				view.meta.selector[view.meta.method](view.$el);
			}*/
			
			
			/*if(this.childViews.length > 0){
				for(var i = 0; i < this.childViews.length; i++){
					var view = this.childViews[i];
					this.childViews[i].render();
				//this.$el.append(this.childViews[i].$el);
					view.meta.selector[view.meta.method](view.$el);
				}
			}else{
				return this
			}*/
			
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();

			return this;
		},
		reset: function(model){
			//console.log("BaseClass.reset()")
			
			//this.$el.empty()
			if(model) this.model = model;
			
			/*for(var each in this.childViews){
				this.childViews[each].remove();
			}
			*/
			/*if(this.childViews.length > 0){
				for(var i = 0; i < this.childViews.length; i++){
					this.childViews[i].remove();
				}
			}*/
			this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
			
			/*
			for(var each in this.childViews){
				this.add(this.childViews[each], this.childViews[each].meta)
			}
			
			if(this.childViews.length > 0){
				for(var i = 0; i < this.childViews.length; i++){
					this.add(this.childViews[i], this.childViews[i].meta);
				}
			}
			*/
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();
			
			return this;
			
		},
		get: function(id){
			////console.log("views.BaseClass.getView("+id+")");
			if (id) throw "List items don't have children!";
			return this;
			/*if(this.childViews[id]) return this.childViews[id];
			else return undefined;
			*/
		},
		add: function(view, options){
			////console.log(this.id+'.addxx('+view.id+')');
			if (id) throw "You can not add children to list items!";
			
			

			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();

			return view;
		},
		remove: function(id){
			if (id) throw "You can not remove children from a list item!";
			this.model.unbind('change', this.render, this);
			this.$el.remove();
			this.isRendered = false;
			return this;
		},
		destroy: function(id){
			if (id) throw "You can not destroy a child from a list item!";
			this.model.unbind('change', this.render, this);
			this.remove();
			delete this;
			return this;
			
		},
		children: function(){
			if (id) throw "list items don't have children!";
			return this.childViews;
		}
	});
	
	

	////////////////////////////////////////////////////////////////////////////
	//	Popups
	////////////////////////////////////////////////////////////////////////////

	views.Popups = views.BaseClass.extend({
		tagName: 'div',
		events: {
			//'click': 'onClickEventHandler'
		},
		show: function (id) {
			//console.log('Popups.show('+id+')')
			_.each(this.childViews, function (childView) {
				childView.visible(false)
			}, this)
			this.get(id).visible(true)
			this.visible(true);
			return this
		},
		hide: function () {
			//console.log('Popups.hide('+id+')')
			_.each(this.childViews, function (childView) {
				childView.visible(false);
			}, this)
			this.visible(false);
			return this
		},
		onClickEventHandler: function (e) {
			//console.log('onClickEventHandler')
			this.controller.trigger('closePopUp', this.model);
		}
	});
	
	views.Popup = views.BaseClass.extend({
		tagName: 'div',
		events: {
			'click a': 'onClickEventHandler'
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			console.log('Popup.onClickEventHandler', this.options.event);
			this.controller.trigger(this.options.event, this.model);
		}
	});
	
	views.EnterGameCodePopup = views.BaseClass.extend({
		tagName: 'div',
		events: {
			"click input[type=radio]": "radioOnClick",
			"click #subscribe input[type=checkbox]": "checkboxOnClick",
			"blur input[type=text]": "inputOnBlur",
			"keypress input[type=text]": "inputOnKeyPress",
			"focus input": "inputOnFocus",
			"change select": "dropDownOnChange",
			"click #submit": "onClickEventHandler"
		},
		start: function(){
			
			Backbone.Validation.bind(this, {
				forceUpdate: true,
				valid: this.valid,
				invalid: this.invalid
			});
			
			this.model.bind('validated', this.validated, this)
			
			_(this).bindAll('inputOnBlur', 'inputOnKeyPress', 'dropDownOnChange', 'valid', 'invalid', 'validated');
			
		},
		onClickEventHandler: function(e){
			console.log('onClickEventHandler');
			
			var obj = {};
			
			$('#enter-game-code .form input').each(function(i, el) {
				obj[$(el).attr('name')] = $(el).val();
			}); 

			this.model.set(obj, {
				silent: true
			});
			/*
			this.controller.trigger('submitGameCodeBtnClick', this.model.get('gameCode'));
			return;
			*/
			//this.model.preValidate('gameCode', this.model.get(gameCode));
            if(this.model.isValid(true)){
            	//console.log('isValid, ',this.model)
            	this.controller.trigger('submitGameCodeBtnClick', this.model.get('gameCode'));
            	this.$el.find('#error-messages').addClass('hidden');
            	//this.model.set({gameCodeIncorrect: false},{silent: true});
            }else{
            	//alert('not valid')
            	//console.log('not Valid, ',this.model)
            	/*var errorMsg = this.model.preValidate('gameCodeIncorrect', false);
            	if(errorMsg == "Game code is not registerd."){
            		location.reload();
            	}*/
            	this.$el.find('#error-messages').removeClass('hidden');
            	this.$el.find('#error-messages').addClass('visible');
            	//this.model.set({gameCodeIncorrect: false},{silent: true});
            	//this.model.set({gameCodeIncorrect: false},{silent: true})
            	//this.$el.addClass('hidden');
            }
	    
		},
        reset: function(model){
            if(model) this.model = model;
            this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
            /*this.$el.find("#current-address option[value='"+this.model.get('ddProvince')+"']").attr('selected','selected');
            this.$el.find("option[value='"+this.model.get('ddTitle')+"']").attr('selected','selected');
            this.$el.find("option[value='"+this.model.get('ddProvincePrev')+"']").attr('selected','selected');
            if(this.model.get('tbMethodOfContact')){
                this.$el.find("input[value='"+this.model.get('tbMethodOfContact')+"']").attr('checked','checked');
            }*/
            this.originalHeight = this.$el.height();
            this.originalWidth = this.$el.width();
            return this;
        },
		dropDownOnChange: function (e) {
			var error = this.model.preValidate(e.currentTarget.name, e.currentTarget.value);
			if (error) {
				$(e.currentTarget).parent().addClass('error')
			} else {
				$(e.currentTarget).parent().removeClass('error')
			}
			var obj = {};
			obj[e.currentTarget.name] = e.currentTarget.value;
			this.model.set(obj, {
				silent: true
			});
		},
		inputOnFocus: function (e) {
		},
		radioOnClick: function (e) {
			var $target = $(e.currentTarget)
			$target.addClass('selected')
			$target.parent().parent().find('> .error').removeClass('error')
			var obj = {};
			obj[e.currentTarget.name] = e.currentTarget.value;
			obj.tbMethodOfContact = e.currentTarget.value;
			this.model.validation.tbHomePhone.required = false;
			this.model.validation.tbCellPhone.required = false;
			this.model.validation[e.currentTarget.value].required = true;

			this.model.set(obj, {
				silent: true
			});
		},
		checkboxOnClick: function (e) {
			var obj = {};
			if ($(e.currentTarget).is(':checked')) {
				obj[e.currentTarget.name] = true;
				obj.cbOptin = true;
			} else {
				obj[e.currentTarget.name] = false;
				obj.cbOptin = false;
			}
			this.model.set(obj, {
				silent: true
			});
		},
		inputOnBlur: function (e) {
		   console.log('userInformationForm.inputOnBlur()')
			e.preventDefault;
			
			if (e.currentTarget.name == "gameCode") {
				if ((e.currentTarget.value != this.model.get(e.currentTarget.name)) && this.model.get(e.currentTarget.name+'Incorrect') != false) {
					this.$el.find('[name=' + e.currentTarget.name + ']').parent().removeClass('error');
					this.$el.find('#error-messages em[for=' + e.currentTarget.name + 'Incorrect]').css('display', 'none');
					this.model.set(e.currentTarget.name+'Incorrect', false, {silent: true})
				}
			}
			

			var error = this.model.preValidate(e.currentTarget.name, e.currentTarget.value);

			if (error) {
				$(e.currentTarget).parent().addClass('error');
				$('#error-messages em[for='+e.currentTarget.name+']').css('display', 'block');
				
			} else if(e.currentTarget.value != this.model.get(e.currentTarget.name)){
				$(e.currentTarget).parent().removeClass('error');
				$('#error-messages em[for='+e.currentTarget.name+']').css('display', 'none');
			}

			var obj = {};
			obj[e.currentTarget.name] = e.currentTarget.value;

			this.model.set(obj, {
				silent: true
			});

		},
		inputOnKeyPress: function (e) {
			//console.log('PostalCodeSearch.onEnterKeyPress')
			var code = (e.keyCode ? e.keyCode : e.which);
			if (code == 13) {
				if (e.currentTarget.name == "tbPostalCode") {
					e.currentTarget.value = e.currentTarget.value.toUpperCase()
					var reg = new RegExp("[ ]+", "g");
					e.currentTarget.value = e.currentTarget.value.replace(reg, "");
					this.$('input[name=tbPostalCode]').val(e.currentTarget.value)
				}
				var error = this.model.preValidate(e.currentTarget.name, e.currentTarget.value);
				if (error) {
					$(e.currentTarget).parent().addClass('error')
				} else {
					$(e.currentTarget).parent().removeClass('error')
				}
				var obj = {};
				obj[e.currentTarget.name] = e.currentTarget.value;
				this.model.set(obj, {
					silent: true
				});
			}

		},
		valid: function (view, attr) {
			//console.log('\n'+attr+': valid');
			view.$el.find('[name=' + attr + ']').parent().removeClass('error');
			view.$el.find('#error-messages em[for=' + attr + ']').removeClass('visible');
			view.$el.find('#error-messages em[for=' + attr + ']').css('display','none');
		},
		invalid: function (view, attr, error) {
			console.log('invalid: '+attr+': '+error);
			view.$el.find('[name=' + attr + ']').parent().addClass('error');
			view.$el.find('#error-messages em[for=' + attr + ']').addClass('visible');
			view.$el.find('#error-messages em[for=' + attr + ']').css('display','block');
			var n = attr.indexOf("Incorrect");
			if(n > 0){
				var tempId = attr.substring(0, n);
				view.$el.find('[name=' + tempId + ']').parent().addClass('error');
			}
		},
		validated: function (isValid) {
			if (!isValid) {
				this.$el.find('#error-messages').addClass('visible');
				this.$el.find('#error-messages').removeClass('hidden');
			} else {
				this.$el.find('#error-messages').removeClass('visible');
				this.$el.find('#error-messages').addClass('hidden');
			}
		}
	});


	views.Carousel = views.ListBaseClass.extend({
		tagName: 'div',
		events: {
			"click nav a.prev": "prevBtnClickHandler",
			"click nav a.next": "nextBtnClickHandler",
			"release a#select-bat-btn": "selectBatClickHandler"
		},
		start: function(){

			//console.log('views.ListBaseClass.start()')
			this.reset();

			console.log('views.Carousel.start()');
			( function() {
					var lastTime = 0;
					var vendors = ['ms', 'moz', 'webkit', 'o'];
					for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
						window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
						window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
					}

					if (!window.requestAnimationFrame)
						window.requestAnimationFrame = function(callback, element) {
							var currTime = new Date().getTime();
							var timeToCall = Math.max(0, 16 - (currTime - lastTime));
							var id = window.setTimeout(function() {
								callback(currTime + timeToCall);
							}, timeToCall);
							lastTime = currTime + timeToCall;
							return id;
						};

					if (!window.cancelAnimationFrame)
						window.cancelAnimationFrame = function(id) {
							clearTimeout(id);
						};
				}());

			


			return this;

		},
		setPaneDimensions: function(){
			//console.log('BatSelectionView.setPaneDimensions()');
			var that = this;
			
			/*if(this.$el.width() < 1){
				this.pane_width = $(window).width();
			}else{
				this.pane_width = this.$el.width();
			}*/
			this.pane_width = $(window).width();
            this.panes.each(function() {
                $(this).width(that.pane_width);
            });
            
            this.$container.width(this.pane_width*this.pane_count);
            
		},
		showPane: function(index){
			//console.log('BatSelectionView.showPane()');
			var that = this;
			index = Math.max(0, Math.min(index, this.pane_count-1));
            this.current_pane = index;

            var offset = -((100/this.pane_count)*this.current_pane);
            this.setContainerOffset(offset, true);
		},
		setContainerOffset: function(percent, animate) {
			//console.log('BatSelectionView.setContainerOffset()');
			this.$container.removeClass("animate");

			if (animate) {
				this.$container.addClass("animate");
			}

			if (Modernizr.csstransforms3d) {
				this.$container.css("transform", "translate3d(" + percent + "%,0,0) scale3d(1,1,1)");
			} else if (Modernizr.csstransforms) {
				this.$container.css("transform", "translate(" + percent + "%,0)");
			} else {
				var px = ((this.pane_width * this.pane_count) / 100) * percent;
				this.$container.css("left", px + "px");
			}
		},
		nextBtnClickHandler: function(e){
			e.preventDefault();
			this.next();
		},
		prevBtnClickHandler: function(e){
			e.preventDefault();
			this.prev();
		},
		next: function(){
			//console.log('BatSelectionView.next()');
			return this.showPane(this.current_pane+1, true);
		},
		prev: function(){
			//console.log('BatSelectionView.prev()');
			return this.showPane(this.current_pane-1, true);
		},
		selectBatClickHandler: function(e){
			//console.log('selectBatClickHandler()', e);
			//console.log('currentPane: ', this.collection.at(this.current_pane));
			this.controller.trigger('onSelectBatClickHandler', this.collection.at(this.current_pane));
		},
		handleHammer: function(e) {
			//console.log('BatSelectionView.handleHammer()');
			//console.log(e);
			// disable browser scrolling
			e.gesture.preventDefault();
			
			var that = this;
			
			switch(e.type) {
				case 'dragright':
				case 'dragleft':
					// stick to the finger
					var pane_offset = -(100 / that.pane_count) * that.current_pane;
					var drag_offset = ((100 / that.pane_width) * e.gesture.deltaX) / that.pane_count;

					// slow down at the first and last pane
					if ((that.current_pane == 0 && e.gesture.direction == Hammer.DIRECTION_RIGHT) || (that.current_pane == that.pane_count - 1 && e.gesture.direction == Hammer.DIRECTION_LEFT)) {
						drag_offset *= .4;
					}

					that.setContainerOffset(drag_offset + pane_offset);
					break;

				case 'swipeleft':
					that.next();
					e.gesture.stopDetect();
					break;

				case 'swiperight':
					that.prev();
					e.gesture.stopDetect();
					break;

				case 'release':
					// more then 50% moved, navigate
					if (Math.abs(e.gesture.deltaX) > that.pane_width / 2) {
						if (e.gesture.direction == 'right') {
							that.prev();
						} else {
							that.next();
						}
					} else {
						that.showPane(that.current_pane, true);
					}
					break;
			}
		},
		rendered: function(){
			//console.log('views.BatSelectionView.rendered()');
			var that = this;
			//element = $(element);

			this.$container = this.$el.find('>ul');
			//console.log('$container: ', this.$container);
			// var $container = $(">ul", element);

			this.panes = this.$el.find('>ul>li');
			// var panes = $(">ul>li", element);
			//console.log('panes: ', this.panes);

			this.pane_width = $(window).width();
			this.pane_count = this.panes.length;

			this.current_pane = 0;

			//console.log('this.panes.length: ', this.panes.length);

			this.setPaneDimensions();

			$(window).on("load resize orientationchange", function() {
				//console.log("load resize orientationchange")
				that.setPaneDimensions();
				//updateOffset();
			});
			
			function handleHammer(e) {
				//console.log('BatSelectionView.handleHammer()', e);
				//console.log(e);
				// disable browser scrolling
				if(!e.gesture){
					return;
				}
				
				e.gesture.preventDefault();
				//var that = this;
				
				switch(e.type) {
					case 'dragright':
					case 'dragleft':
						// stick to the finger
						var pane_offset = -(100 / that.pane_count) * that.current_pane;
						var drag_offset = ((100 / that.pane_width) * e.gesture.deltaX) / that.pane_count;
	
						// slow down at the first and last pane
						if ((that.current_pane == 0 && e.gesture.direction == Hammer.DIRECTION_RIGHT) || (that.current_pane == that.pane_count - 1 && e.gesture.direction == Hammer.DIRECTION_LEFT)) {
							drag_offset *= .4;
						}
	
						that.setContainerOffset(drag_offset + pane_offset);
						break;
	
					case 'swipeleft':
						that.next();
						e.gesture.stopDetect();
						break;
	
					case 'swiperight':
						that.prev();
						e.gesture.stopDetect();
						break;
	
					case 'release':
						// more then 50% moved, navigate
						if (Math.abs(e.gesture.deltaX) > that.pane_width / 2) {
							if (e.gesture.direction == 'right') {
								that.prev();
							} else {
								that.next();
							}
						} else {
							that.showPane(that.current_pane, true);
						}
						break;
				}
				
			}

			this.$el.hammer({
				drag_lock_to_axis : true
			}).on("release dragleft dragright swipeleft swiperight", handleHammer); 
		},
		onClickEventHandler: function(e){
			//console.log('views.BatSelectionView.onClickEventHandler();');
			
			
	    
		},
		debug: function(text){
			$("#debug").text(text);
		}
	});
	
	/*
	views.BatSelectionView = views.ListBaseClass.extend({
		tagName: 'div',
		events: {
			//"click input[type=radio]": "radioOnClick"
		},
		start: function(){
			console.log('views.BatSelectionView.start()');
			
			//_(this).bindAll('inputOnBlur', 'inputOnKeyPress', 'dropDownOnChange', 'valid', 'invalid', 'validated');
			
		},
		rendered: function(){
			console.log('views.BatSelectionView.rendered()');
		},
		onClickEventHandler: function(e){
			console.log('views.BatSelectionView.onClickEventHandler();');
			
			
	    
		}
	});
	*/
	views.Screens = views.BaseClass.extend({
		tagName: 'div',
		events: {
			//'click': 'onClickEventHandler'
		},
		show: function (id) {

			_.each(this.childViews, function (childView) {
				childView.visible(false)
			}, this)
			this.get(id).visible(true)
			this.visible(true);

			return this
		},
		hide: function () {
			//console.log('Popups.hide('+id+')')
			_.each(this.childViews, function (childView) {
				childView.visible(false);
			}, this)
			this.visible(false);
			return this
		},
		onClickEventHandler: function (e) {
			//console.log('onClickEventHandler')
			this.controller.trigger('closePopUp', this.model);
		}
	});

	
	views.Screen = views.BaseClass.extend({
		tagName: 'section',
		events: {
			//'click a': 'onClickEventHandler'
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('Popup.onClickEventHandler');
			this.controller.trigger('closePopUp', this.model);
		}
	});
	
	
	
	
	views.Button = views.BaseClass.extend({
		tagName: 'a',
		events: {
	    	"click": "onClickEventHandler"
		},
		start: function(){
			_(this).bindAll('onClickEventHandler');	
			this.$el.bind('tap', this.onClickEventHandler);
			this.toggleVisible();
			this.toggleEnabled();
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			this.controller.trigger(this.event, e);
		}
	});
	
	
	views.TestView = views.BaseClass.extend({
		tagName: 'section',
		events: {
    		"click #ca-div": "onClickEventHandler",
    		"click #us-div": "onClickEventHandler",
    		"click #mex-div": "onClickEventHandler"
		 },
		start: function (){
			//this.render();
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log("view.onClickEventHandler()")
			//clickedText = clickedText.replace(/ +?/g, '');
			this.controller.trigger('testEvent', $('#'+e.currentTarget.id).text());
		}
	});
	
	views.NavList = views.ListBaseClass.extend({
		tagName: 'nav',
		/*events: {
    		"click #ca-div": "onClickEventHandler",
    		"click #us-div": "onClickEventHandler",
    		"click #mex-div": "onClickEventHandler"
		 },*/

		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log("view.onClickEventHandler()")
			//clickedText = clickedText.replace(/ +?/g, '');
			//this.controller.trigger('testEvent', $('#'+e.currentTarget.id).text());
		}
	});
	
	views.NavItem = views.ListItemBaseClass.extend({
		tagName: 'li',
		events: {
    		"click a": "onClickEventHandler"
		 },
		start: function (){
			//console.log('NavItem.start()')
			//this.render();
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log(e.currentTarget.href)
			//console.log($('#'+e.currentTarget.id+' > a').attr('href'))
			//this.controller.trigger('navItemOnClick', $('#'+e.currentTarget.id).text());
			//console.log(this.id+".onClickEventHandler()")
			//clickedText = clickedText.replace(/ +?/g, '');
			this.controller.trigger('navItemOnClick', e.currentTarget.hash);
			return false;
		}
	});
	
	views.TestList = views.ListBaseClass.extend({
		tagName: 'ul',
		events: {
    		"click #ca-div": "onClickEventHandler",
    		"click #us-div": "onClickEventHandler",
    		"click #mex-div": "onClickEventHandler"
		 },
		start: function (){
			//this.render();
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log("view.onClickEventHandler()")
			//clickedText = clickedText.replace(/ +?/g, '');
			//this.controller.trigger('testEvent', $('#'+e.currentTarget.id).text());
		}
	});
	
	views.TestListItem = views.BaseClass.extend({
		tagName: 'li',
		events: {
    		"click": "onClickEventHandler"
		 },
		start: function (){
			//this.render();
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log(this.id+".onClickEventHandler()")
			//clickedText = clickedText.replace(/ +?/g, '');
			//this.controller.trigger('testEvent', $('#'+e.currentTarget.id).text());
		}
	});	
	
	
	views.TestView = views.BaseClass.extend({
		tagName: 'section',
		events: {
    		"click #ca-div": "onClickEventHandler",
    		"click #us-div": "onClickEventHandler",
    		"click #mex-div": "onClickEventHandler"
		 },
		start: function (){
			//this.render();
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log("view.onClickEventHandler()")
			//clickedText = clickedText.replace(/ +?/g, '');
			this.controller.trigger('testEvent', $('#'+e.currentTarget.id).text());
		}
	});
	
	
	////////////////////////////////////////////////////////////////////////////
	//	View Class - Main View Class, root dom element for app
	//	Empty <article> element which views are appended to
	////////////////////////////////////////////////////////////////////////////

	views.View = views.BaseClass.extend({
		initialize: function(){
			//console.log("views.View.initialize()");
			this.$content = this.$el;
			this.render();
		},
		render: function(model){
			//console.log("views.View.render()");
			
			this._rendered = true;

			for(var i = 0; i < this.childViews.length; i++){
				this.childViews[i].$el.remove();
				delete this.childViews[i];
			}
			this.childViews = [];

			for(var i = 0; i < this.childViews.length; i++){
				this.childViews[i].render();
				this.$el.append(this.childViews[i].$el);
			}
			return this;
		}
	});
	
	////////////////////////////////////////////////////////////////////////////
	//ComponentSection - General View for anything that isEnabled, isVisible & isSelected
	////////////////////////////////////////////////////////////////////////////
	
	
	views.ComponentSection = views.BaseClass.extend({
		tagName: 'section',
		initialize: function(options){
			//console.log("views.ComponentSection.initialize")
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			
			if(options.content)	this.content = options.content;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.tagName)	this.tagName = options.tagName;
			if(options.id)	this.id = options.id
			
			this.render();
			
		}
	});
	

	
	
	
	views.DropDownOption = views.BaseClass.extend({
		tagName: 'option',
		events: {
    		//"click": "onClickEventHandler"
		 },
		initialize: function(options){
			//console.log('DropDownOption.initialize');
			this.eventAggr = options.eventAggr;
			this.template = options.template;
			this.event = options.event;
			if(options.text) this.text = options.text;
			this.render();
			//console.log(this.model.get('id'))
		},
		render: function(model){
			if(model)	this.model = model;
			this.$el= $(this.template(this.model.toJSON()));

			this._rendered = true;
			this.model.bind('change:isSelected', this.toggleSelected, this);
			
		},
		toggleSelected:function(){
			if(this.model.get('isSelected')==true){
				this.$el.attr('selected', 'selected');
			}else{
				//console.log('removeSelected')
				this.$el.removeAttr("selected")
			}
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log('onClickEventHandler')
			this.eventAggr.trigger(this.event, this.model);
		},
		onChangeEventHandler: function(e){
			e.preventDefault();
			//console.log('onChangeEventHandler')
			//this.eventAggr.trigger(this.event, this.model);
		}
	});


	views.DropDownSelect = views.ListBaseClass.extend({
		tagName: 'select',
		events: {
			"change": "onChangeEventHandler"
		},
		initialize: function(options){
			//console.log("DropDownSelect.initialize()");
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('tab-nav');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.collection = options.collection;
			this.eventAggr = options.eventAggr;
			this.event = options.event;
			this.childViewConstructor = options.childViewConstructor;
			this.childTemplate = options.childTemplate;
			this.content = options.content;
			if(options.id)	this.id = options.id;
			
			//console.log(this.collection)
			
			this.render();
			this.collection.bind('reset', this.render, this);
		},
		onChangeEventHandler: function(e){
			e.preventDefault();
			//console.log('onChangeEventHandler')
			//console.log(e.currentTarget.value)
			//console.log(e.currentTarget.id)
			//console.log(this.collection)
			//console.log(this.collection.get(e.currentTarget.value).get('id'))
			this.eventAggr.trigger(this.event, this.collection.get(e.currentTarget.value));
		}
	});
	
	
	

	////////////////////////////////////////////////////////////////////////////

	views.Options = Backbone.View.extend({
		tagName: 'select',
		initialize: function(){
			this.data     = this.options.data;
			this.selected = this.options.selected;
			//this.reset();
		},
		reset: function(){
			//console.log("views.Options.reset()")
			var options		= _.map(this.data, function(val, key, all){
				return '<option value="'+key+'">'+val+'</option>';
			}).join("");
			this.$el.html(options);
			this.render();
		},
		render: function(){
			this.$el.val(this.selected);
			return this;
		}
	});



	ns.views = views;
	
}(app, jQuery, _, Backbone, io, accounting));
