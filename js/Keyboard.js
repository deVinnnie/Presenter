export default class Keyboard{
    /**
     * @class Keyboard
     * @constructor
     */
    constructor(){
        this.map = {
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
            77: "sync.monitor",  //"m"
            76: "sync.listen"//"l"
        };
       
        this.enable();
    }
    
    enable(){
        console.log("[Keyboard] Enabled");
        document.addEventListener("keydown", (e) => {
            this.handle(e)
        });
    }

    disable(){
        console.log("[Keyboard] Disabled");
        document.removeEventListener("keydown", (e) => {
            this.handle(e)
        });
    }

    /**
     * @method handle
     */
    handle(event){
        var channel = postal.channel("slides");
        var keyCode = event.keyCode;
        if (this.map.hasOwnProperty(keyCode)) {
            event.preventDefault();
            console.log(this.map[keyCode]);
            channel.publish("navigator", {action: this.map[keyCode]});
        }
        else{
            console.info("[Keyboard] Keycode '" + keyCode + "' has no action attached.");
        }
    }    
}
