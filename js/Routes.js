//Register Actions with the navigator.
export var routes = {
    "curtain.toggle.white" : () => {
        presenter.deck.curtain.toggle("#FFF");
    },
    "curtain.toggle.black" : () => {
        presenter.deck.curtain.toggle("#000");
    },
    "next" : () => {
        presenter.deck.next();
    },
    "previous" : () => {
        presenter.deck.previous();
    },
    "toggle_pointer" : () => {
        presenter.deck.togglePointer();
    },
    "pointer.show" : () => {
        presenter.deck.showPointer();
    },
    "pointer.hide" : () => {
        presenter.deck.hidePointer();
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
        presenter.syncClient.monitor();
    },
    "sync.listen" : () => {
        presenter.syncClient.listen();
    },
    "sync.connect" : () => {
        presenter.syncClient.connect();
    },
    "overview" : () => {
        presenter.overview.toggle();
    }
};
