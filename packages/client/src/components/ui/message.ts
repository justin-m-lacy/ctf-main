import { Component } from 'gibbon.js';
import { Container, ITextStyle, Text, Point } from 'pixi.js';

export class Message extends Component<Container> {

    private _timer: number = 0;

    private timed: boolean = false;

    private _fld: Text;
    public autoDisable: boolean = true;

    /**
     * Percent offset.
     */
    private readonly offset: Point = new Point();

    constructor(text?: ITextStyle | Text, xPct: number = 0, yPct: number = 0) {

        super();

        this._fld = text instanceof Text ? text : new Text('', text);
        this.offset.set(xPct, yPct);

    }

    init() {

        this.clip?.addChild(this._fld);

    }

    /**
     * Display message.
     * @param time - length of time to display message.
     */
    public showMessage(text: string, x?: number | null, y?: number | null, time?: number) {

        this._fld.text = text;
        if (time) {
            this._timer = time;
            this.timed = true;
        } else {
            this.timed = false;
        }
        this.enabled = true;

        if (x !== undefined && x !== null) {
            this.offset.x = x;
        }
        if (y !== undefined && y !== null) {
            this.offset.y = y;
        }

    }

    onEnable() {
        this._fld.visible = true;

    }
    onDisable() {
        this._fld.visible = false;
        /// reset scale.
        this._fld.scale.set(1, 1);
    }

    update(delta: number) {

        if (this.timed) {

            this._timer -= delta;
            if (this._timer <= 0) {

                this._fld.visible = false;
                if (this.autoDisable) {
                    this.enabled = false;
                }

            }
        }

    }

    onDestroy() {
        this._fld.destroy();
    }

}