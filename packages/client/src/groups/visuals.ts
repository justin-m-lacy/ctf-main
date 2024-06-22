import { TPoint, Group, Actor, Component } from 'gibbon.js';
import { Container, FillStyle, LineStyle, Graphics, LINE_CAP, Sprite, DisplayObject, Texture, WRAP_MODES, ITextStyle, Text } from 'pixi.js';
import { TeamSchema } from '../../../server/src/model/schema/team-schema';
import { drawCircle, drawDashedPath, drawDashedPoly, drawRect, texCircle, texRect, toTexture, drawPoly, texPoly } from '../utils/draw';
import { ArenaData, TPolygon } from '../model/arena';
import { GeomData, HitData, HitType, MapData } from '../../../server/src/ctf/data/parser';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';
import { TexKey } from './asset-group';
import { ClientGame } from '../client-game';
import { WaterEffect } from '../components/water-effect';
import { DisplacementFilter } from '@pixi/filter-displacement';
import { RadPerDeg, DegPerRad } from '../utils/geom';
import { ActorImage } from '../components/actor-image';
import { LoaderGroup } from './loader-group';
import { TCraft } from '../../../server/src/ctf/data/craft-type';
import { MatchAngle } from '../components/motion/match-angle';
import { lighten } from '@/utils/display';
import { addFilter } from '../utils/filters';
import { BodySchema } from '../../../server/src/model/schema/body-schema';
import { BodyShape } from '../../../server/src/model/matter';
import { Followers } from '../components/followers';
import { VisualData } from '../types/visuals';

/**
 * Angle to use for shadows.
 */
const GlobalShadowRad: number = 140 * RadPerDeg;

const BorderColor = 0x222222;

const BulletColor = 0x441111;

type GrahpicsStyle = {
    fill?: FillStyle,
    line?: LineStyle
}
const HitFills = new Map<string, GrahpicsStyle>([

    [HitType.Water, makeStyle(0x000077, 0.6, BorderColor, 2)],
    [HitType.Wall, makeStyle(0x335533, 1, BorderColor, 1, 6)],

]);

export class Visuals extends Group<ClientGame> {

    private readonly assets: LoaderGroup;

    private readonly drawFuncs = new Map<HitType, (h: HitData, parent: Container) => DisplayObject>(
        [
            [HitType.Water, (hit, p) => this.drawWaterHit(hit, p)],
            [HitType.Wall, (hit, p) => this.drawBasic(hit, p)],
        ]
    );

    constructor(assetGroup: LoaderGroup) {

        super();
        this.assets = assetGroup;

    }

    private drawHits(mapData: MapData, container?: Container) {

        const parent = container ?? new Container();
        const hits = mapData.walls;

        for (let i = hits.length - 1; i >= 0; i--) {

            const hit = hits[i];
            const func = this.drawFuncs.get(hit.type);
            if (func) {
                func(hit, parent);
            } else {
                this.drawBasic(hit, parent);
            }


        }

        return parent;

    }

    private drawWaterHit(hit: HitData<GeomData>, parent: Container) {

        const visual = this.drawBasic(hit);
        parent.addChild(visual);

        /*const maskSprite = new Sprite(this.assets.getTexture(TexKey.Mask));
        maskSprite.position = visual.position;
        maskSprite.width = visual.width;
        maskSprite.height = visual.height;
        parent.addChild(maskSprite);*/

        const a = new Actor(visual);
        a.add(new WaterEffect(visual, this.game?.filterLayer, { lambda: 500, amplitude: 4 }));
        //a.add(new TiledMotion(16, 0));
        this.add(a);

        return visual;

    }


    /**
     * Draw base color/texture for a hit. Filters/changes
     * can be applied by calling function.
     * @param tex - Optional texture override.
     */
    private drawBasic(hit: HitData, parent?: Container, tex?: Texture,) {

        const style = HitFills.get(hit.type);
        tex = tex ?? this.assets.getTexture(hit.type);

        let graphic: Graphics;

        if (tex) {

            if (hit.shape === 'circ') {
                graphic = texCircle(hit, hit.r, tex, style?.line, parent);
            } else if (hit.shape === 'rect') {
                graphic = texRect(hit, tex, style?.line, parent);
            } else {
                graphic = texPoly(hit, tex, style?.line, parent);
            }

        } else {

            if (hit.shape === 'circ') {
                graphic = drawCircle(hit, hit.r, style?.fill, style?.line, parent);
            } else if (hit.shape === 'rect') {
                graphic = drawRect(hit, style?.fill, style?.line, parent);
            } else {
                graphic = drawPoly(hit.points, style?.fill, style?.line, parent);
            }
        }

        const sprite = Sprite.from(toTexture(graphic, this.game!.app.renderer),
            { wrapMode: WRAP_MODES.MIRRORED_REPEAT });

        sprite.x = graphic.x;
        sprite.y = graphic.y;
        return sprite;

    }

    public drawArena(arena: ArenaData, parent: Container) {

        this.drawArenaBounds(arena.width, arena.height, parent);
        if (arena.teamBorder) {
            this.drawBorder(arena.teamBorder, parent);
        }

        if (arena.mapData) {
            parent.addChild(this.drawHits(arena.mapData, parent));
        }

        for (const team of arena.state.teams.values()) {

            this.drawSpawnArea(team, arena.getSpawnRegion(team.id)?.toPolygon(), parent);

        }

    }

    public drawBorder(path: TPoint[], parent: Container) {

        const g = new Graphics();
        const line = new LineStyle();
        line.width = 6;
        line.cap = LINE_CAP.SQUARE;
        line.color = BorderColor;
        line.alpha = 0.95

        drawDashedPath(path, g, {
            lineStyle: line,
            size: 32,
            gap: 20
        });
        parent.addChild(g);

    }

    public drawArenaBounds(width: number, height: number, parent: Container) {

        const g = new Graphics();

        g.lineStyle(14, BorderColor);
        g.drawRect(0, 0, width, height);

        parent.addChild(g);
    }

    public drawSpawnArea(team: TeamSchema, polygon?: TPolygon, parent?: Container) {

        const fill = new FillStyle();
        fill.color = team.color;
        fill.alpha = 0.3;
        const line = new LineStyle();
        line.width = 8;
        line.color = team.color;
        line.alpha = 0.9;

        if (polygon) {

            const g = drawDashedPoly(polygon, new Graphics(), {
                fillStyle: fill,
                lineStyle: line,
                size: 32,
                gap: 18
            });
            if (g) {
                parent?.addChild(g);
            }
            return g;

        } else {

            return drawCircle(team.flag.spawn, 20, fill, line, parent);
        }

    }

    /**
     * using radius here won't work because the sprite image will have
     * a sharp displacement cutoff
     * @param target 
     * @param container 
     */
    public addLens(target: Container, container?: Container, strength: number = 3) {

        const lens = this.assets.getAsSprite(TexKey.Lens);

        if (lens) {
            //const size = Math.max(target.width, target.height);
            lens.width = target.width;
            lens.height = target.height;
            lens.anchor.set(0.5, 0.5);
            lens.position.set(0, 0);

            const filter = new DisplacementFilter(lens, strength);
            addFilter(target, filter);

            (container ?? target).addChild(lens);
            return filter;

        } else {
            console.warn(`Lens filter Missing.`)
        }

    }

    public addFlagTex = (base: Container, radius: number, color: number) => {

        const tex = this.assets.getTexture(TexKey.Flag);
        if (tex) {

            const sprite = Sprite.from(tex);
            sprite.tint = lighten(color);
            sprite.anchor.set(0.5, 0.5);
            sprite.width = sprite.height = 2 * radius;
            sprite.rotation = -6 * RadPerDeg;

            base.addChild(sprite);
            //this.assets.setSpriteMask(TexKey.CircleMask, sprite);

            return sprite;

        } else {
            console.warn(`Visuals.addFlagTex() Flag texture not found.`);
        }

    }

    /**
     * Initialize the component to hold a player's main texture.
     * @param act
     * @param radius 
     */
    public initCraftSprite(act: Actor, radius: number) {

        const image = act.add(new ActorImage());
        const sprite = image.sprite;

        sprite.width = sprite.height = 2.1 * radius;

        //sprite.rotation = Math.PI / 2;

        this.assets.setSpriteMask(TexKey.FadeCircle, sprite);

        const filter = this.addLens(sprite, sprite.parent)
        if (filter) {
            act.require(MatchAngle).addChild(filter.maskSprite! as Sprite);
        }

    }

    /**
     * Draw default flag Graphic.
     * @param color 
     * @param size 
     * @param parent 
     * @returns 
     */
    public drawFlag(color: number, size: number, parent?: Container) {

        const g = drawRect(
            {
                x: 0, y: 0, w: size, h: size,
            },
            {
                color: color,
                alpha: 1
            },
            {
                color: 0,
                alpha: 1
            });

        parent?.addChild(g);
        return g;
    }

    public applyCustomVisual = (clip: Container, visual: VisualData) => {

        if (visual.width) {
            clip.width = visual.width;
        }
        if (visual.height) {
            clip.height = visual.height;
        }

    }

    /**
     * 
     * @param type - bullet type.
     * @param radius - bullet size.
     * @param craftData - firing craft.
     * @param color 
     * @returns 
     */
    public makeBullet(type: string, width: number, height: number, craftData?: TCraft) {

        if (craftData) {

            const imageUrl = this.assets.getImageUrl(craftData.id, type.toLowerCase());
            if (imageUrl) {

                const sprite = new Sprite();
                sprite.width = width;
                sprite.height = height;

                this.assets.loadTextureUrl(imageUrl).then(v => {

                    if (v && !sprite.destroyed) {

                        sprite.texture = v;
                        sprite.anchor.set(0.5, 0.5);
                        sprite.scale.set(width / v.width);

                    }

                }).catch();

                return sprite;

            }

        }

        return drawCircle({ x: 0, y: 0 }, width / 2,
            {
                color: craftData?.color ? parseInt(craftData.color, 16) : BulletColor,
                alpha: 1
            },
            {
                width: 1.2,
                color: 0
            });


    }

    /**
     * Draw a simple actor body.
     * @param go 
     * @param radius 
     * @param color 
     */
    public drawDefaultBody = (body: BodySchema, color: number, parent?: Container,) => {

        if (body.shape === BodyShape.circle) {

            return drawCircle({ x: 0, y: 0 }, body.extents.x,
                {
                    color: color,
                    alpha: 1
                },
                {
                    width: 1.2,
                    color: 0
                }, parent);

        } else if (body.shape === BodyShape.rect) {

            return drawRect({ x: 0, y: 0, w: 2 * body.extents.x, h: 2 * body.extents.y }, {
                color: color,
                alpha: 1
            }, {
                width: 1.2,
                color: 0
            }, parent)
        }

    }

    public addDropShadow(container: Container, distance: number = 4) {
        const ds = new DropShadowFilter({
            distance: distance,
            rotation: GlobalShadowRad * DegPerRad

        });
        container.filters ? container.filters.push(ds) : container.filters = [ds];
    }

    /**
     * Create a texture, rather than filter, shadow. Currently unused.
     * @param radius 
     * @param parent 
     * @param angle 
     * @param moveToBack 
     * @returns 
     */
    /*public addShadow(radius: number, parent?: Container, angle: number = 0, moveToBack: boolean = true) {

        const g = Sprite.from(this.assets.getTexture(TexKey.Shadow)!);
        g.anchor.set(0.5, 0.5);
        g.width = g.height = 2.1 * (radius);
        g.alpha = 0.5;

        g.position.set(
            6 * Math.cos(angle), 6 * Math.sin(angle)
        )

        if (parent) {
            if (moveToBack) {
                parent.addChildAt(g, 0);
            } else {
                parent.addChild(g);
            }
        }

        return g;

    }*/

    /**
     * Make visual for a percent-bar-display.
     * @returns 
     */
    public makePercentBar(color: number, width: number, height: number = 12) {

        //const size = 2 * player.schema!.radius;

        const g = new Graphics();
        g.beginFill(color, 0.5);
        g.drawRect(0, 0, width, height);
        g.endFill();

        return g;

    }

    /**
     * Make username label.
     * @param targ 
     * @param text 
     * @param textInfo 
     * @param at 
     * @returns 
     */
    public makeLabel = (targ: Actor<Container> | Component<Container>, text: string, textInfo: Partial<ITextStyle> = { fill: 0xffffff, fontSize: 16, align: 'center', dropShadow: false, fontWeight: 'bold', stroke: 0, strokeThickness: 2, dropShadowAngle: GlobalShadowRad, dropShadowDistance: 2, dropShadowColor: 0x000000, dropShadowBlur: 2 }, at: TPoint = { x: 0, y: 0 }) => {

        const label = new Text(text, textInfo);
        if (targ.clip) {
            targ.clip.parent.addChild(label);
        }

        at.x -= label.width / 2;
        at.y += targ.clip!.height / 2 - label.height / 2;

        const f = targ.require(Followers);
        f.addFollower(label, at);

        return label;

    }

}

function makeStyle(fill: number, fillAlpha: number, lineColor: number, lineAlpha: number, lineWidth: number = 1) {

    const fillStyle = fillAlpha > 0 ? new FillStyle() : undefined;
    if (fillStyle) {
        fillStyle.color = fill;
        fillStyle.alpha = fillAlpha;

    }

    const lineStyle = lineAlpha > 0 ? new LineStyle() : undefined;
    if (lineStyle) {
        lineStyle.color = lineColor;
        lineStyle.alpha = lineAlpha;
        lineStyle.width = lineWidth;
    }

    return {
        fill: fillStyle,
        line: lineStyle
    };

}
