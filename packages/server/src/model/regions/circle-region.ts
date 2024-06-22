import { TPoint } from 'src/engine/data/geom';
import { IRegion } from './iregion';

export class CircleRegion implements IRegion {

    // private since 'center' is a getter of IRegion
    private readonly _center: TPoint = { x: 0, y: 0 };
    readonly radius: number;

    constructor(center: TPoint, radius: number) {

        this._center.x = center.x;
        this._center.y = center.y;
        this.radius = radius;

    }
    toPolygon(): TPoint[] {

        const len = 16;

        const pts: TPoint[] = [];

        const dTheta = 2 * Math.PI / len;
        const r = this.radius;

        let angle = 2 * Math.PI;
        while (angle >= 0) {

            angle -= dTheta;

            pts.push({
                x: this._center.x + r * Math.cos(angle),
                y: this._center.y + r * Math.sin(angle)
            });
        }

        return pts;

    }

    contains(pt: TPoint): boolean {

        const dx: number = pt.x - this._center.x;
        const dy: number = pt.y - this._center.y;

        return (dx * dx + dy * dy <= this.radius * this.radius);

    }
    getArea(): number {
        return Math.PI * this.radius * this.radius;
    }

    randPoint(out?: TPoint): TPoint {

        /// Note: not an even distribution.
        const r = Math.random() * this.radius;
        const a: number = 2 * Math.random() * Math.PI;
        if (out) {
            out.x = r * Math.cos(a);
            out.y = r * Math.sin(a);
        } else {
            out = { x: r * Math.cos(a), y: r * Math.sin(a) };
        }
        return out;

    }

    center(out?: TPoint): TPoint {
        if (out) {
            out.x = this._center.x;
            out.y = this._center.y;
            return out;
        } else {
            return { x: this._center.x, y: this._center.y };
        }
    }

}