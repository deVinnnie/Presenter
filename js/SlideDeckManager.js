/**
 * @module Presenter
 */
 var Presenter = Presenter || {};

(function(namespace, window) {
    "use strict";
    var PREFIX = Presenter.PREFIX = ["-webkit-", "-moz-", "-o-", ""];
    var deck;
    var SLIDE_TRANSFORMS = {};

    /**
     * Starts the presentation.
     *
     * @method init
     * @param {object} config Configuration object
     */
    function init(config) {
        Presenter.settings = config;

        //Redefine the log functions of console if the console object doesn't exist (ex. IE)
        if(typeof console == "undefined"){
            var console = {};
            console.log = console.error = console.info = console.debug = function(){};
        }

        //Hook up eventhandlers.
        $(window).on("resize", Presenter.onWindowResized);

        if(typeof Hammer != 'undefined'){
            Presenter.Touch.enable();
        }
        Presenter.keyboard = new Presenter.Keyboard();
        Presenter.mouse = new Presenter.Mouse();

        addExtraHTMLElements();
        createDeck();
        Presenter.onWindowResized();

        //Overview
        if(typeof Presenter.Overview != 'undefined'){
            Presenter.overview = new Presenter.Overview(deck);
        }

        Presenter.Navigator.init();
        window.postal.channel("slides").publish("slide-changed");
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

            var slide_style;
            if( $("#test").css('transform')){
                slide_style =  $("#test").css('transform');
            }
            else{
                slide_style = $("#test").css('-webkit-transform');
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
     */
    Presenter.onWindowResized = function(){
        var styles = "@media screen{\n";
        var scale = Math.min(window.innerHeight / deck.slideHeight, window.innerWidth / deck.slideWidth);

        if(Presenter.settings.hasOwnProperty("scale")){
            scale *= Presenter.settings.scale;
        }

        var offsetLeft = (window.innerWidth - deck.slideWidth * scale) / 2.0;
        var offsetTop = (window.innerHeight - deck.slideHeight * scale) / 2.0;

        for (var i = 0; i < Presenter.SlideDeck.SLIDE_STATES.length; i++) {
            styles += "." + Presenter.SlideDeck.SLIDE_STATES[i] + "{\n";
            for (var j = 0; j < PREFIX.length; j++) {
                styles += PREFIX[j] + "transform:"+ deck.scale(scale) + " ";
                styles += SLIDE_TRANSFORMS[Presenter.SlideDeck.SLIDE_STATES[i]] +";\n";
            }
            styles += "left:" + offsetLeft + "px;\n";
            styles += "top: " + offsetTop + "px;\n";
            styles += "}\n";
        }
        styles+="\n";
        $("#style").html(styles);
    }

    Presenter.disableTransitions = function(){
        var styles = "";

        for (var i = 0; i < Presenter.SlideDeck.SLIDE_STATES.length; i++) {
            styles += "." + Presenter.SlideDeck.SLIDE_STATES[i] + "{\n";
            for (var j = 0; j < PREFIX.length; j++) {
                styles += PREFIX[j] + "transform: none;\n";
                styles += PREFIX[j] + "transition: all 0s;\n";
            }
            styles += "}\n";
        }
        $("#style").html(styles);
    }

    window.Presenter.init = init;
}(Presenter, window));
