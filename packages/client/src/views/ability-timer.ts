import { Container, ITextStyle, Text, Graphics, Sprite } from 'pixi.js';
import { CommandBindings } from '../input/bindings';

const DisabledTint = 0xaaaaaa;

export class AbilityTimer<T> extends Container {

    private readonly fld: Text;

    private _timer: number = -1;
    private _lastInt = 0;

    /**
     * Data associated with box.
     */
    public data?: T;

    public readonly box: Graphics | Sprite;

    private display: string = '';

    public get bindings() { return this._bindings }
    public set bindings(v) {
        this._bindings = v;
        this._setDisplayText();
    }

    private _bindings?: CommandBindings;

    private baseWidth: number;
    private baseHeight: number;

    /**
     * 
     * @param color - box color
     * @param style - text style
     */
    constructor(
        props: {
            bindings?: CommandBindings,
            width: number,
            height: number,
            color?: number,
            data?: T,
            style?: ITextStyle
        }) {

        super();

        this.baseWidth = props.width;
        this.baseHeight = props.height;

        this.box = this.drawBox(props);

        this.fld = new Text('000', props.style ?? {

            fontSize: 42,
            fill: 0x221235
        });

        this.fitContent();

        this._bindings = props.bindings;

        this._setDisplayText();

        this.data = props.data;



        this.addChild(this.box);
        this.addChild(this.fld);


    }

    /**
     * Search for appropriate display icon based on input binding.
     */
    private _setDisplayText() {

        const list = this.bindings?.bindings;
        if (list == null) {
            this.fld.text = this.display = '';
            return;
        }

        let text: string | null = null;
        for (let i = 0; i < list.length; i++) {

            const input = list[i];
            if (input != null) {

                if (input.type === 'keydown') {
                    text = input.value as string;
                    break;
                }

            }

        }

        if (text == null) {

            for (let i = 0; i < list.length; i++) {

                const input = list[i];
                if (input != null) {

                    if (input.type.includes('pointer') || input.type.includes('mouse')) {
                        text = '🖱️';
                        break;
                    } else if (input.type.includes('touch')) {
                        text = '👆';
                        break;
                    }

                }

            }
        }

        if (text != null) {

            this.display = text.charAt(0).toUpperCase();
            this.fld.text = this.display;
        } else {
            this.fld.text = this.display = '';
        }

        this.recenter();

    }

    private fitContent() {

        const fillPct = 0.90;

        if (this.fld.width >= fillPct * this.baseWidth || this.fld.height >= fillPct * this.baseHeight) {
            const scale = Math.min(fillPct * this.baseWidth / this.fld.width, fillPct * this.baseHeight / this.fld.height);
            this.fld.scale.set(scale, scale);
        }

    }

    public clearTimer() {
        this.box.tint = 0xffffff;
        this.fld.text = this.display;

        this.recenter();

        this._timer = -1;

    }

    public setTimer(time: number) {
        this.setTime(time);
        this.box.tint = DisabledTint;
        this._timer = time;
    }

    private setTime(t: number) {
        this._lastInt = t;
        this.fld.text = `${t}`;

        this.recenter();
    }

    update(delta: number) {

        if (this._timer < 0) {
            return;
        }

        this._timer -= delta;
        if (this._timer < 0) {

            this.setTime(0);
            //this.text.visible = false;

        } else {
            const t = Math.ceil(this._timer);
            if (t !== this._lastInt) {
                this.setTime(t);
            }

        }

    }

    private recenter(x: number = 0, y: number = 0) {
        this.fld.position.set(
            (this.box.width - this.fld.width) / 2,
            (this.box.height - this.fld.height) / 2);
    }

    private drawBox(props: {
        width: number,
        height: number,
        color?: number,
        style?: ITextStyle
    }) {

        const g = new Graphics();

        g.lineStyle(1, 0x222222);
        g.drawRoundedRect(-1, -1, props.width + 2, props.height + 2, 2);

        g.lineStyle(1, 0xffffff, 0.6);
        g.beginFill(props.color ?? 0x330033, 0.5);
        g.drawRoundedRect(0, 0, props.width, props.height, 2);
        g.endFill();


        return g;

    }

    destroy() {

        this.data = undefined;
        super.destroy();
    }

}