import { TPoint } from '../../engine/data/geom';

export interface IRegion {

    /**
     * True if region contains point.
     * @param pt 
     */
    contains(pt: TPoint): boolean;

    /**
     * Get the points of a polygon that approximate
     * the region.
     */
    toPolygon(): TPoint[];

    /**
     * Get approximate size of region.
     * Is not necessarily exact.
     */
    //getArea(): number;

    /**
     * Return random point within region.
     * @param out 
     */
    randPoint(out?: TPoint): TPoint;

    /**
     * Return approximate center of region.
     * @param out 
     */
    center(out?: TPoint): TPoint;

}