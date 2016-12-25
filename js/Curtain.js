export default class Curtain{
    /**
     * @class Curtain
     * @constructor
     */
    constructor(){
        
        /**
         * Indicate state of curtain:
         * True = Curtain Active
         * False = Curtain Hidden
         *
         * @property active
         */
        this.active = false;
    }

    /**
     * Toggles a blank screen with the given color.
     *
     * @method toggle
     * @param {String} color Color of the curtain.
     */
    toggle(color) {
        var curtainElement = document.getElementById('curtain');
        if (this.active === false) {
            //Close
            curtainElement.classList.add('closed');
            curtainElement.style.background = color;
        }
        else {
            //Open
            curtainElement.classList.remove('closed');
        }
        this.active = !this.active; //Toggle value.
    }
}
