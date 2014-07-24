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
            document.querySelector(".slideDeck").addEventListener("mousewheel", Mouse.scrollHandler, false);
            
            // Firefox
            document.querySelector(".slideDeck").addEventListener("DOMMouseScroll", Mouse.scrollHandler, false);
        }
    };

    Mouse.scrollHandler = function(e){
        var action = ""; 
        if(e.wheelDelta < 0){
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
