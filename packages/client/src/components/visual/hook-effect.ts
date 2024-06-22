import { Component, TPoint } from 'gibbon.js';
import { Container, Graphics, Filter } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';

/**
 * Visual for hook attack.
 */
export class HookEffect extends Component<Graphics> {

    private readonly startPt: TPoint;
    private readonly destPt: TPoint;

    private graphic!: Graphics;

    private color: number;

    private width: number = 3;

    /**
     * 
     * @param endPt - end point of hook.
     */
    constructor(startPt: TPoint, endPt: TPoint, color: number = 0xffffff) {

        super();

        this.startPt = startPt;
        this.destPt = endPt;
        this.color = color;


    }

    init() {

        /// TODO: replace with line filter?
        this.graphic = this.clip!;
        // @ts-ignore
        this.graphic.filters = [new GlowFilter({ color: this.color })];
    }

    update() {

        this.graphic.clear();
        this.graphic.moveTo(this.startPt.x, this.startPt.y)
        this.graphic.lineStyle(this.width, this.color);
        this.graphic.lineTo(this.destPt.x, this.destPt.y);

    }

    onDestroy() {
        console.log(`Hook destroyed.`);
    }

}