import { Component, Actor, IPoint, TPoint } from 'gibbon.js';
import { Point, Text, Container } from 'pixi.js';
import { Priorities } from '../priorities';

/**
 * Component's owner follows target actor at offset.
 */
export class Follow extends Component<Text | Container> {

    private target?: Actor | Component | TPoint;

    private readonly offset: IPoint = new Point();

    /**
     * Offset is relative to target's angle.
     */
    private offsetAngle: boolean;

    /**
     */
    //private readonly anchor: TPoint = new Point(0, 0);

    priority = Priorities.ServerSync;

    constructor(target: Actor | Component | TPoint, offset?: IPoint, offsetAngle: boolean = false) {
        super();
        this.target = target;

        if (offset) {
            this.offset.set(offset.x, offset.y);
        }
        this.offsetAngle = offsetAngle ?? false;

    }

    init() {
        this.update();
    }

    update() {

        if (this.target) {
            const pos = 'position' in this.target ? this.target.position : this.target;

            if (this.offsetAngle && 'rotation' in this.target) {

                const a = this.target.rotation;

                this.position.set(
                    pos.x + Math.cos(a) * this.offset.x - Math.sin(a) * this.offset.y,
                    pos.y + Math.sin(a) * this.offset.x + Math.cos(a) * this.offset.y
                );
                this.rotation = a;

            } else {
                this.position.set(
                    pos.x + this.offset.x, //this.anchor.x * this.clip!.width,
                    pos.y + this.offset.y //this.anchor.y * this.clip!.height
                );
            }
        }

    }

}