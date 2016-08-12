/**
 * @module Presenter
 */
var Presenter = Presenter || {};

(function(namespace) {
    "use strict";
    /**
     * Controls the visibility and transitions of steps.
     *
     *  Example Usage
     *  <section>
     *      <ul>
     *          <!-- Next two li items will show at the same time.-->
     *          <li class="step" data-step-group="group1"></li>
     *          <li class="step" data-step-group="groep1"></li>
     *
     *          <li class="step" data-step-group="groep2"></li>
     *
     *          <!--data-step-group attribute is optional.-->
     *          <li class="step"></li>
     *       </ul>
     *  </section>
     *
     * @class StepManager
     * @constructor
     * @param {SlideDeck} Reference to the SlideDeck object.
     */
    function StepManager(deck) {
        this.deck = deck;
        this.groups = [];
        this.current = -1;

        var channel = postal.channel("slides");
        channel.subscribe("slide-changed", this.reset).context(this);
    }

    StepManager.prototype.setData = function(){
        if(this.current < 0 || this.current >= this.groups.length){
            this.deck.getCurrentSlide().dataset.currentGroup = null;
        }
        else{
            this.deck.getCurrentSlide().dataset.currentGroup = this.groups[this.current].name;
        }
    }

    /**
     * Shows the next step on the current slide.
     *
     * @method nextStep
     */
     StepManager.prototype.nextStep = function() {
        if(this.current >= 0 && this.current < this.groups.length-1){
            //Remove current-step class from all steps in the current group.
            for(var i = 0; i < this.groups[this.current].steps.length; i++){
                this.groups[this.current].steps[i].classList.remove("current-step");
            }
        }

        if(this.current < this.groups.length-1){
            this.current++;
            this.deck.ticker.decrease();

            var currentStepGroup = this.groups[this.current].steps;
            for(var i = 0; i < currentStepGroup.length; i++){
                var step = currentStepGroup[i];
                step.classList.remove("step");
                step.classList.remove("current-step");
                step.classList.add("step-done");
            }
        }

        this.setData();
    };

    /**
     * Hides the last visible step on the current slide.
     *
     * @method previousStep
     */
    StepManager.prototype.previousStep = function() {
        if(this.current >= 0 && this.current < this.groups.length){
            for(var i = 0; i < this.groups[this.current].steps.length; i++){
                this.groups[this.current].steps[i].classList.remove("current-step", "step-done");
                this.groups[this.current].steps[i].classList.add("step");
            }

            this.current--;
            this.deck.ticker.increase();

            if(this.current >= 0){
                //Don't do this when no step is visible.
                for(var i = 0; i < this.groups[this.current].steps.length; i++){
                    this.groups[this.current].steps[i].classList.add("current-step");
                }
            }
        }
        this.setData();
    };

    /**
     *
     * @method reset
     */
    StepManager.prototype.reset = function(){
        var steps = this.deck.getCurrentSlide().querySelectorAll(".step, .step-done");
        this.groups = [];
        this.current = -1;

        for(var i=0; i< steps.length; i++){
            var step = steps[i];
            var group = step.dataset.stepGroup; //data-step-group = dataset.stepGroup!!!
            var index;

            if(typeof group != 'undefined'){
                var found = false;
                var searchIndex = 0;
                while(!found && searchIndex < this.groups.length){
                    if(this.groups[searchIndex].name == group){
                        var new_group = this.groups[searchIndex];
                        new_group.steps.push(step);
                        index = searchIndex;
                        found = true;
                    }
                    else{
                        searchIndex++;
                    }
                }

                if(!found){
                    var new_group = {};
                    new_group.name = group;
                    new_group.steps = [];
                    new_group.steps[0]= step;
                    this.groups.push(new_group);
                    index = this.groups.length-1;
                }
            }
            else{
                var new_group = {};
                new_group.name = null;
                new_group.steps = [];
                new_group.steps[0] = step;
                this.groups.push(new_group);
                index = this.groups.length-1;
            }

            if(step.classList.contains("current-step")){
                this.current = index;
            }
        }

        this.deck.ticker.set(this.groups.length-(this.current+1));
        this.setData();
    };

    namespace.StepManager = StepManager;
}(Presenter));
