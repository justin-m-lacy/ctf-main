import { Stack } from './../layout/stack';
import { Container, Text } from 'pixi.js';
import { Pane, PaneOptions } from '../panes/pane';


export type ButtonOptions<T = any> = PaneOptions & {
    onClick?: () => void,
    child?: Container,
    text?: string,
    data?: T
}
export class Button<T extends unknown = never> extends Pane {

    public data?: T;
    private _label?: Text;

    public get text() { return this._label?.text ?? '' }
    public set text(v) {

        if (this._label == null) {
            this.makeText(v);
        } else {
            this._label.text = v;
        }

    }

    constructor(opts?: ButtonOptions) {

        super(opts);

        this.interactive = true;
        if (opts) {
            if (opts.onClick) {
                this.on('pointerup', opts.onClick);
            }
            const child = opts.child;
            if (child) this.addChild(child);
            if (opts.text != null) this.makeText(opts.text);

            if (opts.width) {
                this.width = opts.width;
            }
            if (opts.height) {
                this.height = opts.height;
            }
            if (child || this._label) {

                const padding = 24;

                this.width = Math.max(
                    this.width, child?.width ?? 0,
                    this._label?.width ?? 0) + padding;

                this.height = Math.max(
                    this.height, child?.height ?? 0,
                    this._label?.height ?? 0) + padding;

                const items: Container[] = [];
                if (child) items.push(child);
                if (this._label) items.push(this._label)

                super.setLayout(new Stack(items));

            }
        }

        this.layout(this.getBounds());

    }

    private makeText(str: string) {

        this._label = new Text(str, this.skin?.baseStyle);
        this.addChild(this._label);

    }

}