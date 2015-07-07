/**
 * @module Presenter
 */
 var Presenter = Presenter || {};

(function(global) {
    "use strict";
    /**
     * Client side functions for synchronizing slide progress with sync_server.
     *
     * @class SyncClient
     * @constructor
     */
    function SyncClient(){}

    /**
     * Register this instance of the presentation as monitor.
     *
     * In monitor mode commands are received as well as sent. (Bidirectional)
     * The monitor displays two slides side by side, and notes are visible by default.
     *
     * @method monitor
     * @static
     */
    SyncClient.monitor = function() {
        var connection = this.prompt();

        $('body').addClass("master");
        $("#ticker").hide();
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
        ).withContext(this);
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
    SyncClient.listen = function() {
        var connection = this.prompt();
        $("#ticker").hide();

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
    };

    /**
     * Connect this instance to a server.
     * Listens to incomming commands via WebSockets and updates this instance accordingly.
     * Input from the current instance is accepted.
     *
     * @method connect
     * @static
     */
    SyncClient.connect = function() {
        var connection = this.prompt();
        $("#ticker").hide();

        connection.onerror = function(error) {
            alert('WebSocket Error ' + error);
            console.error('[SyncClient] WebSocket Error ' + error);
        };

        window.postal.channel("slides").subscribe("navigator",
            function(data) {
                connection.send(data.action);
            }
        ).withContext(this);

        connection.onmessage = function(e) {
            window.postal.channel("slides").publish("navigator-external", {action: e.data});
            console.error('[SyncClient] Server: ' + e.data);
        };
    };

    SyncClient.prompt = function(){
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
    };

    //Make constructor visible in global space.
    global.Presenter.SyncClient = SyncClient;
}(window));

Presenter.Navigator.register("sync.monitor",
    function()
    {
            Presenter.SyncClient.monitor();
    }
);

Presenter.Navigator.register("sync.listen",
    function()
    {
        Presenter.SyncClient.listen();
    }
);

Presenter.Navigator.register("sync.connect",
    function()
    {
        Presenter.SyncClient.connect();
    }
);
