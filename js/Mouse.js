/**
 * @module Presenter
 */
var Presenter = Presenter || {};

(function(global) {
    "use strict";
    /**
     * @class Mouse
     * @constructor
     */
    function Mouse(){
       this.enable();
    }

    Mouse.prototype.enable = function()
    {
        console.log("[Mouse] Enabled");

        if (window.addEventListener) {    // all browsers except IE before version 9
            // Internet Explorer, Opera, Google Chrome and Safari
            document.querySelector(".slideDeck").addEventListener("mousewheel",
                function(e){
                    Mouse.scrollHandler(e.wheelDelta);
                },
            false);

            // Firefox
            // Scroll information is stored in e.detail. Is '3' for scrollDown and '-3' for scrollUp.
            document.querySelector(".slideDeck").addEventListener("DOMMouseScroll",
                function(e){
                    Mouse.scrollHandler(-e.detail);
                },
            false);
        }
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

    Mouse.prototype.disable = function()
    {
        console.log("[Mouse] Disabled");
        document.querySelector(".slideDeck").removeEventListener("mousewheel", Mouse.scrollHandler);
        document.querySelector(".slideDeck").removeEventListener("DOMMouseScroll",  Mouse.scrollHandler);
    };

    //Make constructor visible in global space.
    global.Presenter.Mouse = Mouse;
}(window));
