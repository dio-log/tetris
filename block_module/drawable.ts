import { XY, Predicate } from "./type.js";
import { Converter } from "./util.js";

export { Drawable, Cell, Block } ;


/**
 * @param {Record<string, any>} prop
 * @param {number} prop.lineWidth - #deprecated default: 1 
 * @param {number} prop.size - default: 10
 * @param {string} prop.color - default: grey
 */
abstract class Drawable {
    protected _prop: Record<string, any>;
    protected _eventListeners:  Map<string, Array<Function>> = new Map();

    constructor(prop: Drawable["_prop"]) {
        this._prop = {
            // lineWidth: 1,
            size: 10,
            color: "grey",
        }
        this._assignNotNull(this._prop, prop);
    }

    private _assignNotNull(target: Record<string, any>, source: Record<string, any>): void {
        for (let key in source) {
            if (source[key]) target[key] = source[key]
        }
    }

    addEventListener(event: string, listener: Function): void{
        if(!this._eventListeners.has(event)) {
            this._eventListeners.set(event, new Array());
        }
        const listeners = this._eventListeners.get(event);
        listeners!.push(listener);
    }

    call(event: string): void{
        if(!this._eventListeners.has(event)) return;

        const listeners = this._eventListeners.get(event);
        listeners!.forEach(listener => {
            console.log(event)
            listener(this);
        });
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract clear(ctx: CanvasRenderingContext2D): void;
}

/**
 * @param {Record<string, any>} prop 
 * @param {Point} prop.refPoint - required
 */
class Cell extends Drawable {
    private _prevState?: Drawable["_prop"];
    private _isActive: boolean = true;

    constructor(prop: Drawable["_prop"]) {
        if(!prop.refPoint) throw new Error("prop.refPoint is required");
        super(prop); 
    }

    setProperty<K extends keyof Drawable["_prop"]>(key: K, value: Drawable["_prop"][K]): void {
        this._prop[key] = value;
    }

    active(): void { this._isActive = true; }

    deactive(): void { this._isActive = false; }

    stepBy(step: XY) {
        this._prop.refPoint.x += (step.x * this._prop.size);
        this._prop.refPoint.y += (step.y * this._prop.size);
    }

    moveBy(fixel: XY): void {
        this._prop.refPoint.x += fixel.x;
        this._prop.refPoint.y += fixel.y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (!this._isActive) return;

        this.clear(ctx);

        ctx.lineWidth = this._prop.lineWidth;
        ctx.fillStyle = this._prop.color;
        ctx.fillRect(this._prop.refPoint.x, this._prop.refPoint.y, this._prop.size, this._prop.size);

        this._prevState = JSON.parse(JSON.stringify(this._prop));
    }

    clear(ctx: CanvasRenderingContext2D) {
        if(this._prevState)
            ctx.clearRect(this._prevState.refPoint.x, this._prevState.refPoint.y, this._prevState.size, this._prevState.size);
    }
}


/**
 * @param {Record<string, any>} prop
 * @param {stsring} prop.id - required
 */
class Block extends Drawable {
    private _points: Array<XY>;
    private _cells: Array<Cell>;

    private _converter = new Converter<Array<XY>, Array<Cell>>((points, prop) => {
        return points.map(point => new Cell({
            lineWidth: prop.lineWidth,
            size: prop.size,
            color: prop.color,
            refPoint: { x: point.x, y: point.y }
        }));
    });

    constructor(prop: Drawable["_prop"], points: Array<XY>) {
        if (!prop.id) throw new Error("prop.id is required");
        super(prop);
        this._points = points;
        this._cells = this._converter.convert(this._points, this._prop);
    }

    getProperty<K extends keyof Drawable["_prop"]>(key: K): Drawable["_prop"][K] {
        return this._prop[key];
    }

    setProperty<K extends keyof Drawable["_prop"]>(key: K, value: Drawable["_prop"][K]): void {
        this._prop[key] = value;

        if (key == "id") return;

        this._cells.forEach(cell => { cell.setProperty(key, value); })
    }

    /**
     * @todo isDirty 로직이 여기있는게 맞나? 렌더링에서 isdirty를 확인해서 렌더링해주는게 맞나?
     * @param ctx 
     * @returns 
     */
    draw(ctx: CanvasRenderingContext2D): void {
        this._cells.forEach(cell => cell.draw(ctx));
    }

    clear(ctx: CanvasRenderingContext2D): void {
        this._cells.forEach(cell => cell.clear(ctx))
    }

    removeCells(callback: Predicate<Cell>) {
        this._cells.forEach(cell => {
            if (callback(cell)) cell.deactive();
        })
    }

    stepBy(step: { x: number, y: number }) {
        this._cells.forEach(cell => cell.stepBy(step));
    }

    moveBy(fixel: { x: number, y: number }) {
        this._cells.forEach(cell => cell.moveBy(fixel));
    }

    /**
     * @todo 
     */
    rotate() {
        
    }
}

