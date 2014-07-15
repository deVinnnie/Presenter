/**  
 * @module Presenter
 */
var Presenter = Presenter || {};

(function(namespace) {
    "use strict";

    /**
     * The Ticker indicates the number of steps (hidden elements) remaining on the current slide. 
     *
     * @class Ticker
     * @constructor
     * @param {SlideDeck} Reference to SlideDeck object. 
     */
    function Ticker(deck) {
        this.deck = deck;

        var channel = postal.channel("slides");
        channel.subscribe("slide-changed", this.flush).withContext(this);
        channel.subscribe("slide-changed", this.renew).withContext(this);
    }

    /**
     * Removes all ticks.
     *
     * @method flush
     */
    Ticker.prototype.flush = function(){
        $("#ticks li").remove(); 
    }

    /**
     * Renew the ticker count so that it matches the current number of steps remaining. 
     * 
     * @method renew
     */
    Ticker.prototype.renew = function() {
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
    };
        
    /**
     * Decreases the ticker-count by one tick. 
     * 
     * @method decrease
     */
    Ticker.prototype.decrease = function() {
        $("#ticks li:last-child").hide(
                'fast', 
                function(){ 
                    $("#ticks li:last-child").remove(); 
                }
        );
    };

    /**
     * Increases the ticker-count by one tick.
     * 
     * @method increase
     */
    Ticker.prototype.increase = function() {
        $("#ticks").append(
            $("<li />").append(
                $("<span />").attr("class", "tick")
            )
        ); 
    };
    
    //Make constructor visible in module. 
    namespace.Ticker = Ticker;
}(Presenter));
