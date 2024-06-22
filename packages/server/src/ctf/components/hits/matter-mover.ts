import { Component } from '../../../engine/component';
import { Body } from 'matter-js';
import { Priorities } from '../../data/consts';

/**
 * Motion controlled by Matter.js
 */
export class MatterMover extends Component {

    private readonly body: Body;

    /**
 * @property  velocity
 */
    get speed() { return this._speed; }
    set speed(v) {
        this._speed = v;
    }

    /**
      * @property {number} speedMax - Maximum absolute value of velocity.
      */
    get maxSpeed(): number { return this._maxSpeed; }
    set maxSpeed(v: number) {
        this._maxSpeed = v;
    }


    /**
     * @property accel
     */
    get accel(): number { return this._accel; }
    set accel(v: number) {
        if (v > this._maxAccel) v = this._maxAccel;
        else if (v < -this.brakeAccel) v = -this.brakeAccel;
        this._accel = v;
    }


    /**
     * @property {number} accelMax
     */
    get maxAccel() { return this._maxAccel; }
    set maxAccel(v: number) { this._maxAccel = v; }

    /**
     * @property {number} omegaAcc
     */
    get alpha() { return this._alpha; }
    set alpha(v) {
        this._alpha = v;
    }

    /**
     * @property {number} omega - angular velocity in radians/frame.
     */
    get omega() { return this._omega; }
    set omega(v) { this._omega = v; }

    /**
     * @property {number} omegaMax
     */
    get maxOmega() { return this._maxOmega; }
    set maxOmega(v) { this._maxOmega = v; }

    /**
     * @property {number}
     */
    get maxAlpha() { return this._maxAlpha; }
    set maxAlpha(v) { this._maxAlpha = v; }



    /**
     * Velocity is always along the orientation.
     */
    private _speed: number = 0;

    /**
     * As the driver only moves in the direction of its
     * orientation, acceleration is only a number.
     */
    private _accel: number = 0;

    private _maxSpeed: number = 4;
    private _maxAccel: number = 1;

    /**
     * Maximum acceleration when braking/opposing velocity.
     * The value is set as a positive value, but will be
     * negative when actually applied to brake.
     */
    brakeAccel: number = 100;

    private _omega: number = 0;
    private _maxOmega: number = 2 * Math.PI / 3;

    private _alpha: number = 0;
    private _maxAlpha: number = Math.PI;

    priority = Priorities.Mover;

    constructor(body: Body) {

        super();
        this.body = body;

    }


    brakeOmega() {

    }

    init() {

    }

    update() {

        const pos = this.body.position;
        this.position.set(pos.x, pos.y);

        this.rotation = this.body.angle;

    }

}