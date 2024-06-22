import { Component, TPoint } from 'gibbon.js';
import { Priorities } from '../../priorities';
import { Point } from 'pixi.js';
import { Latency } from '../../net/latency';
import { ClientGame } from '@/client-game';

/**
 * Target point while matching speed.
 */
export class SpeedLerp extends Component<any, ClientGame> {

    priority = Priorities.ServerSync;

    private latency: Latency;

    /**
     * Time to lerp.
     */
    private lerpTime: number = 0;

    /**
     * Time lerp has been active.
     */
    private timer: number = 0;

    private readonly destPt = new Point();

    private startSpeed: number = 0;
    private endSpeed: number = 0;

    private target: { dest: TPoint, speed: number };

    /**
     * base time to add to all lerps in milliseconds.
     * (server updates are staggered at constant rate
     * so lerping can not go under this rate.)
     */
    private updateRate: number = 0;

    constructor(target: { dest: TPoint, speed: number }, latency: Latency, updateRate: number = 0) {

        super();

        this.target = target;

        this.latency = latency;

        this.updateRate = updateRate / 1000;

    }

    onEnable() {
        this.startSpeed = this.target.speed;
        this.checkNewTarget();
    }

    public setDest(pt: TPoint, speed: number) {

        this.lerpTime = this.latency.getDelay() + this.updateRate;

        this.destPt.set(pt.x, pt.y);
        this.endSpeed = speed;

        const pos = this.position;

        const dx = this.destPt.x - pos.x;
        const dy = this.destPt.y - pos.y;

        const reqSpeed = Math.sqrt(dx * dx + dy * dy) / this.lerpTime;

        if (this.endSpeed < reqSpeed) {

            this.endSpeed = reqSpeed;

        } /*else if (this.startSpeed === 0 && this.endSpeed === 0) {

            this.startSpeed = this.schema.motion.maxSpeed;
            this.endSpeed = Math.sqrt(dx * dx + dy * dy) / this.lerpTime;

        }*/

        this.timer = 0;

    }

    override update(dt: number) {

        this.checkNewTarget();


        this.timer += dt;
        const t = this.timer >= this.lerpTime ? 1 : this.timer / this.lerpTime;

        let speed = ((1 - t) * this.startSpeed + t * this.endSpeed) * dt;


        const pos = this.position;
        const dx = this.destPt.x - pos.x;
        const dy = this.destPt.y - pos.y;
        const d = dx * dx + dy * dy;

        if (d <= speed * speed) {

            this.startSpeed = this.endSpeed;
            pos.set(this.destPt.x, this.destPt.y);

            this.checkNewTarget();


        } else {

            speed = speed / Math.sqrt(d);
            pos.set(pos.x + dx * speed, pos.y + dy * speed);

        }



    }

    private checkNewTarget() {

        const targ = this.target.dest;

        if (targ.x !== this.destPt.x || targ.y !== this.destPt.y) {

            this.setDest(targ, this.target.speed);
        } else {
            this.startSpeed = this.target.speed;
        }

    }

}