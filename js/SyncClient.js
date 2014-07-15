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
     * Register this instance of the presentation as master. 
     * 
     * In master mode the input commands (changing slides) are transmitted 
     * via WebSockets to the sync-server and relayed 
     * to the registered listeners. 
     * 
     * @method master
     * @static
     */
    SyncClient.master = function() {
        var url = prompt("URL", "");
        
        try{
            var connection = new WebSocket('ws://' + url); //Example: ws://localhost:8080
        }
        catch(exception)
        {
            alert('WebSocket Error ' + exception); 
            console.log('WebSocket Error ' + exception);
            return; 
        }
            
        $('body').addClass("master");  
        $("#ticker").hide(); 
        connection.onerror = function(error) {
            alert('WebSocket Error ' + error); 
            console.log('WebSocket Error ' + error);
        };
        
        window.postal.channel("slides").subscribe("navigator",
            function(data) {
                connection.send(data.action);
            }
        ).withContext(this);
    };
    
    /**
     * Register this instance of the presentation as listener. 
     * Listens to incomming commands via WebSockets 
     * and updates this instance accordingly. 
     * Use this in combination with putInMasterMode
     * 
     * @method listen
     * @static
     */
    SyncClient.listen = function() {
        var url = prompt("URL", "");
        
        try{
            var connection = new WebSocket('ws://' + url);// ex. ws://localhost:8080
        }
        catch(exception)
        {
            alert('WebSocket Error ' + exception); 
            console.error('[SyncClient] WebSocket Error ' + exception);
            return; 
        }
        
        $("#ticker").hide(); 
        
        connection.onerror = function(error) {
            alert('WebSocket Error ' + error); 
            console.error('[SyncClient] WebSocket Error ' + error);
        };

        connection.onmessage = function(e) {
            window.postal.channel("slides").publish("navigator", {action: e.data});
            console.error('[SyncClient] Server: ' + e.data);
        };
    };

    //Make constructor visible in global space. 
    global.Presenter.SyncClient = SyncClient;
}(window));

Presenter.Navigator.register("sync.master",
    function()
    {
            Presenter.SyncClient.master(); 
    }
);

Presenter.Navigator.register("sync.listen",
    function()
    {
        Presenter.SyncClient.listen(); 
    }
);
