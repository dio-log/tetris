// import 'block.ts';
import { Shape, Container } from './drawable.js';

class Renderer {
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;

    private _containers: Array<Container> = new Array();

    private _enableAutoRender: boolean = true;

    constructor(canvasId: string) {
        const elem = document.getElementById(canvasId);
        if (!elem)
            throw new Error("Connot found Element");

        if (!(elem instanceof HTMLCanvasElement))
            throw new Error("Element is not Canvas");

        this._canvas = elem;
        const ctx = this._canvas.getContext("2d");
        if (!ctx) throw new Error("Context is Null");

        this._ctx = ctx;

        if (!this._enableAutoRender) return;

        this._renderLoop = this._renderLoop.bind(this);
        requestAnimationFrame(this._renderLoop);
    }

    addShapes(containerId: string, ...shapes: Array<Shape>): void {
        const found = this._containers.find(container => container.getProperty("id") == containerId);
        if (!found) throw new Error("Cannot found Container");

        shapes.forEach(shape => {
            shape.setProperty("ctx", this._ctx);
            found.addShape(shape);
        });
    }
    addContainer(containter: Container): void {
        containter.getChildrens().forEach(children => children.setProperty("ctx", this._ctx));
        this._containers.push(containter);
    }

    findContainerById(id: string) {

    }

    clear(id: string) {

    }

    update(): void {
        this._containers.forEach(container => {
            container.clear();
            container.draw();
        });
    }

    private _renderLoop(): void {
        this.update();
        requestAnimationFrame(this._renderLoop);
    }

}

export { Renderer };