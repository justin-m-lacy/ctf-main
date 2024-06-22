import { convexPartition, removeHoles } from "poly-partition";
import { Polygon, TPoint } from '../engine/data/geom';


/**
 * Not typical mesh. collection of polygons
 * representing walkable game areas.
 */
export class Mesh {

    /**
     * Holes are made by supplying hit areas.
     * @param polygon 
     * @param holes 
     * @returns 
     */
    static create(polygon: Polygon, holes: Polygon[]): Mesh {

        const parts = removeHoles(polygon, holes);
        return new Mesh(convexPartition(parts));

    }

    private polys: Polygon[];

    constructor(polys: Polygon[]) {

        this.polys = polys;

    }

    public findPath(p1: TPoint, p2: TPoint) {
    }

}