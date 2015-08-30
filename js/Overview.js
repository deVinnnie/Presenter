/**
 * @module Presenter
 */
 var Presenter = Presenter || {};

(function(global) {
    "use strict";
    /**
     * @class Overview
     * @constructor
     */
    function Overview(deck){
        this.active = false;
        this.deck = deck;
    }

    /**
     * Toggles overview mode of the sliddedeck where
     * all slides are displayed in a table as thumbnails.
     *
     * @method toggle
     */
    Overview.prototype.toggle = function(){
        if (this.active)
        {
            this.hide();
        }
        else
        {
            this.show();
        }
    }

    var PREFIX = Presenter.PREFIX;

    /**
     *  @method show
     */
    Overview.prototype.show = function() {
        this.active = true;
        var deck = this.deck;
        var settings = Presenter.settings;
        var channel = window.postal.channel("slides");

        Presenter.Mouse.disable();

        //Announce change
        channel.publish("enter-overview");

        //Show cursor so user can click on thumbnails.
        channel.publish("navigator", {action:"pointer.show"});

        //Determine height of the tumbnails.
        var thumbnailHeight = (deck.slideHeight / deck.slideWidth) * settings.thumbnail_width; //aspect-ratio * thumbnail_width
        var scale = settings.thumbnail_width / deck.slideWidth;

        //Wrap each slide in another div. Used for layout purposes in overview mode.
        $(deck.slides).wrap('<div class="slide-wrapper"/>');

        var style = ".slide-wrapper{width:" + settings.thumbnail_width + "px;"
                + "height:" + (thumbnailHeight) + "px;}\n"
                + ".slideDeck.overview .slide-wrapper .slide"
                + "{\n";
        for (var i = 0; i < PREFIX.length; i++) {
            style += PREFIX[i] + "transform: scale(" + scale + ");\n";
        }

        style += "}";

        $("#style").append(style);
        $(window).off("resize");

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
    Overview.prototype.hide = function() {
        this.active = false;
        var deck = this.deck;
        var settings = Presenter.settings;
        var channel = window.postal.channel("slides");

        Presenter.Mouse.enable();

        channel.publish("navigator", {action:"pointer.hide"});

        $(".slideDeck")
                .removeClass("overview")
                .off("click", ".slide", this.onSelectSlide);

        $(".slideDeck > .slide-wrapper.current").removeClass("current");

        $(deck.slides).unwrap();

        var t = 0;
        for (var i = deck.currentSlide - 2; i <= deck.currentSlide + 2; i++, t++) {
            deck.updateSlide(i, Presenter.SlideDeck.SLIDE_STATES[t]);
        }

        $(window).on("resize", Presenter.onWindowResized);
        $(window).trigger('resize');
        channel.publish("slide-changed");
    }

    /**
     * Event Handler for clicking on a slide in overview-mode.
     *
     * @method onSelectSlide
     * @param event
     */
    Overview.prototype.onSelectSlide = function(event) {
        var target = event.currentTarget;
        this.deck.gotoByNumber(this.deck.getSlideNmb(target));
        this.hide();
    }

    //Make constructor visible in global space.
    global.Presenter.Overview = Overview;
}(window));

Presenter.Navigator.register("overview",
    function(){
        Presenter.overview.toggle();
    }
);
