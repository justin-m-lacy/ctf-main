import { Component } from '../../engine/component';
import Actor from '../../engine/actor';
import { CtfMatch } from '../ctf-match';

/**
 * Turret fires at enemies.
 */
export class Turret extends Component<CtfMatch> {

    /**
     * Targetting distance.
     */
    private targetDist: number = 500;
    private maxDist2: number;

    /**
     * Object being targetted.
     */
    private curTarget: Actor | null = null;

    private team: string;
    get hasTarget() { return this.curTarget != null }

    /**
     * Time between firing.
     */
    private fireTime: number = 5;

    constructor(team: string) {

        super();

        this.team = team;
        this.maxDist2 = this.targetDist * this.targetDist;

    }

    public update(delta: number) {

        if (this.hasTarget) {
            this.checkTarget();
        } else {
            this.game.findTarget(this.position, this.maxDist2, this.team);
        }
    }

    /**
     * Make sure target still valid an in range.
     */
    private checkTarget() {

        if (this.curTarget == null || this.curTarget.isDestroyed) {

            this.curTarget = null;

        } else {

        }

    }

    private endTarget() {
        this.curTarget = null;
    }

}