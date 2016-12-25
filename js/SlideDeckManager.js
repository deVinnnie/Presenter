export default class Presenter{
    
    constructor(){
        var SLIDE_TRANSFORMS = {};
        
        
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

        //Hook up eventhandlers.
        window.addEventListener("resize", this.onWindowResized);

        this.addExtraHTMLElements();
        this.createDeck();

        //Initialize input methods.
        if(typeof Hammer != 'undefined'){
            //Use Touch input if the Hammer.js library is available.
            deck.touch = new Touch();
            deck.touch.enable();
        }
        deck.keyboard = new Keyboard();
        deck.mouse = new Mouse();
        deck.syncClient = new SyncClient(deck);
        
        this.onWindowResized(); //Manually trigger resize event to set the initial scale right.

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

        deck = Presenter.deck = new SlideDeck(document.querySelectorAll(".slide"), currentSlide);
        var computedStyle = document.defaultView.getComputedStyle(deck.slides[0], "");
        deck.slideWidth = parseInt(computedStyle.getPropertyValue("width"));
        deck.slideHeight = parseInt(computedStyle.getPropertyValue("height"));

        var t = deck.currentSlide - 2;
        for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++, t++) {
            if (t > 0 && t <= deck.nSlides) {
                deck.getSlide(t).classList.add(SlideDeck.SLIDE_STATES[i]);
            }

            //Store Original Transformation
            //Add dummy slide to DOM to get the style associated.
            $("body").append(
                $("<div/>")
                        .attr("class", SlideDeck.SLIDE_STATES[i])
                        .attr("id", "test")
            );

            var testElement = document.getElementById('test');
            var slide_style = getComputedStyle(testElement)['transform'];
            if(slide_style == "none"){
                slide_style = "";
            }

            SLIDE_TRANSFORMS[SlideDeck.SLIDE_STATES[i]] = slide_style;

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
    onWindowResized(){
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
        if(this.settings.hasOwnProperty("scale")){
            scale *= this.settings.scale;
        }

        //The offset ensures that the slide is always in the center of the screen.
        //Round to a integer pixel value.
        var offsetLeft = Math.round((window.innerWidth - deck.slideWidth * scale) / 2.0);
        var offsetTop = Math.round((window.innerHeight - deck.slideHeight * scale) / 2.0);

        scale = Math.round(scale*1000)/1000; //Round to 3 decimal places.

        for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++) {
            let state = SlideDeck.SLIDE_STATES[i];
            styles += `.${state}{
                transform: scale3d(${scale},${scale},1) ${SLIDE_TRANSFORMS[state]};
                left: ${offsetLeft}px;
                top: ${offsetTop}px;
            }`;
        }
        styles+="}\n";

        document.getElementById('style').innerHTML = styles;
    }    
}
