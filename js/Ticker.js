export default class Ticker{

    /**
     * The Ticker indicates the number of steps (hidden elements) remaining on the current slide.
     *
     * Adds following markup to the DOM:
     * <div id="ticker" class="{ticker-position}">
     *    <ul id="ticks"></ul>
     * </div>
     *
     * @class Ticker
     * @constructor
     * @param {SlideDeck} Reference to SlideDeck object.
     */
    constructor(deck) {
        this.deck = deck;
        
        $("body").append(
            $("<div/>")
                .attr("id", "ticker")
                .attr("class", deck.settings["ticker-position"])
                .append(
                    $("<ul/>")
                    .attr("id", "ticks")
                )
        );
    }

    /**
     * Removes all ticks.
     *
     */
    flush(){
        var ticks = document.querySelector("#ticks");
        while(ticks.firstChild){
            ticks.removeChild(ticks.firstChild);
        }
    }

    /**
     * Renew the ticker count so that it matches the current number of steps remaining.
     *
     */
    renew() {
        var nSteps = this.deck.getCurrentSlide().querySelectorAll(".step").length;
        var nTicks = this.count();
        var deltaSteps = Math.abs(nSteps - nTicks);

        //Determine whether to increase or decrease in order to match the correct number of ticks.
        var callback = ((nSteps - nTicks) > 0) ? this.increase : this.decrease;

        for(var i = 0; i < deltaSteps; i++){
            callback.apply(this);
        }
    }

    /**
     * Set Ticker to a specific count.
     *
     */
    set(nSteps) {
        this.flush();
        for(var i = 0; i < nSteps; i++){
            this.increase();
        }
    };

    /**
     * Decreases the ticker-count by one tick.
     *
     */
    decrease() {
        var lastChild = document.querySelector("#ticks li:last-child");
        lastChild.remove();
    };

    /**
     * Increases the ticker-count by one tick.
     *
     */
    increase() {
        $("#ticks").append(
            $("<li />").append(
                $("<span />").attr("class", "tick")
            )
        );
    }
    
    /**
    * Return the number of ticks remaining.
    */
    count(){
        return document.getElementById("ticks").childNodes.length;
    }
}
