/**
 * @module Presenter
 */
 var Presenter = Presenter || {};

(function(global) {
    "use strict";
    /**
     * @class Overview
     * @constructor
     */
    function Navigator(){}

    Navigator.actions = new Array();

    /**
     * @method init
     * @static
     */
    Navigator.init = function(){
        var channel = postal.channel("slides");
        channel.subscribe("navigator", Navigator.handle);
        channel.subscribe("navigator-external", Navigator.handle);
    }

    /**
     * @method handle
     * @static
     */
    Navigator.handle = function(data){
        var action = data.action;
        console.log("[Navigator] Handling " + action);
        Navigator.actions[action]();
    }

    /**
     * @method register
     * @static
     */
    Navigator.register = function(key, action){
        console.log("[Navigator] " + key + " " + "registered.");
        Navigator.actions[key] = action;
    }

    /**
     * @method registerMap
     * @param actions Array of objects with key and action properties.
     * @static
     */
    Navigator.registerMap = function(actions){
        for(var i = 0; i < actions.length; i++){
            var key = actions[i].key;
            var action = actions[i].action;
            Navigator.actions[key] = action;
            console.log("[Navigator] " + key + " " + "registered.");
        }
    }

    //Make constructor visible in global space.
    global.Presenter.Navigator = Navigator;
}(window));
