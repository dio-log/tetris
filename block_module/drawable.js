import { Converter } from "./util.js";
export { Drawable, Cell, Block };
/**
 * @param {Record<string, any>} prop
 * @param {number} prop.lineWidth - #deprecated default: 1
 * @param {number} prop.size - default: 10
 * @param {string} prop.color - default: grey
 */
class Drawable {
    constructor(prop) {
        this._eventListeners = new Map();
        this._prop = {
            // lineWidth: 1,
            size: 10,
            color: "grey",
        };
        this._assignNotNull(this._prop, prop);
    }
    _assignNotNull(target, source) {
        for (let key in source) {
            if (source[key])
                target[key] = source[key];
        }
    }
    addEventListener(event, listener) {
        if (!this._eventListeners.has(event)) {
            this._eventListeners.set(event, new Array());
        }
        const listeners = this._eventListeners.get(event);
        listeners.push(listener);
    }
    call(event) {
        if (!this._eventListeners.has(event))
            return;
        const listeners = this._eventListeners.get(event);
        listeners.forEach(listener => {
            console.log(event);
            listener(this);
        });
    }
}
/**
 * @param {Record<string, any>} prop
 * @param {Point} prop.refPoint - required
 */
class Cell extends Drawable {
    constructor(prop) {
        if (!prop.refPoint)
            throw new Error("prop.refPoint is required");
        super(prop);
        this._isActive = true;
    }
    setProperty(key, value) {
        this._prop[key] = value;
    }
    active() { this._isActive = true; }
    deactive() { this._isActive = false; }
    stepBy(step) {
        this._prop.refPoint.x += (step.x * this._prop.size);
        this._prop.refPoint.y += (step.y * this._prop.size);
    }
    moveBy(fixel) {
        this._prop.refPoint.x += fixel.x;
        this._prop.refPoint.y += fixel.y;
    }
    draw(ctx) {
        if (!this._isActive)
            return;
        this.clear(ctx);
        ctx.lineWidth = this._prop.lineWidth;
        ctx.fillStyle = this._prop.color;
        ctx.fillRect(this._prop.refPoint.x, this._prop.refPoint.y, this._prop.size, this._prop.size);
        this._prevState = JSON.parse(JSON.stringify(this._prop));
    }
    clear(ctx) {
        if (this._prevState)
            ctx.clearRect(this._prevState.refPoint.x, this._prevState.refPoint.y, this._prevState.size, this._prevState.size);
    }
}
/**
 * @param {Record<string, any>} prop
 * @param {stsring} prop.id - required
 */
class Block extends Drawable {
    constructor(prop, points) {
        if (!prop.id)
            throw new Error("prop.id is required");
        super(prop);
        this._converter = new Converter((points, prop) => {
            return points.map(point => new Cell({
                lineWidth: prop.lineWidth,
                size: prop.size,
                color: prop.color,
                refPoint: { x: point.x, y: point.y }
            }));
        });
        this._points = points;
        this._cells = this._converter.convert(this._points, this._prop);
    }
    getProperty(key) {
        return this._prop[key];
    }
    setProperty(key, value) {
        this._prop[key] = value;
        if (key == "id")
            return;
        this._cells.forEach(cell => { cell.setProperty(key, value); });
    }
    /**
     * @todo isDirty 로직이 여기있는게 맞나? 렌더링에서 isdirty를 확인해서 렌더링해주는게 맞나?
     * @param ctx
     * @returns
     */
    draw(ctx) {
        this._cells.forEach(cell => cell.draw(ctx));
    }
    clear(ctx) {
        this._cells.forEach(cell => cell.clear(ctx));
    }
    removeCells(callback) {
        this._cells.forEach(cell => {
            if (callback(cell))
                cell.deactive();
        });
    }
    stepBy(step) {
        this._cells.forEach(cell => cell.stepBy(step));
    }
    moveBy(fixel) {
        this._cells.forEach(cell => cell.moveBy(fixel));
    }
    /**
     * @todo
     */
    rotate() {
    }
}
