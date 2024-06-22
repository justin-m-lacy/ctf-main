import { Component, TPoint } from 'gibbon.js';
import { Priorities } from '../../priorities';
import { Point } from 'pixi.js';
import { Latency } from '../../net/latency';
import { ClientGame } from '@/client-game';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';

import { radToDeg } from '../../../../server/src/utils/logging';
import { clampToPi } from '@/utils/geom';

export class PlayerLerp extends Component<any, ClientGame> {

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

    private startAngle: number = 0;
    private destAngle: number = 0;

    private lerping: boolean = false;

    private schema: PlayerSchema;
    private startSpeed: number = 0;
    private endSpeed: number = 0;

    /**
     * base time to add to all lerps in milliseconds.
     * (server updates are staggered at constant rate
     * so lerping can not go under this rate.)
     */
    private updateRate: number = 0;

    constructor(schema: PlayerSchema, latency: Latency, updateRate: number = 0) {

        super();

        this.schema = schema;

        this.latency = latency;

        this.updateRate = updateRate / 1000;

    }

    init() {
        super.init?.();
        this.reset();

    }

    public reset() {

        this.destPt.set(this.schema.pos.x, this.schema.pos.y);
        this.destAngle = this.startAngle = this.schema.angle;
        this.lerping = false;

    }

    onDisable() { this.stop(); }

    /**
     * Stop any lerping.
     */
    public stop() {
        this.lerping = false;
    }


    onEnable() {

        this.startSpeed = this.schema.motion.speed;
        this.startAngle = this.destAngle = this.schema.angle;

        this.lerping = false;
        this.checkNewTarget();
    }


    /**
     * Set target for lerp.
     * @param pt 
     * @param angle 
     * @param speed 
     */
    private setTarget(pt: TPoint, angle: number, speed: number) {

        this.lerpTime = this.latency.getDelay() + this.updateRate;

        this.destPt.set(pt.x, pt.y);
        this.endSpeed = speed;

        this.startAngle = this.rotation;

        const delta = clampToPi(angle - this.startAngle);
        this.destAngle = this.startAngle + delta;
        //this.destAngle = angle;


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


        this.lerping = true;

    }

    public setPosition(pt: TPoint) {

        this.lerping = false;

    }

    override update(dt: number) {

        this.checkNewTarget();
        if (this.lerping === false) {
            this.rotation += Math.max(3 * dt, 1) * clampToPi(this.schema.angle - this.rotation);
            return;
        }


        this.timer += dt;
        const t = this.timer >= this.lerpTime ? 1 : this.timer / this.lerpTime;

        let moveDist = this.endSpeed * dt;
        //((1 - t) * this.schema.motion.speed + t * this.endSpeed) * dt;


        const pos = this.position;
        const dx = this.destPt.x - pos.x;
        const dy = this.destPt.y - pos.y;
        const d = dx * dx + dy * dy;


        this.rotation = this.startAngle * (1 - t) + t * this.destAngle;
        if (d <= moveDist * moveDist) {

            this.startSpeed = this.endSpeed;
            pos.set(this.destPt.x, this.destPt.y);

            // this.rotation = this.destAngle;
            //console.log(`STOP ANGL: ${radToDeg(this.destAngle)}`);

            this.lerping = false;
            this.checkNewTarget();


        } else {


            moveDist = moveDist / Math.sqrt(d);
            pos.set(pos.x + dx * moveDist, pos.y + dy * moveDist);

        }



    }

    private checkNewTarget() {

        const targ = this.schema.pos;

        if (targ.x !== this.destPt.x || targ.y !== this.destPt.y || this.schema.angle !== this.destAngle) {

            this.setTarget(targ, this.schema.angle, this.schema.motion.speed);
        }

    }


}