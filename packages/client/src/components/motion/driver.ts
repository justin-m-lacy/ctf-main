import { IPoint, Component, TPoint } from 'gibbon.js';
import { Point } from 'pixi.js';
import { ForwardMover } from '@components/motion/forward-mover';
import { Priorities } from '@/priorities';
import { clampToPi } from 'gibbon.js/src/utils/geom';


export class Driver extends Component {

    private readonly destPt: IPoint = new Point();

    /**
     * destination angle in radians.
     */
    private destAngle?: number;

    public get stopRadius() { return this._stopRadius }
    public set stopRadius(v) { this._stopRadius = v; this._stopRadius2 = v * v }


    public get slowRadius() { return this._slowRadius }
    public set slowRadius(v) { this._slowRadius = v; this._slowRadius2 = v * v }

    /**
     * Radius at which to attempt to stop.
     * todo: compute from current move velocity and acceleration?
     */
    private _stopRadius: number = 2;

    /**
     * Radius at which actor should slow down.
     */
    private _slowRadius: number = 24;

    private mover!: ForwardMover;

    /**
     * Angle at which to begin slowing rotation.
     */
    private _slowAngle: number = 16 * (Math.PI / 180);

    /**
     * Angle close enough to stop rotation.
     */
    private _stopAngle: number = 8 * (Math.PI / 180);

    /**
     * stop radius squared.
     */
    private _stopRadius2: number = 0;
    /**
     * slow radius squared.
     */
    private _slowRadius2: number = 0;

    priority = Priorities.Driver;

    init() {

        this.mover = this.require<ForwardMover>(ForwardMover);
        this.destPt.x = this.position.x;
        this.destPt.y = this.position.y;

        this._stopRadius2 = this._stopRadius * this._stopRadius;

        this.enabled = false;

    }

    public setDest(pt: TPoint, destAngle?: number) {

        this.destPt.x = pt.x;
        this.destPt.y = pt.y;

        const curPos = this.position;
        const dx = this.destPt.x - curPos.x;
        const dy = this.destPt.y - curPos.y;

        const d2 = dx * dx + dy * dy;
        if (d2 === 0) {

            this.destAngle = destAngle;

        } else if (dx * dx + dy * dy < this._slowRadius2) {
            this.destAngle = destAngle ?? Math.atan2(dy, dx);
        } else {
            this.destAngle = destAngle;
        }

    }

    /**
     * Halt on current point.
     */
    public halt() {
        this.destPt.set(this.position.x, this.position.y);
        this.destAngle = undefined;
    }

    update(delta: number): void {

        const curPos = this.position;
        const curAngle = this.rotation;

        const dx = this.destPt.x - curPos.x;
        const dy = this.destPt.y - curPos.y;

        const d = dx * dx + dy * dy;

        let vel_dist = this.mover.speed * delta;
        vel_dist *= vel_dist;

        if (d < this._stopRadius2 + vel_dist) {

            this.mover.brake();

        } else if (d < this._slowRadius2 + vel_dist) {

            /// (TargV - V) / 0.4 sec
            const targetV = this.mover.maxSpeed * (Math.sqrt(d) / this._slowRadius);
            this.mover.accel = (targetV - this.mover.speed) / 0.1;


        } else {

            const cos = Math.cos(curAngle);
            const sin = Math.sin(curAngle);

            const dot = cos * dx + sin * dy;

            if (dot > 0) {

                this.mover.accel = this.mover.maxAccel;

            } else {
                /// must slow down to turn?
                //rareLog("turn braking", 1);
                this.mover.brake();

            }

        }

        if (this.destAngle || d > this._stopRadius2) {
            this.targetAngle(dx, dy, curAngle);
        } else {
            this.mover.alpha = 0;
            this.mover.omega = 0;
        }


    }

    /**
     * 
     * @param dx - dx to destination
     * @param dy - dy to destination
     * @param curAngle - curAngle in radians.
     */
    private targetAngle(dx: number, dy: number, curAngle: number) {

        let destAngle = this.destAngle ?? Math.atan2(dy, dx);

        /// Get angle to dest.
        const deltaAngle = clampToPi(destAngle - curAngle);

        //rareLog(`dest angle: ${radToDeg(Math.atan2(dy, dx))}  My Angle: ${radToDeg(angle)}`, 20);

        if (Math.abs(deltaAngle) < this._stopAngle) {

            this.mover.alpha = 0;
            this.mover.omega = 0;

        } else if (Math.abs(deltaAngle) < this._slowAngle) {

            //rareLog(`SLOW turn: ${radToDeg(deltaAngle)}`, 1);

            this.mover.alpha = 0;
            this.mover.omega = 2 * deltaAngle;

        } else {

            this.mover.alpha = 0;
            this.mover.omega = deltaAngle > 0 ? this.mover.maxOmega : -this.mover.maxOmega;
            //rareLog(`omega: ${radToDeg(this.driver.omega)} alpha: ${radToDeg(this.driver.alpha)}`, 2);
        }

    }


}