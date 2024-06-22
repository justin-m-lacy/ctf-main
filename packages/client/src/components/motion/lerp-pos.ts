import { Priorities } from '@/priorities';
import { Component, TPoint } from 'gibbon.js';
import { Point } from 'pixi.js';


export class LerpPos extends Component {

    /**
     * Point being moved toward dest point.
     * Defaults to position.
     */
    private pos?: Point;
    private readonly dest: TPoint;

    priority = Priorities.ServerSync;

    /**
     * 
     * @param dest - lerp destination.
     * @param pos - point being moved. defaults to position.
     */
    constructor(dest: TPoint, pos?: Point) {

        super();
        this.dest = dest;

        this.pos = pos;


    }

    init() {

        if (!this.pos) this.pos = this.position;
    }

    update(delta: number) {
        const pos = this.pos!;

        const dx = this.dest.x - pos.x;
        const dy = this.dest.y - pos.y;

        const d = dx * dx + dy * dy;

        if (d > 0) {

            let t = delta / (Math.sqrt(d) * (0.06 / 100));
            if (t > 1) t = 1;
            pos.set(pos.x + dx * t, pos.y + dy * t);
        }

    }


}