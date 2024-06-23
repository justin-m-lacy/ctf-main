import { TPoint } from '@/engine/data/geom';
import { IRegion } from "./iregion";

/**
 * Multiple regions.
 */
export class RegionGroup implements IRegion {

    readonly regions: IRegion[];

    constructor(regions: IRegion[]) {

        this.regions = regions;
    }

    /**
     * Contains for Point Region accepts anything within a small radius
     * of the point itself.
     * @param pt 
     */
    contains(pt: TPoint): boolean {

        for (let i = this.regions.length - 1; i >= 0; i--) {
            if (this.regions[i].contains(pt)) return true;
        }
        return false;
    }

    /**
     * 
     * Area returns 1 since an area of 0 might be misleading.
     */
    getArea(): number {
        return 1;
    }

    /**
     * Function not safely applicable to a polygon group.
     * @returns 
     */
    toPolygon(): TPoint[] {
        /// not really applicable.
        return this.regions[0].toPolygon();

    }

    randPoint(out?: TPoint): TPoint {

        const val = out ?? { x: 0, y: 0 };
        if (this.regions.length > 0) {

            this.regions[Math.floor(Math.random() * this.regions.length)].randPoint(val);

        }
        return val;

    }
    center(out?: TPoint): TPoint {

        /// don't care right now.
        return out ?? { x: 0, y: 0 };

    }


}