/*global $*/

var DuckButton = DuckButton || {};

(function () {
    "use strict";
    
    	var that = this;

	var production = (location.hostname.indexOf('ewe') != -1);
	var port = production ? ':8080' : ':8080';
	var fbId = production ? '219532624878753' : '1414632378751479';

    DuckButton = function () {

        var self = this;

        this.flyDuck = function (response) {
        	if(response.result === 'SUCCESS'){
	            var duckID = response.user.uid;
	            $.getJSON('http://duckhunt:8090/uid/' + duckID + '/direction/888/score/999');
	        } else {
		      alert(response.message);
	        }
        };

        this.newDuck = function () {

            var userName = self.generateRandomName();

            $.getJSON('http://duckhunt:8090/userName/' + userName + '/roomId/demo/playerType/duck', self.flyDuck);

        };

        this.generateRandomName = function () {
            var name = '', i;
            for (i = 0; i < 5; i = i + 1) {
                name += ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").charAt(Math.floor(Math.random() * ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").length));
            }
            return name;
        };
        
        this.createButton = function () {
	        
	        var createDuck = document.createElement('button');
	        createDuck.onclick = self.newDuck;
	        
	        createDuck.innerHTML = 'Create New Duck';
	        createDuck.setAttribute('style', 'display: block; width: 100%; font-size: 32px; padding: 5px 0px; border-radius: 5px; margin-bottom: 10px;');
	        
	        var containerDOM = document.getElementById('userInfo-login');
	        containerDOM.insertBefore(createDuck, containerDOM.firstChild);
	        
	        
        };
        
        this.createButton();

    };

    DuckButton = new DuckButton();

}());