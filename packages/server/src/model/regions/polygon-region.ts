import { TPoint } from '@/engine/data/geom';
import { IRegion } from './iregion';

/**
 * @todo: implement decomposition for IRegion interface.
 */
export class PolygonRegion implements IRegion {

    readonly origin: TPoint;

    points: TPoint[];

    constructor(pts: TPoint[], origin?: TPoint) {
        this.points = pts;
        this.origin = origin ?? { x: 0, y: 0 };

    }

    randPoint(out?: TPoint): TPoint {
        throw new Error("Method not implemented.");
    }
    center(out?: TPoint): TPoint {
        return this.origin;
    }

    /**
 * Encode as originX,originY,p0x,p0y,p1x,p1y,...etc
 * @returns 
 */
    encode(): string {
        return `${this.origin.x},${this.origin.y}` + this.points.map(v => `${v.x},${v.y}`).join(',');

    }


    contains(pt: TPoint): boolean {
        throw new Error('Method not implemented.');
    }
    toPolygon(): TPoint[] {
        return this.points;
    }

    static decode(data: string) {

        /// values are single x or y values, not points.
        /// each pair of values: ( values[i], values[i+1]) is a point.
        const values = data.split(',');
        const len = values.length;
        if (len % 2 !== 0) {
            throw new Error(`ConvexRegion.decode(): Invalid coordinate pairs: ${data}`)
        }

        if (len < 4) {
            throw new Error(`ConvexRegion.decode(): Insufficient region size: ${data}`);
        }
        const origin = {
            x: parseFloat(values[0]),
            y: parseFloat(values[1])
        }

        const points: TPoint[] = [];
        for (let i = 2; i < len; i += 2) {

            points.push({
                x: parseFloat(values[i]),
                y: parseFloat(values[i + 1])
            })
        }

        return new PolygonRegion(points, origin);
    }
}