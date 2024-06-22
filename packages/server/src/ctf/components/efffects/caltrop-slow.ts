import { CtfMatch } from 'src/ctf/ctf-match';
import { Component } from '../../../engine/component';
import { SchemaMover } from '../../../engine/components/schema-mover';

/**
 * Slows target by a small amount.
 */
export class CaltropSlow extends Component<CtfMatch> {

    private readonly percent = -0.2;

    private bonusSpeed: number = 0;

    private mover!: SchemaMover;

    private timer: number = 0;



    init() {
        super.init();
        this.mover = this.get(SchemaMover)!;
    }

    start(duration: number) {

        if (this.timer <= 0) {
            this.bonusSpeed = this.percent * this.mover.baseSpeed;
            this.mover.maxSpeed += this.bonusSpeed;
        } else if (duration > this.timer) {

            /// already running.
            this.timer = duration;

        }

    }

    update(delta: number) {
        this.timer -= delta;
        if (this.timer <= 0) {
            this.end();
        }

    }
    end() {
        this.timer = 0;
        if (!this.isDestroyed) {

            this.mover.maxSpeed -= this.bonusSpeed;
            this.destroy();
        }
    }

}