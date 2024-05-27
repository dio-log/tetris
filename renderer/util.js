export { Converter };
class Converter {
    constructor(callback) {
        this._callback = callback;
    }
    convert(source, param) {
        return this._callback(source, param);
    }
}
