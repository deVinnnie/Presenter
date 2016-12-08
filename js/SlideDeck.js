/**
 * @module Presenter
 * @author Vincent Ceulemans
 */
var Presenter = Presenter || {};

class SlideDeck{
    /**
     * SlideDeck
     *
     * @class SlideDeck
     * @constructor
     * @param {array} slides List of slides in the deck.
     * @param {int} currentSlide The first slide to show. (Starts at 1)
     */
    constructor(slides, currentSlide) {
        this.slides = slides;
        this.nSlides = this.slides.length;
        this.currentSlide = currentSlide;
        this.pointer = false;
        this.ticker = new Ticker(this);
        this.stepManager = new StepManager(this);

        this.initProgressBar();
        this.initVideos();

        this.channel = postal.channel("slides");

        /*Actions done before slide changes*/
        this.channel.subscribe("pre-slide-changed", this.autoStopVideo).context(this);
        this.channel.subscribe("enter-overview", this.autoStopVideo).context(this);

        /*Actions for new slide*/
        this.channel.subscribe("slide-changed", this.updateLocationHash).context(this);
        this.channel.subscribe("slide-changed", this.updateProgressBar).context(this);

        this.channel.subscribe("slide-changed", this.refreshNotes).context(this);
        this.channel.subscribe("slide-changed", this.autoPlayVideo).context(this);
    }

    /*Static*/
    static get SLIDE_STATES(){ 
        return [
            "farPastSlide",
            "pastSlide",
            "currentSlide",
            "futureSlide",
            "farFutureSlide"
        ];
    }

    /*
     Private functions
     */
    _toggleVideo(e) {
        var video = e.target;
        if(video.paused){
            video.play();
        }
        else{
            video.pause();
        }
    }

    /**
     * Update URL in the adressbar to the current position in the slidedeck.
     *
     * @method updateLocationHash
     */
    updateLocationHash() {
        window.location.hash = "#" + this.currentSlide;
    }

    /**
     * Update progressbar.
     *
     * @method updateProgressBar
     */
    updateProgressBar(){
        var progressPercentage = this.currentSlide/this.nSlides*100;
        progressJs().set(progressPercentage); //Decrease the progressbar with 1% once every 0.01 * interval.
    }

    initProgressBar(){
        progressJs().start();
    }

    /**
     * Returns the slide object for the given slide number.
     *
     * @method getSlide
     * @param {int} slideNumber
     * @return {htmlelement} The corresponding slide.
     */
    getSlide(slideNumber) {
        return this.slides[slideNumber - 1];
    }

    /**
     * Returns the current slide.
     *
     * @method getCurrentSlide
     * @return {htmlelement} The current slide.
     */
    getCurrentSlide() {
        return this.getSlide(this.currentSlide);
    }

    /**
     * Returns the sequence number of the given slide.
     *
     * @method getSlideNmb
     * @return {int} The sequence number. '1' is the first slide.
     */
    getSlideNmb(slide) {
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
    }

    /**
     * Go to next item (Slide or step)
     *
     * Go to the next step if there are remaining steps on the current slide.
     * If no steps remain, then the next slide is shown.
     *
     * @method next
     */
    next() {
        var nSteps = this.getCurrentSlide().querySelectorAll(".step").length;
        if (nSteps != 0){
            this.stepManager.nextStep();
        }
        else{
            this.nextSlide();
        }
    }

    /**
     * Go to previous item (Slide or step)
     *
     * Go to the previous slide if no steps are visible on the current slide, otherwise the previous step is shown.
     *
     * @method previous
     */
    previous() {
        var nSteps = this.getCurrentSlide().querySelectorAll(".step-done").length;
        if (nSteps >= 1) {
            this.stepManager.previousStep();
        }
        else {
            this.previousSlide();
        }
    }

    /**
     * Goto to the specified Slide using the Id of the slide.
     *
     * @method gotoById
     * @param {string} id Id of the slide.
     */
    gotoById(id) {
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
    }

    /**
     * Goto to the specified Slide using the slide number.
     *
     * @method gotoByNumber
     * @param {int} n The number/order of the slide in the slidedeck.
     */
    gotoByNumber(n){
        this.currentSlide = n;
        var t = 0;
        for (var i = this.currentSlide - 2; i <= this.currentSlide + 2; i++, t++) {
            this.updateSlide(i, Presenter.SlideDeck.SLIDE_STATES[t]);
        }
        this.channel.publish("slide-changed", {type: "goto", slide: this.currentSlide});
    }

    /**
     * Go to next slide.
     *
     * @method nextSlide
     */
    nextSlide() {
        if (this.currentSlide < this.nSlides) {
            this.channel.publish("pre-slide-changed");

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

            this.channel.publish("slide-changed", {type: "next", slide: this.currentSlide});
        }
    }

    /**
     * Go to previous slide.
     *
     * @method previousSlide
     */
    previousSlide() {
        if (this.currentSlide > 1) {
            this.channel.publish("pre-slide-changed");
            var slideN = this.currentSlide - 3;
            for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++, slideN++) {
                this.updateSlide(slideN, SlideDeck.SLIDE_STATES[i]);
            }
            if (this.getSlide(slideN)) {
                this.clear(slideN);
            }
            
            this.currentSlide--;
            this.channel.publish("slide-changed", {type: "previous" , slide: this.currentSlide});
        }
    }

    /**
     * Update notes for current slide.
     *
     * Reloads the notes stored within div.notes into the notes display.
     *
     * @method refreshNotes
     */
    refreshNotes() {
        var notesDisplay = document.getElementById('notes-display');
        //Remove any content that was previously present in the notes-display.
        notesDisplay.innerHTML = "";

        var currentSlide = this.getCurrentSlide();
        if (currentSlide.querySelector(".notes")) {
            var notes = currentSlide.querySelector(".notes");
            notesDisplay.innerHTML = notes.innerHTML;
        }
    }

    /**
     * Automatically start playing the video on the current slide, when present.
     *
     * @method autoPlayVideo
     */
    autoPlayVideo() {
        var currentSlide = this.getCurrentSlide();
        if (currentSlide.querySelector("video") !== null) {
            currentSlide.querySelector("video").play();
        }
    }

    /**
     * Automatically stop playing the video on the current slide, when present.
     *
     * @method autoStopVideo
     */
    autoStopVideo() {
        //If the current slide has a video, stop playing the video.
        var currentSlide = this.getCurrentSlide();
        if (currentSlide.querySelector("video") !== null) {
            currentSlide.querySelector("video").pause();
        }
    }

    /**
     * Update the slide with the given state.
     *
     * @method updateSlide
     * @param {int} slideNumber between 1 and slides.length
     * @param {String} stateName New state of the slide (one of SLIDE_STATES)
     */
    updateSlide(slideNumber, stateName) {
        if (slideNumber > 0 && slideNumber <= this.slides.length) {
            var slide = this.getSlide(slideNumber);
            for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++) {
                slide.classList.remove(SlideDeck.SLIDE_STATES[i]);
            }
            slide.classList.add(stateName);
        }
    }

    /**
     * Remove all states from the slide.
     *
     * @method clear
     * @param {int} slideNumber Number of the Slide
     */
    clear(slideNumber) {
        if (slideNumber > 0 && slideNumber <= this.slides.length) {
            var slide = this.getSlide(slideNumber);
            for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++) {
                slide.classList.remove(SlideDeck.SLIDE_STATES[i]);
            }
        }
    }

    /**
     * Toggles the visibility of the mouse cursor.
     *
     * @method togglePointer
     */
    togglePointer() {
        this.pointer = !this.pointer;
        document.body.classList.toggle("cursor-visible");
    }

    showPointer() {
        this.pointer = true;
        document.body.classList.add("cursor-visible");
    }
    
    hidePointer() {
        this.pointer = false;
        document.body.classList.remove("cursor-visible");
    }

    /*
     * Handle video start playing and pausing events.
     * Use the click event of the video element to provide support for 'clicking on video and playing',
     * as opposed to aiming for the tiny play button.
     * Adds an eventhandler to each video in the presentation, as such ensuring that they are played when clicked.
     *
     * @method initVideos
     */
    initVideos() {
        var videos = document.getElementsByTagName('video');
        for (var i = 0; i < videos.length; i++) {
            videos[i].addEventListener('click', _toggleVideo, false);
        }
    }
}
