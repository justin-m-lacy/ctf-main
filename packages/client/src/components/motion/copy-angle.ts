import { Component } from 'gibbon.js';
import { clampToPi } from 'gibbon.js/src/utils/geom';
import { DisplayObject } from 'pixi.js';

/**
 * Keep constant angle relative to Actor clip's parent.
 * (Reverses Actor's angle and adds optional offset)
 */
export class CopyAngle<P extends string, T extends Record<P, number>> extends Component<DisplayObject> {

    /**
     * offset angle in radians.
     */
    //private offset: number;


    /**
     * Source to copy.
     */
    private target: T;

    /**
     * Property holding target angle.
     */
    private prop: P;

    /**
     * Approx time in seconds to reach angle.
     * Not exact time. Motion towards goal
     * should be something like an inverse exponential.
     */
    public easeTime: number = 0;

    private dest!: DisplayObject;

    /**
     * 
     * @param clip - The display object to offset.
     * @param offset - offset angle in radians.
     */
    constructor(target: T, prop: P, dest?: DisplayObject) {
        super();

        this.prop = prop;

        this.target = target;
        //this.offset = offset;
    }

    init() {
        this.dest = this.dest ?? this.clip!;

        this.dest.rotation = this.target[this.prop];
    }

    update(time: number) {

        const a = this.target[this.prop];// + this.offset;

        if (this.easeTime > 0) {

            const delta = clampToPi(a - this.dest.rotation);


            /// delta is percent of target second total.
            this.dest.rotation += (time / this.easeTime) * delta;

        } else {
            this.dest.rotation = a;
        }
    }

}