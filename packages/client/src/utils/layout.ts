import { Container, Rectangle } from 'pixi.js';

export const addChildCenter = (display: Container, container: Container) => {

    display.position.set(
        (container.width - display.width) / 2,
        (container.height - display.height) / 2
    );
    container.addChild(display);

}
export const fitInView = (display: Container, width: number, height: number) => {

    if (display.width >= width) {
        display.width = 0.9 * width;
        display.scale.set(display.scale.x, display.scale.x);
    }

}

export const fitAndPlace = (display: Container, width: number, height: number, xPct: number = 0.5, yPct: number = 0.5) => {

    fitInView(display, width, height);

    display.position.set(

        xPct * width - display.width / 2, yPct * height - display.height / 2

    );



}

/**
 * Place a clip beside another display object to avoid.
 * @param clip - clip to place.
 * @param avoid - clip to avoid.
 * @param rect - screen bounds. rect within which clip must be placed.
 * @param padding - required padding from both rect edge and avoid clip.
 */
export const placeRight = (clip: Container, avoid: Container, rect: Rectangle, padding: number = 40) => {

    /// pick side with more space.
    clip.x = avoid.x + avoid.width + padding;

    let y = avoid.y + (avoid.height - clip.height) / 2;
    if (clip.y + clip.height + padding > rect.bottom) {
        y = rect.bottom - padding - clip.height;
    }
    if (y < padding) {
        y = padding;
    }
    clip.y = y;

}

/**
 * Place a clip beside another display object to avoid.
 * @param clip - clip to place.
 * @param avoid - clip to avoid.
 * @param rect - screen bounds. rect within which clip must be placed.
 * @param padding - required padding from both rect edge and avoid clip.
 */
export const placeBeside = (clip: Container, avoid: Container, rect: Rectangle, padding: number = 40) => {

    /// pick side with more space.
    if (avoid.x - rect.left >= rect.right - (avoid.x + avoid.width)) {


        clip.x = avoid.x - clip.width - padding;
        if (clip.x < padding) {

            clip.x = padding;
        }

    } else {

        clip.x = avoid.x + avoid.width + padding;
        if (clip.x + padding > rect.right) {
            clip.x = rect.right - clip.width - padding;
        }

    }

    let y = avoid.y + (avoid.height - clip.height) / 2;
    if (clip.y + clip.height + padding > rect.bottom) {
        y = rect.bottom - padding - clip.height;
    }
    if (y < padding) {
        y = padding;
    }
    clip.y = y;

}


export const keepInRect = (clip: Container, rect: Rectangle, padding: number = 0) => {

    if (clip.width < rect.width) {
        clip.x = (rect.width - clip.width) / 2;
    } else {
        if (clip.x < rect.left + padding) {
            clip.x = rect.left + padding;
        } else if (clip.x + clip.width > rect.right - padding) {
            clip.x = rect.right - padding - clip.width;
        }
    }

    if (clip.height < rect.height) {
        clip.y = (rect.height - clip.height) / 2;
    } else {
        if (clip.y < rect.top + padding) {
            clip.y = rect.top + padding;
        } else if (clip.y + clip.height > rect.bottom - padding) {
            clip.y = rect.bottom - padding - clip.height;
        }
    }


}

export const centerIn = (clip: Container, rect: Rectangle, pctX: number = 0.5, pctY: number = 0.5) => {

    clip.position.set(

        (rect.width - clip.width) * pctX,
        (rect.height - clip.height) * pctY

    );

}