import { Component } from 'gibbon.js';
import { Container, Graphics } from 'pixi.js';
import { RadPerDeg } from '../../utils/geom';

/**
 * Circular arc displaying health.
 */
export class ArcMeter<P extends string, T extends Record<P, number>> extends Component<Container>{

    private readonly source: T;

    private readonly prop: P;

    private maxProp?: P;

    /**
     * Offset of center of the arc.
     */
    public get offset() { return this._offset; }
    public set offset(v) { this._offset = v; }
    private _offset: number = 0;
    /**
     * Mask rotates to hide the arc-bar.
     */
    private mask: Container;

    private bar: Container;

    /**
     * Note: This lifebar has a max of 180 degrees since the mask-in is rotated over it.
     * Full 360 would need to redraw the bar at every step. Or use a filter.
     */
    private maxArc: number = 120 * RadPerDeg;
    //private showTween: Tween<DisplayObject>;
    //private hideTween: Tween<DisplayObject>;

    private color: number = 0x00bb00;

    private reverse: boolean = false;

    constructor(params: {
        source: T, prop: P, maxProp?: P, radius: number,
        offset: number,
        thickness: number,
        color?: number,
        reverse?: boolean
    }) {
        super();

        this.source = params.source;
        this.prop = params.prop;
        this.maxProp = params.maxProp;

        this._offset = params.offset;

        if (params.color) {
            this.color = params.color;
        }

        this.reverse = params.reverse ?? false;

        this.bar = this.drawBaseArc(params.radius, params.thickness ?? 4);
        this.bar.rotation = this.offset
        this.mask = this.drawMask(params.radius);

        this.bar.mask = this.mask;

        /*this.showTween = new Tween(this._bar, g).to({ alpha: 1 }, 0.2).onStart(v => v.visible = true);
        this.hideTween = new Tween(this._bar, g).to({ alpha: 0 }, 0.5).onComplete(v => {
            v.visible = false;
            this.enabled = false;
        }
        );*/

    }

    init() {

        this.clip?.addChild(this.bar);
        this.clip?.addChild(this.mask);

        this.bar.rotation = this.offset;
        this.mask.rotation = this.offset;

    }

    update(delta: number) {

        const pct = this.maxProp ?
            this.source[this.prop] / this.source[this.maxProp] :
            this.source[this.prop];

        this.mask.rotation = this.mask.rotation + (
            this._offset +
            (1 - pct) * (this.reverse ? -this.maxArc : this.maxArc) - this.mask.rotation
        ) * 4 * delta;

    }

    hide() {
    }

    setTo(val: number) {
    }

    onDisable() {
    }



    onDestroy() {
    }

    private drawMask(radius: number,) {

        const mask = new Graphics();
        mask.beginFill(0xff0000);
        mask.arc(0, 0, radius + 4, -this.maxArc / 2, this.maxArc / 2);
        mask.endFill();

        return mask;

    }

    private drawBaseArc(radius: number, thickness: number) {
        const g = new Graphics();
        g.lineStyle(thickness, this.color, 0.9);
        g.arc(0, 0, radius, -this.maxArc / 2, 0.5 * this.maxArc);

        return g;

    }

}