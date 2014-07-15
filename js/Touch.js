/**  
 * @module Presenter
 */
 var Presenter = Presenter || {};
 
(function(global) {
    "use strict";
    /**
     * @class Touch
     * @constructor
     */
    function Touch(){
    }

    /**
     * Register Touch Events with Hammer.js.  
     * 
     * @method enable
     * @static
     */
    Touch.enable = function(){
        var channel = postal.channel("slides");
        var slideDeck = document.getElementById("slidedeck"); 

        //Tap
        Hammer(slideDeck).on("tap", function() {
            channel.publish("navigator", {action:"next"});
        });
        
        //SwipeLeft
        Hammer(slideDeck).on("swipeleft", function() {
            channel.publish("navigator", {action:"next"});
        });
        
        //SwipeRight
        Hammer(slideDeck).on("swiperight", function() {
            channel.publish("navigator", {action:"previous"});
        });
        
        //SwipeUp
        Hammer(slideDeck).on("swipeup", function() {
            channel.publish("navigator", {action:"show_notes"});
        });
        
        //SwipeDown 
        Hammer(slideDeck).on("swipedown", function() {
            channel.publish("navigator", {action:"hide_notes"});
        });
        
        //Hold
        Hammer(slideDeck).on("hold", function() {
            channel.publish("navigator", {action:"overview"});
        });
    }
   
    //Make constructor visible in global space. 
    global.Presenter.Touch = Touch;
}(window));
