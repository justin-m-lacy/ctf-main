import { TPoint } from '../data/geom';
import { Bodies, IBodyDefinition } from 'matter-js';

/**
 * 
 * @param r 
 * @param arc 
 * @param at 
 * @param angle 
 */
export const makeMatterCone = (r: number, arc: number, at: TPoint, angle: number, opts?: IBodyDefinition) => {

    const pts = [{ x: 0, y: 0 }];

    const num_pts = 8;
    let theta = -arc / 2;
    const dtheta = arc / (num_pts - 1);

    for (let i = 0; i < num_pts; i++) {

        pts.push({ x: r * Math.cos(arc), y: r * Math.sin(arc) });
        theta += dtheta;

    }

    const body = Bodies.fromVertices(at.x, at.y, [pts], opts);
    body.angle = angle;

}