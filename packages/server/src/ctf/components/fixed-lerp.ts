import { IPoint, Point, TPoint } from '../../engine/data/geom';
import { Component } from '../../engine/component';
import { Priorities } from "../data/consts";


type TMovable = {
    pos: IPoint;
    angle?: number;
}


/**
 * Lerp limited by speed. The lerp value does not affect
 * any of the actor's values.
 * The value must be used manually.
 */
export class FixedLerp extends Component {

    /**
     * Current value of the lerp.
     */
    public readonly value: Point = new Point();

    /**
     * Target position.
     */
    private readonly _target: Point = new Point();

    get target() {
        return this._target;
    }
    set target(p: TPoint) {
        this._target.set(p.x, p.y);
    }

    private maxSpeed: number;

    priority = Priorities.PostPlayer;


    constructor(maxSpeed: number, target?: TPoint) {

        super();

        this.maxSpeed = maxSpeed;

        if (target) { this._target.set(target.x, target.y); }

    }

    init() { }

    override update(dt: number) {

        const dest = this._target;
        const pos = this.value;

        let maxD = this.maxSpeed * dt;
        const dx = dest.x - pos.x;
        const dy = dest.y - pos.y;

        const d2 = dx * dx + dy * dy;
        if (d2 <= maxD * maxD) {
            pos.set(dest.x, dest.y);
        } else {

            maxD = maxD / Math.sqrt(d2);
            pos.set(pos.x + dx * maxD, pos.y + dy * maxD);

        }

    }


}