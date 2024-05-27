
import { Renderer } from "./renderer.js";

export { EventHandler };

class EventHandler {

    private _renderer: Renderer;
    private _instanceListeners: Map<string, Map<string, Array<Function>>>;
    private _clazzListeners: Map<string, Map<string, Array<Function>>>;;

    constructor(renderer: Renderer){
        this._renderer = renderer;
        this._instanceListeners = new Map();
        this._clazzListeners = new Map();
    }

    addListener(
        param: {
            isClassName?: boolean, //식별자가 클래스 이름인지 
            id: string, //식별자
            event: string,
            listener: Function
        }): void{
        param.isClassName = param.isClassName ? param.isClassName : false;

        let event;
        let listeners;

        if(param.isClassName){
            event = this._clazzListeners.get(param.id) || new Map();
            
            listeners = event.get(param.event) || new Array();
            listeners.push(param.listener);
        }
        else{
            if(!this._instanceListeners.has(param.id)){
                this._instanceListeners.set(param.id, new Map());
            }
            event = this._instanceListeners.get(param.id)!;

            if(!event.has(param.event)){
                event.set(param.event, new Array());
            }
            listeners = event.get(param.event)!;
            listeners.push(param.listener);
        }
    }

    invoke(
        param: {
            bubble?: boolean, //인스턴스의 클래스에서 같은 이벤트를 가진 리스너를 호출할건지
            id: string,
            event: string
        }): void{
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