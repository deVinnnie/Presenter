import Ticker from './Ticker.js';
import Steps from './Steps.js';
import Notes from './Notes.js';
import Curtain from './Curtain.js';

export default class SlideDeck{
    /**
     * SlideDeck
     *
     * @class SlideDeck
     * @constructor
     * @param {array} slides List of slides in the deck.
     * @param {int} currentSlide The first slide to show. (Starts at 1)
     */
    constructor(slides, currentSlide, settings) {
        this.slides = slides;
        this.nSlides = this.slides.length;
        this.currentSlide = currentSlide;
        this.settings = settings;
        
        this.channel = postal.channel("slides");
        /*Actions done before slide changes*/
        this.channel.subscribe("pre-slide-changed", this.autoStopVideo).context(this);
        this.channel.subscribe("enter-overview", this.autoStopVideo).context(this);

        /*Actions for new slide*/
        this.channel.subscribe("slide-changed", this.updateLocationHash).context(this);
        this.channel.subscribe("slide-changed", this.updateProgressBar).context(this);
        this.channel.subscribe("slide-changed", this.autoPlayVideo).context(this);
        
        this.ticker = new Ticker(this);
        this.steps = new Steps(this);
        this.notes = new Notes(this);
        this.curtain = new Curtain();
        
        this.initProgressBar();
        this.initVideos();
    }

    /*Static*/
    static get SLIDE_STATES(){ 
        return [
            "far-past",
            "past",
            "current",
            "future",
            "far-future"
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
     */
    updateLocationHash() {
        window.location.hash = "#" + this.currentSlide;
    }

    /**
     * Update progressbar.
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
     * @param {int} slideNumber
     * @return {htmlelement} The corresponding slide.
     */
    getSlide(slideNumber) {
        return this.slides[slideNumber - 1];
    }

    /**
     * Returns the current slide.
     *
     * @return {htmlelement} The current slide.
     */
    getCurrentSlide() {
        return this.getSlide(this.currentSlide);
    }

    /**
     * Returns the sequence number of the given slide.
     *
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
     */
    next() {
        if (this.steps.remaining != 0){
            this.steps.nextStep();
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
     */
    previous() {
        if (this.steps.current > 0){
            this.steps.previousStep();
        }
        else {
            this.previousSlide();
        }
    }

    /**
     * Goto to the specified Slide using the Id of the slide.
     *
     * @param {string} id Id of the slide.
     */
    gotoById(id) {
        this.channel.publish("pre-slide-changed");
        var n = this.currentSlide - 2;
        for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++, n++) {
            this.clear(n);
        }

        var slideN = this.getSlideNmb(document.getElementById(id));
        this.currentSlide = slideN;
        slideN -= 2;
        for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++, slideN++) {
            this.updateSlide(slideN, SlideDeck.SLIDE_STATES[i]);
        }
        this.channel.publish("slide-changed", {type: "goto", slide: this.currentSlide});
    }

    /**
     * Goto to the specified Slide using the slide number.
     *
     * @param {int} n The number/order of the slide in the slidedeck.
     */
    gotoByNumber(n){
        this.currentSlide = n;
        var t = 0;
        for (var i = this.currentSlide - 2; i <= this.currentSlide + 2; i++, t++) {
            this.updateSlide(i, SlideDeck.SLIDE_STATES[t]);
        }
        this.channel.publish("slide-changed", {type: "goto", slide: this.currentSlide});
    }

    /**
     * Go to next slide.
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
     * Automatically start playing the video on the current slide, when present.
     */
    autoPlayVideo() {
        var currentSlide = this.getCurrentSlide();
        if (currentSlide.querySelector("video") !== null) {
            currentSlide.querySelector("video").play();
        }
    }

    /**
     * Automatically stop playing the video on the current slide, when present.
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
     * @param {int} slideNumber between 1 and slides.length
     * @param {String} stateName New state of the slide (one of SLIDE_STATES)
     */
    updateSlide(slideNumber, stateName) {
        if (slideNumber > 0 && slideNumber <= this.slides.length) {
            var slide = this.getSlide(slideNumber);
            slide.dataset.state=stateName;
        }
    }

    /**
     * Remove all states from the slide.
     *
     * @param {int} slideNumber Number of the Slide
     */
    clear(slideNumber) {
        if (slideNumber > 0 && slideNumber <= this.slides.length) {
            var slide = this.getSlide(slideNumber);
            slide.dataset.state="";
        }
    }

    /**
     * Toggles the visibility of the mouse cursor.
     *
     */
    togglePointer() {
        document.body.classList.toggle("cursor-visible");
    }

    showPointer() {
        document.body.classList.add("cursor-visible");
    }
    
    hidePointer() {
        document.body.classList.remove("cursor-visible");
    }

    /*
     * Handle video start playing and pausing events.
     * Use the click event of the video element to provide support for 'clicking on video and playing',
     * as opposed to aiming for the tiny play button.
     * Adds an eventhandler to each video in the presentation, as such ensuring that they are played when clicked.
     *
     */
    initVideos() {
        var videos = document.getElementsByTagName('video');
        for (var i = 0; i < videos.length; i++) {
            videos[i].addEventListener('click', _toggleVideo, false);
        }
    }
}
