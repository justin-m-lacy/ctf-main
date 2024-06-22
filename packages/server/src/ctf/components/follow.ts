import { Component } from '../../engine/component';
import { Point } from '../../engine/data/geom';


/**
 * This actor follows target point continuously with optional offset point.
 * Both target and offset are stored as references and can be
 * updated externally.
 */
export class Follow extends Component {

    private target: Point;
    private offset: Point;

    /**
     * @param offset - Reference to an offset point.
     */
    constructor(target: Point, offset: Point = new Point()) {
        super();

        this.target = target;
        this.offset = offset;

    }

    init() {
        this.update();
    }

    update() {
        this.position.set(this.target.x + this.offset.x, this.target.y + this.offset.y);
    }
}