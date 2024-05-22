import { XY } from "./type.js";

export { OShape };

interface PointsProvider {
    generate(): Array<XY>;
}

class OShape implements PointsProvider {
    generate(): XY[] {
        return [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 10 },
        ];
    }
}
