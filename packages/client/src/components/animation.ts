import { Component } from 'gibbon.js';
import { Container, AnimatedSprite } from 'pixi.js';

/// UNUSED
export class Animation extends Component<Container> {

    get loop() { return this.anim.loop }
    set loop(v) { this.anim.loop = v; }

    /**
     * Whether to automatically component after animation
     * complete.
     */
    autoDestroy: boolean = true;

    /**
     * Whether to destroy actor when animation removed.
     */
    destroyActor: boolean = true;

    private anim: AnimatedSprite;

    constructor(animation: AnimatedSprite) {
        super();

        this.anim = animation;
        this.anim.loop = false;

    }

    public play() {

        if (this.clip) {
            this.clip.addChild(this.anim);
        }

        this.anim.onComplete = () => {

            if (this.autoDestroy) {
                this.actor?.destroy();
            }

        }
        this.anim.play();


    }

    onDestroy() {
        if (this.destroyActor) {
            this.actor?.destroy();
        }
    }
}