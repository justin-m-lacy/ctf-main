import { Tween } from 'tweedle.js';
import { Pane, PaneOptions } from './pane';
import { IDestroyOptions } from 'pixi.js';
import { Restrict } from '../../../server/src/utils/types';
import { ILayout } from '../layout/layout';
import { DefaultSkin } from '@pixiwixi/index';

/**
 * A View extends a Pane by adding Tweens hor hiding, showing, resizing, and repositioning
 * the Pane. The tweens play automatically when the appropriate variables are changed.
 */
export class View extends Pane implements ILayout {

    /// Note: need to return the targetted values since the view values
    /// might be in the middle of tweening.
    public get x() { return this.targets.x ?? super.x }
    public get y() { return this.targets.y ?? super.y }
    public get width() { return this.targets.width ?? super.width }
    public get height() { return this.targets.height ?? super.height }

    set x(v: number) { this.tweenProp('x', v); }
    set y(v: number) { this.tweenProp('y', v); }
    set width(v: number) { this.tweenProp('width', v); }
    set height(v: number) { this.tweenProp('height', v); }

    /*get position() { return super.position; }
    set position(v) { super.position = v; }*/

    private tween: Tween<Pane>;

    private showTween: Tween<Pane>;
    private hideTween: Tween<Pane>;

    /**
     * Target states of target.
     */
    private readonly targets: Partial<Restrict<Pane, number>> = {};

    constructor(opts?: PaneOptions) {

        super(opts);

        if (opts && !opts.skin) {
            opts.skin = DefaultSkin;
        }

        this.tween = new Tween(this);

        this.hideTween = new Tween(this).to({ alpha: 0 }, 0.2).onStart((p) => {
            this.tween.stop();
        }).onComplete((p) => {
            p.visible = false;
        });

        this.showTween = new Tween(this).to({ alpha: 1 }, 0.3).onStart(p => {
            this.hideTween.stop();
            p.visible = true;
        });

        this.targets.width = super.width;
        this.targets.height = super.height;
        this.targets.x = super.x;
        this.targets.y = super.y;

        this.tween.dynamicTo(this.targets).onComplete((p, t) => {

            //console.log(`move tween complete.`);
            //console.log(`${p.x},${p.y}  size: ${p.width},${p.height}`);
            p.layout();

        }).onStart((p, t) => {
            this.visible = true;
            this.hideTween.stop();
        });

        this.visible = false;

    }

    public setPosition(x: number, y: number) {
        this.targets.x = x;
        this.targets.y = y;
        this.position.set(x, y);
    }

    public setSize(w: number, h: number) {
        this.targets.width = w;
        this.targets.height = h;
        super.width = w;
        super.height = h;

    }

    private tweenProp(prop: keyof Restrict<Pane, number>, value: number) {

        // @ts-ignore
        this.targets[prop] = value;

        if (!this.visible) {
            return;
        }

        if (this.tween.isPlaying()) {
            this.tween.reset();
        }
        this.tween.start();


    }

    /**
     * Enable and play tweens.
     */
    public show() {
        if (!this.showTween.isPlaying()) {
            this.showTween.start();
        }
    }

    /**
     * Play tweens before disabling.
     */
    public hide() {
        if (!this.hideTween.isPlaying()) {
            this.hideTween.start();
        }
    }

    destroy(opts?: boolean | IDestroyOptions) {

        this.showTween.stop();
        this.hideTween.stop();
        this.tween.stop();

        super.destroy(opts);

    }

}