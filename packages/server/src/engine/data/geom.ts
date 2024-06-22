export const RadPerDeg = Math.PI / 180;

export const PI_2 = 2 * Math.PI;


export type Polygon = { x: number, y: number }[];

export type Movable = {
    get x(): number;
    get y(): number;
}

export type TPoint = {
    x: number,
    y: number;
}

export type TSize = {
    width: number,
    height: number
}

/**
 * Point without reference to pixi.
 */
export interface IPoint {
    x: number;
    y: number;
    set(x: number, y: number): this;
}

export interface IRectangle {
    x: number,
    y: number,
    width: number,
    height: number,

    contains(pt: TPoint): boolean;
}

export class Rectangle implements IRectangle {

    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

    }
    contains(pt: TPoint) {
        return pt.x >= this.x && pt.x <= this.x + this.width && pt.y >= this.y && pt.y <= this.y + this.height;
    }
    containsPt(pt: IPoint) {
        return pt.x >= this.x && pt.x <= this.x + this.width && pt.y >= this.y && pt.y <= this.y + this.height;
    }

}


/**
 * Simple Point implementation
 */
export class Point implements IPoint {

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    set(x: number = 0, y: number = 0): this {
        this.x = x;
        this.y = y;
        return this;
    }

    toString() {
        return `${this.x},${this.y}`;
    }

}

export const angleToPt = (from: TPoint, angle: number, dist: number) => {

    return {
        x: from.x + Math.cos(angle) * dist,
        y: from.y + Math.sin(angle) * dist
    }

}

/**
 * Clamp angle in [-2*Math.PI,2*Math.PI] to [-Math.PI, Math.PI]
 */
export const clampToPi = (a: number) => {


    a = a % PI_2;

    if (a > Math.PI) {
        a -= PI_2;
    } else if (a < -Math.PI) {
        a += PI_2;

    }

    return a;
}



export const polyToString = (pts: TPoint[]) => {

    return pts.map(v => `${Math.round(v.x)},${Math.round(v.y)}`).join(';');

}

export const stringToPoly = (str: string): TPoint[] => {

    const a = str.split(';');
    if (a.length === 0) {
        return [];
    }
    if (!a[a.length - 1]) {
        /// Empty last element.
        a.pop();
        if (a.length === 0) {
            return [];
        }
    }
    if (!a[0]) {
        /// Empty first element.
        a.shift();
    }

    return a.map(v => {
        const pt = v.split(',');
        return { x: parseInt(pt[0]), y: parseInt(pt[1]) };
    });

}