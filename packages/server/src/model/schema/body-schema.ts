import { Schema, type } from '@colyseus/schema';
import { BodyShape } from '../matter';
import { PointSchema } from './data/point-schema';
import { TPoint } from '../../engine/data/geom';
import { BodyType } from './types';
export class BodySchema extends Schema {

    @type("uint32") type: BodyType = 0;

    @type("string") id: string = '';

    @type(PointSchema) pos = new PointSchema();

    @type('uint8') shape: BodyShape = BodyShape.circle;

    @type("number") angle: number = 0;

    /**
     * Objects that collide with this object.
     */
    @type("uint32") hitMask: number = 0;

    @type("number") hp: number = 1;

    /**
     * Player who created object.
     */
    @type("string") player?: string;

    /**
     * Owning team of object.
     */
    @type("string") team?: string;

    /**
     * Extent of Body in x and y. The meaning can vary depending on the body's shape.
     * Equal to radius in circles.
     */
    @type(PointSchema) extents: PointSchema = new PointSchema();

    /**
     * Object duration if any.
     */
    @type("number") time: number = 0;

    destructible: boolean = true;

    /**
     * Only valid for circle shapes on server.
     */
    get radius() { return this.extents.x; }
    set radius(v) { this.extents.x = v; }

    constructor(props: Omit<Partial<BodySchema>, 'extents'> & { extents?: TPoint }) {

        super();


        let k: keyof typeof props;
        for (k in props) {

            const v = props[k];
            if (typeof v !== 'object') {
                // @ts-ignore
                this[k] = v;
            }
        }

        if (props.extents) {
            if (typeof props.extents === 'number') {
                this.extents.set(props.extents, props.extents);
            } else {
                this.extents.setTo(props.extents);
            }
        }

    }

}