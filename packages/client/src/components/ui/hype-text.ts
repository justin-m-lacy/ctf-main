import { Component, Game } from 'gibbon.js';
import { Text, Rectangle, DisplayObject, TextStyle } from 'pixi.js';

type ScrollOpts = {

    text: string,
    color?: number,
    size?: number,
    //default true
    autoDestroy?: boolean,
    alpha?: number,
    time?: number,
    italics?: boolean

};

/**
 * Scroll large text across the screen.
 */
export class HypeScroll extends Component<DisplayObject, Game> {

    private fld: Text;

    private opts: ScrollOpts

    private screen!: Rectangle;

    private maxTime: number;
    private timer: number = 0;

    constructor(opts: ScrollOpts) {

        super();

        this.fld = new Text(
            opts.text,
            {
                fontSize: opts.size ?? 64,
                fontStyle: opts.italics !== false ? 'italic' : undefined
            });

        this.maxTime = opts.time ?? 3;

        this.fld.alpha = opts.alpha ?? 0.8;

        this.opts = opts;

    }

    init() {

        this.screen = this.game!.screen;

    }

    onEnable() {
        this.fld.position.set(
            this.screen.right + 10,
            0.5 * (this.screen.height - this.fld.height));

    }

    onDisable() {
        this.fld.visible = false;
    }

    update(delta: number) {

        this.timer += delta;

        const t = this.timer / this.maxTime;

        if (t <= 1) {

            const endX = this.screen.left - this.fld.width + 10;
            this.fld.x = (1 - t) * this.screen.right + t * endX;

        } else {

            if (this.opts.autoDestroy) {
                this.actor!.destroy();
            } else {
                this.enabled = false;
            }
        }

    }

    onDestroy() {

        this.fld.visible = false;

    }

}