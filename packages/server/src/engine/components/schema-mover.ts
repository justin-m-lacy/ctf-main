import { Component } from "../component";
import { DriverSchema } from '../../model/schema/data/driver-schema';
import { Priorities } from '../../ctf/data/consts';
import { Point } from '../data/geom';
import { IMover } from './mover';


/**
 * A Driver always moves without slipping
 * in the direction of its orientation/angle.
 */
export class SchemaMover extends Component implements IMover {

    get baseSpeed() { return this.schema.baseSpeed; }
    /**
      * @property {number} speedMax - Maximum absolute value of velocity.
      */
    get maxSpeed(): number { return this.schema.maxSpeed; }
    set maxSpeed(v: number) { this.schema.maxSpeed = v; }


    /**
     * @property accel
     */
    get accel(): number { return this.schema.accel; }
    set accel(v: number) {
        if (v > this.schema.maxAccel) v = this.schema.maxAccel;
        else if (v < -this.schema.brakeAccel) v = -this.schema.brakeAccel;
        this.schema.accel = v;
    }


    /**
     * @property {number} accelMax
     */
    get maxAccel() { return this.schema.maxAccel; }
    set maxAccel(v: number) { this.schema.maxAccel = v; }

    /**
     * @property {number} omegaAcc
     */
    get alpha() { return this.schema.alpha; }
    set alpha(v) { this.schema.alpha = v; }

    /**
     * @property {number} omega - angular velocity in radians/frame.
     */
    get omega() { return this.schema.omega; }
    set omega(v) { this.schema.omega = v; }

    /**
     * @property {number} omegaMax
     */
    get maxOmega() { return this.schema.maxOmega; }
    set maxOmega(v) { this.schema.maxOmega = v; }

    /**
     * @property {number}
     */
    get maxAlpha() { return this.schema.maxAlpha; }
    set maxAlpha(v) { this.schema.maxAlpha = v; }

    /**
     * @property  velocity
     */
    get speed() { return this.schema.speed; }
    set speed(v) { this.schema.speed = v; }


    get velocity() {
        //return this.schema.velocity;
        return { x: this.direction.x * this.speed, y: this.direction.y * this.speed }
    }
    /**
     * Setting velocity on mover will only set the component along
     * the axis the mover is facing.
     */
    set velocity(v) {
        //this.schema.velocity.set(v.x, v.y);
        this.schema.speed = v.x * this.direction.x + v.y * this.direction.y;
    }

    readonly schema: DriverSchema;

    /**
     * Most recent motion. Setting does not change
     * the actual velocity.
     */
    public readonly direction: Point = new Point();

    priority = Priorities.Mover;

    constructor(schema: DriverSchema) {
        super();
        this.schema = schema;
    }

    init() {
        const a = this.rotation;
        this.direction.set(Math.cos(a), Math.sin(a));
    }

    /**
     * Force-stop all movement.
     */
    forceStop() {
        this.schema.speed = 0;
        this.schema.omega = 0;
        this.schema.accel = 0;
        this.schema.alpha = 0;
    }

    /**
     * Set acceleration to full brake.
     */
    brake() { this.schema.accel = -this.schema.brakeAccel; }

    update(delta: number) {

        let angle = this.schema.angle;

        this.omega += this.alpha * delta;
        if (Math.abs(this.omega) > this.maxOmega) {
            this.omega = this.omega > 0 ? this.maxOmega : -this.maxOmega;
        }

        angle += this.omega * delta;
        this.rotation = this.schema.angle = angle % (2 * Math.PI);

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        if (this.accel > 0) {
            if (this.accel > this.maxAccel) {
                this.accel = this.maxAccel;
            }
        } else {
            if (this.accel < -this.schema.brakeAccel) {
                this.accel = -this.schema.brakeAccel;
            }
        }

        this.speed += this.accel * delta;
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed
        } else if (this.speed < 0) {
            this.speed = 0;
        }

        this.direction.set(cos, sin);
        if (this.speed > 0) {

            const pos = this.position;
            pos.set(pos.x + cos * this.speed * delta, pos.y + sin * this.speed * delta);
        }

    }

}