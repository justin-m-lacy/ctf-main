import { Component, TPoint, IPoint } from 'gibbon.js';
import { Container } from 'pixi.js';
import { ForwardMover } from './../motion/forward-mover';
import { Priorities } from '../../priorities';

export interface IDriver {

    setDest(pt: TPoint, angle?: number): void;
    halt(): void;

}

export type PathTarget = {

    to: IPoint,
    angle: number | null,
}

export class PathFollow extends Component<Container> {

    private readonly path: PathTarget[] = [];

    private nextDest?: PathTarget;
    private nextPt?: TPoint;


    get arriveRadius() { return this._arriveRadius }
    set arriveRadius(v) { this._arriveRadius = v; this._arriveRadius2 = v * v }

    /**
     * Radius at which to attempt to stop.
     * todo: compute from current move velocity and acceleration?
     */
    _arriveRadius: number = 8;


    /**
    * Angle at which to begin slowing rotation.
    */
    _slowAngle: number = 16 * (Math.PI / 180);

    /**
     * Angle close enough to stop rotation.
     */
    _stopAngle: number = 8 * (Math.PI / 180);

    /**
     * Radius which counts as arriving at target point.
     */
    _arriveRadius2: number = 0;

    priority = Priorities.Driver;

    /**
     * Get current destination, if any.
     */
    get dest() { return this.nextDest }

    private mover!: ForwardMover;

    constructor() {

        super();

    }

    init() {

        this.mover = this.require(ForwardMover);

        this._arriveRadius2 = this._arriveRadius * this._arriveRadius;

    }

    onEnable() {
    }

    onDisable() { this.clearPath(); }

    public clearPath() {

        this.path.length = 0;
        this.nextDest = undefined;
        this.nextPt = undefined;
        this.mover.forceStop();
    }

    addPoint(dest: PathTarget) {

        if (this.enabled) {
            if (this.nextDest === undefined) {
                this.nextDest = dest;
                this.nextPt = dest.to;
            } else {
                this.path.push(dest);
            }
        }

    }

    /**
     * Advance to next point.
     */
    private advance() {

        if (this.path.length > 0) {

            this.nextDest = this.path.shift();
            this.nextPt = this.nextDest?.to;

        } else {
            this.nextDest = undefined;
            this.nextPt = undefined;
        }

    }

    update(delta: number) {

        if (!this.nextDest) {
            this.advance();
            if (!this.nextDest) {
                return;
            }
        }

        const curPos = this.position;
        const curAngle = this.rotation;

        const dx = this.nextPt!.x - curPos.x;
        const dy = this.nextPt!.y - curPos.y;

        let d = dx * dx * +dy * dy;


        if (d <= this._arriveRadius2 && this.path.length > 0) {

            this.advance();

        } else {

        }



    }

    private targetAngle(rotation: number) {

        const dA = rotation - this.rotation;

    }

    slowStop() {
    }

}