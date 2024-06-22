import { Component } from 'gibbon.js';


/**
 * Currently unused. Guess explosion size without reference to schema.
 */
export class Explosion extends Component {

    power: number;

    /**
     * time explosion has been active for.
     */
    timer: number;

    private startRadius: number = 2;
    private endRadius: number = 10;

    radius: number;

    private maxTimeSec: number = 3;

    constructor(power: number) {

        super();

        this.power = power;
        this.timer = 0;
        this.radius = this.startRadius;
    }

    update(delta: number) {

        this.timer += delta;
        if (this.timer >= delta) {

            this.actor?.destroy();
            this.radius = this.endRadius;

        } else {
            this.radius = this.startRadius + (this.endRadius - this.startRadius) * (this.timer / this.maxTimeSec);
        }

    }

}