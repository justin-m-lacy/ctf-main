import { Schema, type } from '@colyseus/schema';
import { PointSchema } from './data/point-schema';
import { SubclassOpts } from '../../utils/types';
import { TPoint } from 'src/engine/data/geom';
import { ShotType, ShotEffect } from './types';
import { Point } from '../../engine/data/geom';

export class BulletSchema extends Schema {

    @type("uint8") type: ShotType = ShotType.basic;

    @type("string") id: string = '';

    /**
     * Owning player of bullet.
     */
    @type("string") player: string = '';

    /**
     * Radius of bullet.
     */
    @type("number") radius: number = 6;

    @type("number") speed: number = 400;

    /**
     * Total time bullet will last.
     * Set on bullet creation based on distance.
     */
    @type("number") time: number = 0;

    /**
     * Destination of bullet. Used by client to determine
     * local approximation of angle, distance.
     */
    @type(PointSchema) dest: PointSchema = new PointSchema();

    /**
     * Starting location. Clients will simulate start at shooter's location.
     */
    pos: Point;

    /**
     * Damage power of direct hit.
     */
    power: number = 0;

    /**
     * Effect when bullet is destroyed.
     */
    effect: ShotEffect = ShotEffect.blast;

    /**
     * Radius of any resulting blast.
     */
    blast?: number = 0;

    /**
     * Owning team of bullet.
     */
    team: string = '';

    /**
     * Explosion timer.
     */
    timer: number = 0;

    /**
     * Direction of the bullet in radians.
     * Bullets assumed to be symmetrical
     * so the rotation of the clip itself
     * doesn't matter.
     */
    angle: number = 0;

    constructor(props: Omit<Partial<BulletSchema>, keyof Schema | 'pos'> & { dest: TPoint, pos: TPoint }) {
        super();

        this.dest?.set(props.dest.x, props.dest.y);

        this.pos = new Point(props.pos.x, props.pos.y);

        let k: keyof SubclassOpts<BulletSchema, Schema>;
        for (k in props) {

            const v = props[k];
            if (v) {
                if (typeof v === 'object') {
                    continue;
                } else {
                    // @ts-ignore
                    this[k] = v;
                }
            }
        }

    }

}