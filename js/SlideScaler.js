import SlideDeck from './SlideDeck.js';

export default class SlideScaler{
    
    constructor(deck, settings){
        this.deck = deck;
        this.settings = settings;
        this.SLIDE_TRANSFORMS = {};
        
        this.init();
    }
    
    init(){
        var deck = this.deck;
        var t = deck.currentSlide - 2;
        for (var i = 0; i < SlideDeck.SLIDE_STATES.length; i++, t++) {
            if (t > 0 && t <= deck.nSlides) {
                deck.getSlide(t).dataset.state=SlideDeck.SLIDE_STATES[i];
            }

            //Store Original Transformation
            //Add dummy slide to DOM to get the style associated.
            $("body").append(
                $("<div/>")
                        .attr("class", "slide")
                        .attr("data-state", SlideDeck.SLIDE_STATES[i])
                        .attr("id", "test")
            );

            var testElement = document.getElementById('test');
            var slide_style = getComputedStyle(testElement)['transform'];
            if(slide_style == "none"){
                slide_style = "";
            }

            this.SLIDE_TRANSFORMS[SlideDeck.SLIDE_STATES[i]] = slide_style;

            //Remove Dummy.
            $("#test").remove();
        }
    }

    /**
     * Resizes slidedeck when window is resized.
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
    scale(){
        var deck = this.deck;
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
            styles += `.slide[data-state="${state}"]{
                transform: scale3d(${scale},${scale},1) ${this.SLIDE_TRANSFORMS[state]};
                left: ${offsetLeft}px;
                top: ${offsetTop}px;
            }`;
        }
        styles+="}\n";

        document.getElementById('style').innerHTML = styles;
    }
}
