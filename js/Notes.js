export default class Notes{
    /**
    * Adds <div id="notes-display"></div> to the DOM.
    */
    constructor(deck) {
        this.deck = deck;
    
        deck.channel.subscribe("slide-changed", this.refresh).context(this);
        
        $("body")
            .append($("<div/>")
                .attr("id", "notes-display"));   
    }
    
    /**
     * Update notes for current slide.
     *
     * Reloads the notes stored within div.notes into the notes display.
     */
    refresh() {
        var notesDisplay = document.getElementById('notes-display');
        //Remove any content that was previously present in the notes-display.
        notesDisplay.innerHTML = "";

        var currentSlide = this.deck.getCurrentSlide();
        if (currentSlide.querySelector(".notes")) {
            var notes = currentSlide.querySelector(".notes");
            notesDisplay.innerHTML = notes.innerHTML;
        }
    }
}
