import { XY, Predicate } from "./type.js";
// import { v4 as uuid } from "uuid";



// function ensureContext(target: any, propertyKey: string|symbol, descriptor: PropertyDescriptor) {
//     const originalMethod = descriptor.value;
//     descriptor.value = function (...args: any[]) {
//         if(!(this instanceof Block)) return;
//         if (!this.getProperty("ctx")) {
//             throw new Error("Context is not set");
//         }
//         return originalMethod.apply(this, args);
//     };
// }

interface Drawable {
    draw(): void;
    clear(): void;
}

/**
 * @param {Record<string, any>} props
 * @param {number} prop.lineWidth - #deprecated default: 1 
 * @param {number} prop.size - default: 10
 * @param {string} prop.color - default: grey
 * @param {CanvasRenderingContext2D} porp.ctx
 */
abstract class AbDrawable implements Drawable {
    protected _props: Record<string, any>; //외부에서 get을 해도되는 속성 

    constructor(props: AbDrawable["_props"]) {
        this._props = props;
    }
    getProperty<K extends keyof AbDrawable["_props"]>(key: K): AbDrawable["_props"][K] {
        return this._props[key];
    }

    setProperty<K extends keyof AbDrawable["_props"]>(key: K, value: AbDrawable["_props"][K]): void {
        this._props[key] = value;
    }

    clearAndDraw(): void {
        // this.clear();
        // this.draw();
    }

    abstract draw(): void;
    abstract clear(): void;

}

/**
 * @param {XY} props.position
 */
abstract class Shape extends AbDrawable {
    protected _container?: Container;
    protected _prevState?: Record<string, any>;

    constructor(props: AbDrawable["_props"]) {
        if (!props.id) throw new Error("id is null");
        super(props);
    }

    setContainer(container: Container) {
        this._container = container;
    }
    getContainer(): Container | undefined {
        return this._container;
    }

    abstract draw(): void;
    abstract clear(): void;
    abstract rotate(pos: XY): void;
}


class Rect extends Shape {

    private _isActive = false;

    constructor(props: Shape["_props"]) {
        super(props);
        this._props.lineWidth = 1;
        this._props.size = 20;
        this._props.color = "grey";
    }

    draw(): void {
        if(this._isActive) return;
        // if(!this._props.isActive) return; //더티는 컨테이너에서 
        //컨테이너에서 더티처리만하고여기는 무조건 다 재드로우? 
        const ctx = this._props.ctx;
        // this.clear();
        ctx.lineWidth = this._props.lineWidth;
        ctx.fillStyle = this._props.color;
        ctx.fillRect(this._props.position.x, this._props.position.y, this._props.size, this._props.size);

        this._prevState = JSON.parse(JSON.stringify(this._props));
    }
    clear(): void {
        if (this._prevState)
            this._props.ctx.clearRect(this._prevState.position.x, this._prevState.position.y, this._prevState.size, this._prevState.size);
    }

    clearAndDraw() {
        this.clear();
        this.draw();
    }

    /**
     * 
     * @param pos - 기준 좌표 
     */
    rotate(pos: XY) {
        this._isActive = true;
        this.clear(); 
        const ctx = this._props.ctx;
        ctx.save(); 
        ctx.translate(pos.x, pos.y); 
        ctx.rotate(Math.PI / 2);
        ctx.translate(-pos.x, -pos.y); 
        ctx.lineWidth = this._props.lineWidth;
        ctx.fillStyle = this._props.color;
        ctx.fillRect(this._props.position.x, this._props.position.y, this._props.size, this._props.size);
        ctx.restore();

        this._prevState = JSON.parse(JSON.stringify(this._props));
        this._isActive = false;

    }
}

class Container extends AbDrawable {
    private _childrens: Array<Shape>;
    private _isDirty: boolean = false;

    constructor(props: AbDrawable["_props"]) {
        super(props);
        // this._props.id = uuid();
        this._props.id = "c" + Math.random(); //임시
        this._childrens = new Array();
    }
    draw(): void {
        this._childrens.forEach(childern => {
            childern.draw();
        })
    }
    clear(): void {
        this._childrens.forEach(children => {
            children.clear();
        })
    }
    rotate(pos: XY): void {
        this._childrens.forEach(children => children.rotate(pos));
    }
    getChildrens(): Array<Shape> {
        return this._childrens;
    }

    //props 로 넣어비릴지말지 고민
    isDirty(): boolean {
        return this._isDirty;
    }
    setDirty(dirty: boolean): void {
        this._isDirty = dirty;
    }

    addShape(shape: Shape) {
        this._childrens.push(shape);
    }
    removeShape(shape: Shape) {
        this._childrens = this._childrens.filter(children => (children.getProperty("id") != shape.getProperty("id")));
    }
}


export { AbDrawable, Shape, Rect, Container };