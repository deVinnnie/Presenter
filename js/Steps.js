export default class Steps{
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
    constructor(deck) {
        this.deck = deck;
        this.groups = [];
        this.current = -1;

        deck.channel.subscribe("slide-changed", this.reset).context(this);
    }

    /**
     * Update data-step-group attribute on slide element.
     *
     * @method setData
     */
    setData(){
        var currentGroup = null;
        if(this.current >= 0 && this.current < this.groups.length){
            currentGroup = this.groups[this.current].name;
        }
        this.deck.getCurrentSlide().dataset.currentGroup = currentGroup;
    }

    /**
     * Shows the next step on the current slide.
     *
     * @method nextStep
     */
    nextStep() {
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
        this.deck.channel.publish("step-changed", {type: "next"});
    }

    /**
     * Hides the last visible step on the current slide.
     *
     * @method previousStep
     */
    previousStep() {
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
        this.deck.channel.publish("step-changed", {type: "previous"});
    }

    /**
     *
     * @method reset
     */
    reset(){
        var steps = [...this.deck.getCurrentSlide().querySelectorAll(".step, .step-done")];
        this.current = -1;

        steps.forEach((step) => {
            /*
            <li class="step" data-step-group="group1"></li>
            <li class="step"></li>
            <span class="step" data-step-group="group1"></span>
            */
            let group = step.dataset.stepGroup; //data-step-group = dataset.stepGroup!!!
            
            let index = this.groups.findIndex(
                (element) => element.name === group
            );
            if(index === -1){
                //Make new group if it wasn't found.
                var newGroup = {
                    "name" : group || null,
                    "steps" : [step]
                };
                this.groups.push(newGroup);
            }
            else{
                //Add current step to existing group.
                this.groups[index].steps.push(step);
            }
        });

        var nSteps = this.groups.length;
        this.deck.ticker.set(nSteps);
        this.setData();
    }

}
