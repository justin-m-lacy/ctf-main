import { TPoint } from '../engine/data/geom';
import { makeCCW, quickDecomp } from 'poly-decomp-es';
import { ConvexRegion } from '../model/regions/convex-region';
import { RegionGroup } from '../model/regions/region-group';
import { IRegion } from '@/model/regions/iregion';
/**
 * Decompose points into a region group or convex polygon.
 * @param points 
 */
export const pointsToRegion = (points: TPoint[]): IRegion => {

    const concave = points.map<[number, number]>(v => [v.x, v.y]);

    makeCCW(concave);

    const polyList = quickDecomp(concave);

    /// Map separate lists of [x,y] poly points into distinct regions
    /// then group into RegionGroup.
    if (polyList.length > 1) {
        return new RegionGroup(
            polyList.map(poly =>
                new ConvexRegion(poly.map(v => ({ x: v[0], y: v[1] })))
            ));

    } else {
        return new ConvexRegion(
            polyList[0].map(v => ({ x: v[0], y: v[1] }))
        );
    }


}