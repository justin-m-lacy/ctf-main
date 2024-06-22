import { Component } from 'gibbon.js';
import { Container, ITextStyle, Text, Rectangle } from 'pixi.js';

export class Countdown extends Component<Container> {

    private _timer: number = 0;

    public readonly text: Text;

    private _lastInt = 0;

    /**
     * Hide the timer until countdown reaches a min. value.
     */
    private _hideUntil: number = 0;
    public set hideUntil(v: number) {
        this._hideUntil = v;
    }


    public autoDisable: boolean = true;

    public get style() { return this.text.style; }
    public set style(v: Partial<ITextStyle>) {
        this.text.style = v;
    }

    public screen!: Rectangle;

    constructor(text?: ITextStyle | Text) {

        super();

        this.text = text instanceof Text ? text : new Text('', text ?? {

            fontSize: 256,
            fill: 0xfefefe,
            stroke: 0x111111,
            strokeThickness: 4


        });

        this.text.scale.set(1.5, 1.5);

    }

    init() {

        this.clip?.addChild(this.text);

        this.screen = this.game!.app.screen;

    }

    /**
     * Start timer countdown.
     * @param timer - time to count down in seconds.
     */
    public startCount(timer: number, hideUntil?: number) {

        this._timer = timer;
        this._lastInt = Math.ceil(timer);

        this.text.text = `${this._lastInt}`;
        this.recenter();
        this.enabled = true;

        if (hideUntil !== undefined) {
            this._hideUntil = hideUntil;
        }

    }

    private recenter() {
        this.text.position.set((this.screen.width - this.text.width) / 2, (this.screen.height - this.text.height) / 2);
    }

    onEnable() {
        this.text.visible = this._hideUntil <= 0 || this._timer < this._hideUntil;

    }
    onDisable() {
        this.text.visible = false;
    }

    update(delta: number) {

        this._timer -= delta;

        if (this._timer < 0) {

            this.text.visible = false;
            if (this.autoDisable) {
                this.enabled = false;
            }
            return;

        }
        if (this._hideUntil && this._timer > this._hideUntil) {

            this.text.visible = false;

        } else {

            this.text.visible = true;
            const t = Math.ceil(this._timer);
            if (t !== this._lastInt) {
                this._lastInt = t;
                this.text.text = `${t}`;
                this.recenter();
            }
        }

    }

    onDestroy() {
        this.text.destroy();
    }

}