import { Container, Graphics, Sprite } from 'pixi.js';

/**
 * 
 * @param color 
 * @param pct - perecent amount to lighten. 1 is completely white.
 * @returns 
 */
export const lighten = (color: number, pct: number = 0.54) => {

    let r = 0xff & (color >> 16);
    let g = 0xff & (color >> 8);
    let b = 0xff & color;

    r = 0xff & (r + (0xff - r) * pct);
    g = 0xff & (g + (0xff - g) * pct);
    b = 0xff & (b + (0xff - b) * pct);

    return (r << 16) | (g << 8) | b;

    //return 0xffffff - (0xffffff - color) * pct;

}


/**
 * Place sprite in a frame and mask the content.
 * @param parent parent container is required to add masking graphic. 
 */
export const frameSprite = (sprite: Sprite, width: number, height: number, parent: Container,) => {

    const g = new Graphics();
    g.beginFill();
    g.drawRect(0, 0, width - 6, height - 6);
    g.endFill();
    g.position.set(
        (width - g.width) / 2, (height - g.height) / 2
    );
    parent.addChild(g);

    sprite.mask = g;

    sprite.anchor.set(0.5, 0.5);
    sprite.width = width;
    sprite.height = height;
    sprite.position.set(width / 2, height / 2);

    parent.addChild(sprite);
}