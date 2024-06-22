import { TPoint, Point } from '../../../engine/data/geom';
import { Component } from '../../../engine/component';
/**
 * Move actor while continually approaching target speed.
 */
export class MoveSpeed extends Component {


    private readonly targetV: TPoint = new Point();
    private readonly vel: TPoint;

    /**
     * To to reach target velocity.
     */
    private time: number = 0.8;

    constructor(vx: number = 0, vy: number = 0) {

        super();

        this.vel = { x: vx, y: vy };

    }

    public setVelocity(vx: number, vy: number) {
        this.vel.x = vx;
        this.vel.y = vy;

    }
    /**
     * Set velocity target.
     * @param vx 
     * @param vy 
     */
    public setVTarget(vx: number, vy: number) {
        this.targetV.x = vx;
        this.targetV.y = vy;
    }

    update(delta: number) {

        this.vel.x += (this.targetV.x - this.vel.x) * delta / this.time;
        this.vel.y += (this.targetV.y - this.vel.y) * delta / this.time;

        const pos = this.position;

        pos.x += this.vel.x * delta;
        pos.y += this.vel.y * delta;



    }

}