import { Component } from 'gibbon.js';
import { Container } from 'pixi.js';

export class AngleBob extends Component<Container> {


    private timer: number = 0;
    private minA: number;
    private maxA: number;

    private freq: number = 4;

    /**
     * 
     * @param minA 
     * @param max - If max angle is omitted, maxAngle is set
     * to negative of minA.
     */
    constructor(minA: number, maxA?: number) {

        super();

        this.minA = minA;
        this.maxA = maxA ?? -this.minA;

    }

    update(delta: number) {

        this.timer += delta;
        this.rotation = 0.5 * this.minA + (this.maxA - 0.5 * this.minA) * Math.cos(this.freq * this.timer);
    }

}