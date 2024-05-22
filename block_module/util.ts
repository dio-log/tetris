export { Converter };

class Converter<S, R> {
    protected _callback: (source: S, param?: any) => R;

    constructor(callback: Converter<S, R>["_callback"]) {
        this._callback = callback;
    }

    convert(source: S, param?: any): R {
        return this._callback(source, param);
    }
}