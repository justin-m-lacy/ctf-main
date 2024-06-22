import { Component } from 'gibbon.js';
import { clampToPi } from 'gibbon.js/src/utils/geom';
import { Container, DisplayObject } from 'pixi.js';

/**
 * Match actor's angle.
 */
export class MatchAngle extends Component<Container> {

    /**
     * Clips with angles being offset.
     */
    private readonly children: DisplayObject[] = [];

    /**
     * Approx time in seconds to reach angle.
     * Not an exact time. Motion towards goal
     * should be something like an inverse exponential.
     */
    public easeTime: number = 0;

    /**
     * 
     * @param clip - The display object to offset.
     * @param offset - offset angle in radians.
     */
    constructor(child?: DisplayObject) {
        super();

        if (child) {
            this.children.push(child);
        }
    }

    init() {
        const a = this.rotation;

        for (let i = this.children.length - 1; i >= 0; i--) {
            this.children[i].rotation = a;
        }

    }

    public addChild(clip: DisplayObject) {
        this.children.push(clip);
        clip.rotation = this.rotation;
    }

    update(time: number) {
        const dest = this.rotation;
        if (this.easeTime > 0) {


            const pct = time / this.easeTime;

            for (let i = this.children.length - 1; i >= 0; i--) {
                this.children[i].rotation += pct * clampToPi(dest - this.children[i].rotation);
            }

        } else {
            for (let i = this.children.length - 1; i >= 0; i--) {
                this.children[i].rotation = dest;
            }
        }
    }

    onDestroy() {
        this.children.length = 0;
    }
}