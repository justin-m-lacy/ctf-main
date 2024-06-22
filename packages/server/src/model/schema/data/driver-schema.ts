import { Schema, type } from '@colyseus/schema';
import { SubclassOpts } from '../../../utils/types';
import { PointSchema } from './point-schema';

/**
 * Driver always moves in the direction it's facing.
 */
export class DriverSchema extends Schema {

    @type("number") angle: number = 0;

    @type(PointSchema) velocity: PointSchema = new PointSchema();

    @type("number") accel: number = 0;

    @type("number") speed: number = 0;

    @type("number") maxSpeed: number = 50;

    @type("number") maxAccel: number = 50;

    /**
     * Maximum acceleration when braking/opposing velocity.
     * The value is set as a positive value, but will be
     * negative when actually applied to brake.
     */
    @type("number") brakeAccel: number = 200;

    @type("number") omega: number = 0;

    @type("number") maxOmega: number = 0.9 * Math.PI;

    /**
     * Angular acceleration.
     */
    @type("number") alpha: number = 0;

    /**
     * Maximum angular acceleration.
     */
    @type("number") maxAlpha: number = Math.PI;


    /**
     * Base max speed without modifiers applied.
     */
    baseSpeed: number = 50;

    constructor(props?: SubclassOpts<Omit<DriverSchema, 'dest' | 'velocity'>, Schema>) {

        super(props);

        if (props) {
            let k: keyof Omit<DriverSchema, keyof Schema | 'dest' | 'velocity'>;
            for (k in props) {

                const v = props[k];
                if (v) {
                    this[k] = v;
                }


            }
        }
        this.baseSpeed = this.maxSpeed;

    }

}