/**
 * @module Presenter
 */
var Presenter = Presenter || {};

(function(global) {
    "use strict";

    /**
     * @class Mouse
     */
    var Mouse = {};

    Mouse.enable = function()
    {
        console.log("[Mouse] Enabled");

        if (window.addEventListener) {    // all browsers except IE before version 9
            // Internet Explorer, Opera, Google Chrome and Safari
            document.querySelector(".slideDeck").addEventListener("mousewheel", Mouse.handleMouseWheel, false);

            // Firefox
            // Scroll information is stored in e.detail. Is '3' for scrollDown and '-3' for scrollUp.
            document.querySelector(".slideDeck").addEventListener("DOMMouseScroll", Mouse.handleDOMMouseScroll, false);
        }
    };

    Mouse.handleMouseWheel = function(e){
        console.debug("mousewheel");
        Mouse.scrollHandler(e.wheelDelta);
    };

    Mouse.handleDOMMouseScroll = function(e){
        console.debug("DOMMouseScroll");
        Mouse.scrollHandler(-e.detail);
    };

    /**
     * @param wheelData Negative number on scrollUp, positive number on scrollDown.
     */
    Mouse.scrollHandler = function(wheelDelta){
        var action = "";
        if(wheelDelta < 0){
            action = "next";
        }
        else{
            action = "previous"
        }

        global.postal.channel("slides").publish("navigator", {action: action});
    }

    Mouse.disable = function()
    {
        console.log("[Mouse] Disabled");
        document.querySelector(".slideDeck").removeEventListener("mousewheel", Mouse.handleMouseWheel, false);
        document.querySelector(".slideDeck").removeEventListener("DOMMouseScroll",  Mouse.handleDOMMouseScroll, false);
    };

    //Make constructor visible in global space.
    global.Presenter.Mouse = Mouse;
}(window));
