/**  
 * @module Presenter
 */
 var Presenter = Presenter || {};
 
(function(global) {
    "use strict";
    /**
     * @class Keyboard
     * @constructor
     */
    function Keyboard(){
       this.enable(); 
    }

    Keyboard.map = {
        13: "next", //Enter-key
        39: "next", //Right Arrow-key
        34: "next", //Page-Down
        32: "next", //Space-Bar

        33: "previous", //Page-Up
        37: "previous", //Left Arrow-key
        
        79: "overview", //"o" Overview
        80: "toggle_pointer", //"p" Pointer
        87: "curtain.toggle.white", //w
        66: "curtain.toggle.black", //b
        78: "toggle_notes", //n
        77: "sync.master",  //"m"
        76: "sync.listen"//"l"
    };

    Keyboard.prototype.enable = function()
    {
        $(document).on("keydown", this.handle);
    }; 

    Keyboard.prototype.disable = function()
    {
        $(document).off("keydown", this.handle);
    };

    /**
     * @method handle
     */
    Keyboard.prototype.handle = function(event)
    {
        var channel = postal.channel("slides");
        var keyCode = event.keyCode;
        if (Keyboard.map.hasOwnProperty(keyCode)) {
            event.preventDefault();
            console.log(Keyboard.map[keyCode]);
            channel.publish("navigator", {action: Keyboard.map[keyCode]});
        }
        else{
            console.info("[Keyboard] Keycode '" + keyCode + "' has no action attached."); 
        }
    }; 

    //Make constructor visible in global space. 
    global.Presenter.Keyboard = Keyboard;
}(window));
