import { Component } from "../../../engine/component";
import { Point, clampToPi, TPoint, IPoint } from '../../../engine/data/geom';
import { SchemaMover } from "../../../engine/components/schema-mover";
import { Priorities } from '../../data/consts';
import { DriverSchema } from '../../../model/schema/data/driver-schema';
import { rareLog, radToDeg } from '../../../utils/logging';

export type DriveTarget = {

    to: IPoint,
    angle: number | null
}

export class Driver extends Component {

    readonly destPt: Point = new Point();

    /**
     * destination angle in radians.
     */
    private destAngle: number | null = null;

    get stopRadius() { return this._stopRadius }
    set stopRadius(v) { this._stopRadius = v; this._stopRadius2 = v * v }


    get slowRadius() { return this._slowRadius }
    set slowRadius(v) { this._slowRadius = v; this._slowRadius2 = v * v }

    /**
     * Radius at which to attempt to stop.
     * todo: compute from current move velocity and acceleration?
     */
    private _stopRadius: number = 2;

    /**
     * Radius at which actor should slow down.
     */
    private _slowRadius: number = 24;

    private mover!: SchemaMover;

    /**
     * Angle at which to begin slowing rotation.
     */
    private _slowAngle: number = 40 * (Math.PI / 180);

    private _stopAngle: number = 8 * Math.PI / 180;
    /**
     * stop radius squared.
     */
    private _stopRadius2: number = 0;
    /**
     * slow radius squared.
     */
    private _slowRadius2: number = 0;

    priority = Priorities.Driver;

    private schema: DriverSchema;

    constructor(schema: DriverSchema) {
        super();
        this.schema = schema;
    }

    init() {

        this.mover = this.require<SchemaMover>(SchemaMover);
        this.destPt.x = this.position.x;
        this.destPt.y = this.position.y;

        this._stopRadius2 = this._stopRadius * this._stopRadius;

    }

    /**
     * Update destination without recomputing target angles.
     * @param pt
     */
    public updateDest(pt: TPoint) {
        this.destPt.set(pt.x, pt.y);
    }

    public setDest(pt: TPoint, destAngle: number | null = null) {

        this.destPt.x = pt.x;
        this.destPt.y = pt.y;

        if (destAngle) {
            this.destAngle = destAngle;
        } else {

            const curPos = this.position;
            const dx = this.destPt.x - curPos.x;
            const dy = this.destPt.y - curPos.y;

            const d2 = dx * dx + dy * dy;
            if (d2 > 4 && d2 <= this._slowRadius2) {
                this.destAngle = Math.atan2(dy, dx);
            } else {
                this.destAngle = null;
            }


        }


    }

    /**
     * Halt on current point.
     */
    public halt() {
        this.destPt.set(this.position.x, this.position.y);
        this.destAngle = null;
    }

    update(delta: number): void {

        const curPos = this.position;
        const curAngle = this.rotation;

        const dx = this.destPt.x - curPos.x;
        const dy = this.destPt.y - curPos.y;

        const d2 = dx * dx + dy * dy;

        /*let vel_dist = this.mover.speed * delta;
        vel_dist *= vel_dist;*/

        if (d2 < this._stopRadius2) {


            this.mover.brake();
            if (this.destAngle !== null) {
                // rareLog(`arriv dest angle: ${radToDeg(this.destAngle)}`);

                this.targetAngle(this.destAngle);
            } else {
                this.mover.alpha = 0;
                this.mover.omega = 0;
            }

        } else if (d2 < this._slowRadius2) {

            this.calcAcceleration(Math.sqrt(d2), dx, dy,);

            /*if (this.destAngle !== null) {
                // rareLog(`arriv dest angle: ${radToDeg(this.destAngle)}`);

                this.targetAngle(this.destAngle);
            } else {
                this.targetAngle(Math.atan2(dy, dx));
            }*/
            //this.targetAngle(Math.atan2(dy, dx));
            // rareLog(`slow angle: ${radToDeg(Math.atan2(dy, dx))}`);

            //const targetV = this.mover.maxSpeed * (d2 / this._slowRadius2);
            //this.mover.accel = (targetV - this.mover.speed) / 0.1;


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
            this.targetAngle(Math.atan2(dy, dx));

            //this.calcAcceleration(Math.sqrt(d2), dx, dy)

        }


    }

    /**
     * calculate an acceleration taking current velocity into account.
     * @param dx 
     * @param dy 
     * @param d 
     */
    private calcAcceleration(d: number, dx: number, dy: number) {

        const curAngle = this.rotation;

        const speed = this.mover.speed;
        const cos = Math.cos(curAngle);
        const sin = Math.sin(curAngle);

        /// time to arrive at location.
        const time: number = d / (this.mover.maxSpeed);

        /// dx,dy not negated because posfinal-posinitial
        const ax = 2 * (dx - speed * cos * time) / (time * time);
        const ay = 2 * (dy - speed * sin * time) / (time * time);

        this.mover.accel = ax * cos + ay * sin;

        //if (this.destAngle !== null && )
        this.targetAngle(Math.atan2(ay, ax));
        //this.targetAngle(this.destAngle === null ? Math.atan2(ay, ax) : this.destAngle);

    }

    /**
     * 
     * @param dx - dx to destination
     * @param dy - dy to destination
     * @param curAngle - curAngle in radians.
     */
    private targetAngle(destAngle: number) {

        /// Get angle to dest.
        const deltaAngle = clampToPi(destAngle - this.schema.angle);

        //rareLog(`delta: ${radToDeg(deltaAngle)}`);
        //rareLog(`delta: ${radToDeg(destAngle)}`);

        if (Math.abs(deltaAngle) < this._slowAngle) {

            //rareLog(`SLOW turn: ${radToDeg(deltaAngle)}`, 1);

            this.mover.alpha = 0;
            this.mover.omega = deltaAngle / 0.25;

        } else {

            this.mover.alpha = 0;
            this.mover.omega = deltaAngle > 0 ? this.mover.maxOmega : -this.mover.maxOmega;
            //rareLog(`omega: ${radToDeg(this.driver.omega)} alpha: ${radToDeg(this.driver.alpha)}`, 2);
        }

    }


}