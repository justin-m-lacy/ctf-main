import { Component } from 'gibbon.js';
import { Container, Spritesheet, AnimatedSprite } from 'pixi.js';

/**
 * Play an animation from a spritesheet.
 */
export class SheetAnimation extends Component<Container> {

    public get loop() { return this._loop }
    public set loop(v) {
        this._loop = v;
        if (this.anim) {
            this.anim.loop = v
        }
    }
    private _loop: boolean = false;

    /**
     * Whether to automatically component after animation
     * complete.
     */
    public autoDestroy: boolean = true;

    /**
     * Whether to destroy actor when animation removed.
     */
    public destroyActor: boolean = true;

    private sheet: Spritesheet;

    /**
     * Note: animationSpeed is frames per update.
     */
    private anim?: AnimatedSprite;

    private animationKey: string;

    private waitParse?: Promise<void>;

    /**
     * width of loaded animation.
     */
    private animWidth?: number;

    private autoPlay: boolean = false;

    /**
     * height of loaded animation.
     */
    private animHeight?: number;

    private container?: Container;

    /**
     * 
     * @param sheet 
     * @param props.width - width of loaded animation.
     * @param props.height - height of loaded animation.
     * @param props.animationKey - animation key from spritesheet.animations to play.
     */
    constructor(sheet: Spritesheet, props?: {
        width?: number,
        height?: number,
        container?: Container,
        /**
         * Play as soon as ready.
         */
        autoPlay?: boolean,
        /**
         * Default 'main'
         */
        animationKey?: string,
    }) {

        super();
        this.sheet = sheet;
        this.animationKey = props?.animationKey ?? 'main';

        this.container = props?.container;

        this.animWidth = props?.width;
        this.animHeight = props?.height;

        this.autoPlay = props?.autoPlay ?? false;

    }

    init() {

        this.waitParse = this.sheet.parse().then(dict => {

            this.anim = new AnimatedSprite(this.sheet.animations[this.animationKey], true);
            if (this.animWidth) {
                this.anim.width = this.animWidth;
            }
            if (this.animHeight) {
                this.anim.height = this.animHeight;
            }
            if (!this.container) {
                this.container = this.clip;
            }
            this.anim.loop = this._loop;

            if (this.autoPlay) {
                this.play();
            }

        }).catch(err => {

            console.error(err);
        });

    }

    public play() {

        this.waitParse?.then(() => {
            if (this.anim && this.enabled && !this.isDestroyed && !this.container?.destroyed) {

                this.anim.position.set(this.position.x, this.position.y);
                this.container?.addChild(this.anim);

                //this.clip!.addChild(this.anim);

                this.anim.onComplete = () => {

                    console.log(`trap animation complete.`)
                    if (!this._loop) {
                        this.anim?.stop();
                    }
                    if (this.autoDestroy) {
                        this.destroy();
                    }

                }
                this.anim.play();
            }

        });


    }

    onDestroy() {
        if (this.destroyActor) {
            this.actor?.destroy();
        }
        if (this.anim) {
            this.container?.removeChild(this.anim);
            this.container = undefined;
            this.anim = undefined;
        }
        this.waitParse = undefined;
    }



}