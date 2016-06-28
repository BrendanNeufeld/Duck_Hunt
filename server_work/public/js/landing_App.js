/* -*- mode:js; tab-width: 4; indent-tabs-mode: t; js-indent-level: 4 -*- */

"use strict";
app.main = function(ns, Modernizr, jQuery, _, Backbone, _gaq, accounting){
	
	//alert('lsdkjflsdkj')
	Backbone.emulateHTTP = true;
	Backbone.emulateJSON = true;
			
	// change underscore tempate syntax
	_.templateSettings = {
		evaluate		: /\{%(.+?)%\}/g,
		interpolate		: /\{\{(.+?)\}\}/g,
		escape			: /\{-(.+?)-\}/g
	};
	
	
	_.extend(Backbone.Validation.patterns, {
		postalcode: /^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$/,
		userName: /^[A-Za-z0-9 ]{1,20}$/,
		phoneNumber: /^(1\s*[-\/\.]?)?(\((\d{3})\)|(\d{3}))\s*[-\/\.]?\s*(\d{3})\s*[-\/\.]?\s*(\d{4})\s*(([xX]|[eE][xX][tT])\.?\s*(\d+))*$/
	});
	
	//prevents console errors in IE
	if (typeof console == 'undefined')   {
	    var console = new Object();
	    console.log = function(){}
	    console.error = function(){}
	    console.debug = function(){}
	    console.warn = function(){}
	}
	
			
	$(function(){
		// remove "no javascript" notice
		$('#no-js').remove();
		
		// pass in any general configuration that all models will use
		
		ns.M = new ns.models.Model({
			lang:	ns.config.lang.get()
		});
		
		ns.V = new ns.views.View({
			el: ns.config.nodes.get('root'),
			text: ns.config.staticText.get(),
			id: 'View'
			}
		);
		
		ns.C = new ns.Controller({model: ns.M, view: ns.V, accounting: accounting});

	});
}


