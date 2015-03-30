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
        var deck= new Hammer($(".slideDeck")[0]);

        //SwipeLeft
        deck.on("swipeleft", function() {
            channel.publish("navigator", {action:"next"});
        });

        //SwipeRight
        deck.on("swiperight", function() {
            channel.publish("navigator", {action:"previous"});
        });

        //SwipeUp
        deck.on("swipeup", function() {
            channel.publish("navigator", {action:"show_notes"});
        });

        //SwipeDown
        deck.on("swipedown", function() {
            channel.publish("navigator", {action:"hide_notes"});
        });

        //Hold
        deck.on("press", function() {
            channel.publish("navigator", {action:"overview"});
        });
    }

    //Make constructor visible in global space.
    global.Presenter.Touch = Touch;
}(window));
