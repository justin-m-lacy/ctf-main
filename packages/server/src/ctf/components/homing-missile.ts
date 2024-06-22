import { Component } from '../../engine/component';
import type { TPoint } from '../../engine/data/geom';
import { CtfMatch } from '../ctf-match';
import type { BulletSchema } from '../../model/schema/bullet-schema';
import Mover from '../../engine/components/mover';

export class HomingMissile extends Component<CtfMatch> {

    private targ: TPoint | null = null;
    private ignoreTeam?: string;

    /**
     * Can't target players further than this distance.
     */
    private targetDist: number = 2000;
    private maxTarg2: number = 0;

    private schema: BulletSchema;

    private accel: number = 1000;

    private mover!: Mover;

    constructor(schema: BulletSchema, myTeam?: string) {
        super();

        this.schema = schema;
        this.ignoreTeam = myTeam;

    }

    init() {
        super.init();
        this.maxTarg2 = this.targetDist * this.targetDist;

        this.mover = this.require(Mover);
        this.mover.velocity.set(0, 0);
        this.mover.accelMax = this.accel;
        this.mover.accel.set(
            this.accel * Math.cos(this.schema.angle),
            this.accel * Math.sin(this.schema.angle)
        );


    }

    update() {

        if (!this.targ) {

            this.targ = this.game.findTarget(this.position, this.maxTarg2, this.ignoreTeam)?.pos ?? null;

            if (this.targ) {
                this.seek();
            }

        } else {
            this.seek()
        }
        this.schema.dest.set(this.position.x, this.position.y);

    }

    private seek() {
        const pos = this.position;

        const dx = this.targ!.x - pos.x;
        const dy = this.targ!.y - pos.y;

        let d = Math.sqrt(dx * dx + dy * dy);

        if (d > 0) {
            d = this.accel / d;
            this.mover.accel.set(d * dx, d * dy);
        }

    }


}