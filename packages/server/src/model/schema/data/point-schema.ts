import { Schema, type } from '@colyseus/schema';
import { IPoint, TPoint } from '../../../engine/data/geom';

export class PointSchema extends Schema implements IPoint {

    @type("number") x: number = 0;
    @type("number") y: number = 0;

    constructor(x?: number | TPoint, y?: number) {

        super();

        if (x) {
            if (typeof x === 'number') {
                this.x = x;
            } else {
                this.x = x.x;
                this.y = x.y;
            }
        }
        if (y) {
            this.y = y;
        }

    }

    setTo(to: TPoint): this {
        this.x = to.x;
        this.y = to.y;
        return this;
    }

    set(x: number, y: number): this {
        this.x = x;
        this.y = y;
        return this;
    }

    toString() {
        return `${this.x},${this.y}`;
    }
    /**
     * Get vector from this point towards 'at' point.
     * @param to 
     */
    public vectorTo(to: TPoint) {

        return { x: to.x - this.x, y: to.y - this.y }

    }

    /**
     * Get angle in radians towards the point.
     * @param to 
     * @returns 
     */
    public angleTo(to: TPoint) {
        return Math.atan2(to.y - this.y, to.x - this.x);
    }

}