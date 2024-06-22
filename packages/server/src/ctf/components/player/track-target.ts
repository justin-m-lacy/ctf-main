import { Component } from '../../../engine/component';
import { TPoint } from '../../../engine/data/geom';
import { Driver } from './driver';

export class TrackTarget extends Component {

    private target: TPoint;

    private driver!: Driver;

    /**
     * Target is stored and actively tracked.
     * @param target 
     */
    constructor(target: TPoint) {

        super();

        this.target = target;

    }

    init() {

        this.driver = this.get(Driver)!;

    }

    update() {
        this.driver.updateDest(this.target);
    }

}