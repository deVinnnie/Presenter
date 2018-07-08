describe("Steps", function() {
    let deck = {
        channel : postal.channel("slides")
    }
    
    it("returns correct value for atBeginning", function() {
        var steps = new Steps(deck);
        assert.isTrue(steps.atBeginning());
    });
});
