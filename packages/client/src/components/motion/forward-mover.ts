import { Component, IPoint, TPoint } from 'gibbon.js';
import { Priorities } from '../../priorities';
import { Point } from 'pixi.js';


/**
 * A Driver always moves without slipping
 * in the direction of its orientation/angle.
 * Unused in favor of PlayerLerp
 */
export class ForwardMover extends Component {

    /**
     * @property {number} rotation - wraps actor rotation in radians.
     */
    public get rotation() { return this.actor!.rotation; }
    public set rotation(v) { this.actor!.rotation = v; }

    /**
     * @property  position
     */
    public get position() { return this.actor!.position; }
    public set position(v) { this.actor!.position = v; }

    /**
     * @property  velocity
     */
    public get speed() { return this._speed; }
    public set speed(v) { this._speed = v; }

    /**
      * @property {number} speedMax - Maximum absolute value of velocity.
      */
    public get maxSpeed(): number { return this._maxSpeed; }
    public set maxSpeed(v: number) {
        this._maxSpeed = v;
    }


    /**
     * @property accel
     */
    public get accel(): number { return this._accel; }
    public set accel(v: number) {
        if (v > this._maxAccel) v = this._maxAccel;
        else if (v < -this.brakeAccel) v = -this.brakeAccel;
        this._accel = v;
    }


    /**
     * @property {number} accelMax
     */
    public get maxAccel() { return this._maxAccel; }
    public set maxAccel(v: number) { this._maxAccel = v; }

    /**
     * @property {number} omegaAcc
     */
    public get alpha() { return this._alpha; }
    public set alpha(v) { this._alpha = v; }

    /**
     * @property {number} omega - angular velocity in radians/frame.
     */
    public get omega() { return this._omega; }
    public set omega(v) { this._omega = v; }

    /**
     * @property {number} omegaMax
     */
    public get maxOmega() { return this._maxOmega; }
    public set maxOmega(v) { this._maxOmega = v; }

    /**
     * @property {number}
     */
    public get maxAlpha() { return this._maxAlpha; }
    public set maxAlpha(v) { this._maxAlpha = v; }

    public get velocity(): TPoint {
        throw new Error('Method not implemented.');
    }
    public set velocity(v: TPoint) {
        throw new Error('Method not implemented.');
    }

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
     * Delta movement from current frame.
     */
    readonly deltaPos: IPoint = new Point();

    /**
     * Maximum acceleration when braking/opposing velocity.
     */
    private brakeAccel: number = 100;

    private _omega: number = 0;
    private _maxOmega: number = 2 * Math.PI / 3;

    private _alpha: number = 0;
    private _maxAlpha: number = Math.PI;

    priority = Priorities.Mover;

    /**
     * Last cosine of mover.
     */
    public axisX: number = 1;

    /**
     * Last sine of mover.
     */
    public axisY: number = 0;

    public forceStop() {
        this.accel = 0;
        this.speed = 0;
        this.omega = 0;
        this.alpha = 0;
    }
    /**
     * Set acceleration to full brake.
     */
    public brake() {
        this._accel = -this.brakeAccel;
    }

    update(dt: number) {

        this._omega += this._alpha * dt;
        if (Math.abs(this._omega) > this._maxOmega) {
            this._omega = this._omega > 0 ? this._maxOmega : -this._maxOmega;
        }
        let angle = this.rotation + this._omega * dt;
        this.rotation = angle;

        this.axisX = Math.cos(angle);
        this.axisY = Math.sin(angle);

        this._speed += this._accel * dt;
        if (this._speed > this._maxSpeed) {
            this._speed = this._maxSpeed
        } else if (this._speed < 0) {
            this._speed = 0;
        }

        if (this._speed > 0) {

            this.deltaPos.x = this.axisX * dt * this._speed;
            this.deltaPos.y = this.axisY * this._speed * dt;

            const pos = this.position;
            pos.set(pos.x + this.deltaPos.x, pos.y + this.deltaPos.y);

        } else {
            this.deltaPos.x = 0;
            this.deltaPos.y = 0;
        }

        /// clear impulses.
        this.alpha = 0;
        this.accel = 0;

    }

}