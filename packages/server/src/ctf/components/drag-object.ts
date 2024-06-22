import { Component } from '../../engine/component';
import { Point } from '../../engine/data/geom';
import Actor from '../../engine/actor';


/**
 * This actor drags another object to its position.
 */
export class DragActor extends Component {

    /**
     * Object being dragged.
     */
    public readonly dragged: Actor;

    /**
     * Offset from this object's position.
     */
    private offset: Point;

    /**
     * @param other - reference to point being dragged.
     * @param offset - Reference to an offset point.
     */
    constructor(other: Actor, offset: Point = new Point()) {
        super();

        this.dragged = other;
        this.offset = offset;

    }

    init() {
        this.update();
    }

    update() {

        const pos = this.position;
        this.dragged.position.set(pos.x + this.offset.x, pos.y + this.offset.y);
    }
}