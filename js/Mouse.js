/**
 * @class Mouse
 */
export default class Mouse{

    constructor(){
        this.enable();
    }

    enable(){
        console.log("[Mouse] Enabled");

        if (window.addEventListener) {    // all browsers except IE before version 9
            // Internet Explorer, Opera, Google Chrome and Safari
            document.querySelector(".slideDeck").addEventListener("mousewheel", (e) => this.handleMouseWheel(e), false);

            // Firefox
            // Scroll information is stored in e.detail. Is '3' for scrollDown and '-3' for scrollUp.
            document.querySelector(".slideDeck").addEventListener("DOMMouseScroll", (e) => this.handleDOMMouseScroll(e), false);
        }
    }

    handleMouseWheel(e){
        console.debug("mousewheel");
        this.scrollHandler(e.wheelDelta);
    }

    handleDOMMouseScroll(e){
        console.debug("DOMMouseScroll");
        this.scrollHandler(-e.detail);
    }

    /**
     * @param wheelData Negative number on scrollUp, positive number on scrollDown.
     */
    scrollHandler(wheelDelta){
        var action = "";
        if(wheelDelta < 0){
            action = "next";
        }
        else{
            action = "previous"
        }

        window.postal.channel("slides").publish("navigator", {action: action});
    }

    disable(){
        console.log("[Mouse] Disabled");
        document.querySelector(".slideDeck").removeEventListener("mousewheel", this.handleMouseWheel, false);
        document.querySelector(".slideDeck").removeEventListener("DOMMouseScroll",  this.handleDOMMouseScroll, false);
    }
}
