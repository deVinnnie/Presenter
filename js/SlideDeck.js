/**  
 * @module Presenter
 * @author Vincent Ceulemans
 */
var Presenter = Presenter || {};

(function(global) {
    "use strict";
    /**
     * SlideDeck
     *  
     * @class SlideDeck
     * @constructor
     * @param {array} slides List of slides in the deck.
     * @param {int} currentSlide The first slide to show. (Starts at 1)
     */
    function SlideDeck(slides, currentSlide) {
        this.slides = slides;
        this.nSlides = this.slides.length;
        this.currentSlide = currentSlide;
        this.pointer = false;
        this.ticker = new global.Presenter.Ticker(this); 
        this.stepManager = new global.Presenter.StepManager(this);
    
        this.initProgressBar();
        this.initVideos(); 
        
        this.channel = postal.channel("slides");

        /*Actions done before slide changes*/
        this.channel.subscribe("pre-slide-changed", this.autoStopVideo).withContext(this);
        this.channel.subscribe("enter-overview", this.autoStopVideo).withContext(this);

        /*Actions for new slide*/
        this.channel.subscribe("slide-changed", this.updateLocationHash).withContext(this);
        this.channel.subscribe("slide-changed", this.updateProgressBar).withContext(this);

        this.channel.subscribe("slide-changed", this.refreshNotes).withContext(this);
        this.channel.subscribe("slide-changed", this.autoPlayVideo).withContext(this);

        this.channel.subscribe("slide-changed", this.SlideInit).withContext(this);
        this.channel.subscribe("pre-slide-changed", this.SlideDestroy).withContext(this);
    }

    /*Static*/
    SlideDeck.SLIDE_STATES = [
        "farPastSlide", 
        "pastSlide", 
        "currentSlide", 
        "futureSlide", 
        "farFutureSlide"
    ];

    /*
     Private functions
     */
    function playVideo(video) {
        video.play();
        video.onclick = pauseVideo_clickHandler;
    }

    function pauseVideo(video) {
        video.pause();
        video.onclick = playVideo_clickHandler;
    }

    function playVideo_clickHandler(e) {
        playVideo(e.target);
    }

    function pauseVideo_clickHandler(e) {
        pauseVideo(e.target);
    }

    SlideDeck.prototype.SlideInit = function(){
        var init = $(this.getCurrentSlide()).attr("init");
        if(typeof init != 'undefined'){
            window[init]();//init
        }
    }

    SlideDeck.prototype.SlideDestroy = function(){
        var destroy = $(this.getCurrentSlide()).attr("destroy");
        if(typeof destroy != 'undefined'){
            window[destroy]();
        }
    }
    

    //Public Functions
    /**
     * Update URL in the adressbar to the current position in the slidedeck.  
     * 
     * @method updateLocationHash
     */
    SlideDeck.prototype.updateLocationHash = function() {
        global.location.hash = "#" + this.currentSlide;
    };

    /**
     * Update progressbar.
     *
     * @method updateProgressBar
     */
    SlideDeck.prototype.updateProgressBar = function(){
        var progressPercentage = this.currentSlide/this.nSlides*100; //Decrease by a small amount so that the variable doesn't become 1.0, as that would make the bar disappear.
        progressJs().set(progressPercentage); //Decrease the progressbar with 1% once every 0.01 * interval. 
    }

    SlideDeck.prototype.initProgressBar = function(){
        progressJs().start(); 
    };

    /**
     * Returns the slide object for the given slide number. 
     * 
     * @method getSlide
     * @param {int} slideNumber
     * @return {htmlelement} The corresponding slide. 
     */
    SlideDeck.prototype.getSlide = function(slideNumber) {
        return this.slides[slideNumber - 1];
    };

    /**
     * Returns the current slide. 
     * 
     * @method getCurrentSlide
     * @return {htmlelement} The current slide.
     */
    SlideDeck.prototype.getCurrentSlide = function() {
        return this.getSlide(this.currentSlide);
    };

    /**
     * Returns the sequence number of the given slide. 
     * 
     * @method getSlideNmb
     * @return {int} The sequence number.
     */
    SlideDeck.prototype.getSlideNmb = function(slide) {
        var found = false; 
        var i = 0;
        while (i < this.slides.length && found === false) {
            if (this.slides[i] === slide) {
                found = true;
            } 
            else {
                i++;
            }
        }
        return (i + 1);
    };

    /**
     * Go to next item (Slide or step)
     * 
     * Go to the next step if there are remaining steps on the current slide.
     * If no steps remain, then the next slide is shown.
     * 
     * @method next
     */
    SlideDeck.prototype.next = function() {
        var nSteps = this.getCurrentSlide().querySelectorAll(".step").length;
        if (nSteps === 0)
        {
            this.channel.publish("pre-slide-changed");
            this.nextSlide();
            this.channel.publish("slide-changed", {type: "next", slide: this.currentSlide});
        }
        else
        {
            this.stepManager.nextStep();
            this.channel.publish("step-changed", {type: "next"});
        }
    };

    /**
     * Go to previous item (Slide or step)
     *
     * Go to the previous slide if no steps are visible on the current slide, otherwise the previous step is shown.
     * 
     * @method previous
     */
    SlideDeck.prototype.previous = function() {
        var nSteps = this.getCurrentSlide().querySelectorAll(".step-done").length;
        if (nSteps >= 1) {
            this.stepManager.previousStep();
            this.channel.publish("step-changed", {type: "previous"});
        } else {
            this.channel.publish("pre-slide-changed");
            this.previousSlide();
            this.channel.publish("slide-changed", {type: "previous" , slide: this.currentSlide});
        }
    };
    
    /**
     * Goto to the specified Slide using the Id of the slide. 
     * 
     * @method gotoById 
     * @param {string} id Id of the slide. 
     */
    SlideDeck.prototype.gotoById = function(id) {
        this.channel.publish("pre-slide-changed");
        var n = this.currentSlide - 2;
        for (var i = 0; i < this.SLIDE_STATES.length; i++, n++) {
            this.clear(n);
        }

        var slideN = this.getSlideNmb(document.getElementById(id));
        this.currentSlide = slideN;
        slideN -= 2;
        for (var i = 0; i < this.SLIDE_STATES.length; i++, slideN++) {
            this.updateSlide(slideN, this.SLIDE_STATES[i]);
        }
        this.channel.publish("slide-changed", {type: "goto", slide: this.currentSlide});
    };
    
    /**
     * Goto to the specified Slide using the slide number. 
     * 
     * @method gotoByNumber 
     * @param {int} n The number/order of the slide in the slidedeck. 
     */
    SlideDeck.prototype.gotoByNumber = function(n){
        this.currentSlide = n; 
        var t = 0;
        for (var i = this.currentSlide - 2; i <= this.currentSlide + 2; i++, t++) {
            this.updateSlide(i, Presenter.SlideDeck.SLIDE_STATES[t]);
        }
        this.channel.publish("slide-changed", {type: "goto", slide: this.currentSlide});
    };

    /**
     * Go to next slide.
     * 
     * @method nextSlide
     */
    SlideDeck.prototype.nextSlide = function() {
        if (this.currentSlide < this.nSlides) {
            //Update slides to new state.
            var slideN = this.currentSlide - 2;
            if (this.getSlide(slideN)) {
                this.clear(slideN); 
            }

            slideN++;
            for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++, slideN++) {
                this.updateSlide(slideN, SlideDeck.SLIDE_STATES[i]);
            }

            this.currentSlide++;        
        }
    };

    /**
     * Go to previous slide.
     * 
     * @method previousSlide
     */
    SlideDeck.prototype.previousSlide = function() {
        if (this.currentSlide > 1) {
            var slideN = this.currentSlide - 3;
            for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++, slideN++) {
                this.updateSlide(slideN, SlideDeck.SLIDE_STATES[i]);
            }
            if (this.getSlide(slideN)) {
                this.clear(slideN);
            }
            slideN++;
            this.currentSlide--;
        }
    };
  
    /**
     * Update notes for current slide.
     *
     * Reloads the notes stored within div.notes into the notes display. 
     * 
     * @method refreshNotes
     */
    SlideDeck.prototype.refreshNotes = function() {
        //Remove any content that was previously present in the notes-display. 
        $("#notes-display").html("");
        
        var currentSlide = this.getCurrentSlide();
        if (currentSlide.querySelectorAll(".notes")[0]) {
            var notes = currentSlide.querySelectorAll(".notes")[0];
            $("#notes-display").html(notes.innerHTML);
        }
    };

    /**
     * Automatically start playing the video on the current slide, when present. 
     * 
     * @method autoPlayVideo
     */
    SlideDeck.prototype.autoPlayVideo = function() {
        var currentSlide = this.getCurrentSlide();
        if (currentSlide.classList.contains("video") && currentSlide.querySelectorAll("video")[0] !== null) {
            playVideo(currentSlide.querySelectorAll("video")[0]);
        }
    };

    /**
     * Automatically stop playing the video on the current slide, when present. 
     * 
     * @method autoStopVideo
     */
    SlideDeck.prototype.autoStopVideo = function() {
        //If the current slide has a video, stop playing the video.
        var currentSlide = this.getCurrentSlide();
        if (currentSlide.classList.contains("video") 
                && currentSlide.querySelectorAll("video")[0] !== null) {
            pauseVideo(currentSlide.querySelectorAll("video")[0]);
        }
    };

    /**
     * Update the slide with the given state.
     *
     * @method updateSlide
     * @param {int} slideNumber between 1 and slides.length
     * @param {String} stateName New state of the slide (one of SLIDE_STATES)
     */
    SlideDeck.prototype.updateSlide = function(slideNumber, stateName) {
        if (slideNumber > 0 && slideNumber <= this.slides.length) {
            var slide = this.getSlide(slideNumber);
            for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++) {
                slide.classList.remove(SlideDeck.SLIDE_STATES[i]);
            }
            slide.classList.add(stateName);
        }
    };

    /**
     * Remove all states from the slide.
     *
     * @method clear
     * @param {int} slideNumber Number of the Slide
     */
    SlideDeck.prototype.clear = function(slideNumber) {
        if (slideNumber > 0 && slideNumber <= this.slides.length) {
            var slide = this.getSlide(slideNumber);
            for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++) {
                slide.classList.remove(SlideDeck.SLIDE_STATES[i]);
            }
        }
    };

    /**
     * Toggles the visibility of the mouse cursor.  
     * 
     * @method togglePointer
     */
    SlideDeck.prototype.togglePointer = function() {
        this.pointer = !this.pointer;
        document.body.classList.toggle("cursor-visible");
    };

    SlideDeck.prototype.showPointer = function() {
        this.pointer = true; 
        document.body.classList.add("cursor-visible");
    };

    SlideDeck.prototype.hidePointer = function() {
        this.pointer = false; 
        document.body.classList.remove("cursor-visible");
    };

    /*
     * Handle video start playing and pausing events.
     * Use the click event of the video element to provide support for 'clicking on video and playing',
     * as opposed to aiming for the tiny play button.
     */

    /**
     * Adds an eventhandler to each video in the presentation, as such ensuring that they are played when clicked.
     * 
     * @method initVideos
     */
    SlideDeck.prototype.initVideos = function() {
        var videos = document.getElementsByTagName('video');
        for (var i = 0; i < videos.length; i++) {
            videos[i].addEventListener('click', playVideo_clickHandler, false);
        }
    };
    
    /**
     * Return the appropriate CSS-transform for the scaling of screen. 
     * 
     * @method scale
     * @param {number} scale
     */
    SlideDeck.prototype.scale = function (scale){
        return "scale3d(" + scale + "," + scale + ",1)";
    };

    //Make constructor visible in global space. 
    global.Presenter.SlideDeck = SlideDeck;
}(window));

//Register Actions
Presenter.Navigator.register("next",
    function(){
        Presenter.deck.next(); 
    }
);
Presenter.Navigator.register("previous",
    function(){
        Presenter.deck.previous(); 
    }
);

Presenter.Navigator.register("toggle_pointer",
    function(){ 
        Presenter.deck.togglePointer();
    }
);

Presenter.Navigator.register("pointer.show",
    function(){ 
        Presenter.deck.showPointer();
    }
); 

Presenter.Navigator.register("pointer.hide", 
    function(){ 
        Presenter.deck.hidePointer();
    }
);

Presenter.Navigator.register("toggle_notes",
    function(){
         $("#notes-display").toggleClass("visible");
    }
);

Presenter.Navigator.register("hide_notes",
    function(){
        $("#notes-display").removeClass("visible");
    }
);

Presenter.Navigator.register("show_notes",
    function(){
        $("#notes-display").addClass("visible");
    }
);
