import { Group, Utils, CanvasDraw, Game } from 'gibbon.js';
import { Graphics, WRAP_MODES, Texture, Renderer, Sprite, Container, ALPHA_MODES, TextStyle, BaseTexture, Matrix, Point } from 'pixi.js';
import { makeLensMap } from '../utils/filters';
import { HitType } from '../../../server/src/ctf/data/parser';
import { DefaultSkin, SkinKey } from '@pixiwixi/index';
import { ArenaData } from '../model/arena';
import type { Howl } from 'howler';
// @ts-ignore
import { crafts } from '@server/crafts.json';
import { abilities } from '@server/abilities.json';
import { TCraft, TCraftFull } from '../../../server/src/ctf/data/craft-type';
import wallTexture from '../../static/textures/walls.webp';
import type { VisualData } from '../types/visuals';
import visuals from '../../static/data/visuals.json';
import { RadPerDeg } from '../utils/geom';
import { makeTex } from '../utils/draw';


/**
 * Extra texture constants.
 */
export enum TexKey {

    /// semi-3d displacement map on craft sprites.
    Lens = 'lens',

    /**
     * black texture for rect masking.
     */
    Mask = 'mask',

    CraftBase = 'craftBase',
    /**
     * Circle with fadeout at edge.
     */
    FadeCircle = 'alphaCirc',

    /**
     * Circular shaded rim.
     */
    RimShade = 'rimCircle',
    Flag = 'flag',
}

export class AssetsGroup<G extends Game = Game> extends Group<G> {

    /**
     * Basic ui textures ready. Does not indicate web resources have been loaded.
     */
    public static TexturesReady = 'assetsReady';

    protected readonly textures: Map<string, Texture> = new Map();

    protected readonly sounds: Map<string, Howl> = new Map();

    arena?: ArenaData;

    public readonly crafts: Map<string, TCraftFull> = new Map();

    constructor() {
        super();
        this.initCraftsData();
    }

    /**
     * Initialize core crafts data.
     * Craft details/flavor text not included.
     */
    protected initCraftsData() {

        /// array of all base craft data.
        const arr = crafts;
        const len: number = arr.length;
        for (let i = 0; i < len; i++) {
            this.crafts.set(arr[i].id, this.getCraftFull(arr[i]));
        }


    }

    /**
     * Clear data specific to match.
     */
    public clearMatchData() { this.arena = undefined; }

    public addSound(key: string, file: Howl) { this.sounds.set(key, file); }

    public addTexture(key: string, tex: Texture) { this.textures.set(key, tex); }
    public getTexture(key: string): Texture | undefined { return this.textures.get(key); }

    onAdded() {

        this.prepareUi();
        this.prepareTextures();
    }

    public getCraftColor(id: string) {
        const v = this.crafts.get(id)?.color;
        if (typeof v === 'string') {
            return parseInt(v, 16);
        }
    }

    /**
     * Get secondary craft color
     * @param id 
     */
    public getOffColor(id: string) {
        const v = this.crafts.get(id)?.offColor;
        return (typeof v === 'string') ? parseInt(v, 16) : null;
    }

    public getCraftData(id: string) { return this.crafts.get(id); }

    public getObjectVisual(id?: string, bullet?: string): VisualData | undefined {

        if (!id || !bullet) return undefined;

        const craft = (visuals as any)[id] as undefined | { objects?: { [kind: string]: VisualData | undefined } };
        return craft?.objects?.[bullet];

    }

    private prepareUi() {
        const skin = DefaultSkin;
        skin.renderer = this.game!.app.renderer as Renderer;

        const g = new Graphics();
        g.lineStyle(1.5, 0xffffff, 0.8);
        g.beginFill(0, 0.3);
        g.drawRoundedRect(0.75, 0.75, 62, 62, 4);
        g.endFill();
        g.x = g.y = 0;

        skin.addTexture(SkinKey.frame, g);

        skin.smallStyle = new TextStyle({
            fontSize: 18,
            //fontWeight: 'bold',
            fill: 0xfefefe,
            stroke: 0x050505,
            strokeThickness: 0

        });
        skin.baseStyle = new TextStyle({
            fontSize: 24,
            fontWeight: 'bold',
            fill: 0xfefefe,
            stroke: 0x050505,
            strokeThickness: 1
        });
        skin.largeStyle = new TextStyle({
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xfefefe,
            stroke: 0x050505,
            strokeThickness: 2
        });

    }

    /**
     * Merge craft information with ability information.
     * @param craft 
     */
    private getCraftFull(craft: TCraft): TCraftFull {

        const out: any = {
            abilities: []
        }

        let p: keyof TCraftFull;
        for (p in craft) {

            if (p != 'abilities') {
                out[p] = craft[p]
            }
        }

        /// abilities defined on craft. Either string or ability with data overrides.
        const craftAbilities = craft.abilities;
        if (craftAbilities) {

            for (let i = 0; i < craftAbilities.length; i++) {

                const craftInfo = craftAbilities[i];
                const abilityData = abilities.find(v => (typeof craftInfo === 'string') ? v.id === craftInfo : v.id === craftInfo.id
                );

                if (abilityData) {

                    if (typeof craftInfo === 'string') {

                        out.abilities.push(Object.assign({}, abilityData));
                    } else {
                        out.abilities.push(Object.assign(craftInfo, abilityData))
                    }
                }



            }


        }

        return out as TCraftFull;

    }


    /**
     * Return keyed texture as sprite.
     * @param key 
     */
    public getAsSprite(key: string) {
        const tex = this.textures.get(key);
        return tex ? Sprite.from(tex) : null;
    }

    /**
     * Creates a Sprite mask from the Mask key to limit target's visibility.
     * @param maskKey - key of mask texture.
     * @param target - target to mask in/out.
     */
    public setSpriteMask(maskKey: string, target: Container) {

        const maskTex = this.textures.get(maskKey);
        if (!maskTex) {
            console.warn(`Missing mask texture: ${maskKey}`);
        } else {
            const mask = Sprite.from(maskTex);
            mask.anchor.set(0.5, 0.5);
            mask.width = target.width;
            mask.height = target.height;

            mask.position.set(target.x, target.y);
            target.mask = mask;
            target.parent?.addChild(mask);

        }
    }

    /**
     * Prepare basic textures used.
     * TODO: display loading/waiting, etc. Background worker?
     */
    private async prepareTextures() {

        this.textures.set(
            TexKey.FadeCircle,
            this.makeCircleGrad(0xffffffff, 0, 0.84));

        const base = new BaseTexture(null, {
            width: 64, height: 64,
        });
        this.textures.set(TexKey.Mask,

            Texture.from(base)
        );

        this.game!.emit(AssetsGroup.TexturesReady);

    }

    public getCraftBase(radius: number, color: number) {

        let tex = this.textures.get(TexKey.CraftBase);
        if (!tex) {
            tex = this.makeCraftBase(radius);
            this.textures.set(TexKey.CraftBase, tex);
        }
        const s = Sprite.from(tex);
        s.pivot.set(radius, radius);
        s.tint = color;

        return s;

    }

    private makeCraftBase(radius: number,) {

        const graphics = new Graphics();
        graphics.beginFill(0xffffff, 1);
        graphics.drawCircle(0, 0, radius);

        /// Draw pointer arrow.
        const arcX = radius * Math.cos(10 * RadPerDeg), arcY = radius * Math.sin(10 * RadPerDeg);
        graphics.moveTo(arcX, -arcY);
        graphics.lineTo(radius + 10, 0);
        graphics.lineTo(arcX, arcY);
        graphics.endFill();

        const rimTex = this.getTexture(TexKey.RimShade);
        if (rimTex) {
            graphics.beginTextureFill({
                texture: rimTex,
                matrix: new Matrix(2 * radius / rimTex.width, 0, 0, 2 * radius / rimTex.width, -radius, -radius),
            });

            graphics.drawRect(-radius, -radius, 2 * radius, 2 * radius);
            graphics.endFill();
        }

        return makeTex(graphics, this.game!.renderer, new Point(radius, radius));
    }

    /**
     * Currently stupid trick to split some of the texture processing.
     * Need to move to shaders or background
     */
    public initGameTextures() {

        if (!this.textures.has(TexKey.RimShade)) {
            this.textures.set(TexKey.RimShade, this.makeCircleGrad(0, 0x40000000, 0.75));
        }

        if (!this.textures.has(HitType.Wall)) {
            const wallTex = BaseTexture.from(wallTexture, {
                wrapMode: WRAP_MODES.REPEAT
            });
            this.textures.set(HitType.Wall, Texture.from(wallTex));
        }

        if (!this.textures.has(TexKey.Lens)) {
            this.textures.set(TexKey.Lens, makeLensMap(64, 64 * (20 / 32)));
        }
    }

    /**
     * Create gradient of full color fading outwards from center.
     * NOTE: radial gradients begin at center and color outwards.
     */
    private makeCircleGrad(
        innerColor: number = 0xffffff,
        outerColor: number = 0,
        innerPct: number = 0.8) {

        const radius: number = 42;
        const canvas = new CanvasDraw(2 * radius, 2 * radius);
        const ctx = canvas.getContext()!;

        const grad = new Utils.Gradient(
            [innerColor, innerColor, outerColor], [0, innerPct, 1]
        ).toAlphaRadial(ctx, 0, radius, radius, radius);
        ctx.fillStyle = grad;

        ctx.arc(radius, radius, radius, 0, 2 * Math.PI)
        ctx.fill();

        // ctx.fillRect(0, 0, 2 * radius, 2 * radius);



        return Texture.from(canvas.canvas, {
            alphaMode: ALPHA_MODES.NO_PREMULTIPLIED_ALPHA
        });

    }

}