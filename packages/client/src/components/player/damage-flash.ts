import { Component } from 'gibbon.js';
import { ActorImage } from '../actor-image';
import { Tween, Group as TweenGroup } from 'tweedle.js';
import { colorLerp } from '../../utils/draw';
import { Container, Sprite } from 'pixi.js';

export class DamageFlash extends Component {


    private flash?: Tween<Container>;
    private tweenGroup?: TweenGroup;

    /// active count of damagers.
    private damagers: number = 0;

    private sprite?: Sprite;

    constructor(group?: TweenGroup) {
        super();

        this.tweenGroup = group;

    }
    init() {

        this.sprite = this.get(ActorImage)?.sprite;
    }

    public addDamager() {
        this.damagers++;
        this.flashHit();

    }
    public removeDamager() {
        this.damagers--;
    }

    public flashHit() {

        if (!this.flash?.isPlaying()) {
            if (this.sprite) {

                if (!this.flash) this.flash = this.makeTween(this.sprite);
                this.flash.start();
            }
        }

    }

    onDisable() {
        this.flash?.stop();
    }

    private makeTween(sprite: Sprite) {
        return new Tween(sprite, this.tweenGroup).repeat(1).yoyo(true).to({}, 0.1).safetyCheck(s => !this.isDestroyed && s.visible === true).onUpdate((s, t) => {

            s.tint = colorLerp(0xffffff, 0xff5555, 4 * t * (1 - t));
        }).onComplete((s, tw) => {

            if (!this.isDestroyed && this.damagers > 0) {
                tw.start();
            }

            s.tint = 0xffffff
        });
    }

    onDestroy() {

        this.tweenGroup = undefined;
        this.flash = undefined;
        this.sprite = undefined;

    }

}