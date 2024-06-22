import { type } from '@colyseus/schema';
import { BodySchema } from './body-schema';
import type { TPoint } from '../../engine/data/geom';
import { BodyType } from './types';

export class BlastSchema extends BodySchema {

    /**
     * Starting radius.
     * NOTE: Matter.js cannot handle objects which start
     * with 0 radius.
     */
    @type("number") startRadius: number = 0;

    @type("number") endRadius: number = 60;

    @type("number") power: number = 90;

    /**
     * Internal explosion timer.
     * NOTE: Schema does NOT ALLOW underscores.
     */
    cTime: number = 0;

    constructor(props: Partial<Omit<BlastSchema, 'pos'>>, pos: TPoint) {

        super(props);

        this.destructible = props.destructible ?? false;

        if (props.endRadius) {
            this.endRadius = props.endRadius;
        }
        if (props.startRadius) {
            this.startRadius = props.startRadius;
        }

        if (this.type === BodyType.none) {
            this.type = BodyType.blast;
        }

        this.time = props?.time ?? 0.5;

        this.pos.setTo(pos);

        this.extents.set(props.startRadius ?? this.startRadius, props.startRadius ?? this.startRadius);

    }

}