import { Schema, type } from '@colyseus/schema';
import { Rectangle } from '../../../engine/data/geom';

export class RectSchema extends Schema {

    @type("number") x: number = 0;
    @type("number") y: number = 0;
    @type("number") width: number = 0;
    @type("number") height: number = 0;

    constructor(width: number | Rectangle = 0, height: number = 0, x: number = 0, y: number = 0) {

        super();

        if (typeof width === 'object') {

            this.x = width.x;
            this.y = width.y;
            this.width = width.width;
            this.height = width.height;

        } else {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }

    }
}