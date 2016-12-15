/**
 * @module Presenter
 */
var Presenter = Presenter || {};

export default class SyncClient{
    /**
     * Client side functions for synchronizing slide progress with sync_server.
     *
     * @class SyncClient
     * @constructor
     */
    constructor(){}

    /**
     * Register this instance of the presentation as monitor.
     *
     * In monitor mode commands are received as well as sent. (Bidirectional)
     * The monitor displays two slides side by side, and notes are visible by default.
     *
     * @method monitor
     * @static
     */
    monitor() {
        var connection = this.prompt();

        document.body.classList.add('master');
        document.getElementById('ticker').classList.add('hidden');
        connection.onerror = function(error) {
            alert('WebSocket Error ' + error);
            console.error('WebSocket Error ' + error);
        };

        connection.onmessage = function(e) {
            window.postal.channel("slides").publish("navigator-external", {action: e.data});
            console.error('[SyncClient] Server: ' + e.data);
        };

        window.postal.channel("slides").subscribe("navigator",
            function(data) {
                connection.send(data.action);
            }
        ).context(this);
    }

    /**
     * Register this instance of the presentation as listener.
     * Listens to incomming commands via WebSockets and updates this instance accordingly.
     * Input from the current instance is ignored.
     * Only commands from the external instance are executed.
     *
     * @method listen
     * @static
     */
    listen() {
        var connection = this.prompt();
        document.getElementById('ticker').classList.add('hidden');

        connection.onerror = function(error) {
            alert('WebSocket Error ' + error);
            console.error('[SyncClient] WebSocket Error ' + error);
        };

        global.Presenter.keyboard.disable();
        global.Presenter.Mouse.disable();

        connection.onmessage = function(e) {
            window.postal.channel("slides").publish("navigator-external", {action: e.data});
            console.error('[SyncClient] Server: ' + e.data);
        };
    }

    /**
     * Connect this instance to a server.
     * Listens to incomming commands via WebSockets and updates this instance accordingly.
     * Input from the current instance is accepted.
     *
     * @method connect
     * @static
     */
    connect() {
        var connection = this.prompt();
        document.getElementById('ticker').classList.add('hidden');

        connection.onerror = function(error) {
            alert('WebSocket Error ' + error);
            console.error('[SyncClient] WebSocket Error ' + error);
        };

        window.postal.channel("slides").subscribe("navigator",
            function(data) {
                connection.send(data.action);
            }
        ).context(this);

        connection.onmessage = function(e) {
            window.postal.channel("slides").publish("navigator-external", {action: e.data});
            console.error('[SyncClient] Server: ' + e.data);
        };
    }

    prompt(){
        var url = prompt("URL", "localhost:8080");

        try{
            var connection = new WebSocket('ws://' + url);// ex. ws://localhost:8080
            return connection;
        }
        catch(exception)
        {
            alert('WebSocket Error ' + exception);
            console.error('[SyncClient] WebSocket Error ' + exception);
            return;
        }
    }
}

Presenter.syncClient = new SyncClient();
