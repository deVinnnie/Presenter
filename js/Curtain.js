/**
 * @module Presenter
 * @author Vincent Ceulemans
 */
 var Presenter = Presenter || {};

(function(global) {
    "use strict";
    /**
     * @class Curtain
     * @constructor
     */
    function Curtain(){}

    /**
     * Indicate state of curtain:
     * True = Curtain Active
     * False = Curtain Hidden
     *
     * @property active
     * @static
     */
    Curtain.active = false;

    /**
     * Toggles a blank screen with the given color.
     *
     * @method toggle
     * @static
     * @param {String} color Color of the curtain.
     */
    Curtain.toggle = function(color) {
        var curtainElement = document.getElementById('curtain');
        if (Curtain.active === false) {
            //Close
            curtainElement.classList.add('closed');
            curtainElement.style.background = color;
        }
        else {
            //Open
            curtainElement.classList.remove('closed');
        }
        Curtain.active = !Curtain.active; //Toggle value.
    }

    //Make constructor visible in global space.
    global.Presenter.Curtain = Curtain;
}(window));

//Register Actions with the navigator.
Presenter.Navigator.register("curtain.toggle.white",
    function() {
        Presenter.Curtain.toggle("#FFF");
    }
);

Presenter.Navigator.register("curtain.toggle.black",
    function() {
        Presenter.Curtain.toggle("#000");
    }
);
