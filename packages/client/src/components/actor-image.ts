import { Component } from 'gibbon.js';
import { Container, Sprite, Texture } from 'pixi.js';

export class ActorImage extends Component<Container> {

    /**
     * Loaded sprite.
     */
    public readonly sprite: Sprite;

    /**
     * Fallback to call if image loading fails.
     */
    private readonly fallback?: (ai: ActorImage) => void;

    constructor(source?: Promise<Texture | undefined>, width?: number, height?: number, fallback?: (ai: ActorImage) => void) {

        super();

        this.sprite = new Sprite();
        this.sprite.anchor.set(0.5, 0.5);

        if (width) {
            this.sprite.width = width;
        }
        if (height) {
            this.sprite.height = height;
        }
        this.fallback = fallback;

        if (source) {
            this.waitLoad(source);
        }

    }

    init() {
        this.clip!.addChild(this.sprite);
    }

    async waitLoad(source: Promise<Texture | undefined>) {

        try {

            const tex = await source;

            if (!this.isDestroyed && !this.sprite.destroyed) {
                if (tex) {
                    this.sprite.texture = tex;
                } else {
                    this.fallback?.(this);
                }
            }

        } catch (err) {
            console.warn(`ActorImage(): Failed to load image: ${err}`);
            if (!this.isDestroyed) {
                this.fallback?.(this);
            }
        }


    }

    onDestroy() {
        this.sprite.destroy();
    }

}