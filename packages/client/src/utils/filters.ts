import { BaseTexture, Sprite, Container, Graphics, IRenderer, RenderTexture, WRAP_MODES, Texture, Filter } from 'pixi.js';
import { PerlinFilter } from '@/shaders/perlin/perlin-filter';
import { ColorBuffer } from './color-buffer';
import { GlowFilter } from '@pixi/filter-glow';

type TFilter = Filter | GlowFilter;

/**
 * Remove all matching filters from container.
 * @param obj 
 * @param filters 
 */
export const removeFilters = (obj: Container, filters: TFilter[]) => {

    if (obj.filters) {
        obj.filters = obj.filters.filter(v => !filters.includes(v));
    }

}

/**
 * Search container for filter type and remove first found.
 * @param obj 
 * @param filterClass 
 */
export const removeFilterType = <T extends TFilter>(obj: Container, filterClass: new (...args: any[]) => T) => {

    if (obj.filters) {

        const ind = obj.filters.findIndex(v => v instanceof filterClass);
        if (ind >= 0) {
            obj.filters.splice(ind);
        }

    }

}

export const removeFilter = <T extends TFilter>(obj: Container, filter: T) => {

    if (obj.filters) {

        // @ts-ignore
        const ind = obj.filters.indexOf(filter);
        if (ind >= 0) {
            obj.filters.splice(ind);
        }

    }

}

export const addFilters = (obj: Container, filters: TFilter[]) => {

    if (obj.filters) {

        for (let i = filters.length - 1; i >= 0; i--) {
            /// @ts-ignore
            if (obj.filters.indexOf(filters[i]) < 0) {
                /// @ts-ignore
                obj.filters.push(filters[i]);
            }
        }

    } else {
        /// @ts-ignore
        obj.filters = filters.concat();
    }

}

/**
 * Add filter to container. Filter will be ignored if it already
 * occurs in the container's filter list.
 * @returns The filter added.
 */
export const addFilter = <T extends TFilter>(obj: Container, filter: T): T => {

    if (obj.filters) {
        /// @ts-ignore
        if (obj.filters.indexOf(filter) < 0) {
            /// @ts-ignore
            obj.filters.push(filter);
        }
    } else {
        /// @ts-ignore
        obj.filters = [filter];
    }

    return filter;
}

/**
 * Lens that distorts in the forward direction?
 * @param radius
 * @param minRadius - radius at which lens effect will be cut.
 */
export const makeDirectionLens = (radius: number, minRadius: number = 0) => {

    const size = 2 * radius;
    const buffer = new ColorBuffer(size, size, 0);


    const r2 = radius * radius;
    const r2min = minRadius * minRadius;

    let d;
    let pct;

    for (let y = 0, dy = -radius; y < size; y++, dy++) {

        for (let x = 0, dx = -radius; x < size; x++, dx++) {

            /// distance from image center.
            d = dx * dx + dy * dy;
            if (d < r2min) {
                continue;
            }
            d = Math.sqrt(d);
            /// amount of outwards displacement.
            pct = (d - minRadius) / (radius - minRadius);

            //height = 1 - Math.abs(crestOffset);
            buffer.setDisplaceColor(x, y, -Math.abs(pct * dx / d), -0.5 * pct * dy / d)


        }

    }

    return Texture.fromBuffer(buffer.buffer, size, size);
}


/**
 * @param radius
 * @param minRadius - radius at which lens effect will be cut.
 */
export const makeLensMap = (radius: number, minRadius: number = 0) => {

    const size = 2 * radius;
    const buffer = new ColorBuffer(size, size, 0xff108080);

    const r2 = radius * radius;
    const rmin2 = minRadius * minRadius;

    let d;
    let pct;

    for (let y = 0, dy = -radius; y < size; y++, dy++) {

        for (let x = 0, dx = -radius; x < size; x++, dx++) {

            /// distance from image center.
            d = dx * dx + dy * dy;
            if (d > r2 || d < rmin2) {
                continue;
            }
            d = Math.sqrt(d);
            /// amount of outwards displacement.
            pct = (d - minRadius) / (radius - minRadius);
            //if (pct > 1) pct = 1;

            //height = 1 - Math.abs(crestOffset);
            buffer.setDisplaceColor(x, y, pct * dx / d, pct * dy / d)


        }

    }

    return Texture.fromBuffer(buffer.buffer, size, size);
}


export const makePerlin = (baseWidth?: number, baseHeight?: number, offset: number = 0) => {

    const tex = new BaseTexture(undefined, {
        width: baseWidth ?? screen.width, height: baseHeight ?? screen.height
    });

    const sprite = Sprite.from(tex);
    sprite.filters = [
        new PerlinFilter({
            width: baseWidth ?? screen.width,
            height: baseHeight ?? screen.height,
            perlinOffset: offset,
            seed: Date.now()
        })
    ]

    return sprite;
}

/**
 * 
 * @param target 
 * @param offset 
 * @param width - defaults to target.width
 * @param height - defaults to target.height
 */
export const addPerlin = (target: Container, offset: number = 0,
    width?: number, height?: number) => {

    const perlin = new PerlinFilter(
        {
            perlinOffset: offset,
            width: width ?? target.width,
            height: height ?? target.height,
            seed: Date.now()
        });

    if (target.filters) {
        target.filters = target.filters.concat(perlin);
    } else target.filters = [perlin];

}

// todo: replace with filter
export const makePerlinTex = (color: number, renderer: IRenderer, width: number = 512, height: number = 512) => {

    const g = new Graphics();
    g.beginFill(color, 1);
    g.drawRect(0, 0, width, height);
    g.endFill();

    addPerlin(g, 0.2, 700, 700);

    const tex = RenderTexture.create({
        width: width, height: height,
        wrapMode: WRAP_MODES.MIRRORED_REPEAT
    });

    renderer.render(g, {
        renderTexture: tex,
        clear: false,
    });

    return tex;

}



/**
 * Make image texture for a water droplet displacement filter.
 * @param radius
 */
/*export const makeDropletTexture = (radius: number) => {

    const buffer = makeDropletBuffer(radius);
    return Texture.fromBuffer(buffer.buffer, 2 * radius, 2 * radius,);

}*/

/**
 * Make bitmap buffer for a droplet displacement map.
 * @param radius
 * @param crestPercent
 * @param cutoffDist
 * @returns
 */
/*export const makeDropletBuffer = (radius: number, crestPercent = 0.8, cutoffDist: number = 16) => {

    const size = 2 * radius;
    const buffer = new ColorBuffer(size, size, 0xff808080);

    /// Where the droplet crest reaches its maximum.
    const crestRadius = radius * crestPercent;

    /// Offset to crest maximum.
    let crestOffset;

    const r2 = radius * radius;

    let d;
    let height;

    for (let y = 0, dy = -radius; y < size; y++, dy++) {

        for (let x = 0, dx = -radius; x < size; x++, dx++) {

            d = dx * dx + dy * dy;
            if (d > r2 || d === 0) {
                continue;
            }
            d = Math.sqrt(d);

            crestOffset = (d - crestRadius) / cutoffDist;
            if (crestOffset > 1 || crestOffset < -1) {
                continue;
            }
            /// droplet height is cos of the crest offset.
            /// dx,dy indicate how much off the height should be applied
            /// to x,y color displacements.
            height = Math.cos((Math.PI / 2) * crestOffset);
            //height = 1 - Math.abs(crestOffset);
            buffer.setDisplaceColor(x, y, (-dx / d) * (height), (-dy / d) * height)


        }

    }

    return buffer;

}*/
