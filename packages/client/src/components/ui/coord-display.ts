import { Component, Actor } from 'gibbon.js';
import { Text, Container, TextStyle } from 'pixi.js';

export default class CoordDisplay extends Component {

    public get target(): Actor | undefined {
        return this.target;
    }
    public set target(v: Actor | undefined) {

        this._target = v;
        if (v) {
            this.updateCoords();
        }
    }

    private _target?: Actor;

    private text: Text = new Text('', new TextStyle({ fontSize: 12 }));

    /**
     * Minimum change in x,y before updating display.
     */
    private updateDelta: number = 1;

    private prevX: number = 0;
    private prevY: number = 0;

    init() {

        this.prevX = 0;
        this.prevY = 0;
        this.setCoordText(0, 0);
        this.text.visible = false;

        if (this.clip) {
            (this.clip as Container).addChild(this.text);
        }


    }

    update() {
        this.updateCoords();
    }

    private updateCoords() {

        if (this._target && this._target.active) {

            const x = this._target.x;
            const y = this._target.y;

            if (Math.abs(x - this.prevX) >= this.updateDelta ||
                Math.abs(y - this.prevY) >= this.updateDelta) {

                this.text.text = `( ${x.toFixed(0)}, ${y.toFixed(0)} )`;
                this.prevX = x;
                this.prevY = y;
            }
            this.text.visible = true;

        } else {
            this.text.visible = false;
        }

    }

    private setCoordText(x: number, y: number) {

        this.text.text = `( ${x.toFixed(0)}, ${y.toFixed(0)} )`;
    }

}