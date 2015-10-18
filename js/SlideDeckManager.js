/**
 * @module Presenter
 */
 var Presenter = Presenter || {};

(function(namespace, window) {
    "use strict";
    var PREFIX = Presenter.PREFIX = ["-webkit-", "-moz-", "-o-", "-ms-", ""];
    var deck;
    var SLIDE_TRANSFORMS = {};

    /**
     * Starts the presentation.
     *
     * @method init
     * @param {object} config Configuration object
     */
    function init(config) {
        window.console.time("setup");
        Presenter.settings = config;

        //Redefine the log functions of console if the console object doesn't exist (ex. IE)
        if(typeof console == "undefined"){
            var console = {};
            console.log = console.error = console.info = console.debug = function(){};
        }

        //Hook up eventhandlers.
        window.addEventListener("resize", Presenter.onWindowResized);

        //Initialize input methods.
        if(typeof Hammer != 'undefined'){
            //Use Touch input if the Hammer.js library is available.
            Presenter.Touch.enable();
        }
        Presenter.keyboard = new Presenter.Keyboard();
        Presenter.Mouse.enable();

        addExtraHTMLElements();
        createDeck();
        Presenter.onWindowResized(); //Manually trigger resize event to set the initial scale right.

        //Overview
        if(typeof Presenter.Overview != 'undefined'){
            Presenter.overview = new Presenter.Overview(deck);
        }

        Presenter.Navigator.init();
        window.postal.channel("slides").publish("slide-changed");
        window.console.timeEnd("setup");
    }

    /**
     * Adds needed HTML markup to the DOM.
     *
     *  @method addExtraHTMLElements
     */
    function addExtraHTMLElements(){
        //Add necessary divs
        $("body")
                .append($("<div/>").attr("id", "curtain"))
                .append($("<div/>").attr("id", "notes-display"))
                .append(
                    $("<div/>")
                        .attr("id", "ticker")
                        .attr("class", Presenter.settings["ticker-position"])
                        .append(
                            $("<ul/>")
                            .attr("id", "ticks")
                        )
                );

        //Add the "slide" class to each section.
        $(".slideDeck > section").addClass("slide");
    }

    /**
     * Create an initialize a new deck object
     *
     * @method createDeck
     */
    function createDeck(){
        //Check for slide number in location.hash
        var currentSlide;
        if (location.hash === "") {
            location.hash = "#1";
            currentSlide = 1;
        }
        else {
            var slideNumber = location.hash.substring(1); //location.hash is of the form "#number". Start from position 1 so the "#" is ignored.
            currentSlide = parseInt(slideNumber);
        }

        deck = Presenter.deck = new Presenter.SlideDeck(document.querySelectorAll(".slide"), currentSlide);
        var computedStyle = document.defaultView.getComputedStyle(deck.slides[0], "");
        deck.slideWidth = parseInt(computedStyle.getPropertyValue("width"));
        deck.slideHeight = parseInt(computedStyle.getPropertyValue("height"));

        var t = deck.currentSlide - 2;
        for (var i = 0; i < Presenter.SlideDeck.SLIDE_STATES.length; i++, t++) {
            if (t > 0 && t <= deck.nSlides) {
                deck.getSlide(t).classList.add(Presenter.SlideDeck.SLIDE_STATES[i]);
            }

            //Store Original Transformation
            //Add dummy slide to DOM to get the style associated.
            $("body").append(
                $("<div/>")
                        .attr("class", Presenter.SlideDeck.SLIDE_STATES[i])
                        .attr("id", "test")
            );

            var testElement = document.getElementById('test');
            var slide_style = getComputedStyle(testElement)['transform'];
            if(slide_style == "none"){
                slide_style = "";
            }

            SLIDE_TRANSFORMS[Presenter.SlideDeck.SLIDE_STATES[i]] = slide_style;

            //Remove Dummy.
            $("#test").remove();
        }
    }

    /**
     * Resizes slidedeck when window is resized.
     *
     * @method windowResizedHandler
     *
     * Generates this kind of CSS-code:
     * @media screen{
     *       .farPastSlide{
     *           transform: scale3d(0.881,0.881,1) matrix(1, 0, 0, 1, -2600, 0);
     *           left:119px;
     *           top: 17px;
     *       }
     *       .pastSlide{
     *           transform: scale3d(0.881,0.881,1) matrix(1, 0, 0, 1, -1300, 0);
     *           left:119px;
     *           top: 17px;
     *       }
     *       .currentSlide{
     *           transform: scale3d(0.881,0.881,1) matrix(1, 0, 0, 1, 0, 0);
     *           left:119px;
     *           top: 17px;
     *       }
     *       .futureSlide{
     *           transform: scale3d(0.881,0.881,1) matrix(1, 0, 0, 1, 1300, 0);
     *           left:119px;
     *           top: 17px;
     *       }
     *       .farFutureSlide{
     *           transform: scale3d(0.881,0.881,1) matrix(1, 0, 0, 1, 2600, 0);
     *           left:119px;
     *           top: 17px;
     *       }
     *   }
     */
    Presenter.onWindowResized = function(){
        var styles = "@media screen{\n";


        //         window.innerWidth
        //  <------------------------------>
        // ___________________________________
        // |         deck.slideWidth         |                      ^
        // |   <-------------------------->  |                      |
        // |   ____________________________  |                      |
        // |   | oooooooooooooooooooooooo |  |     ^                |
        // |   | oooooooooooooooooooooooo |  |     |  deck.height   |  window.innerHeight
        // |   | oooooooooooooooooooooooo |  |     |                |
        // |   |__________________________|  |     v                |
        // |                                 |                      |
        // |_________________________________|                      v
        //
        var scale = Math.min(window.innerHeight / deck.slideHeight, window.innerWidth / deck.slideWidth);

        //Set a prescale if a "scale" parameter was included in the config object.
        if(Presenter.settings.hasOwnProperty("scale")){
            scale *= Presenter.settings.scale;
        }

        //The offset ensures that the slide is always in the center of the screen.
        //Round to a integer pixel value.
        var offsetLeft = Math.round((window.innerWidth - deck.slideWidth * scale) / 2.0);
        var offsetTop = Math.round((window.innerHeight - deck.slideHeight * scale) / 2.0);

        scale = Math.round(scale*1000)/1000; //Round to 3 decimal places.

        for (var i = 0; i < Presenter.SlideDeck.SLIDE_STATES.length; i++) {
            styles += "." + Presenter.SlideDeck.SLIDE_STATES[i] + "{\n";
            for (var j = 0; j < PREFIX.length; j++) {
                styles += PREFIX[j] + "transform: scale3d(" + scale + "," + scale + ",1)" + " ";
                styles += SLIDE_TRANSFORMS[Presenter.SlideDeck.SLIDE_STATES[i]] +";\n";
            }
            styles += "left:" + offsetLeft + "px;\n";
            styles += "top: " + offsetTop + "px;\n";
            styles += "}\n";
        }
        styles+="\n";

        document.getElementById('style').innerHTML = styles;
    }

    window.Presenter.init = init;
}(Presenter, window));
