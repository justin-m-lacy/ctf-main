import { Component } from 'gibbon.js';

/**
 * Rotate component at constant rate.
 */
export class Rotater extends Component {

    public omega: number;

    constructor(omega: number) {
        super();
        this.omega = omega;

    }
    update(delta: number) {
        this.rotation += this.omega * delta;
    }

}