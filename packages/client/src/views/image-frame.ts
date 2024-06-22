import { NineSlicePlane, Container, Sprite, Graphics } from 'pixi.js';

/**
 * Frame containing a sprite.
 */
export class ImageFrame {

    readonly frame: NineSlicePlane | Container;
    readonly image: Sprite = new Sprite();

    get texture() { return this.image.texture }
    set texture(v) { this.image.texture = v; }

    /**
     * 
     * @param frame 
     * @param width 
     * @param height 
     * @param padX - Padding between image and frame border.
     * @param padY - Padding between image and frame border.
     */
    constructor(frame: NineSlicePlane | Container, width: number, height: number, padX: number = 4, padY: number = 4) {

        this.frame = frame;

        frame.width = width;
        frame.height = height;

        this.image.anchor.set(0.5, 0.5);
        this.image.position.set(width / 2, height / 2);
        this.image.width = width;
        this.image.height = height;

        const mask = this.createMask(width, height, padX, padY);
        frame.addChild(mask);

        this.image.mask = mask;
        frame.addChild(this.image);

    }

    private createMask(width: number, height: number, padX: number = 4, padY: number = 4) {

        const mask = new Graphics();
        mask.beginFill(0x000000, 1);
        mask.drawRect(0, 0, width - 2 * padX, height - 2 * padY);
        mask.endFill();

        mask.position.set((width - mask.width) / 2, (height - mask.height) / 2);

        return mask;
    }
}