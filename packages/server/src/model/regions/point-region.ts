import { Point, TPoint } from '@/engine/data/geom';
import { IRegion } from "./iregion";

export class PointRegion implements IRegion {

    readonly point: Point = new Point();

    constructor(pt: TPoint) {

        this.point.set(pt.x, pt.y);

    }

    /**
     * Contains for Point Region accepts anything within a small radius
     * of the point itself.
     * @param pt 
     */
    contains(pt: TPoint): boolean {
        const dx = pt.x - this.point.x;
        const dy = pt.y - this.point.y;
        return dx * dx + dy * dy <= 1;
    }

    /**
     * 
     * Area returns 1 since an area of 0 might be misleading.
     */
    getArea(): number {
        return 1;
    }

    toPolygon(): TPoint[] {
        return [{ x: this.point.x, y: this.point.y }];

    }

    randPoint(out?: TPoint): TPoint {
        if (out) {
            out.x = this.point.x;
            out.y = this.point.y;
            return out;
        }
        return { x: this.point.x, y: this.point.y }

    }
    center(out?: TPoint): TPoint {
        if (out) {
            out.x = this.point.x;
            out.y = this.point.y;
            return out;
        }
        return { x: this.point.x, y: this.point.y }

    }


}