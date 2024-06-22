
import { Container, Point, DisplayObject } from 'pixi.js';
import { Component, Actor, IPoint } from 'gibbon.js';
import { Tween } from 'tweedle.js';


const CarryScale: number = 0.5;
export class CarriedFlag extends Component<Container<any>> {

    private shrink?: Tween<DisplayObject>
    /**
     * Tween to restore scale.
     */
    private expand?: Tween<DisplayObject>;


    /// Target carrying flag.
    private target?: Actor;

    /**
     * Approx. time in seconds to catch up with target.
     * Not exact.
     */
    private easeTime: number = 0.05;

    /**
     * indicates flag reached target point and easing ends.
     */
    private snapped: boolean = false;

    private readonly offset: IPoint = new Point();

    init() {

        this.shrink = new Tween(this.actor!.clip!).to(
            { scale: { x: CarryScale, y: CarryScale } }, 0.15);
    }

    public setCarry(target: Actor, offsetX: number = 0, offsetY: number = 0) {

        this.target = target;
        this.offset.set(offsetX, offsetY);

        const parent = this.clip!.parent;
        if (this.target.clip?.parent === parent) {

            const tIndex = parent.getChildIndex(this.target.clip);
            parent.setChildIndex(this.clip!, tIndex);

        }

        this.expand?.stop();
        this.shrink!.start();
        this.enabled = true;
    }

    onDisable() {

        this.target = undefined;
        this.shrink?.stop();

        if (!this.isDestroyed) {
            if (!this.expand) {
                this.expand = new Tween(this.actor!.clip!).to({ scale: { x: 1, y: 1 } }, 0.5);
            }
            this.expand.start();
            this.actor?.clip?.parent.setChildIndex(this.actor.clip, 0);
        }

    }

    update(delta: number) {

        if (!this.target) {
            return;
        } else if (this.snapped) {
            this.position.set(this.target.position.x + this.offset.x - this.clip!.width / 2, this.target.position.y + this.offset.y - this.clip!.height / 2);
        } else {

            const pos = this.position;
            const dx = this.target.position.x + (this.offset.x - this.clip!.width / 2) - pos.x;
            const dy = this.target.position.y + (this.offset.y - this.clip!.height / 2) - pos.y;

            if (dx * dx + dy * dy <= 2) {
                this.snapped = true;
            }

            pos.set(
                pos.x + dx * (delta / this.easeTime),
                pos.y + dy * (delta / this.easeTime)
            );

        }
    }

    onDestroy() {
        if (this.expand) {
            this.expand.stop();
            this.expand = undefined;
        }
        if (this.shrink) {
            this.shrink.stop();
            this.shrink = undefined;
        }
        this.target = undefined;
    }

}