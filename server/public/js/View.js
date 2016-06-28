/* -*- mode:js; tab-width: 4; indent-tabs-mode: t; js-indent-level: 4 -*- */
/**
 * @author bneufeld
 */

"use strict";

////////////////////////////////////////////////////////////////////////////////
// defines the views
////////////////////////////////////////////////////////////////////////////////

(function(ns, $, _, Backbone, io, accounting, MediaElementPlayer){
	
	
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
	
	views.Popups = views.BaseClass.extend({
		tagName: 'div',
		events: {
			//'click': 'onClickEventHandler'
		},
		history: [],
		show: function (id) {
			console.log('Popups.show('+id+')')
			
			var that = this;
			
			var $el = this.get(id).$el;
			
			_.each(this.childViews, function (childView) {
				childView.visible(false)
			}, this);
			
			this.get(id).visible(true);
			this.visible(true);
			if(id != this.history[this.history.length-1]){
				this.history.push(id);
			}
			
			//console.log('history is: ', this.history);
			
			$el.css('margin-left', -($el.outerWidth()/2));
			$el.css('margin-top', -($el.outerHeight()/2));
			
			return this
		},
		showPreviousTo: function(id){
			var history = this.history;
			var prevId = '';
			for(var i=0; i<history.length; i++){
				if(history[i] ==  id){
					prevId = history[i-1];
				}
			}
			if(prevId){
				this.show(prevId);
			}else{
				this.hide();
			}
			//console.log('prevId is: ', prevId);
		},
		hide: function () {
			//console.log('Popups.hide('+id+')')
			_.each(this.childViews, function (childView) {
				childView.visible(false);
			}, this);
			
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
		rendered: function(){
			//console.log('Popup.rendered()');
			
			var that = this;
			var $el = this.$el;
			var $imgs = $el.find('img');
			var count = $imgs.length;

			if (count) {

				$imgs.load(function() {

					count--;
					if (!count) {
						$el.css('margin-left', -($el.outerWidth()/2));
						$el.css('margin-top', -($el.outerHeight()/2));
					}
				}).filter(function() {
					return this.complete;
				}).load();
			}else{
				$el.css('margin-left', -($el.outerWidth()/2));
				$el.css('margin-top', -($el.outerHeight()/2));
			}
			
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('Popup.onClickEventHandler');
			var event = 'closePopUp';
			if(this.event){
				event = this.event;
			}
			
			this.controller.trigger(event, this.model);
		}
	});
	
	
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
			'click a': 'onClickEventHandler'
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('Popup.onClickEventHandler');
			var event = 'closePopUp';
			if(this.event){
				event = this.event;
			}
			//console.log('event: ',event)
			this.controller.trigger(event, this.model);
		}
	});
	
	views.Overlays = views.BaseClass.extend({
		tagName: 'section',
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
			this.controller.trigger('closeOverlay', this.model);
		}
	});

	
	views.Overlay = views.BaseClass.extend({
		tagName: 'div',
		events: {
			//'click a': 'onClickEventHandler'
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('Popup.onClickEventHandler');
			this.controller.trigger('closePopUp', this.model);
		}
	});
	
	views.LandingIntroAnimation = views.BaseClass.extend({
		tagName: 'div',
		events: {
			'click a#instruction-cta': 'onClickEventHandler'
		},
		start: function(){
			//console.log('views.LandingIntro');
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('Popup.onClickEventHandler');
			this.controller.trigger('onPlayBallClickHandler', this.model);
		}
	});
	
	views.GameComplete = views.BaseClass.extend({
		tagName: 'div',
		events: {
			'click a#fb-share': 'onClickEventHandler',
			'click a#learn-more': 'onLearnMoreBtnClickHandler'
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			/*
			window.open('http://www.facebook.com/sharer.php?s=100&amp;p[title]=foo&amp;p[summary]=bar&amp;p[url]=https://www.foobar.com/&amp;p[images][0]=https://www.foobar.com/thumb.gif','sharer','toolbar=0,status=0,width=580,height=325');*/
			
			this.controller.trigger('fbShareBtnClick', this.model);
			//type="button_count"
			
			
			//console.log('Popup.onClickEventHandler');
			/*var event = 'closePopUp';
			if(this.event){
				event = this.event;
			}
			
			this.controller.trigger(event, this.model);*/
		},
		onLearnMoreBtnClickHandler: function(e){
			e.preventDefault();
			window.open(this.text.learnMoreUrl, "_blank");
		}
	});
	
	views.LoggedIn = views.BaseClass.extend({
		tagName: 'div',
		events: {
			'click #play-btn': 'onClickEventHandler'			
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			//this.controller.trigger('closePopUp', this.model);
			this.controller.trigger('playGame', this.model);
		}
	});
	
	views.RegistrationOptions = views.BaseClass.extend({
		tagName: 'div',
		events: {
			'click #close-btn': 'onClickEventHandler',
			'click a#register': 'registerClickEventHandler',
			'click #login': 'loginClickEventHandler',
			'click #playForFun': 'playForFunClickEventHandler',
			'click #register-options-back' : 'backBtnClickEventHandler'
		},
		onClickEventHandler: function (e) {
			console.log('RegistrationOptions.onClickEventHandler');
			e.preventDefault();
			this.controller.trigger('closePopUp', this.model);
		},
		backBtnClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('RegistrationOptions.onClickEventHandler');
			this.controller.trigger('registerOptionsBackBtnClick', this.model);
		},
		registerClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('RegistrationOptions.onClickEventHandler');
			this.controller.trigger('registerBtnClick', this.model);
		},
		loginClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('RegistrationOptions.onClickEventHandler');
			this.controller.trigger('loginBtnClick', this.model);
		},
		playForFunClickEventHandler: function(e){
			e.preventDefault();
			console.log('RegistrationOptions.playForFunClickEventHandler');
			this.controller.trigger('playForFunBtnClick', this.model);
		}
	});
	
	views.LandingAnimation = views.BaseClass.extend({
		tagName: 'section',
		start: function (){
			//console.log('VideosView.start()');
			
		}
	});
	
	
	views.VideosView = views.ListBaseClass.extend({
		tagName: 'section',
		start: function (){
			//console.log('views.VideosView.start()');
			//console.log('colleciton', this.collection)
			_(this).bindAll('show');
			
			//this.model.bind('change', this.render, this);
			this.reset();
			
		},
		initializePlayers: function(options){
			//console.log('VideosView.initializePlayers', options)
			//var player = new MediaElementPlayer($('#player2'));
			for (var i=0; i < this.childViews.length; i++){
				this.childViews[i].initializePlayer(options);
			}
		},
		show: function(id){
			if (!id) throw "You need to supply an id!";
			
			//console.log('show()', id);
			
			var childView = this.get(id);
			//console.log(childView.id);
			
			if(!childView){
				return undefined
			}else{
				
				_.each(this.childViews, function(view){
					if(view.id != id){
						view.visible(false);
						view.player.currentTime = 0;
						view.player.pause();
					}
				 
				}, this);
				childView.player.currentTime = 0;
				childView.visible(true);
				childView.player.pause();
			}
			
			return this;
		},
		play: function(id){
			if (!id) throw "You need to supply an id!";
			
			//console.log('show()', id);
			
			var childView = this.get(id);
			//console.log(childView.id);
			
			if(!childView){
				return undefined
			}else{
				
				_.each(this.childViews, function(view){
					if(view.id != id){
						view.visible(false);
						view.player.currentTime = 0;
						view.player.pause();
					}
				 
				}, this);
				childView.player.currentTime = 0;
				childView.visible(true);
				childView.player.play();
			}
			
			return this;
		}
	});
	
	
	views.VideoView = views.BaseClass.extend({
		tagName: 'video',
		isVisible: false,
		//player: {},
		start: function (){
			//console.log('VideoView.start()')
			//this.render();
		},
		initializePlayer: function(options){
			//console.log('VideoView.initializePlayer()',options);
			var that = this;
			
			function bindEvent(el, eventName, eventHandler) {
			  if (el.addEventListener){
			    el.addEventListener(eventName, eventHandler, false); 
			  } else if (el.attachEvent){
			    el.attachEvent('on'+eventName, eventHandler);
			  }
			}
			
			
			this.player = new MediaElementPlayer(this.$el.find('video'), options);
			
			
			var events = ['loadstart', 'loadeddata', 'play', 'ended'];
			

			if (window.addEventListener) {
				for (var i = 0, il = events.length; i < il; i++) {

					var eventName = events[i];

					that.player.media.addEventListener(events[i], function(e) {
						that.controller.trigger('onVideoEvent', {
							id : e.target.id,
							type : e.type
						});
					});
				}
			} else if (window.attachEvent) {
				for (var i = 0, il = events.length; i < il; i++) {

					var eventName = events[i];

					that.player.media.attachEvent(events[i], function(e) {
						that.controller.trigger('onVideoEvent', {
							id : e.target.id,
							type : e.type
						});
					});
				}
			}
			
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log(this.id+".onClickEventHandler()")
			//clickedText = clickedText.replace(/ +?/g, '');
			//this.controller.trigger('testEvent', $('#'+e.currentTarget.id).text());
		}
	});
	
	views.LogIn = views.BaseClass.extend({
		tagName: 'div',
		events: {
			"click input[type=radio]": "radioOnClick",
			"click #subscribe input[type=checkbox]": "checkboxOnClick",
			//"blur input[type=text]": "inputOnBlur",
			"keypress input[type=text]": "inputOnKeyPress",
			"focus input": "inputOnFocus",
			"change select": "dropDownOnChange",
			"click #submit": "onClickEventHandler",
			//'click #twitter-register': 'twitterClickEventHandler',
			'click #forgotPassword' : 'forgotPswdClickEventHandler',
			'click #login-back' : 'backBtnClickEventHandler',
			'click #twitter-login': 'twitterClickEventHandler',
			'click #facebook-login': 'facebookClickEventHandler'
		},
		start: function(){
			
			Backbone.Validation.bind(this, {
				forceUpdate: true,
				valid: this.valid,
				invalid: this.invalid
			});
			
			this.model.bind('validated', this.validated, this);
			
			_(this).bindAll('inputOnBlur', 'inputOnKeyPress', 'dropDownOnChange', 'valid', 'invalid', 'validated');
			
		},
		onClickEventHandler: function(e){
			console.log('onClickEventHandler');
			
			var obj = {};
			$('#userInfo-login .form input').each(function(i, el) {
				obj[$(el).attr('name')] = $(el).val();
			}); 

			this.model.set(obj, {
				silent: true
			});
			
            if(this.model.isValid(true)){
            	this.controller.trigger('loginSubmitOnClick', this.model);
            }
	    
		},
		backBtnClickEventHandler: function(){
			this.controller.trigger('loginBackBtnClick', this.model);
		},
		forgotPswdClickEventHandler: function(){
			this.controller.trigger('forgotPswdBtnClick', this.model);
		},

		facebookClickEventHandler: function(){
			console.log('Login.facebookClickEventHandler()');
			//this.controller.trigger('signUpWithFacebookBtnClick', this.model);
			this.controller.trigger('loginWithFacebookBtnClick', this.model);
		},
		twitterClickEventHandler: function(){
			console.log('Login.twitterClickEventHandler()');
			this.controller.trigger('loginWithTwitterBtnClick', this.model);
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
		   console.log('Login.inputOnBlur()')
			e.preventDefault;
			
			
			if (e.currentTarget.name == "emailAddress" || e.currentTarget.name == "password") {
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
			//console.log('invalid: '+attr+': '+error);
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


	views.ForgotPswd = views.BaseClass.extend({
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
			$('#forgot-pswd-login .form input').each(function(i, el) {
				obj[$(el).attr('name')] = $(el).val();
			}); 

			this.model.set(obj, {
				silent: true
			});
			
			console.log()
			
            if(this.model.isValid(true)){
            	this.controller.trigger('emailPswdBtnClick', {emailAddress: this.model.get('emailAddress')});
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
			
			
			if (e.currentTarget.name == "emailAddress") {
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
	
	views.UserInformationForm = views.BaseClass.extend({
		tagName: 'div',
		events: {
			"click input[type=radio]": "radioOnClick",
			"click #subscribe input[type=checkbox]": "checkboxOnClick",
			"blur input[type=text]": "inputOnBlur",
			"keypress input[type=text]": "inputOnKeyPress",
			"focus input": "inputOnFocus",
			"change select": "dropDownOnChange",
			"click #register-submit": "onClickEventHandler",
			'click #twitter-register': 'twitterClickEventHandler',
			'click #facebook-register': 'facebookClickEventHandler',
			'click #register-back' : 'backBtnClickEventHandler'
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
			//e.preventDefault();
			
			var obj = {};
			$('#user-infoRegister .form input').each(function(i, el) {
				console.log($(el).val())
				obj[$(el).attr('name')] = $(el).val();
			}); 

			this.model.set(obj, {
				silent: true
			});
			
            if(this.model.isValid(true)){
            	this.controller.trigger('registerSubmitOnClick', this.model);
            }
	    
		},
		backBtnClickEventHandler: function(){
			console.log('UserInformationForm.backBtnClickEventHandler()');
			this.controller.trigger('registerBackBtnClick', this.model);
		},
		facebookClickEventHandler: function(){
			//console.log('UserInformationForm.facebookClickEventHandler(), ',this.model);
			//console.log('socialId: ',this.model.get('socilaId'))
			if(this.model.get('socialId')){
				this.onClickEventHandler();
			}else{
				this.controller.trigger('signUpWithFacebookBtnClick', this.model);
			}
			
			
		},
		twitterClickEventHandler: function(){
			//console.log('UserInformationForm.twitterClickEventHandler()');
			if(this.model.get('socialId')){
				this.onClickEventHandler();
			}else{
				this.controller.trigger('signUpWithTwitterBtnClick', this.model);
			}
		},
        reset: function(model){
            if(model) this.model = model;
            this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
            //FB.XFBML.parse(document.getElementById('foo'));
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

			if (e.currentTarget.name == "emailAddress" || e.currentTarget.name == "userName") {
				if ((e.currentTarget.value != this.model.get(e.currentTarget.name)) && this.model.get(e.currentTarget.name+'Unique') != true) {
					this.$el.find('[name=' + e.currentTarget.name + ']').parent().removeClass('error');
					this.$el.find('#error-messages em[for=' + e.currentTarget.name + 'Unique]').css('display', 'none');
					this.model.set(e.currentTarget.name+'Unique', true, {silent: true})
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
			//view.$el.find('#error-messages em[for=' + attr + ']').removeClass('visible');
			view.$el.find('#error-messages em[for=' + attr + ']').css('display','none');
		},
		invalid: function (view, attr, error) {
			//console.log('invalid: '+attr+': '+error);
			view.$el.find('[name=' + attr + ']').parent().addClass('error');
			//view.$el.find('#error-messages em[for=' + attr + ']').addClass('visible');
			view.$el.find('#error-messages em[for=' + attr + ']').css('display','block');
			var n = attr.indexOf("Unique");
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
	
	
	views.PracticeUserName = views.BaseClass.extend({
		tagName: 'div',
		events: {
			"click #submit": "onClickEventHandler",
			"click #practice-username-back" : "backBtnClickEventHandler"
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
			$('#practice-user-name .form input').each(function(i, el) {
				console.log($(el).val())
				obj[$(el).attr('name')] = $(el).val();
			}); 

			this.model.set(obj, {
				silent: true
			});
			
            if(this.model.isValid(true)){
            	this.controller.trigger('practiceUserNameSubmitOnClick', this.model);
            }
	    
		},
		backBtnClickEventHandler: function(){
			this.controller.trigger('practiceUserNameBackBtnClick', this.model);
			
		},
        reset: function(model){
            if(model) this.model = model;
            this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
            //FB.XFBML.parse(document.getElementById('foo'));
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

			if (e.currentTarget.name == "userName") {
				if ((e.currentTarget.value != this.model.get(e.currentTarget.name)) && this.model.get(e.currentTarget.name+'Unique') != true) {
					this.$el.find('[name=' + e.currentTarget.name + ']').parent().removeClass('error');
					this.$el.find('#error-messages em[for=' + e.currentTarget.name + 'Unique]').css('display', 'none');
					this.model.set(e.currentTarget.name+'Unique', true, {silent: true})
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
			//view.$el.find('#error-messages em[for=' + attr + ']').removeClass('visible');
			view.$el.find('#error-messages em[for=' + attr + ']').css('display','none');
		},
		invalid: function (view, attr, error) {
			//console.log('invalid: '+attr+': '+error);
			view.$el.find('[name=' + attr + ']').parent().addClass('error');
			//view.$el.find('#error-messages em[for=' + attr + ']').addClass('visible');
			view.$el.find('#error-messages em[for=' + attr + ']').css('display','block');
			var n = attr.indexOf("Unique");
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
	
	views.HeaderNav = views.BaseClass.extend({
		tagName: 'nav',
		events: {
    		"click a#nav-leaderboard-btn": "onLeaderboardClickEventHandler",
    		"click a#nav-twitter-btn": "onTwitterClickEventHandler",
    		"click a#nav-facebook-btn": "onFacebookClickEventHandler"
		 },
		start: function (){
			//this.render();

		},
		onLeaderboardClickEventHandler: function(e){
			e.preventDefault();
			console.log("HeaderNav.onLeaderboardClickEventHandler()");
			this.controller.trigger('onLeaderboardClickEventHandler', e);
			//clickedText = clickedText.replace(/ +?/g, '');
			//var userName = this.$el.find('input').val();
			//this.controller.trigger('onFindPlayer', userName);
			
		},
		onTwitterClickEventHandler: function(e){
			e.preventDefault();
			console.log("HeaderNav.onTwitterClickEventHandler()");
			this.controller.trigger('onTwitterClickEventHandler', e);
		},
		onFacebookClickEventHandler: function(e){
			e.preventDefault();
			console.log("HeaderNav.onFacebookClickEventHandler()");
			this.controller.trigger('onFacebookClickEventHandler', e);
		}
		
	});
	
	views.LeaderboardPopup = views.BaseClass.extend({
		tagName: 'div',
		events: {
			'click a.popup-close-btn': 'onClickEventHandler',
			"click a.search-btn": "onSearchBtnClickEventHandler",
			'click a#leaderboard-page-back' : "backBtnClickHandler",
			'click a#leaderboard-page-next' : "nextBtnClickHandler",
			'click .navwrap ul a' : "pageBtnClickHandler"
		},
		start: function(){
			//this.model.get('games').bind('reset', this.pageLoaded, this);
			this.model.bind('change:pages', this.onPagesUpdate, this);
			this.$nav = this.$el.find('.navwrap > ul');
			//this.pages
		},
		onPagesUpdate: function(){
			//console.log('onPagesUpdate: ', this.model);
			//console.log('onPagesUpdate: ', this.model.get('pages'));
			//console.log('onPagesUpdate: ', this.model.get('pages').length);
			/*this.$nav = this.$el.find('.navwrap > ul');
			this.$nav.css('display', 'none')
			*/
		},
		pageBtnClickHandler: function(e){
			//console.log('pageBtnClickHandler', $(e.currentTarget).text());
			e.preventDefault();
			this.controller.trigger('onPageSelection', Number($(e.currentTarget).text()));
			//this.page(Number($(e.currentTarget).text()));
		},
		rendered: function(){
			//console.log('LeaderboardPopup.rendered()');
			
			var that = this;
			var $el = this.$el;
			var $imgs = $el.find('img');
			var count = $imgs.length;

			if (count) {

				$imgs.load(function() {

					count--;
					if (!count) {
						$el.css('margin-left', -($el.outerWidth()/2));
						$el.css('margin-top', -($el.outerHeight()/2));
					}
				}).filter(function() {
					return this.complete;
				}).load();
			}else{
				$el.css('margin-left', -($el.outerWidth()/2));
				$el.css('margin-top', -($el.outerHeight()/2));
			}
			
			this.$nav = this.$el.find('.navwrap > ul');
			var pages = this.model.get('pages');
			//var pages = [1,2,3,4,5,6,7,8];
			var totalPages = pages.length;
			this.$nav.empty();
			
			if(pages.length == 1){
				
				
				
			}else if(pages.length > 6){
				for (var i = 0; i < 3; i++) {
					this.$nav.append('<li><a href="#">' + (i + 1) + '</a></li>');
					/*if(pages.length > 6 && i==4){

					 }*/
				}
				this.$nav.append('<li><a>.&nbsp;.&nbsp;.</a></li>');
				for (var i = (pages.length-3); i < pages.length; i++) {
					this.$nav.append('<li><a href="#">' + (i + 1) + '</a></li>');
					/*if(pages.length > 6 && i==4){

					 }*/
				}
			}else{
				for (var i = 0; i < pages.length; i++) {
					this.$nav.append('<li><a href="#">' + (i + 1) + '</a></li>');
					/*if(pages.length > 6 && i==4){

					 }*/
				}
				
			}
			
			
			
		},
		nextBtnClickHandler: function(e){
			console.log('Popup.nextBtnClickHandler');
			var page = this.model.get('selectedPage')+1;
			console.log('page: ',page)
			
			if(page < this.model.get('totalPages')+1){
				this.controller.trigger('onPageSelection', page);
			}
		},
		backBtnClickHandler: function(e){
			//console.log('Popup.nextBtnClickHandler', this.model.get('totalPages'));
			console.log('Popup.backBtnClickHandler');
			
			var page = this.model.get('selectedPage')-1;
			console.log('page: ',page)
			
			if(page > 0){
				this.controller.trigger('onPageSelection', page);
			}
		},
		onClickEventHandler: function (e) {
			e.preventDefault();
			//console.log('Popup.onClickEventHandler');
			var event = 'closePopUp';
			if(this.event){
				event = this.event;
			}
			
			this.controller.trigger("onShowPreviousPopup", this.model);
		},
		onSearchBtnClickEventHandler: function(e){
			e.preventDefault();
			//console.log("LeaderBoardSearch.onClickEventHandler()", $('#leaderboardSearchName').val());
			//clickedText = clickedText.replace(/ +?/g, '');
			this.controller.trigger('onLeaderboardSearchBtnClick', $('#leaderboardSearchName').val());
		},
		page: function(selectedPage){
			//this.model.set('selectedPage', selectedPage);
			this.model.pageUpdate(selectedPage);
			
		},
		player: function(userName){
			console.log('LeaderboardPopup.player(), ',userName)
			//this.model.set('selectedPlayer', userName);
			this.model.playerUpdate(userName);
			
			
		},
		pageLoaded: function(){
			console.log('pageLoaded');
			
			/*this.$el.find('tr').removeClass('disabled');
			this.$el.find('.ajax-loader').removeClass('visible');
			this.$el.find('.ajax-loader').addClass('hidden');*/
		},
	});
	
	views.LeaderboardGames = views.ListBaseClass.extend({
		tagName: 'section',
		events: {
    		"click a.popup-close-btn": "onClickEventHandler",
    		"keypress :input": "onClickEventHandler"
		},
		start: function (){
			//this.render();
			//console.log("Paginator collection: ", this.collection);
			//-->this.collection.bind('reset', this.test, this);
			//this.$el.find()
			//this.model.bind('change', this.render, this);
		},
		test: function(collection){
			console.log('Leaderboard.test(), ',collection);
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			console.log("LeaderBoardSearch.onClickEventHandler()");
			//clickedText = clickedText.replace(/ +?/g, '');
			/*var userName = this.$el.find('input').val();*/
			this.controller.trigger('closePopUp', this.model);
			
		},
		rendered: function(){
			//console.log('ListBaseCalss.rendered()');
			/*
			$('table.leaderboard tr').removeClass('disabled');
			$('#leaderboard-paginator .ajax-loader').removeClass('visible');
			$('#leaderboard-paginator .ajax-loader').addClass('hidden');
			*/
		}
	});	
	
	views.Loader = views.BaseClass.extend({
		tagName: 'div',
		isLoading: false,
		loading: function(id){
			$(id).addClass('loading');
			this.show();
		},
		loaded: function(id){
			$(id).removeClass('loading');
			this.hide();
		},
		show: function(){
			this.loading = true;
			this.$el.removeClass('visible');
			this.$el.addClass('hidden');
		},
		hide: function(){
			this.loading = false;
			this.$el.removeClass('visible');
			this.$el.addClass('hidden');
		},
		rendered: function(){
			if(this.loading){
				this.show();
			}else{
				this.hide();
			}
		}
	});
	
	views.LeaderBoardSearch = views.BaseClass.extend({
		tagName: 'div',
		events: {
    		"click a.search-btn": "onClickEventHandler"
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log("LeaderBoardSearch.onClickEventHandler()", $('#leaderboardSearchName').val());
			//clickedText = clickedText.replace(/ +?/g, '');
			this.controller.trigger('onLeaderboardSearchBtnClick', $('#leaderboardSearchName').val());
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
			
			/*for(var each in this.childViews){
				this.childViews[each].$el.remove();
				delete this.childViews[each];
			}*/
			for(var i = 0; i < this.childViews.length; i++){
				this.childViews[i].$el.remove();
				delete this.childViews[i];
			}
			this.childViews = [];
			
			/*for(var each in this.childViews){
				this.childViews[each].render();
				this.$el.append(this.childViews[each].$el);
			}*/
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
	
	views.Button = views.BaseClass.extend({
		tagName: 'div',
		events: {
	    	"click": "onClickEventHandler"
		},
		initialize: function(options){
			//console.log("views.Button.initialize")
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options.content;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.tagName)	this.tagName = options.tagName;
			if(options.id)	this.id = options.id
			if(options.eventAggr)	this.eventAggr = options.eventAggr;
			if(options.event)	this.event = options.event;

			this.render();
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log("Button.onClickEventHandler()")
			//console.log(this.event)
			//console.log(this.model)
			this.eventAggr.trigger(this.event, this.model);
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





	views.TitlePane = views.BaseClass.extend({
		tagName: 'li',
		initialize: function(options){
			//console.log("views.TitlePane.initialize()");
			this.template  = (options.template) ? options.template : ns.config.templates.get('select-vehicle');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.content = options.content;
			this.render();
		}
	});

	////////////////////////////////////////////////////////////////////////////
	
	views.TabNav = views.ListBaseClass.extend({
		tagName: 'table',
		initialize: function(options){
			//console.log("views.TabNav.initialize()");
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('tab-nav');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.collection = options.collection;
			this.eventAggr = options.eventAggr;
			this.event = options.event;
			this.childViewConstructor = options.childViewConstructor;
			this.childTemplate = options.childTemplate;
			this.content = options.content;
			
			this.render();
		}
	});
	
	views.NavTab = views.BaseClass.extend({
		tagName: 'td',
		data: {
			label	: 'label<br>line2',
			id		: 'cat-cars'
		},
		events: {
    		"click": "onClickEventHandler"
		 },
		initialize: function(options){
			//console.log('views.NavTab.initialize');
			this.eventAggr = options.eventAggr;
			this.template = options.template;
			this.event = options.event;
			this.render();
		},
		render: function(model){
			if(model)	this.model = model;
			this.model.bind('change:isSelected', this.toggleSelected, this);
			this.$el		= $(this.template(this.model.toJSON()));
		},
		toggleSelected:function(){
			this.$el.toggleClass('selected');
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			this.eventAggr.trigger(this.event, this.model);
		}
	});
	
	////////////////////////////////////////////////////////////////////////////
	
	views.ListPane = views.ListBaseClass.extend({
		tagName: 'ul',
		initialize: function(options){
			//console.log("views.ListPane.initialize()");
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('tab-nav');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.collection = options.collection;
			this.eventAggr = options.eventAggr;
			this.event = options.event;
			this.childViewConstructor = options.childViewConstructor;
			this.childTemplate = options.childTemplate;
			this.data = options.data;
			if (this.options.content) this.content = options.content;
			this.render();
		}
	});
		
    views.dealerThanks = views.BaseClass.extend({
        tagName: 'li',
        events: {
            "click .newEstimate": "onClickEventHandler"
        },
        initialize: function(options){
            //console.log("views.PostalCodeSearch.initialize")
            
            if (!options.template) 
                throw "You need to supply a template!";
            if (!options.text) 
                throw "You need to some text!";
            
            this.template = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
            this.text = (options.text) ? (options.text) : ns.config.staticText.get();
            this.eventAggr = options.eventAggr;
            
            if (options.content) 
                this.content = options.content;
            if (options.isEnabled != undefined) 
                this.isEnabled = options.isEnabled;
            if (options.isVisible != undefined) 
                this.isVisible = options.isVisible;
            if (options.tagName) 
                this.tagName = options.tagName;
            if (options.id) 
                this.id = options.id
       
            
            this.render();
            
            
        },
        onClickEventHandler: function(e){
            e.preventDefault();
            //console.log('Get new estimate');
			
			this.eventAggr.trigger('newEstimateOnClick');
			
        },
        visible: function(bool){
            if (bool) {
                this.$el.show();
            }
            else {
                this.$el.hide();
            }
        },toggleSelected: function(){
			// just an empty function
		}
    });
	
	views.Legal = views.BaseClass.extend({
		tagName: 'li',
		initialize: function(options){
			//console.log("views.Legal.initialize")
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			
			this.render();
			
		}
	});
	
	ns.views = views;
	
}(app, jQuery, _, Backbone, io, accounting, MediaElementPlayer));
