export default class Touch{
    /**
     * @class Touch
     * @constructor
     */
    constructor(){}

    /**
     * Register Touch Events with Hammer.js.
     *
     * @method enable
     */
    enable(){
        var channel = postal.channel("slides");
        var slideDeckElement = document.getElementsByClassName('.slideDeck')[0];
        var deck= new Hammer(slideDeckElement);

        //SwipeLeft
        deck.on("swipeleft", function() {
            channel.publish("navigator", {action:"next"});
        });

        //SwipeRight
        deck.on("swiperight", function() {
            channel.publish("navigator", {action:"previous"});
        });

        //SwipeUp
        deck.on("swipeup", function() {
            channel.publish("navigator", {action:"show_notes"});
        });

        //SwipeDown
        deck.on("swipedown", function() {
            channel.publish("navigator", {action:"hide_notes"});
        });

        //Hold
        deck.on("press", function() {
            channel.publish("navigator", {action:"overview"});
        });
    }
}
