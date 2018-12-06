export default class Navigator{
    /**
     * @class Navigator
     * @constructor
     */
    constructor(){
        this.actions = [];
    }

    init(actions){
        var channel = postal.channel("slides");
        channel.subscribe("navigator", (d) => { this.handle (d);});
        channel.subscribe("navigator-external", (d) => { this.handle(d);});
        
        this.registerAll(actions);
    }

    handle(data){
        var action = data.action;
        console.log("[Navigator] Handling " + action);
        this.actions[action]();
    }

    register(key, action){
        console.log("[Navigator] " + key + " " + "registered.");
        console.debug("[DEBUG]" + action);
        this.actions[key] = action;
    }

    registerAll(actions){
        for(var p in actions){
            this.register(p, actions[p]);
        }
    }
}
