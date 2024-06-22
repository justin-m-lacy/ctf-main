import { Component } from 'gibbon.js';
import { clampToPi } from 'gibbon.js/src/utils/geom';
import { DisplayObject } from 'pixi.js';

/**
 * Copy target's angle.
 */
export class HoldAngle extends Component<DisplayObject> {

    /**
     * offset angle in radians.
     */
    private offset: number;

    /**
     * Clip with angle being offset.
     */
    private child: DisplayObject;

    /**
     * Approx time in seconds to reach angle.
     * Not exact time. Motion towards goal
     * should be something like an inverse exponential.
     */
    public easeTime: number = 0;

    /**
     * 
     * @param clip - The display object to offset.
     * @param offset - offset angle in radians.
     */
    constructor(child: DisplayObject, offset: number = 0) {
        super();

        this.child = child;
        this.offset = offset;
    }

    init() {
        this.child.rotation = -this.clip!.rotation + this.offset;
    }

    update(time: number) {
        if (this.easeTime > 0) {
            const dest = -this.clip!.rotation + this.offset;
            const delta = clampToPi(dest - this.child.rotation);


            /// delta is percent of target second total.
            this.child.rotation += (time / this.easeTime) * delta;

        } else {
            this.child.rotation = -this.clip!.rotation + this.offset;
        }
    }

}