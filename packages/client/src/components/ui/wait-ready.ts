import { Component } from 'gibbon.js';
import { Container, Text } from 'pixi.js';
import { Countdown } from './countdown';
import { Group as TweenGroup, Tween } from 'tweedle.js';
import { fitAndPlace } from '../../utils/layout';


/**
 * Display wait message and countdown.
 */
export class WaitReady<Key extends string, T extends Record<Key, number>> extends Component<Container> {

    private message!: Text;
    private countdown?: Countdown;

    /**
     * Object with countdown variable.
     */
    private countSource: T;
    /**
     * key of the countSource that counts down.
     */
    private countKey: Key;

    /**
     * Countdown text.
     */
    private countText?: string;

    private showTween?: Tween<Container>;
    private hideTween?: Tween<Container>;

    private tweens?: TweenGroup;

    constructor(counter: T, key: Key, tweenGroup?: TweenGroup) {

        super();

        this.tweens = tweenGroup;

        this.countKey = key;
        this.countSource = counter;

    }

    init() {

        const screen = this.game!.screen;

        this.countdown = this.actor!.require(Countdown, undefined, screen.width / 2, screen.height / 2);

        this.message = new Text('', {
            fontSize: 64,
            stroke: 0,
            strokeThickness: 4,
            fill: 0xffffff

        });
        this.message.alpha = 0;
        this.message.visible = false;

        this.showTween = new Tween(this.message, this.tweens).to({ alpha: 1 }, 1);
        this.hideTween = new Tween(this.message, this.tweens).to({ alpha: 0 }, 0.5).onComplete(t => {
            t.visible = false
        });

        this.clip!.addChild(this.message);

    }

    onDisable() {

        if (!this.isDestroyed && this.message.visible) {
            this.showTween?.stop();
            this.hideTween?.start();
        }
        this.countdown!.enabled = false;
    }

    show(text: string = '', countdownText?: string, hideUntil: number = 0) {
        this.setTitleAndFit(text);

        if (text !== '') {
            this._showText();
        }

        this.countText = countdownText;
        const curCount = this.countSource[this.countKey];

        this.countdown!.hideUntil = hideUntil;

        if (curCount > 0) {
            this.startCounter(curCount);
        } else {
            this.countdown!.enabled = false;

        }

    }

    private _showText() {
        if (this.hideTween?.isPlaying()) {
            this.hideTween.stop();
        }
        if (this.showTween) {
            if (this.message.visible === false) {
                this.message.alpha = 0;
                this.message.visible = true;
            }
            if (!this.showTween.isPlaying()) {
                this.showTween.start();
            }
        } else {
            this.message.alpha = 1;
            this.message.visible = true;
        }
    }
    /**
     * Set message text and position as title.
     * @param str 
     */
    private setTitleAndFit(str: string) {

        const size = this.game!.screen;
        this.message.text = str;
        fitAndPlace(this.message, size.width, size.height, 0.5, 0.15);

    }

    /**
     * Start the counter at the current count position.
     * @param count 
     */
    private startCounter(count: number) {

        if (this.countText !== undefined) {
            this.setTitleAndFit(this.countText);
            this._showText();

        }

        this.countdown!.startCount(count);

    }

    update() {

        const count = this.countSource[this.countKey];

        /// watching for start of countdown.
        if (count > 0) {
            if (!this.countdown!.enabled) {

                this.startCounter(count);
            }
        }


    }

    onDestroy() {

        this.countdown = undefined;

        this.tweens?.removeAll();
        this.tweens = undefined;

        this.showTween = this.hideTween = undefined;

        this.message.destroy();
    }


}