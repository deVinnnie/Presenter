import Navigator from './Navigator.js'
import SlideDeck from './SlideDeck.js';
import Keyboard from './Keyboard.js';
import Mouse from './Mouse.js';
import Touch from './Touch.js';
import { routes } from './Routes.js';
import Overview from './Overview.js';
import SyncClient from './SyncClient.js';
import SlideScaler from './SlideScaler.js';


class Presenter{
    
    constructor(){}
    
    /**
     * Starts the presentation.
     *
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
        
        var deck = this.createDeck();
        
        //Initialize input methods.
        if(typeof Hammer != 'undefined'){
            //Use Touch input if the Hammer.js library is available.
            deck.touch = new Touch();
            deck.touch.enable();
        }
        deck.keyboard = new Keyboard();
        deck.mouse = new Mouse();
        deck.syncClient = new SyncClient(deck);
        this.slideScaler = new SlideScaler(deck);
        
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
        
        window.postal.channel("slides").publish("slide-changed");
        window.console.timeEnd("setup");
    }
    
    /**
     * Create and initialize a new deck object
     *
     */
    createDeck(){
        //Add the "slide" class to each section.
        $(".slideDeck > section").addClass("slide");
        
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

        this.deck = new SlideDeck(document.querySelectorAll(".slide"), currentSlide, this.settings);
        var deck = this.deck;
        var computedStyle = document.defaultView.getComputedStyle(deck.slides[0], "");
        deck.slideWidth = parseInt(computedStyle.getPropertyValue("width"));
        deck.slideHeight = parseInt(computedStyle.getPropertyValue("height"));
        
        return deck;
    }
}
