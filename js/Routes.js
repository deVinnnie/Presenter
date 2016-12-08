//Register Actions with the navigator.
var routes = {
    "curtain.toggle.white" : () => {
        Presenter.deck.curtain.toggle("#FFF");
    },
    "curtain.toggle.black" : () => {
        Presenter.deck.curtain.toggle("#000");
    },
    "next" : () => {
        Presenter.deck.next();
    },
    "previous" : () => {
        Presenter.deck.previous();
    },
    "toggle_pointer" : () => {
        Presenter.deck.togglePointer();
    },
    "pointer.show" : () => {
        Presenter.deck.showPointer();
    },
    "pointer.hide" : () => {
        Presenter.deck.hidePointer();
    },
    "toggle_notes" : () => {
        document.getElementById('notes-display').classList.toggle('visible');
    },
    "hide_notes" : () => {
        document.getElementById('notes-display').classList.remove('visible');
    },
    "show_notes" : () => {
        document.getElementById('notes-display').classList.add('visible');
    },
    "sync.monitor" : () => {
        Presenter.syncClient.monitor();
    },
    "sync.listen" : () => {
        Presenter.syncClient.listen();
    },
    "sync.connect" : () => {
        Presenter.syncClient.connect();
    },
    "overview" : () => {
        Presenter.overview.toggle();
    }
};
