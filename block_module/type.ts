export{ XY, Predicate };

type XY = {x: number, y: number};

type Predicate<T> = (param: T) => boolean;