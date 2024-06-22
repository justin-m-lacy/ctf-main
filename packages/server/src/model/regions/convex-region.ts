import { Encoder } from 'src/engine/data/encodable';
import { IRegion } from './iregion';
import { Encodable } from '../../engine/data/encodable';
import { TPoint } from 'src/engine/data/geom';


export class ConvexRegion implements IRegion, Encoder<ConvexRegion>, Encodable {

    readonly origin: TPoint;

    private readonly points: TPoint[];


    /**
     * 
     * @param pts - point locations relative to origin.
     * @param origin 
     */
    constructor(pts: TPoint[], origin?: TPoint) {
        this.points = pts;
        this.origin = origin ?? { x: 0, y: 0 }

        if (pts.length === 0) {
            throw new Error(`Empty Convex region size.`);
        }

    }

    /**
     * Encode as originX,originY,p0x,p0y,p1x,p1y,...etc
     * @returns 
     */
    encode(): string {
        return `${this.origin.x},${this.origin.y}` + this.points.map(v => `${v.x},${v.y}`).join(',');

    }

    center(out?: TPoint): TPoint {
        if (out) {
            out.x = this.origin.x;
            out.y = this.origin.y;
            return out;
        }
        return this.origin;
    }

    contains(pt: TPoint): boolean {

        const len = this.points.length;
        if (len <= 1) {
            if (len === 0) return false;
            return pt.x === this.points[0].x && pt.y === this.points[1].y;
        }

        let prev = this.points[1];
        let cur = this.points[0];

        /// deltas of current polygon side being considered.
        let dx = cur.x - prev.x, dy = cur.y - prev.y;

        /// Sign that cross product test point should always make
        /// with length of the region.
        let sign = (pt.x - prev.x) * dy - (pt.y - prev.y) * dx;

        prev = cur;

        let cross;

        for (let i = this.points.length - 1; i > 0; i--) {

            cur = this.points[i];
            dx = cur.x - prev.x;
            dy = cur.y - prev.y;

            cross = (pt.x - prev.x) * dy - (pt.y - prev.y) * dx;
            if (sign < 0 && cross > 0 || sign > 0 && cross < 0) {
                return false;
            }

            prev = cur;

        }

        return true;

    }

    toPolygon(): TPoint[] {
        return this.points;
    }

    /// t(i)*p(i) where sum( t(i)) = 1
    randPoint(out?: TPoint): TPoint {

        let x: number = this.origin.x,
            y: number = this.origin.y;

        /// todo?: start at random index to prevent weighting.
        const len = this.points.length
        let sum = 1, t;
        for (let i = len - 1; i > 1; i--) {

            t = sum * Math.random();
            sum -= t;
            x += t * this.points[i].x;
            y += t * this.points[i].y;

        }
        x += sum * this.points[0].x;
        y += sum * this.points[1].y;

        if (out) {

            out.x = x;
            out.y = y;

            return out;
        } else {

            return {
                x: x,
                y: y
            }
        }

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

        return new ConvexRegion(points, origin);
    }



}