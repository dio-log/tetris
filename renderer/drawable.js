/**
 * @param {Record<string, any>} props
 * @param {number} prop.lineWidth - #deprecated default: 1
 * @param {number} prop.size - default: 10
 * @param {string} prop.color - default: grey
 * @param {CanvasRenderingContext2D} porp.ctx
 */
class AbDrawable {
    constructor(props) {
        this._props = props;
    }
    getProperty(key) {
        return this._props[key];
    }
    setProperty(key, value) {
        this._props[key] = value;
    }
    clearAndDraw() {
        // this.clear();
        // this.draw();
    }
}
/**
 * @param {XY} props.position
 */
class Shape extends AbDrawable {
    constructor(props) {
        if (!props.id)
            throw new Error("id is null");
        super(props);
    }
    setContainer(container) {
        this._container = container;
    }
    getContainer() {
        return this._container;
    }
}
class Rect extends Shape {
    constructor(props) {
        super(props);
        this._isActive = false;
        this._props.lineWidth = 1;
        this._props.size = 20;
        this._props.color = "grey";
    }
    draw() {
        if (this._isActive)
            return;
        // if(!this._props.isActive) return; //더티는 컨테이너에서 
        //컨테이너에서 더티처리만하고여기는 무조건 다 재드로우? 
        const ctx = this._props.ctx;
        // this.clear();
        ctx.lineWidth = this._props.lineWidth;
        ctx.fillStyle = this._props.color;
        ctx.fillRect(this._props.position.x, this._props.position.y, this._props.size, this._props.size);
        this._prevState = JSON.parse(JSON.stringify(this._props));
    }
    clear() {
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
    rotate(pos) {
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
    constructor(props) {
        super(props);
        this._isDirty = false;
        // this._props.id = uuid();
        this._props.id = "c" + Math.random(); //임시
        this._childrens = new Array();
    }
    draw() {
        this._childrens.forEach(childern => {
            childern.draw();
        });
    }
    clear() {
        this._childrens.forEach(children => {
            children.clear();
        });
    }
    rotate(pos) {
        this._childrens.forEach(children => children.rotate(pos));
    }
    getChildrens() {
        return this._childrens;
    }
    //props 로 넣어비릴지말지 고민
    isDirty() {
        return this._isDirty;
    }
    setDirty(dirty) {
        this._isDirty = dirty;
    }
    addShape(shape) {
        this._childrens.push(shape);
    }
    removeShape(shape) {
        this._childrens = this._childrens.filter(children => (children.getProperty("id") != shape.getProperty("id")));
    }
}
export { AbDrawable, Shape, Rect, Container };
