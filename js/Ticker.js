/**
 * @module Presenter
 */
var Presenter = Presenter || {};

class Ticker{

    /**
     * The Ticker indicates the number of steps (hidden elements) remaining on the current slide.
     *
     * @class Ticker
     * @constructor
     * @param {SlideDeck} Reference to SlideDeck object.
     */
    constructor(deck) {
        this.deck = deck;
    }

    /**
     * Removes all ticks.
     *
     * @method flush
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
     * @method renew
     */
    renew() {
        var nSteps = this.deck.getCurrentSlide().querySelectorAll(".step").length;
        var nTicks = document.getElementById("ticks").childNodes.length;
        var deltaSteps = Math.abs(nSteps - nTicks);

        //Determine wether to increase or decrease in order to match the correct number of ticks.
        var callback;
        if(nTicks < nSteps){
            callback = this.increase;
        }
        else if(nTicks > nSteps){
            callback = this.decrease;
        }
        else{
            return;
        }

        for(var i = 0; i < deltaSteps; i++){
            callback.apply(this);
        }
    }

    /**
     * Set Ticker to a specific count.
     *
     * @method set
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
     * @method decrease
     */
    decrease() {
        var lastChild = document.querySelector("#ticks li:last-child");
        lastChild.remove();
    };

    /**
     * Increases the ticker-count by one tick.
     *
     * @method increase
     */
    increase() {
        $("#ticks").append(
            $("<li />").append(
                $("<span />").attr("class", "tick")
            )
        );
    }
}
