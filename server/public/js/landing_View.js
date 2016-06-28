/* -*- mode:js; tab-width: 4; indent-tabs-mode: t; js-indent-level: 4 -*- */
/**
 * @author bneufeld
 */

"use strict";

////////////////////////////////////////////////////////////////////////////////
// defines the views
////////////////////////////////////////////////////////////////////////////////

(function(ns, $, _, Backbone){
	
	
	var views = {};


	////////////////////////////////////////////////////////////////////////////
	// Base Class - All views inherit these methods and properties
	////////////////////////////////////////////////////////////////////////////
	
	views.BaseClass = Backbone.View.extend({
		childViews: {},
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

			for(var each in this.childViews){
				this.childViews[each].render();
			}
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();

			return this;
		},
		reset: function(model){
			//console.log("BaseClass.reset()")
			//this.$el.empty()
			if(model) this.model = model;
			
			for(var each in this.childViews){
				this.childViews[each].remove();
			}
			
			this.$el.html($(this.template(_.extend(this.text, this.data, this.model.toJSON()))).html());
			
			for(var each in this.childViews){
				this.add(this.childViews[each], this.childViews[each].meta)
			}
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();
			
			return this;
			
		},
		get: function(id){
			//console.log("views.BaseClass.getView("+id+")");
			if (!id)	return this;
	
			if(this.childViews[id]) return this.childViews[id];
			else return undefined;
			
		},
		add: function(view, options){
			//console.log(this.id+'.addxx('+view.id+')');
			
			if (this.childViews[view.id]) throw "You can not add two views with the same id!";
			//console.log("!***********");
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
			this.childViews[view.id] = view;
			//view.render();
			//console.log("***********");
			//console.log(defaults);
			//console.log("***********");
			//console.log(this.$el)
			//console.log(view.$el);
			//this.$el.prepend(view.$el);
			//return this
			
			defaults.selector[defaults.method](view.$el);

			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();

			return view;
		},
		remove: function(id){
			
			if(id){
				return this.childViews[id].remove();
			}else{
				for(var each in this.childViews){
					this.childViews[each].remove();
				}
				this.model.unbind('change', this.render, this);
				this.$el.remove();
				this.isRendered = false;
			}
			
			return this;
		},
		destroy: function(id){
			if(id){
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
			//console.log('views.BaseClass.visible('+visible+')');
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
			if(this.isVisible == true){
				this.$el.addClass('visible');
				this.$el.removeClass('hidden');
			}else if(this.isVisible == false){
				this.$el.removeClass('visible');
				this.$el.addClass('hidden');
			}
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
			
			_(this).bindAll('add', 'remove', 'reset');
			
			this.model.bind('change', this.render, this);
			this.collection.bind('reset', this.reset, this);
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
			
			_.each(this.childViews, function(view){
				view.render();
			},this);
			
			/*for(var each in this.childViews){
				this.childViews[each].render();
			}*/
			
			this.originalHeight = this.$el.height();
			this.originalWidth = this.$el.width();

			return this;
		},
		reset: function(collection){
			//console.log(this.id+".reset()");
			
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
			
			
			return this;
			
		},
		get: function(id){
			//console.log("views.BaseClass.getView("+id+")");
			/*if (!id)	return this;
	
			if(this.childViews[id]) return this.childViews[id];
			else return undefined;
			*/
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
		children: function(){
			return this.childViews;
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
			
			for(var each in this.childViews){
				this.childViews[each].$el.remove();
				delete this.childViews[each];
			}
			
			this.childViews = {};
			
			for(var each in this.childViews){
				this.childViews[each].render();
				this.$el.append(this.childViews[each].$el);
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
	
	views.VehicleListPane = views.ListBaseClass.extend({
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
			if (options.content) this.content = options.content;
			if (options.isVisible != undefined) this.isVisible = options.isVisible;

			this.render();
		},
		render:function(collection){
			//console.log("views.ListBaseClass.render()");
			
			if (!this.template) throw "no template provided";
			if (!this.collection) throw "no ccollection provided";
			if (!this.childViewConstructor) throw "no child view constructor provided";
    		if (!this.eventAggr) throw "no eventAggr provided";
			if (!this.childTemplate) throw "no childTemplate provided";
			
			var that = this;
			this._rendered = true;
		 
			
			for(var i = 0; i < this.childViews.length; i++){
				this.childViews[i].$el.remove();
				delete this.childViews[i]
			}
			
			this.childViews = [];
			
			if(!this.text)	this.text = {};
			
			if(this.collection && collection)	this.collection = collection;

			if (this.model) {
				this.$el = $(this.template(this.model.toJSON()));
			}else{
				this.$el = $(this.template(this.text));
			}
			
			if(!this.$content)	this.$content = (this.content) ? this.$(this.content) : this.$el;
			
			if (this.isVisible != undefined) {
					
					this.toggleVisible();
					this.bind('change:isVisible', this.toggleVisible, this);
			}

			_(this).bindAll('add', 'remove', 'reset', 'loadComplete');
			this.reset();
			this.collection.bind('reset', this.reset);

			return this;
		},
		add : function(model) {
			//console.log("add: "+model.get('id'))
			//console.log(model)
			
			if (!this.childViewConstructor) throw "no child view constructor provided";
    		if (!this.eventAggr) throw "no eventAggr provided";
			if (!this.event) throw "no event provided";
			if (!this.childTemplate) throw "no childTemplate provided";
			if (this.$content == '') throw "$content is not defined";
			if (!this.data)	this.data = false;
			
		    var childView = new this.childViewConstructor({
		      model : model,
			  eventAggr : this.eventAggr,
			  template : this.childTemplate,
			  event: this.event,
			  text: this.text,
			  data: this.data
		    });
		 
		    this.childViews.push(childView);

		    if (this._rendered) {
		      this.$content.append(childView.$el);
		    }
			return childView;
		},
		remove:		function(model){
			
		},
		reset: function(){
			//console.log("VehicleListPane.reset()")
			
			if (!this.childViewConstructor) throw "no child view constructor provided";
    		if (!this.eventAggr) throw "no eventAggr provided";
			if (!this.event) throw "no event provided";
			if (!this.childTemplate) throw "no childTemplate provided";
			if (this.$content == '') throw "$content is not defined";
			if (!this.data)	this.data = false;
			
			var that = this;
			
			this.$content.animate({ opacity: '0'}, 0, function(){
							that.isVisible = false;
							that.toggleVisible();
						});
			
			for(var i = 0; i < this.childViews.length; i++){
				this.childViews[i].$el.remove();
				delete this.childViews[i]
			}
			
			this.childViews = [];

			this.loadedImgs = 0;
			this.totalImgs = this.collection.length;
			_.each(this.collection.models, function(model){
				//console.log(model.get('images').small.src);
				var childView = new this.childViewConstructor({
			      model : model,
				  eventAggr : this.eventAggr,
				  template : this.childTemplate,
				  event: this.event,
				  text: this.text,
				  data: this.data
			    });
			    this.childViews.push(childView);				
				var that = this;
				childView.$el.find('img').bind('load', this.loadComplete)
				this.$content.append(childView.$el);
			}, this);
			return this;
		},
		loadComplete: function($el){
			//console.log("loadComplete!")
			this.loadedImgs+=1;
			if(this.loadedImgs == this.totalImgs){
				var that = this;
				this.$content.animate({
							opacity: '1'
						}, 300, function(){
							that.isVisible = true;
							that.toggleVisible();
					});
			}
		}
	});
	
	////////////////////////////////////////////////////////////////////////////
	
	views.CollapsablePane = views.BaseClass.extend({
		tagName	: "li",
		events: {
    		"click .enabled .header > a": "onClickEventHandler"
		 },
		initialize: function(options){
			//console.log('views.CollapsablePane.initialize()');

			if (!options.template) throw "You need to supply a template!";
			if (!options.content) throw "You need to supply a content selector!";
			if (!options.eventAggr) throw "You need to supply an event aggregator!";
			
			this.eventAggr = options.eventAggr;
			this.template = options.template;
			this.content = options.content;
			
			if(options.text) this.text = options.text;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.isCollapsed != undefined) this.isCollapsed = options.isCollapsed;
			if(options.tagName)	this.tagName = options.tagName;

			
			this.render();

		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log('views.CollapsablePane.onClickEventHandler')
			if (this.isCollapsed == true) {
				this.isCollapsed = false;
			}else{
				this.isCollapsed = true;
			}
			this.toggleCollapsed();
		},
		
		toggleCollapsed:function(){
			//console.log('toggleCollapsed(), collapsed is :'+this.isCollapsed)
			var that = this;
			
			this.$el.find('.content:first').animate({
					height: 'toggle'
				}, 200, function(){
					that.$('.pane:first').toggleClass('collapsed');
			});
		},
		toggleEnabled:function(){
			//console.log("views.CollapsablePane.toggleEnabled")
			var that = this;
			if (this.isEnabled == true) {
				this.$el.addClass('enabled');
				this.$el.removeClass('disabled');
				this.$el.css('opacity', '1')
			}else{
				this.$el.removeClass('enabled');
				this.$el.addClass('disabled');
				this.$el.css('opacity', '.5')
			}
		},
		enabled: function(boel){
			//console.log('CollapsablePane.enabled('+boel+')');
			if(boel == undefined || (this.isEnabled == undefined))	return this.isEnabled;
			
			if (this.isEnabled != boel) {
				this.isEnabled = boel;
				this.toggleEnabled();
			}
			
			return this.isEnabled;
			
		},
		collapsed: function(boel){
			//console.log('CollapsablePane.collapsed('+boel+')');
			if(boel == undefined || (this.isCollapsed == undefined))	return this.isCollapsed;
			
			if (this.isCollapsed != boel) {
				this.isCollapsed = boel;
				this.toggleCollapsed();
			}
			
			return this.isEnabled;
			
		}
	});

	
	views.Choice = views.BaseClass.extend({
		tagName: 'li',
		data: {
			value			: '',
			name			: '',
			hasDescription	: false,
			label			: '',
			price			: '',
			description		: ''
		},
		events: {
    		"change label > input": "onClickEventHandler"
		 },
		initialize: function(options){
			//console.log("views.Choice.initialize()")
			  
			this.eventAggr = options.eventAggr;
			this.template = options.template;
			this.event = options.event;
			this.text = options.text;
			if(options.data) this.data = options.data;

			this.model.bind('change:isSelected', this.toggleSelected, this);
			this.model.bind('change:hasDescription', this.toggleDescription, this);
			this.model.bind('change:price', this.updatePrice, this);
			
			this.render();
		},
		render: function(){
			
			if (this.text) {
				var data = this.model.toJSON();
				if(this.data) $.extend(true, data, this.data);
				$.extend(true, data, this.text);
				this.$el = $(this.template(data));
			}else{
				var data = this.model.toJSON();
				if(this.data) $.extend(true, data, this.data);
				this.$el= $(data);
			}
			
			this.toggleDescription();

			if (this.model && (this.model.get('available') == false || (this.model.get('price') == this.text.notAvailableText && Number(this.model.get('rate')) == 0))) {
				this.$el.addClass('disabled')
			}
			
		},
		toggleEnabled: function(){
			//console.log('views.BaseClass.toggleEnabled')
			if(this.isEnabled == true){
				//this.$el.find('.info').removeAttr( 'style' );
				this.$el.addClass('enabled');
				this.$el.removeClass('disabled');
				this.$el.css('opacity', '1')

			}else if(this.isEnabled == false) {
				this.$el.removeClass('enabled');
				this.$el.addClass('disabled');
				this.$el.css('opacity', '.5')
			}

		},
		toggleDescription: function(){
			//console.log("toggleDescription");
			if(this.model.get('hasDescription') == false || this.model.get('hasDescription') == 'false'){
				this.$el.find('.info').css('display','none');
			}else{
				//this.$el.find('.info').css('display','inline');
				this.$el.find('.info').removeAttr( 'style' );
			}
		},
		updatePrice: function(){
			this.$el.find('.price').html(this.model.get('price'))
			if(this.model.get('price') == this.text.notAvailableText){
				this.$el.addClass('disabled')
			}else{
				this.$el.removeClass('disabled')
			}
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log()
			//e.stopPropagation();
			//console.log(this.model.get('id')+", onClickEventHandler")
			this.eventAggr.trigger(this.event, this.model, this);
			return false;
		},
		toggleSelected: function(){
			//console.log('toggleSelected')
			if(this.model.get('isSelected')){
				this.$el.find('label > input').attr('checked', true)
			}else{
				this.$el.find('label > input').attr('checked', false)
			}
		}
		
	});
	
	views.ChoiceDropDown = views.BaseClass.extend({
		tagName: 'li',
		data: {
			value			: 'value',
			name			: 'name',
			hasDescription	: true,
			label			: 'label',
			price			: '$123.45',
			description		: ''
		},
		events: {
    		//"change": "onClickEventHandler"
			
		 },
		initialize: function(options){
			//console.log("-------->>>>views.ChoiceDropDown.initialize()")
			  
			this.eventAggr = options.eventAggr;
			this.template = options.template;
			this.event = options.event;
			this.text = options.text;
			if(options.data) this.data = options.data;

			this.model.bind('change:hasDescription', this.toggleDescription, this);
			this.model.bind('change:price', this.updatePrice, this);
			
			this.render();
		},
		render: function(){
			
			this.aspDropDown = new ns.views.DropDownSelect({
				text: {
					name: 'asp-options',
					selected: 'select'
				},
				template:				ns.config.templates.get('dropdown-select'),
				collection: 			new ns.models.DropDownOptions(this.model.get('aspOptions'), {
                        optionGroup: 'aspOptions'
                    }),
				childViewConstructor : 	ns.views.DropDownOption,
				childTemplate:			ns.config.templates.get('dropdown-option'),
				eventAggr	:			this.eventAggr,
				event:					'aspSelection'
			});
			
			
			
			if (this.text) {
				var data = this.model.toJSON();
				if(this.data) $.extend(true, data, this.data);
				$.extend(true, data, this.text);
				this.$el = $(this.template(data));
			}else{
				var data = this.model.toJSON();
				if(this.data) $.extend(true, data, this.data);
				this.$el= $(data);
			}
			
			this.toggleDescription();

			if (this.model && (this.model.get('available') == false || this.model.get('price') == this.text.notAvailableText)) {
				this.$el.addClass('disabled')
				this.$el.find('.info').css('display','none');
			}
			
			this.$el.append(this.aspDropDown.$el)
			
			
		},
		toggleDescription: function(){
			//console.log("toggleDescription");
			if(this.model.get('hasDescription') == false || this.model.get('hasDescription') == 'false'){
				this.$el.find('.info').css('display','none');
			}else{
				this.$el.find('.info').css('display','inline');
			}
		},
		updatePrice: function(){
			//console.log('updatePrice()')
			this.$el.find('.price').html(this.model.get('price'))
		},
		onChangeEventHandler: function(e){
			e.preventDefault();
			//console.log('onChangeEventHandler')
			//e.stopPropagation();
			//this.eventAggr.trigger(this.event, this.model, this);
			return false;
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log('wtf')
			//e.stopPropagation();
			this.eventAggr.trigger(this.event, this.model, this);
			return false;
		},
		toggleSelected: function(){
			//console.log('toggleSelected')
			if(this.model.get('isSelected')){
				this.$el.find('label > input').attr('checked', true)
			}else{
				this.$el.find('label > input').attr('checked', false)
			}
		}
		
	});
	
	
	views.Choices = Backbone.View.extend({
		views		: {},
		initialize: function(options){
			//debug('views.Choices.initialize()')

			this.template = ns.config.templates.get('choices');
			this.eventAggr = options.eventAggr;
			this.model = options.model;
			this.collection = this.model.get('vehicleModels');
			this.model.bind('change:isSelected', this.toggleSelected, this);

			this.reset();
		},
		reset: function(){
			
			for(var each in this.views){
				this.views[each].$el.remove();
				delete this.views[each]
			}
			
			this.views = {};
			this.render();
		},
		render: function(model){
			
			var that = this;
			
			this.model 	= (model) ? model : this.model
			this.$el	= $(this.template(this.model.toJSON()));

			_.each(this.collection.models, function(model){
				var choice = new views.Choice({model:model, text:that.options.text, eventAggr: that.eventAggr});
				this.$el.find('ul:first').append(choice.$el);
			}, this);
			
			return this;
		},
		addView: function(id, view){
			//console.log("views.modelListPane.addView("+id+")");
			this.views[id] = view;
			this.$el.append(view.$el);
			return view;
		},
		removeView: function(id){
			if (this.views[id]) {
				this.views[id].$el.remove();
				delete this.views[id]
			}
			else {
				return false;
			}
		},
		getView : function(key){
			if(this.views[key]) return this.views[key];
			else return undefined;
		},
		toggleSelected:function(){
			//console.log('views.ListPane.toggleSelected()');
			
			this.$el.toggleClass('selected');
			this.$el.fadeToggle("fast", function () {
			  });
		},
		onClickEventHandler: function(e){
			e.preventDefault();
		}
	});
	
	
	////////////////////////////////////////////////////////////////////////////

	views.Vehicle = views.BaseClass.extend({
		tagName: 'li',
		events: {
    		"click": "onClickEventHandler"
		 },
		initialize: function(options){
			//console.log('views.Vehicle.initialize()')
			this.eventAggr = options.eventAggr;
			this.template = options.template;
			this.event = options.event;
			this.model.bind('change:isSelected', this.toggleSelected, this);
			this.render();
		},
		render: function(model){
			if(model){
				this.model = model;
			}
			this.$el= $(this.template(this.model.toJSON()));
		},
		toggleSelected:function(){
			this.$el.toggleClass('selected');
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log('views.Vehicle.onClickEventHandler')
			this.eventAggr.trigger(this.event, this.model);
		}
	});

	views.PromoTile = views.BaseClass.extend({
		tagName: 'li',
		initialize: function(options){
			//console.log('PromoTile')
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options.content;
			if(options.isVisible) this.isVisible = options.isVisible
			this.isCollapsed = true;
			this.render();
		},
		render:function(model){
			
			this._rendered = true;
			
			var that = this;
			
			for(var each in this.childViews){
				this.childViews[each].$el.remove();
				delete this.childViews[each];
			}
			
			if(this.model && model)	this.model = model;
			
			if (this.model && !this.text) {
				//console.log("model and not text")
				var data = this.model.toJSON()
				if(this.data)	$.extend(true, data, this.data);
				this.$el = $(data);
				
				if(this.model.get('isSelected') != undefined){
					this.toggleSelected();
					this.model.bind('change:isSelected', this.toggleSelected, this);
				}
				
				//!--this.model.bind('change:id', this.reset, this);
				this.model.bind('change', this.reset, this);
			
			}else if(!this.model && this.text){
				//console.log("no model and text")
				var data = this.text;
				if(this.data)	$.extend(true, data, this.data);
				this.$el = $(this.template(data));
				
			}else if(this.model && this.text){
				//console.log("model and text")
				
				var data = this.model.toJSON()
				$.extend(true, data, this.text);
				if(this.data)	$.extend(true, data, this.data);
				
				this.$el = $(this.template(data));

				if(this.model.get('isSelected') != undefined){
					this.toggleSelected();
					this.model.bind('change:isSelected', this.toggleSelected, this);
				}
				
				//!--this.model.bind('change:id', this.reset, this);
				
				this.model.bind('change', this.reset, this);
				
			}
			
			if (this.isVisible != undefined) {
					//this.toggleVisible();
					//this.bind('change:isVisible', this.toggleVisible, this);
			}
			
			if (this.isEnabled != undefined) {
				this.toggleEnabled();
				this.bind('change:isEnabled', this.toggleEnabled, this);
			}
			
			this.childViews = {};
			
			//if(!this.$content)	this.$content = (this.options.content) ? this.$(this.options.content) : this.$el;
			if(!this.$content)	this.$content = (this.content) ? this.$(this.content) : this.$el;
			
			//console.log(this.content)
			for(var each in this.childViews){
				this.childViews[each].render();
				this.$content.append(this.childViews[childViews].$el);
			}
			
			_(this).bindAll('loadComplete');
			
			if(this.isCollapsed){
				this.$el.animate({
							opacity: '0',
							height: '0'
						}, 0, function(){
							that.isVisible = false;
					});
			}else{
				this.$el.animate({
							opacity: '0'
						}, 0, function(){
							that.isVisible = false;
					});
			}
			
			
					
			this.$el.find('img').bind('load', this.loadComplete);
			
			return this;
		},
		reset	:function(model){
			//console.log('PromoTile.reset()')
			//this.isVisible = false;
			this.toggleVisible();
			
			if(model) this.model = model;
			if(this.text){
				var data = model.toJSON();
				$.extend(true, data, this.text);
				this.$el.html($(this.template(data)).html());
				this.$el.find('img').unbind('load', this.loadComplete);
				this.$el.find('img').bind('load', this.loadComplete);
			}else{
				this.$el.html($(this.template(data)).html());
				this.$el.find('img').unbind('load', this.loadComplete);
				this.$el.find('img').bind('load', this.loadComplete);
			}
			
			//this.isVisible = false;
			//this.toggleVisible();
		},
		loadComplete: function($el){
			//console.log("Promo loadComplete!")
			this.isVisible = true;
			this.toggleVisible();
		},
		toggleVisible: function(){
			//console.log("toggleVisible: "+this.model.get("id"))
			if(this.isVisible == true && this.model.get('id') != 'default'){
				//console.log(this.model.get('id'))
				var that = this;
				that.$el.addClass('visible');
				that.$el.removeClass('hidden');
				
				if (this.isCollapsed) {
					this.$el.animate({
						opacity: '1',
						height: '120px'
					}, 100, function(){
						this.isCollapsed = false;
					});
				}else{
					this.$el.animate({
						opacity: '1'
					}, 100, function(){
						this.isCollapsed = false;
					});
				}
				//this.$el.find('img').addClass('visible');
				//this.$el.find('img').removeClass('hidden');
			}else {
				var that = this;
				if (this.isCollapsed) {
					this.$el.animate({
						opacity: '0',
						height: '0'
					}, 0, function(){
						that.$el.removeClass('visible');
						that.$el.addClass('hidden');
						this.isCollapsed = true;
					});
				}else{
					this.$el.animate({
						opacity: '0'
					}, 0, function(){
						that.$el.removeClass('visible');
						that.$el.addClass('hidden');
						this.isCollapsed = true;
					});
				}
				//this.$el.find('img').removeClass('visible');
				//this.$el.find('img').addClass('hidden');
			}
		},
		collapsed: function(boel){
			//console.log('CollapsablePane.collapsed('+boel+')');
			if(boel == undefined || (this.isCollapsed == undefined))	return this.isCollapsed;
			
			if (this.isCollapsed != boel) {
				this.isCollapsed = boel;
				//this.toggleCollapsed();
			}
			
			return this.isEnabled;
			
		}
	});



	////////////////////////////////////////////////////////////////////////////

	views.Selection = Backbone.View.extend({
		tagName	: "section",
		id		: "selection",
		initialize: function(){
			//console.log("view.Selection.initialize()")
		},
		reset: function(){
			//console.log("views.Selection.reset()")
			
			this.selectedVehicle.reset();
			this.selectedVehiclePrice.reset();
			this.paymentCalculator.reset();
			
			this.$el.append(
				this.selectedVehicle.$el,
				this.selectedVehiclePrice.$el,
				this.paymentCalculator.$el
			);
			
			return this
		}
	});
	
	views.SelectedVehicle = views.BaseClass.extend({
		tagName: 'div',
		initialize: function(options){
			//console.log("views.SelectedVehicle.initialize")
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options.content;

			this.render();
		}
	});
	
	views.VehicleProfile = views.BaseClass.extend({
		tagName: 'section',
		initialize: function(options){
			//console.log("views.VehicleProfile.initialize")
			
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
	
	views.Vehicle360 = views.BaseClass.extend({
        tagName: 'section',
        initialize: function(options){
            //console.log("views.VehicleProfile.initialize")
            
            if (!options.template) 
                throw "You need to supply a template!";
            if (!options.text) 
                throw "You need to some text!";
            
            this.template = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
            this.text = (options.text) ? (options.text) : ns.config.staticText.get();
            
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
            
            //console.log("Vehicle360.init()");
            
            
            
            
        },
        reset: function(model){
            //console.log("Vehicle360.reset()");
            
            if (model) 
                this.model = model;
            
            var extColour = this.model.get('extColour');
            var colours = this.model.get('extColours');
            var colourList;
            
            $.each(colours, function(i, val){
                if (val.code === extColour) {
                    colourList = val.images;
                }
            });
            
            var data = model.toJSON();
            $.extend(true, data, this.text, {
                defaultModelImage: colourList[0]
            });
            
            this.$el.html($(this.template(data)).html());
            
            var $cachedEl = this.$el;
            // create new image object
            var img = new Image();
            // when the image is done loading init jQuery reel plugin		          
            img.onload = function(uid){
				
				var imgEl = $cachedEl.find('img');
				
                $cachedEl.find('img').reel({
                    images: colourList,
					 klass : 'v360reel'
                });				
				$cachedEl.find('.imageWrap').height($cachedEl.find('img:first').height());
            };
            img.onerror = function(){
                // show not found image
            };
            // attach source to image object
            img.src = colourList[0];
            
            
        }
    });
	

	views.BasePrice = views.BaseClass.extend({
		tagName: 'table',
		initialize: function(options){	
			this.template  = (options.template) ? options.template : ns.config.templates.get('base-price');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options.content;
			//console.log(this.model)
			this.model.bind('change', this.reset, this);
			//this.model.bind('change:hasTax')
			this.render();
		}
	});
	
	////////////////////////////////////////////////////////////////////////////

	views.PricingOptions = views.BaseClass.extend({
		tagName: 'div',
		initialize: function(options){
			//console.log("views.PricingOptions.initialize()")
			
			this.hasTax			= false;
			this.hasFreight		= false;
			this.showsPricing	= false;
			this.on				= this.options.text.on;
			this.off			= this.options.text.off;
			this.visible		= this.options.text.visible;
			this.hidden			= this.options.text.hidden;
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('pricing-options');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options.content;
			this.eventAggr = options.eventAggr;

			this.render();
			
			this.toggleTaxes();
			this.toggleFreight();
			this.toggleDetails();
			
			this.model.bind('change:hasTax', this.toggleTaxes, this);
			this.model.bind('change:hasFreight', this.toggleFreight, this);
			this.model.bind('change:detailsSelected', this.toggleDetails, this);
			
		},
		reset: function(){
			/*var template		= ns.config.templates.get('pricing-options');
			this.$el			= $(template(this.options.text));
			this.hasTax			= false;
			this.hasFreight		= false;
			this.showsPricing	= false;
			this.on				= this.options.text.on;
			this.off			= this.options.text.off;
			this.visible		= this.options.text.visible;
			this.hidden			= this.options.text.hidden;*/
		},
		events: {
			'click .taxes'   : 'taxesSelection',
			'click .freight' : 'freightSelection',
			'click .details' : 'detailsSelection'
		},
		setButton: function(selector, val){
			this.$(selector).text(val ? this.on : this.off);
		},
		toggleDetails:function(){
			//console.log('views.PricingOptions.toggleDetails')
			if(this.model.get('detailsSelected') == true){
				this.$el.find('.details > i').text(this.visible)
			}else if(this.model.get('detailsSelected') == false){
				this.$el.find('.details > i').text(this.hidden)
			}
		},
		toggleTaxes: function(){
			//console.log('views.PricingOptions.toggleTaxes')
			if(this.model.get('hasTax') == true){
				this.$el.find('.taxes > small').text(this.on)
			}else if(this.model.get('hasTax') == false){
				this.$el.find('.taxes > small').text(this.off)
			}
		},
		toggleFreight: function(){
			//console.log('views.PricingOptions.toggleFreight')
			if(this.model.get('hasFreight') == true){
				this.$el.find('.freight > small').text(this.on)
			}else if(this.model.get('hasFreight') == false){
				this.$el.find('.freight > small').text(this.off)
			}
		},
		taxesSelection: function(){
			this.eventAggr.trigger('taxesSelection', this.model);
		},
		freightSelection: function(){
			this.eventAggr.trigger('freightSelection', this.model);
		},
		detailsSelection: function(){
			this.eventAggr.trigger('detailsSelection', this.model);
		}
	});
	

	views.SummaryTable = views.BaseClass.extend({
		id: "summaryTable",
		initialize: function(options){
			//console.log('views.SummaryTable.initialize()')
			this.template  = (options.template) ? options.template : ns.config.templates.get('summary-table');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options
			//this.model.bind('change:hasTax', this.toggleTaxes, this);
			//this.model.bind('change:hasFreight', this.toggleFreight, this);
			//this.model.bind('change:detailsSelected', this.toggleDetails, this);
			this.render();
			this.model.bind('change', this.reset, this);
		},
		render: function(model){
			//console.log("views.SummaryTable.render()")
			if(model) this.model = model;
			var data = this.model.toJSON()
			$.extend(true, data, this.text);
			this.$el = $(this.template(data));
			this.toggleFreight();
		},
		reset :function(model){
			//console.log("views.SummaryTable.reset()")

			if(this.model.get('rates').qst == 0 || this.model.get('rates').qst == this.text.notAvailableText){
				this.model.set('qst', this.text.notAvailableText)
			}
			if(this.model.get('rates').pst == 0 || this.model.get('rates').pst == this.text.notAvailableText){
				this.model.set('pst', this.text.notAvailableText)
			}
			if(this.model.get('rates').hst == 0 || this.model.get('rates').hst == this.text.notAvailableText){
				this.model.set('hst', this.text.notAvailableText)
			}
			if(this.model.get('rates').gst == 0 || this.model.get('rates').gst == this.text.notAvailableText){
				this.model.set('gst', this.text.notAvailableText)
			}
			if(model) this.model = model;
			if(this.text){
				var data = model.toJSON();
				$.extend(true, data, this.text);
				this.$el.html($(this.template(data)).html());
				
			}else{
				this.$el.html($(this.template(data)).html());
			}
			this.toggleFreight();
		},
		toggleFreight: function(){
			//console.log('views.SummaryTable.toggleFreight');
			if(this.model.get('hasFreight') == true){
				//this.$el.find('.freight > .currency').css('display', 'table-cell');
				this.$el.find('.freight > .not-included').css('display', 'none');
				this.$el.find('.freight > .currency').removeAttr( 'style' );
			}else if(this.model.get('hasFreight') == false){
				this.$el.find('.freight > .currency').css('display', 'none');
				this.$el.find('.freight > .not-included').removeAttr( 'style' );
				//this.$el.find('.freight > .not-included').css('display', 'table-cell');
			}
		},
		updateTable: function(id, key){
			this.$('#'+ id +' > td').text(this.model.get(key));
		},
		updateBreakdown: function(id, lease, finance){
			this.$('#'+ id +' > lease').text(this.model.get(lease));
			this.$('#'+ id +' > finance').text(this.model.get(finance));
		}
	});
	

	
	views.CalculatorColumn = views.BaseClass.extend({
		initialize: function(options){
			//console.log("views.CalculatorColumn.initialize()")
			
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			this.render();

			this.model.bind('change', this.reset, this);
			Backbone.Validation.bind(this);

		},
		reset: function(){
			//console.log("views.CalculatorColumn.reset()")
			//console.log(this.model)
			
			this.$typeEl.text(this.model.get('title'));
			if (this.model.get('term') != this.text.notAvailableText && this.model.get('term') != this.text.notIncludedText && (this.model.get('term')).indexOf(this.text.months) < 1) {
				this.$termEl.text(this.model.get('term') + " " + this.text.months);
			} else {
				this.$termEl.text(this.model.get('term'));
			}
			this.$downPaymentEl.text(this.model.get('totalDownPayment'));
			this.$tradeInEl.text(this.model.get('totalTradeIn'));
			this.$rateEl.text(this.model.get('rate'));
			this.$annualkmEl.text(this.model.get('annualKM'));
			//this.$monthlyPaymentEl.text(this.model.get('monthlyPayment'))
			//this.$biWeeklyEl.text(this.model.get('biWeeklyPayment'))
			
			this.$amountFinancedEl.text(this.model.get('amountFinanced'));
			this.$monthlyPaymentBeforeTaxesEl.text(this.model.get('monthlyPaymentBeforeTaxes'))
			this.$taxesEl.text(this.model.get('taxes'));
			this.$totalMonthlyPaymentEl.text(this.model.get('totalMonthlyPayment'));
			this.$residualValueEl.text(this.model.get('residualValue'));
			this.$adjustedVehicleAmountEl.text(this.model.get('adjustedLeaseVehicleAmount'));

			return this

		},
		render: function(){
			//console.log("views.CalculatorColumn.render()");

			this.$typeEl = $('<td id="type" class = "'+this.model.get('id')+'"> </td>');
			this.$termEl = $('<td id="term" class = "'+this.model.get('id')+'"> </td>');
			this.$rateEl = $('<td id="rate" class = "'+this.model.get('id')+'"> </td>');
			this.$downPaymentEl = $('<td id="downPayment" class = "'+this.model.get('id')+'"> </td>');
			this.$tradeInEl = $('<td id="tradeIn" class = "'+this.model.get('id')+'"> </td>');
			this.$annualkmEl = $('<td id="annualKM" class="'+this.model.get('id')+'"> </td>');
			
			this.$amountFinancedEl = $('<td id="amountFinanced" class = "'+this.model.get('id')+'"> </td>');
			this.$monthlyPaymentBeforeTaxesEl = $('<td id="monthlyPyamentBeforeTaxes" class="'+this.model.get('id')+'"> </td>');
			this.$taxesEl = $('<td id="taxes" class="'+this.model.get('id')+'"> </td>');
			this.$totalMonthlyPaymentEl = $('<td id="totalMonthlyPayment" class="'+this.model.get('id')+'"> </td>');
			this.$residualValueEl = $('<td id="residualValue" class="'+this.model.get('id')+'"> </td>');
			this.$adjustedVehicleAmountEl = $('<td id="adjustedVehicleAmount" class="'+this.model.get('id')+'"> </td>');
			

			this.$typeEl.text(this.model.get('title'));
			this.$termEl.text(this.model.get('term')+" "+this.text.months);
			this.$rateEl.text(this.model.get('rate'));
			this.$downPaymentEl.text(this.model.get('downPayment'));
			this.$tradeInEl.text(this.model.get('tradeIn'));
			this.$annualkmEl.text(this.model.get('annualKM'));
			
			this.$amountFinancedEl.text(this.model.get('amountFinanced'));
			this.$monthlyPaymentBeforeTaxesEl.text(this.model.get('monthlyPaymentBeforeTaxes'))
			this.$taxesEl.text(this.model.get('taxes'));
			this.$totalMonthlyPaymentEl.text(this.model.get('totalMonthlyPayment'));
			this.$residualValueEl.text(this.model.get('residualValue'));
			this.$adjustedVehicleAmountEl.text(this.model.get('adjustedLeaseVehicleAmount'));
			
			//this.$monthlyPaymentEl.text(this.model.get('monthlyPayment'))
			//this.$biWeeklyEl.text(this.model.get('biWeeklyPayment'))
			return this;
		}
	});
	
	views.CalculatorTable = views.BaseClass.extend({
		tagName: 'table',
		initialize: function(options){
			//console.log("views.CalculatorSelectorTable.initialize()")
			this.template  = (options.template) ? options.template : ns.config.templates.get('calculator-selector-table');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			this.$el = $(this.template(this.text));
			
			this.render();
			//--this.collection.bind('reset', this.render, this)

		},
		render: function(){
			//console.log("views.CalculatorTable.render()")
			
			this.$typeRow = this.$el.find('#lfb-type');
			this.$typeRow.find('td').remove();
			this.$termRow = this.$el.find('#lfb-term');
			this.$termRow.find('td').remove();
			this.$rateRow = this.$el.find('#lfb-rate');
			this.$rateRow.find('td').remove();
			this.$downPaymentRow = this.$el.find('#lfb-down-payment');
			this.$downPaymentRow.find('td').remove();
			this.$tradeInRow = this.$el.find('#lfb-trade-in');
			this.$tradeInRow.find('td').remove();
			this.$annualKmRow = this.$el.find('#lfb-annual-km');
			this.$annualKmRow.find('td').remove();
			
			this.$amountFinancedRow = this.$el.find('#lfb-amount-financed');
			this.$amountFinancedRow.find('td').remove();
			
			this.$monthlyPaymentBeforeTaxesRow = this.$el.find('#lfb-monthly-payment');
			this.$monthlyPaymentBeforeTaxesRow.find('td').remove();
			
			this.$taxesRow = this.$el.find('#lfb-taxes');
			this.$taxesRow.find('td').remove();
			
			this.$totalMonthlyPaymentRow = this.$el.find('#lfb-total-monthly-payment');
			this.$totalMonthlyPaymentRow.find('td').remove();
			
			
			this.$adjustedVehicleAmountRow = this.$el.find('#lfb-adjusted-vehicle-amount');
			this.$adjustedVehicleAmountRow.find('td').remove();
			
			
			this.$residualValueRow = this.$el.find('#lfb-residual-value');
			this.$residualValueRow.find('td').remove();

		},
		appendView: function(id, view){
			//console.log("views.CalculatorTable.appendView("+id+")");

			if (this.childViews[id]) throw "You can not add two views with the same id!";

			this.childViews[id] = view;
			
			view.parentView = this;
			
			this.$typeRow.append(view.$typeEl);
			this.$termRow.append(view.$termEl);
			this.$rateRow.append(view.$rateEl);
			this.$downPaymentRow.append(view.$downPaymentEl);
			this.$tradeInRow.append(view.$tradeInEl);
			this.$annualKmRow.append(view.$annualkmEl);
			
			this.$amountFinancedRow.append(view.$amountFinancedEl);
			this.$monthlyPaymentBeforeTaxesRow.append(view.$monthlyPaymentBeforeTaxesEl);
			this.$taxesRow.append(view.$taxesEl); 
			this.$totalMonthlyPaymentRow.append(view.$totalMonthlyPaymentEl);
			this.$adjustedVehicleAmountRow.append(view.$adjustedVehicleAmountEl);
			this.$residualValueRow.append(view.$residualValueEl);
			
			return this;
		},
		reset: function(){
			//do nothing...
		}
	});
	
	views.CalculatorSelectorTable = views.BaseClass.extend({
		tagName: 'table',
		initialize: function(options){
			//console.log("views.CalculatorSelectorTable.initialize()")
			this.template  = (options.template) ? options.template : ns.config.templates.get('calculator-selector-table');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			this.$el = $(this.template(this.text));
			
			this.render();
			//--this.collection.bind('reset', this.render, this)

		},
		render: function(){
			//console.log("views.CalculatorSelectorTable.render()")
			
			this.$typeRow = this.$el.find('#pc-type');
			this.$typeRow.find('td').remove();
			this.$termRow = this.$el.find('#pc-term');
			this.$termRow.find('td').remove();
			this.$rateRow = this.$el.find('#pc-rate');
			this.$rateRow.find('td').remove();
			this.$downPaymentRow = this.$el.find('#pc-down-payment');
			this.$downPaymentRow.find('td').remove();
			this.$tradeInRow = this.$el.find('#pc-trade-in');
			this.$tradeInRow.find('td').remove();
			this.$annualKmRow = this.$el.find('#pc-annual-km');
			this.$annualKmRow.find('td').remove();
			this.$monthlyPaymentRow = this.$el.find('#pc-monthly-payment');
			this.$monthlyPaymentRow.find('td').remove();
			this.$biWeeklyPaymentRow = this.$el.find('#pc-bi-weekly-payment');
			this.$biWeeklyPaymentRow.find('td').remove();

		},
		add: function(calcModel){
			//console.log("table.add()")
			var that = this;
			var calcutlatorColumn = new ns.views.CalculatorSelectorColumn({
				text					: that.text,
				paymentOptions			: that.paymentOptions,
				termOptions				: that.termOptions,
				kmOptions				: that.kmOptions,
				eventAggr				: that.eventAggr,
				model					: calcModel
			});

			this.$typeRow.append(calcutlatorColumn.$typeEl);
			this.$termRow.append(calcutlatorColumn.$termEl);
			this.$rateRow.append(calcutlatorColumn.$rateEl);
			this.$downPaymentRow.append(calcutlatorColumn.$downPaymentEl);
			this.$tradeInRow.append(calcutlatorColumn.$tradeInEl);
			this.$annualKmRow.append(calcutlatorColumn.$annualkmEl);
			this.$monthlyPaymentRow.append(calcutlatorColumn.$monthlyPaymentEl);
			this.$biWeeklyPaymentRow.append(calcutlatorColumn.$biWeeklyEl);
			
			
			
		},
		appendView: function(id, view){
			//console.log("views.BaseClass.appendView("+id+")");

			if (this.childViews[id]) throw "You can not add two views with the same id!";

			this.childViews[id] = view;
			
			view.parentView = this;
			
			this.$typeRow.append(view.$typeEl);
			this.$termRow.append(view.$termEl);
			//this.$termRow.append(view.$termElNotAvailablEl);
			this.$rateRow.append(view.$rateEl);
			this.$downPaymentRow.append(view.$downPaymentEl);
			this.$tradeInRow.append(view.$tradeInEl);
			this.$annualKmRow.append(view.$annualkmEl);
			this.$annualKmRow.append(view.$annualkmNotAvailablEl);
			this.$monthlyPaymentRow.append(view.$monthlyPaymentEl);
			this.$biWeeklyPaymentRow.append(view.$biWeeklyEl);
			
			return view;
		},
		reset: function(){
			//do nothing
		}
	});
	
	views.CalculatorSelectorColumn = views.BaseClass.extend({
		initialize: function(options){
			//console.log("views.CalculatorSelectorColumn.initialize()")
			//this.template  = (options.template) ? options.template : ns.config.templates.get('payment-calculator');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			this.render();

			this.model.bind('change', this.reset, this);
			//this.model.get('paymentPlans').bind('reset', this.reset, this)
			Backbone.Validation.bind(this);

		},
		reset: function(){
			//console.log("views.CalculatorSelectorColumn.reset()")

			this.parentView.$typeRow.find(this.$typeEl).attr('class', this.model.get('optionGroup'));
			this.parentView.$typeRow.find(this.$typeEl).find('option[value='+this.model.get('type')+']').attr('selected', 'selected');
			
			this.parentView.$termRow.find(this.$termEl).attr('class', this.model.get('optionGroup'));
			this.parentView.$termRow.find(this.$termEl).find('option[value='+this.model.get('term')+']').attr('selected', 'selected');

			this.$rateEl.text(this.model.get('rate'));
			//this.$tradeInEl.find('input').val(this.model.get('tradeIn'));
			//this.$downPaymentEl.find('input').val(this.model.get('downPayment'))
			
			//console.log('view downPayment is: '+this.model.get('downPayment'))
			//console.log('view optionGroup is: '+this.model.get('optionGroup'))
			//console.log('view id is: '+this.model.get('id'))
			
			this.parentView.$downPaymentRow.find('.'+this.model.get('optionGroup')+' > input').val(this.model.get('downPayment'));
			this.parentView.$tradeInRow.find('.'+this.model.get('optionGroup')+' > input').val(this.model.get('tradeIn'));
	
			if (this.model.get('annualKM') != this.text.notAvailableText) {
				this.parentView.$annualKmRow.find(this.$annualkmEl).css('display', 'table-cell').attr('class', this.model.get('optionGroup'));
				this.parentView.$annualKmRow.find(this.$annualkmNotAvailablEl).css('display', 'none').attr('class', this.model.get('optionGroup'));
				
			}else{
				this.parentView.$annualKmRow.find(this.$annualkmEl).css('display', 'none').attr('class', this.model.get('optionGroup'));
				this.parentView.$annualKmRow.find(this.$annualkmNotAvailablEl).css('display', 'table-cell').attr('class', this.model.get('optionGroup'));
			}

			this.$monthlyPaymentEl.text(this.model.get('monthlyPayment'))
			this.$biWeeklyEl.text(this.model.get('biWeeklyPayment'))

			return this

		},
		render: function(){
			//console.log("views.CalculatorSelectorColumn.render()");
			//console.log(this.model)
			this.paymentTypeDropDown = new ns.views.DropDownSelect({
				text:					{name:  this.text.paymentOpts.name, selected: this.model.get('type')},
				template:				ns.config.templates.get('dropdown-select'),
				collection: 			this.model.get('paymentPlans'),
				childViewConstructor : 	ns.views.DropDownOption,
				childTemplate:			ns.config.templates.get('dropdown-option-payment'),
				eventAggr	:			this.eventAggr,
				event:					'paymentTypeSelection'
			})
			
			this.termDropDown = new ns.views.DropDownSelect({
				text:					{name:  this.text.termOpts.name, selected: this.model.get('term')},
				template:				ns.config.templates.get('dropdown-select'),
				collection: 			this.model.get('termOptions'),
				childViewConstructor : 	ns.views.DropDownOption,
				childTemplate:			ns.config.templates.get('dropdown-option'),
				eventAggr	:			this.eventAggr,
				event:					'paymentTermSelection'
			})
			
			this.annualKmDropDown = new ns.views.DropDownSelect({
				text:					{name:  this.text.kmOpts.name, selected: this.model.get('term')},
				template:				ns.config.templates.get('dropdown-select'),
				collection: 			this.model.get('kmOptions'),
				childViewConstructor : 	ns.views.DropDownOption,
				childTemplate:			ns.config.templates.get('dropdown-option'),
				eventAggr	:			this.eventAggr,
				event:					'annualKMSelection'
			});
			
			this.$typeEl = $('<td id="type" class = "'+this.model.get('id')+'"> </td>');
			this.$termEl = $('<td id="term" class = "'+this.model.get('id')+'"> </td>');
			
			//--this.$termElNotAvailablEl = $('<td id="termNotAvailable" class = "'+this.model.get('id')+'">'+this.text.notAvailableText+'</td>');
			
			//console.log('view render downPayment is: '+this.model.get('downPayment'))
			//console.log('view render optionGroup is: '+this.model.get('id'))
			//console.log('view render id is: '+this.model.get('id'))
			
			this.$rateEl = $('<td id="rate" class = "'+this.model.get('id')+'"> </td>');
			this.$downPaymentEl = $('<td id="downPayment" class = "'+this.model.get('id')+'"> </td>');
			this.$tradeInEl = $('<td id="tradeIn" class = "'+this.model.get('id')+'"> </td>');
			
			this.$annualkmEl = $('<td id="annualKM" class = "'+this.model.get('id')+'"> </td>');
			this.$annualkmNotAvailablEl = $('<td id="annualkmNotAvailable" class = "'+this.model.get('id')+'">'+this.text.notAvailableText+'</td>');
			
			this.$monthlyPaymentEl = $('<td id="monthlyPyament" class = "'+this.model.get('id')+'"> </td>');
			this.$biWeeklyEl = $('<td id="biWeeklyPayment" class = "'+this.model.get('id')+'"> </td>');
			
			this.$termDropDownEl = this.termDropDown.$el;
			this.$paymentTypeDropDownEl = this.paymentTypeDropDown.$el;
			this.$annulaKmDropDownEl = this.annualKmDropDown.$el;
			
			this.$typeEl.append(this.$paymentTypeDropDownEl);
			this.$termEl.append(this.$termDropDownEl);
			this.$rateEl.text(this.model.get('rate'));
			this.$downPaymentEl.append(this.text.leftDollarSign+'<input id="downPayment" value="'+this.model.get('downPayment')+'" name="'+this.model.get('type')+'-down-payment">'+this.text.rightDollarSign);
			this.$tradeInEl.append(this.text.leftDollarSign+'<input  id="tradeIn" value="'+this.model.get('tradeIn')+'" name="'+this.model.get('type')+'-trade-in">'+this.text.rightDollarSign);
			
			this.$annualkmEl.append(this.$annulaKmDropDownEl);
			
			this.$monthlyPaymentEl.text(this.model.get('monthlyPayment'))
			this.$biWeeklyEl.text(this.model.get('biWeeklyPayment'))
			
			_(this).bindAll('downPaymentChange');
			this.$downPaymentEl.find('input').bind('keyup', this.downPaymentChange)
			
			_(this).bindAll('tradeInChange');
			this.$tradeInEl.find('input').bind('keyup', this.tradeInChange)
			
			_(this).bindAll('inputOnBlur');
			this.$tradeInEl.find('input').bind('blur', this.inputOnBlur)
			
			_(this).bindAll('inputOnBlur');
			this.$downPaymentEl.find('input').bind('blur', this.inputOnBlur)

		},
		downPaymentChange: function(downPayment){
			//console.log('downPaymentChange')
			//console.log(downPayment)
			
			this.eventAggr.trigger("downPaymentChange", {
				value: downPayment.target.value,
				optionGroup: this.model.get('optionGroup'),
				id: downPayment.target.id
			});
		},
		tradeInChange: function(tradeIn){
			this.eventAggr.trigger("tradeInChange", {
				value: tradeIn.target.value,
				optionGroup: this.model.get('optionGroup'),
				id: tradeIn.target.id
			});
		},
		inputOnBlur: function(input){
			this.eventAggr.trigger("inputOnBlur", {
				value: input.target.value,
				optionGroup: this.model.get('optionGroup'),
				id: input.target.id
			});

		}
		
	});
	
	views.PaymentCalculator = views.BaseClass.extend({
		tagName: 'div',
		initialize: function(options){

			this.template  = (options.template) ? options.template : ns.config.templates.get('payment-calculator');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options.content;
			this.model = new Backbone.Model(this.text);
			
			this.render();

		},
		reset:	function(){
			//console.log("views.PaymentCalculator.reset()")
			this.$el	 = $(this.template(this.options.text));
			
			this.leaseTermOptions.reset();
			this.financeTermOptions.reset();
			this.leaseAnnualKmOptions.reset();
			this.financeAnnualKmOptions.reset();
			
			this.$('#pc-term > .lease').append(this.leaseTermOptions.$el);
			this.$('#pc-term > .finance').append(this.financeTermOptions.$el);
			this.$('#pc-annual-km > .lease').append(this.leaseAnnualKmOptions.$el);
			this.$('#pc-annual-km > .finance').append(this.financeAnnualKmOptions.$el);
			
			this.render();
		},
		render: function(){
			this.$el	 = $(this.template(this.options.text));
			//console.log(this.options.text)
			this.updateRowText('pc-rate', 'leaseRate', 'financeRate');
			this.updateRowInput('pc-down-payment', 'leaseDownPayment', 'financeDownPayment');
			this.updateRowInput('pc-trade-in', 'leaseTradeIn', 'financeTradeIn');
			this.updateRowText('pc-monthly-payment', 'leaseMonthlyPayment', 'financeMonthlyPayment');
			this.updateRowText('pc-bi-weekly-payment', 'leaseBiWeeklyPayment', 'financeBiWeeklyPayment');
		},
		updateRowText: function(id, lease, finance){
			this.$('#'+ id +' > .lease').text(this.model.get(lease));
			this.$('#'+ id +' > .finance').text(this.model.get(finance));
		},
		updateRowInput: function(id, lease, finance){
			this.$('#'+ id +' > .lease > input').val(this.model.get(lease));
			this.$('#'+ id +' > .finance > input').val(this.model.get(finance));
		}
	});
	
	////////////////////////////////////////////////////////////////////////////
	//	Popups
	////////////////////////////////////////////////////////////////////////////

	views.Popups = views.BaseClass.extend({
		tagName: 'div',
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
			
			//if(this.model)	this.model.bind('change', this.test, this);
			
			
			this.render();
			
		},
		show: function(id){
			//console.log('Popups.show('+id+')')
			_.each(this.childViews, function(childView){
				childView.visible(false)
			}, this)
			this.getView(id).visible(true)
			this.visible(true);
			return this
		},
		hide: function(){
			//console.log('Popups.hide('+id+')')
			_.each(this.childViews, function(childView){
				childView.visible(false);
			}, this)
			this.visible(false);
			return this
		}
	});
	
	views.Popup = views.BaseClass.extend({
		tagName: 'div',
		events : {
			'click a': 'onClickEventHandler'
		},
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
			this.eventAggr  = this.options.eventAggr;
			this.render();
			_(this).bindAll('onClickEventHandler');
		},
		onClickEventHandler: function(e){
			//console.log('onClickEventHandler')
			this.eventAggr.trigger('popupCloseBtnClick', this.model);
		}
	});
	
	views.UpdateLocationPopup = views.BaseClass.extend({
		tagName: 'div',
		events : {
			'click a': 'onClickEventHandler'
		},
		initialize: function(options){
			//console.log("views.UpdateLocationPopup.initialize()")
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			if(options.content)	this.content = options.content;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.tagName)	this.tagName = options.tagName;
			if(options.id)	this.id = options.id
			this.eventAggr  = this.options.eventAggr;

			this.render();
			
			_(this).bindAll('onClickEventHandler');
		},
		reset: function(){
			this.$el.find('#update-current-location').text(this.model.get('currentLocation'))
			
		},
		onClickEventHandler: function(e){
			this.eventAggr.trigger('popupCloseBtnClick', this.model);
		}
	});
	
	views.PostalCodeSearch = views.BaseClass.extend({
		tagName: 'div',
		events: {
	    	"click button"	: "onClickEventHandler",
			"blur input"	: "postalCodeOnBlur",
			"keypress input": "onEnterKeyPress"
		},
		initialize: function(options){
			//console.log("views.PostalCodeSearch.initialize")
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			
			if(options.content)	this.content = options.content;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.tagName)	this.tagName = options.tagName;
			if(options.id)	this.id = options.id
			
			Backbone.Validation.bind(this, {
		      valid: this.valid,
		      invalid: this.invalid
			  //forceUpdate: true
		    });
			
			this.render();
			
			this.model.bind('change', this.reset)
			
			//Backbone.Validation.bind(this);
			//console.log(this)

		},
		reset: function(){
			//console.log("render().test()")
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			this.model.validate()
			if(this.model.isValid('retailersPostalCode') == true){
				this.eventAggr.trigger('poCodeSearchBtnClick', this.$el.find('input').val());
			}
		},
		postalCodeOnBlur: function(e){
			e.preventDefault;
			var pocode = e.currentTarget.value.toUpperCase()
			var reg = new RegExp("[ ]+","g");
      		pocode = pocode.replace(reg,"");

			this.$('input').val(pocode)
			this.eventAggr.trigger("dealerPostalCodeUpdate", pocode)
			//this.model.set('retailersPostalCode', e.currentTarget.value)
		},
		onEnterKeyPress: function(e){
			//console.log('PostalCodeSearch.onEnterKeyPress')
			 var code = (e.keyCode ? e.keyCode : e.which);
			 if(code == 13) {
			 	this.postalCodeOnBlur(e);
				//this.eventAggr.trigger("dealerPostalCodeUpdate", e.currentTarget.value);
				if (this.model.isValid('retailersPostalCode') == true) {
					this.eventAggr.trigger('poCodeSearchBtnClick', this.model)
				};
			 }

		},
		valid: function(view, attr) {
			view.$el.removeClass('error');
		},
		invalid: function(view, attr, error) {
			view.$el.addClass('error');
		},
		 visible: function(bool){
            if (bool) {
                this.$el.show();
            }
            else {
                this.$el.hide();
            }
        }
	});
	
	views.DealerList = views.ListBaseClass.extend({
		tagName: 'ul',
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
			this.isCollapsed = options.isCollapsed;
			if(options.id)	this.id = options.id;
			
			this.render();
			if(this.isCollapsed){
				this.$el.addClass('collapsed')
			}
		},
		toggleCollapsed:function(){
			//console.log('AssignedRetailer.toggleCollapsed(), collapsed is :'+this.isCollapsed)
			var that = this;
			var sHeight = this.$el.prop('scrollHeight')
			var duration = Math.floor(sHeight/5)

			if(this.isCollapsed == false){
				this.$el.animate({
					height: sHeight
					}, duration, function(){
						that.$el.removeClass('collapsed');
				});
			}else{
				this.$el.animate({
					height: 0
					}, duration/2, function(){
						that.$el.addClass('collapsed');
						$('html, body').animate({
					         scrollTop: $(this).parent().offset().top
					     }, 500, function(){
						 	
						 });
						
				});
			}
		},
		collapsed: function(boel){
			//console.log('AssignedRetailer.collapsed('+boel+')');
			if(boel == undefined || (this.isCollapsed == undefined))	return this.isCollapsed;
			
			if (this.isCollapsed != boel) {
				this.isCollapsed = boel;
				this.toggleCollapsed();
			}
			return this.isEnabled;
			
		},
		reset: function(collection){
			//console.log("views.ListBaseClass.reset()")
			if(collection) this.collection = collection;
			
			for(var i = 0; i < this.childViews.length; i++){
				this.childViews[i].$el.remove();
				delete this.childViews[i]
			}
			
			this.childViews = [];
			
			/*if (this.model) {
				this.$el = $(this.template(this.model.toJSON()));
			}else{
				this.$el = $(this.template(this.text));
			}*/
			this.collection.each(this.add);
			
			return this;
		},
		 visible: function(bool){
            if (bool) {
                this.$el.show();
            }
            else {
                this.$el.hide();
            }
        }
	});
	
	views.DealerItem = views.BaseClass.extend({
		tagName: 'li',
		events: {
	    	"click"	: "onClickEventHandler"
		},
		initialize: function(options){
			//console.log("views.DealerItem.initialize")
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			if(options.content)	this.content = options.content;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.tagName)	this.tagName = options.tagName;
			if(options.id)	this.id = options.id
			
			this.render();
			
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			//console.log('DealerItem.onClickEventHandler()')
			//console.log(this.$el.)
			this.eventAggr.trigger('dealerSelection', this.model);
		}
	});

	
	views.AssignedRetailer = views.BaseClass.extend({
		initialize: function(options){
			//console.log("views.AssignedRetailer.initialize")
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			if (!options.eventAggr) throw "You need to some text!";
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			this.isCollapsed = options.isCollapsed;
			if(options.content)	this.content = options.content;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.tagName)	this.tagName = options.tagName;
			if(options.id)	this.id = options.id;
			
			_(this).bindAll('toggleCollapsed');

			this.model.bind('change:isSelected', this.toggleCollapsed)

			this.render();

			if(this.isCollapsed){
				this.$el.addClass('collapsed')
			}
			
		},
		onClickEventHandler: function(e){
			e.preventDefault();
			this.eventAggr.trigger('dealerSelection', this.model);
		},
		toggleCollapsed:function(){
			//console.log('AssignedRetailer.toggleCollapsed(), collapsed is :'+this.isCollapsed)
			var that = this;
			if(this.isCollapsed == false){
				this.$el.animate({
					height: this.$el.prop('scrollHeight')
					}, 200, function(){
						that.$el.removeClass('collapsed');
				});
			}else{
				this.$el.animate({
					height: 0
					}, 200, function(){
						that.$el.addClass('collapsed');
				});
			}
			
		},
		collapsed: function(boel){
			//console.log('AssignedRetailer.collapsed('+boel+')');
			if(boel == undefined || (this.isCollapsed == undefined))	return this.isCollapsed;
			
			if (this.isCollapsed != boel) {
				this.isCollapsed = boel;
				this.toggleCollapsed();
			}
			
			return this.isEnabled;
		},
		toggleSelected: function(){
			// override
		},
		 visible: function(bool){
            if (bool) {
                this.$el.show();
            }
            else {
                this.$el.hide();
            }
        }
	});
	
	views.UserInformationForm = views.BaseClass.extend({
		tagName: 'div',
		events: {
	    	"click input[type=radio]"		: "radioOnClick",
			"click input[type=checkbox]"	: "checkboxOnClick",
			"blur input[type=text]"			: "inputOnBlur",
			"keypress input[type=text]"		: "inputOnKeyPress",
			"focus .contact-number input"	: "inputOnFocus",
			"change select"					: "dropDownOnChange"
		},
		initialize: function(options){
			//console.log("views.PostalCodeSearch.initialize")
			
			if (!options.template) throw "You need to supply a template!";
			if (!options.text) throw "You need to some text!";
			
			this.template  = (options.template) ? options.template : ns.config.templates.get('estimate-payments-tmpl');
			this.text = (options.text) ? (options.text) : ns.config.staticText.get();
			this.eventAggr = options.eventAggr;
			this.accounting = options.accounting;
			
			if(options.content)	this.content = options.content;
			if(options.isEnabled != undefined) this.isEnabled = options.isEnabled;
			if(options.isVisible != undefined) this.isVisible = options.isVisible;
			if(options.tagName)	this.tagName = options.tagName;
			if(options.id)	this.id = options.id

			Backbone.Validation.bind(this, {
			  forceUpdate: true,
		      valid: this.valid,
		      invalid: this.invalid
		    });
			this.model.bind('validated', this.validated, this)
			
			this.render();
			
			this.model.bind('change', this.reset)
			_(this).bindAll('inputOnBlur', 'inputOnKeyPress', 'dropDownOnChange', 'valid', 'invalid', 'validated');

		},
		reset: function(){
			//console.log("render().test()")
		},
		dropDownOnChange: function(e){
			var error = this.model.preValidate(e.currentTarget.name, e.currentTarget.value);
			if(error){
				$(e.currentTarget).parent().addClass('error')
			}else{
				$(e.currentTarget).parent().removeClass('error')
			}
			var obj = {};
			obj[e.currentTarget.name] = e.currentTarget.value;
			this.model.set(obj, {silent: true});
		},
		inputOnFocus: function(e){


		},
		radioOnClick: function(e){
			//e.preventDefault();
			var $target = $(e.currentTarget)
			$target.addClass('selected')
			
			$target.parent().parent().find('> .error').removeClass('error')
			//--$target.parent().parent().find('> .contact-number > input').val('')
			
			var obj = {};
			obj[e.currentTarget.name] = e.currentTarget.value;
			obj.tbMethodOfContact = e.currentTarget.value;
			
			//console.log(e.currentTarget.value)
			this.model.validation.tbHomePhone.required = false;
			this.model.validation.tbCellPhone.required = false;
			this.model.validation[e.currentTarget.value].required = true;
			
			this.model.set(obj, {silent: true});

		},
		checkboxOnClick: function(e){
			//console.log('checkboxOnClick')
			var obj = {};
			if($(e.currentTarget).is(':checked')){
				obj[e.currentTarget.name] = true;
				obj.cbOptin = true;
			}else{
				obj[e.currentTarget.name] = false;
				obj.cbOptin = false;
			}
			//console.log(obj.cbOptin)
			
			//obj[e.currentTarget.name] = e.currentTarget.value;
			//obj.cbOptin = e.currentTarget.value;
			
			this.model.set(obj, {silent: true});
		},
		inputOnBlur: function(e){
			e.preventDefault;
			if(e.currentTarget.name == "tbPostalCode"){
				e.currentTarget.value = e.currentTarget.value.toUpperCase()
				var reg = new RegExp("[ ]+","g");
	      		e.currentTarget.value = e.currentTarget.value.replace(reg,"");
				this.$('input[name=tbPostalCode]').val(e.currentTarget.value)
			}
			
			var error = this.model.preValidate(e.currentTarget.name, e.currentTarget.value);
			if(error){
				$(e.currentTarget).parent().addClass('error')
			}else{
				$(e.currentTarget).parent().removeClass('error')
			}

			var obj = {};
			obj[e.currentTarget.name] = e.currentTarget.value;
			this.model.set(obj, {silent: true});
		},
		inputOnKeyPress: function(e){
			//console.log('PostalCodeSearch.onEnterKeyPress')
			 var code = (e.keyCode ? e.keyCode : e.which);
			 if(code == 13) {
			 	if(e.currentTarget.name == "tbPostalCode"){
					e.currentTarget.value = e.currentTarget.value.toUpperCase()
					var reg = new RegExp("[ ]+","g");
		      		e.currentTarget.value = e.currentTarget.value.replace(reg,"");
					this.$('input[name=tbPostalCode]').val(e.currentTarget.value)
				}
			 	var error = this.model.preValidate(e.currentTarget.name, e.currentTarget.value);
				if(error){
					$(e.currentTarget).parent().addClass('error')
				}else{
					$(e.currentTarget).parent().removeClass('error')
				}
				var obj = {};
				obj[e.currentTarget.name] = e.currentTarget.value;
				this.model.set(obj, {silent: true});
			 }

		},
		valid: function(view, attr) {
			//console.log('\n'+attr+': valid')
			view.$el.find('[name='+attr+']').parent().removeClass('error');
			view.$el.find('#error-messages em[for='+attr+']').removeClass('visible');
		},
		invalid: function(view, attr, error) {
			//console.log(attr+': '+error)
			view.$el.find('[name='+attr+']').parent().addClass('error');
			view.$el.find('#error-messages em[for='+attr+']').addClass('visible');
		},
		validated: function(isValid){
			if(!isValid){
				this.$el.find('#error-messages').addClass('visible')
			}else{
				this.$el.find('#error-messages').removeClass('visible')
			}
		}, visible : function(bool){			
			if (bool) {
				this.$el.show();
			} else {
				this.$el.hide();
			}
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
	
}(app, jQuery, _, Backbone));
