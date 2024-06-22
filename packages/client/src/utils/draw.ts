import { TPoint } from 'gibbon.js';
import { Graphics, Container, FillStyle, LineStyle, Texture, DisplayObject, ILineStyleOptions, IFillStyleOptions, RenderTexture, Matrix, WRAP_MODES, Point, Renderer, IRenderer } from 'pixi.js';
import { normalizeRect, NormalRect, PolyData, RectData } from '../../../server/src/ctf/data/parser';
import { TPolygon } from '../model/arena';
import { AdvancedBloomFilter } from '@pixi/filter-advanced-bloom';

export type TDashedLine = {
    lineStyle?: LineStyle,
    size: number,
    gap: number,

    /// offset in the size-gap-size pattern to begin
    /// drawing from.
    offset?: number
}


export type TDashedFill = TDashedLine & {
    fillStyle?: FillStyle,
}

export const energyLine = (p1: TPoint, p2: TPoint, color: number = 0x00dd00) => {

    const g = new Graphics();

    const f = new AdvancedBloomFilter();

    g.lineStyle(4, color, 1,);
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y)

    g.filters = [f];


    return g;

}

export const colorLerp = (c1: number, c2: number, t: number) => {

    const oneMinus = 1 - t;

    const r = ((c2 >> 16) * t) + (oneMinus * (c1 >> 16));
    const g = ((c2 >> 8) * t) + (oneMinus * (c1 >> 8));
    const b = ((c2) * t) + (oneMinus * (c1));

    const outColor = ((0xff & r) << 16) + ((0xff & g) << 8) + (0xFF & b);

    //console.log(`${outColor.toString(16)}`);
    return outColor;
}


/**
 * Draw dashed line through points.
 * @param points 
 * @param lineStyle 
 * @param size 
 * @param gap 
 * @param g 
 */
export const drawDashedPath = (points: TPoint[], g: Graphics, opts: TDashedLine = {
    size: 32, gap: 20
}) => {

    const len = points.length;
    if (len <= 0) {
        return;
    }
    if (opts.lineStyle) {
        g.lineStyle(opts.lineStyle?.width, opts.lineStyle?.color, opts.lineStyle.alpha, opts.lineStyle.alignment, opts.lineStyle.native);
    }

    let prev = points[0];
    opts.offset = opts.offset ?? 0;
    for (let i = 1; i < len; i++) {

        opts.offset += drawDashedLine(prev, points[i], g, opts);
        prev = points[i];

    }

    return g;
}

/**
 * Draw dashed line around points with optional fill.
 * @param points 
 * @param lineStyle 
 * @param size 
 * @param gap 
 * @param g 
 */
export const drawDashedPoly = (points: TPoint[], g: Graphics, opts: TDashedFill = {
    size: 32, gap: 20
}) => {

    const len = points.length;
    if (len <= 0) {
        return;
    }
    /// fill must be done separately, since dashes break the fill.
    if (opts.fillStyle) {
        g.beginFill(opts.fillStyle.color, opts.fillStyle.alpha);
        g.drawPolygon(points);
        g.endFill();
    }


    const lineStyle = opts?.lineStyle;
    if (lineStyle) {
        g.lineStyle(lineStyle?.width, lineStyle?.color, lineStyle.alpha, lineStyle.alignment, lineStyle.native);
    }

    let prev = points[0];
    opts.offset = opts.offset ?? 0;
    for (let i = 1; i < len; i++) {

        opts.offset += drawDashedLine(prev, points[i], g, opts);
        prev = points[i];

    }
    drawDashedLine(prev, points[0], g, opts);

    return g;
}

/**
 * Draw dashed line between two points.
 * @returns offset distance in the size-gap-size-gap pattern.
 */
export const drawDashedLine = (p0: TPoint, p1: TPoint, g: Graphics,
    opts: TDashedLine = {
        size: 36, gap: 8
    }) => {

    const { gap, size } = opts;

    /// Track the offset position in the pattern.
    let offset = opts.offset ? opts.offset % (size + gap) : 0;

    let dx = p1.x - p0.x;
    let dy = p1.y - p0.y;

    const d = Math.sqrt(dx * dx + dy * dy);
    if (d === 0) { return offset; }

    dx /= d;
    dy /= d;

    let tot_len = 0;

    let seg_len: number = size;
    let x = p0.x;
    let y = p0.y;

    if (offset > size) {

        // start with gap.
        tot_len = (gap + size) - offset;
        if (tot_len > d) {
            /// line smaller than gap.
            return offset + d;
        }
        // full gap cleared.
        offset = 0;
        x += tot_len * dx;
        y += tot_len * dy;

    }

    while (tot_len <= d) {

        g.moveTo(x, y);

        seg_len = size - offset;
        tot_len += seg_len;
        if (tot_len > d) {
            seg_len = d - (tot_len - seg_len);
            tot_len = d;
        }
        offset += seg_len;

        x += dx * seg_len;
        y += dy * seg_len;

        g.lineTo(x, y);

        /// It doesn't matter if the gap runs over the end,
        /// because it will cut off the loop.
        tot_len += gap;
        if (tot_len > d) {
            return offset + (d - (tot_len - gap));
        }
        offset = 0;

        x += dx * gap;
        y += dy * gap;
    }

    return offset;
}

export const texCircle = (p: TPoint, radius: number, tex: Texture, line?: ILineStyleOptions, parent?: Container, color: number = 0xffffff) => {

    const g = new Graphics();

    g.beginTextureFill({
        texture: tex,
        color: color,
        alpha: 1
    });
    if (line) {
        g.lineStyle(line.width ?? 1, line.color, line.alpha, line.alignment);
        //g.lineTextureStyle(line);
    }
    g.drawCircle(0, 0, radius);
    g.endFill();

    parent?.addChild(g);

    g.position.set(p.x, p.y);

    return g;
}

export const texRect = (rect: RectData, tex: Texture, line?: ILineStyleOptions, parent?: Container, color: number = 0xffffff) => {

    const g = new Graphics();

    g.beginTextureFill({
        texture: tex,
        alpha: 1,
        color: color
    });

    if (line) {
        g.lineStyle(line.width ?? 1, line.color, line.alpha, line.alignment);
    }
    const nrect = normalizeRect(rect);
    g.drawRect(0, 0, nrect.w, nrect.h);

    g.endFill();
    parent?.addChild(g);

    g.position.set(nrect.x, nrect.y);
    return g;

}


export const texPoly = (data: PolyData, tex: Texture, line?: ILineStyleOptions, parent?: Container, color: number = 0xffffff) => {

    const g = new Graphics();
    const pts = data.points;
    const len = pts.length;
    if (len === 0) {
        console.log(`drawPoly(): polygon has no points.`)
        return g;
    }

    g.beginTextureFill({
        texture: tex,
        alpha: 1,
        color: color
    });

    if (line) {
        g.lineStyle(line?.width ?? 1, line.color, line.alpha);
    }

    let p = pts[0];
    g.moveTo(p.x, p.y);

    for (let i = 1; i < len; i++) {
        p = pts[i];
        g.lineTo(p.x, p.y);
    }

    if (data.origin) {
        g.position.set(data.origin.x, data.origin.y);
    }
    g.endFill();
    parent?.addChild(g);

    return g;

}


export const drawCircle = (pt: TPoint, radius: number, fill?: IFillStyleOptions, line?: ILineStyleOptions, parent?: Container) => {

    const g = new Graphics();

    if (fill) { g.beginFill(fill.color, fill.alpha); }
    if (line) {
        g.lineStyle(line.width ?? 1, line.color, line.alpha, line.alignment);
    }

    g.drawCircle(0, 0, radius);

    g.position.set(pt.x, pt.y);
    if (fill) { g.endFill(); }

    parent?.addChild(g);

    return g;

}

export const drawPoly = (pts: TPolygon, fill?: IFillStyleOptions, line?: LineStyle, parent?: Container) => {

    const g = new Graphics();
    const len = pts.length;
    if (len === 0) {
        console.log(`drawPoly(): polygon has no points.`)
        return g;
    }

    if (fill) {
        g.beginFill(fill.color, fill.alpha);
    }
    if (line) {
        g.lineStyle(line.width, line.color, line.alpha);
    }

    let p = pts[0];
    g.moveTo(p.x, p.y);

    for (let i = 1; i < len; i++) {
        p = pts[i];
        g.lineTo(p.x, p.y);
    }

    if (fill) {
        g.endFill();
    }

    parent?.addChild(g);

    return g;

}


/**
 * The Graphic's position will be set to the rect's center.
 * The rect will be drawn with origin at rect's center.
 * @param rect 
 * @param fill 
 * @param line 
 * @param parent 
 * @returns 
 */
export const drawRect = (rect: Omit<NormalRect, 'shape'>, fill?: IFillStyleOptions, line?: ILineStyleOptions, parent?: Container) => {
    const g = new Graphics();

    if (fill) {
        g.beginFill(fill.color, fill.alpha);
    }
    if (line) {
        g.lineStyle(line?.width ?? 1, line.color, line.alpha);
    }

    //g.drawRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h);
    g.drawRect(0, 0, rect.w, rect.h);
    if (fill) {
        g.endFill();
    }

    g.position.set(rect.x, rect.y);
    parent?.addChild(g);

    return g;

}


/**
 * fill with a blank graphic.
 * mainly for testing.
 * @param width
 * @param height 
 */
export const fillBlank = (container: Container, width: number, height: number) => {

    const g = new Graphics();
    g.beginFill();
    g.drawRect(0, 0, width, height);
    g.endFill();
    container.addChild(g);

}

export const makeTex = (display: DisplayObject, renderer: IRenderer, center: Point) => {

    const b = display.getBounds(true);
    const tex = RenderTexture.create({ width: b.width, height: b.height });

    const mat = new Matrix(1, 0, 0, 1, center.x, center.y);

    renderer.render(display, {
        renderTexture: tex,
        transform: mat
    });
    return tex;

}
/**
 * Draw display object to Texture and create a sprite from it.
 * @param display 
 */
export const toTexture = (display: DisplayObject, renderer: IRenderer, wrapMode?: WRAP_MODES) => {

    const b = display.getBounds(true);
    const tex = RenderTexture.create({ width: b.width, height: b.height, wrapMode: wrapMode });

    const mat = new Matrix(1, 0, 0, 1, -display.x, -display.y);

    renderer.render(display, {
        renderTexture: tex,
        transform: mat
    });
    return tex;

}