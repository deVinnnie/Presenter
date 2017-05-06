import Navigator from './Navigator.js'
import SlideDeck from './SlideDeck.js';
import Keyboard from './Keyboard.js';
import Mouse from './Mouse.js';
import Curtain from './Curtain.js';
import Touch from './Touch.js';
import { routes } from './Routes.js';
import Overview from './Overview.js';
import SyncClient from './SyncClient.js';
import SlideScaler from './SlideScaler.js';


class Presenter{
    
    constructor(){
        this.curtain = new Curtain();
    }
    
    /**
     * Starts the presentation.
     *
     * @method init
     * @param {object} config Configuration object
     */
    init(config){
        window.console.time("setup");
        this.settings = config;

        //Redefine the log functions of console if the console object doesn't exist (ex. IE)
        if(typeof console == "undefined"){
            var console = {};
            console.log = console.error = console.info = console.debug = function(){};
        }
        
        this.addExtraHTMLElements();
        this.createDeck();
        
        var deck = this.deck;

        //Initialize input methods.
        if(typeof Hammer != 'undefined'){
            //Use Touch input if the Hammer.js library is available.
            deck.touch = new Touch();
            deck.touch.enable();
        }
        deck.keyboard = new Keyboard();
        deck.mouse = new Mouse();
        deck.syncClient = new SyncClient(deck);
        this.slideScaler = new SlideScaler(deck, this.settings);
        
        //Hook up eventhandlers.
        window.addEventListener("resize", this.slideScaler.scale.bind(this.slideScaler));
        this.slideScaler.scale(); //Manually trigger resize event to set the initial scale right.

        //Overview
        if(typeof Overview != 'undefined'){
            this.overview = new Overview(deck);
        }

        deck.navigator = new Navigator();
        deck.navigator.init();
        deck.navigator.registerAll(routes);
        
        deck.curtain = new Curtain();
        
        window.postal.channel("slides").publish("slide-changed");
        window.console.timeEnd("setup");
    }
    
    /**
     * Adds needed HTML markup to the DOM.
     *
     * <div id="curtain"></div>
     * <div id="notes-display"></div>
     * <div id="ticker" class="{ticker-position}">
     *    <ul id="ticks">
     *    </ul>
     * </div>
     *
     *  @method addExtraHTMLElements
     */
    addExtraHTMLElements(){
        $("body")
                .append($("<div/>").attr("id", "curtain"))
                .append($("<div/>").attr("id", "notes-display"))
                .append(
                    $("<div/>")
                        .attr("id", "ticker")
                        .attr("class", this.settings["ticker-position"])
                        .append(
                            $("<ul/>")
                            .attr("id", "ticks")
                        )
                );

        //Add the "slide" class to each section.
        $(".slideDeck > section").addClass("slide");
    }
    
    /**
     * Create and initialize a new deck object
     *
     * @method createDeck
     */
    createDeck(){
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

        this.deck = new SlideDeck(document.querySelectorAll(".slide"), currentSlide);
        var deck = this.deck;
        var computedStyle = document.defaultView.getComputedStyle(deck.slides[0], "");
        deck.slideWidth = parseInt(computedStyle.getPropertyValue("width"));
        deck.slideHeight = parseInt(computedStyle.getPropertyValue("height"));
    }
}

window.onload = function() {
    window.presenter = new Presenter();
    presenter.init({
            "thumbnail_width": 150,
            "ticker-position": "right",
            /*"scale": 0.95*/
            "scale": 0.75
        });
};
