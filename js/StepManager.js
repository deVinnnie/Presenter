/**  
 * @module Presenter
 */
var Presenter = Presenter || {};

(function(namespace) {
    "use strict";
    /**
     * Controls the visibility and transitions of steps. 
     * 
     * @class StepManager
     * @constructor
     * @param {SlideDeck} Reference to the SlideDeck object. 
     */
    function StepManager(deck) {
        this.deck = deck; 

        var channel = postal.channel("slides");
        channel.subscribe("slide-changed", this.reset).withContext(this);
    }
 
    /**
     * Shows the next step on the current slide.
     * 
     * @method nextStep
     */
     StepManager.prototype.nextStep = function() {
        var currentStep = this.deck.getCurrentSlide().querySelectorAll(".current-step");
        
        if(currentStep.length >= 1){
            currentStep[0].classList.remove("current-step");  
        }
        
        var steps = this.deck.getCurrentSlide().querySelectorAll(".step"); //steps contains a list of all steps to come. 
        if (steps.length >= 1) {
            var nextStep = steps[0];
            nextStep.classList.remove("step");
            nextStep.classList.add("current-step");
            nextStep.classList.add("step-done");
        }
        this.deck.ticker.decrease();
    };

    /** 
     * Hides the last visible step on the current slide. 
     * 
     * @method previousStep
     */
    StepManager.prototype.previousStep = function() {
        var currentStep = this.deck.getCurrentSlide().querySelectorAll(".current-step");
        
        if(currentStep.length >= 1){
            currentStep[0].classList.remove("current-step");  
        }

        //Get the last step.
        var stepsDone = this.deck.getCurrentSlide().querySelectorAll(".step-done");
        var lastStep = stepsDone[stepsDone.length - 1];
        
        lastStep.classList.remove("step-done");
        lastStep.classList.add("step");
        
        if(stepsDone.length >=2){
            stepsDone[stepsDone.length-2].classList.add("current-step"); 
        }
        
        this.deck.ticker.increase();
    };

    /**
     * 
     * @method reset
     */
    StepManager.prototype.reset = function() {
        var steps = this.deck.getCurrentSlide().querySelectorAll(".step-done");
        for (var i = 0; i < steps.length; i++) {
            steps[i].classList.remove("step-done");
            steps[i].classList.add("step");
        }
    };
        
    namespace.StepManager = StepManager;
}(Presenter));
