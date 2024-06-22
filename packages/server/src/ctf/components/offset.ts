import { Component } from '../../engine/component';
import { Point } from '../../engine/data/geom';


/**
 * Constant offset is continually added to point.
 * The offset can be updated. continuously.
 */
export class PositionOffset extends Component {

    private offset: Point;

    /**
     * @param offset - Reference to an offset point.
     * Value will be saved and read directly.
     */
    constructor(offset: Point) {
        super();

        this.offset = offset;

    }

    init() {
        this.update();
    }

    update() {

        const pos = this.position;
        pos.set(this.offset.x + pos.x, this.offset.y + pos.y);

    }
}