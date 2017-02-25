export default class Overview{
    /**
     * @class Overview
     * @constructor
     */
    constructor(deck, settings, presenter){
        this.active = false;
        this.deck = deck;
        this.settings = settings;
        this.presenter = presenter;
    }

    /**
     * Toggles overview mode of the sliddedeck where
     * all slides are displayed in a table as thumbnails.
     *
     * @method toggle
     */
    toggle(){
        if (this.active)
        {
            this.hide();
        }
        else
        {
            this.show();
        }
    }

    /**
     *  @method show
     */
    show() {
        this.active = true;
        var deck = this.deck;
        var channel = window.postal.channel("slides");

        deck.mouse.disable();

        //Announce change
        channel.publish("enter-overview");

        //Show cursor so user can click on thumbnails.
        channel.publish("navigator", {action:"pointer.show"});

        //Determine height of the tumbnails.
        var thumbnailHeight = (deck.slideHeight / deck.slideWidth) * settings.thumbnail_width; //aspect-ratio * thumbnail_width
        var scale = settings.thumbnail_width / deck.slideWidth;

        //Wrap each slide in another div. Used for layout purposes in overview mode.
        $(deck.slides).wrap('<div class="slide-wrapper"/>');

        var style = `.slide-wrapper{
            width: ${settings.thumbnail_width}px;
            height: ${thumbnailHeight}px;
        }`;
        style += `.slideDeck.overview .slide-wrapper .slide {
                        transform: scale(${scale});
                  }`;

        $("#style").append(style);
        window.removeEventListener("resize", this.presenter.onWindowResized);

        $(".slideDeck")
                .addClass("overview")
                .on("click", ".slide",
                    $.proxy(this.onSelectSlide, this)
                );
        var currentSlide = deck.getCurrentSlide();
        //Indicate the current slide with a different style in the overview.
        currentSlide.parentNode.classList.add("current");
        //Remove Slide-states from the active slides
        for (var i = deck.currentSlide - 2; i <= deck.currentSlide + 2; i++) {
            deck.clear(i);
        }

        //Scroll to the current slide.
        currentSlide.scrollIntoView();
    }

    /**
     * @method hide
     */
    hide() {
        this.active = false;
        var deck = this.deck;
        var channel = window.postal.channel("slides");

        deck.mouse.enable();

        channel.publish("navigator", {action:"pointer.hide"});

        $(".slideDeck")
                .removeClass("overview")
                .off("click", ".slide", this.onSelectSlide);

        $(".slideDeck > .slide-wrapper.current").removeClass("current");

        $(deck.slides).unwrap();

        var t = 0;
        for (var i = deck.currentSlide - 2; i <= deck.currentSlide + 2; i++, t++) {
            deck.updateSlide(i, SlideDeck.SLIDE_STATES[t]);
        }

        // TODO: Fix it.
        window.addEventListener("resize", this.presenter.onWindowResized);
        $(window).trigger('resize');
        channel.publish("slide-changed");
    }

    /**
     * Event Handler for clicking on a slide in overview-mode.
     *
     * @method onSelectSlide
     * @param event
     */
    onSelectSlide(event) {
        var target = event.currentTarget;
        this.deck.gotoByNumber(this.deck.getSlideNmb(target));
        this.hide();
    }
}
