export { EventHandler };
class EventHandler {
    ;
    constructor(renderer) {
        this._renderer = renderer;
        this._instanceListeners = new Map();
        this._clazzListeners = new Map();
    }
    addListener(param) {
        param.isClassName = param.isClassName ? param.isClassName : false;
        let event;
        let listeners;
        if (param.isClassName) {
            event = this._clazzListeners.get(param.id) || new Map();
            listeners = event.get(param.event) || new Array();
            listeners.push(param.listener);
        }
        else {
            if (!this._instanceListeners.has(param.id)) {
                this._instanceListeners.set(param.id, new Map());
            }
            event = this._instanceListeners.get(param.id);
            if (!event.has(param.event)) {
                event.set(param.event, new Array());
            }
            listeners = event.get(param.event);
            listeners.push(param.listener);
        }
    }
    invoke(param) {
        // param.bubble = param.bubble ? param.bubble : true;
        // const instance = this._renderer.findById(param.id);
        // if(!instance) throw new Error("Cannot found Instacne");
        // if(!this._instanceListeners.has(param.id)) return;
        // if(!this._instanceListeners.get(param.id)!.has(param.event)) return;
        // const listeners = this._instanceListeners.get(param.id)!.get(param.event)!;
        // instance.invoke(listeners);
        // if(param.bubble){
        //     const className =  instance.getClassName();
        //     if(!this._clazzListeners.has(param.id)) return;
        //     if(!this._clazzListeners.get(param.id)!.has(param.event)) return;
        //     const listeners = this._clazzListeners.get(className)!.get(param.event)!;
        //     instance.invoke(listeners);
        // }
    }
}
