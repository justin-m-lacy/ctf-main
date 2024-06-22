import { Tween } from 'tweedle.js';
import { Pane, PaneOptions } from './pane';
import { Component, Game } from 'gibbon.js';
import { Container, DisplayObject, Rectangle } from 'pixi.js';
import { Restrict } from '../../../server/src/utils/types';
import { DefaultSkin } from '@pixiwixi/index';
import { ILayout } from '@pixiwixi/src/layout/layout';


/**
 * Component that controls a Pane object.
 */
export class ViewControl<G = Game> extends Component<Container, G> implements ILayout {

    /// Note: need to return the targetted values since the view values
    /// might be in the middle of tweening.
    public get x() { return this.targets.x ?? this._view.x }
    public get y() { return this.targets.y ?? this._view.y }
    public get width() { return this.targets.width ?? this._view.width }
    public get height() { return this.targets.height ?? this._view.height }
    public get alpha() { return this.targets.alpha ?? this._view.alpha };


    /**
     * Gets or sets visibility without using show/hide tweens.
     */
    public get visible() { return this._view.visible }


    public set alpha(v) { this.tweenProp('alpha', v); }
    public set x(v) { this.tweenProp('x', v); }
    public set y(v) { this.tweenProp('y', v); }
    public set width(v) { this.tweenProp('width', v); }
    public set height(v) { this.tweenProp('height', v); }
    public set visible(v) { this._view.visible = v; }

    public get skin() { return this._view.skin }

    private tween: Tween<Pane>;

    private showTween: Tween<Pane>;
    private hideTween: Tween<Pane>;

    /**
     * Reference to underlying pane object.
     */
    public get view() { return this._view }
    private _view: Pane;

    /**
     * Target states of target.
     */
    private readonly targets: Partial<Restrict<Pane, number>> = { x: 0, y: 0, width: 0, height: 0 };

    constructor(opts?: PaneOptions & { view?: Pane }) {

        super();

        if (opts && !opts.skin) {
            opts.skin = DefaultSkin;
        }

        this._view = opts?.view ?? new Pane(opts);
        this.tween = new Tween(this._view);

        this.hideTween = new Tween(this._view).to({ alpha: 0 }, 0.2).onStart((p) => {
            this.showTween.stop();
        }).onComplete((p) => {
            this.enabled = false;
        });

        this.showTween = new Tween(this._view).to({ alpha: 1 }, 0.3).onStart(p => {
            this.hideTween.stop();
            p.visible = true;
        });

        this.targets.width = this.view.width;
        this.targets.height = this.view.height;
        this.targets.x = this.view.x;
        this.targets.y = this.view.y;

        this.tween.dynamicTo(this.targets, 0.4).onComplete((p, t) => {
            p.layout();
        });


        this.visible = false;

    }


    init() {
        super.init?.();

        this.enabled = false;
        this.setLayout();
        this.layout();
    }


    /**
     * setLayout() can be overridden in subclasses to set a specific layout,
     * calling super.setLayout()
     * @param layout 
     */
    public setLayout(layout?: ILayout): void {
        this._view.setLayout(layout);
    }

    public layout(rect?: Rectangle): this {

        if (rect) {
            if (this.width > rect.width) this.width = rect.width;
            if (this.height > rect.height) this.height = rect.height;

            this.x = rect.x;
            this.y = rect.y;
        }

        this._view.layout();

        /**
         * Return this to allow position changes to be tweened
         * if changed by parent.
         */
        return this;

    }

    /**
     * Force parent position with no tweening.
     * @param x 
     * @param y 
     */
    public setPosition(x: number, y: number) {
        this.targets.x = x;
        this.targets.y = y;
        this._view.position.set(x, y);
    }

    /**
     * Force parent size with no tweening.
     * @param w 
     * @param h 
     */
    public setSize(w: number, h: number) {
        this.targets.width = w;
        this.targets.height = h;

        this._view.width = w;
        this._view.height = h;

    }

    private tweenProp(prop: keyof Restrict<Pane, number>, value: number) {

        // @ts-ignore
        this.targets[prop] = value;

        if (!this.enabled || !this.visible) {
            // @ts-ignore
            this._view[prop] = value;

            return;
        }

        if (this.tween.isPlaying()) {
            /// necessary to get the new target values.
            this.tween.reset();
        }
        this.tween.start();

    }

    /**
     * Enable and play tweens.
     */
    show() {
        this.enabled = true;
        if (!this.showTween.isPlaying()) {
            this.showTween.start();
        }
    }

    /**
     * Play tweens, then disable.
     */
    hide() {
        if (!this.hideTween.isPlaying()) {
            this.hideTween.start();
        }
    }

    onEnable() {
        this.view.interactive = this.view.interactiveChildren = true;
        this.visible = true;
        this.layout();
    }

    onDisable() {
        this.view.interactive = this.view.interactiveChildren = false;
        this.visible = false;
    }

    onDestroy() {

        this.showTween?.stop();
        this.hideTween?.stop();
        this.tween?.stop();

        super.onDestroy?.();
        this.view.destroy();


    }

    public getBounds() { return this._view.getBounds(); }

    public addChild(...children: DisplayObject[]) { return this._view.addChild(...children); }

    public addChildAt(child: DisplayObject, index: number) {
        return this._view.addChildAt(child, index);
    }

}