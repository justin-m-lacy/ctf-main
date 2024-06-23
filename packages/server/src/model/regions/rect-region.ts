import { TPoint } from '@/engine/data/geom';
import { IRegion } from './iregion';

export class RectRegion implements IRegion {

    /**
     * x,y in RectRegion is the min-coordinate point, but in Matter.js it is
     * the center point.
     */
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

    toPolygon(): TPoint[] {
        return [

            { x: this.x, y: this.y },

            { x: this.x + this.width, y: this.y },

            { x: this.x + this.width, y: this.y + this.height },

            { x: this.x, y: this.y + this.height }
        ]
    }
    contains(pt: TPoint): boolean {

        return pt.x >= this.x && pt.y >= this.y && pt.x <= this.x + this.width && pt.y <= this.y + this.height;
    }
    getArea(): number { return this.width * this.height; }

    randPoint(out?: TPoint): TPoint {

        if (out) {

            out.x = this.x + Math.random() * this.width;
            out.y = this.y + Math.random() * this.height;
        } else {

            out = { x: this.x + Math.random() * this.width, y: this.y + Math.random() * this.height };
        }
        return out;

    }
    center(out?: TPoint): TPoint {

        if (out) {
            out.x = this.x + this.width / 2;
            out.y = this.y + this.height / 2;
            return out;
        } else {
            return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
        }
    }

    toString() {
        return `rect x:${this.x} y:${this.y} w:${this.width} h:${this.height}`;
    }
}