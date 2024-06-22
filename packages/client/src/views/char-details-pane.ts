import { DefaultSkin } from '@pixiwixi/index';
import { LoaderGroup } from '../groups/loader-group';
import { Text, Container, ITextStyle } from 'pixi.js';
import { CtfSchema } from '../../../server/src/model/schema/ctf-schema';
import { TCraftFull } from '../../../server/src/ctf/data/craft-type';
import { TAbilityDesc, TAbilityType } from '../../../server/src/ctf/data/ability';
import LayoutHelper from '@/builders/layout-builder';
import { BASE_SPEED } from '../../../server/src/model/schema/types';
import { timeString, toUppercase } from '../utils/format';
import { ViewControl } from './view-control';
import { Padding, Separate, Axis, Align } from '@pixiwixi/index';
import { FlowLayout } from '../../../pixiwixi/src/layout/flow-layout';
import { ImageFrame } from './image-frame';
import { BoundedBox } from '../../../pixiwixi/src/layout/bounded-box';

const SPACE_Y: number = 4;
const MIN_WIDTH: number = 500;
const MIN_HEIGHT = 500;
const MAX_WIDTH = 700;


/**
 * Displays information about a character and abilities.
 */
export class CharDetailsPane extends ViewControl {

    private readonly loader: LoaderGroup;

    // Currently only used to access baseHp.
    private readonly state: CtfSchema;

    private readonly thumbSize: number = 92;

    private curCraft?: TCraftFull;

    private fldName: Text;
    private fldDesc: Text;
    private fldHp: Text;
    private fldSpeed: Text;

    private lbAbilities: Text;

    /**
     * Thumbnail of character.
     */
    private readonly charThumb: ImageFrame;

    /**
     * Contains all information content. Content is sized separately from Pane
     * so pane can resize to match content.
     */
    private readonly content: Container = new Container();
    private readonly abilityList: Container = new Container();

    /**
     * Text style for small wrapped text.
     */
    private smallWrappedStyle: ITextStyle;

    private padX: number = 28;

    constructor(state: CtfSchema, loader: LoaderGroup) {

        super({

            width: MIN_WIDTH,
            height: MIN_HEIGHT,
            skin: DefaultSkin,
            interactive: false
        });

        this.state = state;
        this.loader = loader;

        this.view.visible = false;
        this.view.alpha = 0;
        this.view.addChild(this.content);

        this.smallWrappedStyle = Object.assign<Partial<ITextStyle>, ITextStyle | undefined, Partial<ITextStyle>>({},

            this.skin?.smallStyle, {
            wordWrap: true,
            wordWrapWidth: MIN_WIDTH - 2 * this.padX
        });

        this.charThumb = this.makeThumbSprite();

        this.fldName = new Text('', this.skin?.baseStyle);
        this.fldHp = new Text('', this.skin?.smallStyle);
        this.fldSpeed = new Text('', this.skin?.smallStyle);
        this.fldDesc = new Text('', this.smallWrappedStyle);


        this.lbAbilities = new Text('Abilities:',
            Object.assign<Partial<ITextStyle>, ITextStyle | undefined, Partial<ITextStyle>>(
                {},
                this.skin?.baseStyle,
                {
                    fontWeight: 'bold',
                }
            ));

    }

    public setLayout() {

        super.setLayout(

            new BoundedBox({
                minWidth: MIN_WIDTH,
                maxWidth: MAX_WIDTH,
                minHeight: MIN_HEIGHT,

            },
                Padding.Sides(28, 20,

                    new FlowLayout(

                        {
                            items: [

                                new Separate(
                                    this.charThumb.frame,
                                    this.fldName,
                                    Axis.Horizontal,
                                    Align.Start),
                                this.fldHp,
                                this.fldSpeed,
                                this.fldDesc,

                                this.lbAbilities,
                                this.abilityList



                            ],
                            align: Align.Start,
                            parent: this.content,
                            spacing: 8

                        }
                    )


                ))

        );

    }

    /**
     * Set craft being viewed.
     * @param craft 
     */
    public setCraft(craft: TCraftFull) {

        this.curCraft = craft;

        this.setCraftImage(craft.id);
        this.fldName.text = toUppercase(craft.name ?? craft.id);

        this.fldHp.text = 'Health: ' + (craft.stats?.maxHp ?? this.state.params.baseHp);
        this.fldSpeed.text = 'Speed: ' + this.getSpeedText(craft.stats?.maxSpeed);
        this.fldDesc.text = craft.desc ?? '';

        this.addAbilities(craft.abilities);

        this.fitContent();

    }

    private fitContent() {

        this.width = Math.max(this.content.width + 2 * this.padX, MIN_WIDTH);
        this.height = Math.max(this.content.height + 2 * this.padX, MIN_HEIGHT);

    }

    private getSpeedText(speed?: number) {
        if (!speed || speed === BASE_SPEED) {
            return 'Average';
        }
        return speed < BASE_SPEED ? 'Fast' : 'Slow';
    }

    private makeThumbSprite() {

        return new ImageFrame(
            this.skin!.makeFrame(this.thumbSize, this.thumbSize)!, this.thumbSize, this.thumbSize, 6, 6
        );

    }

    private setCraftImage(id: string) {

        this.loader.loadCraftImage(id).then(v => {

            if (v && id === this.curCraft?.id) {
                this.charThumb.texture = v;
            }

        });

    }

    /**
     * Add text for ability definitions.
     * @param abilities 
     */
    private addAbilities(abilities: TAbilityDesc[]) {

        const helper = new LayoutHelper(this.abilityList, {
            paddingY: SPACE_Y,
            edgeY: 0,
            edgeX: 0
        });

        this.abilityList.removeChildren();

        for (let i = 0; i < abilities.length; i++) {
            this.addAbilityInfo(abilities[i], helper);
        }

    }

    private addAbilityInfo(def: TAbilityDesc, layout: LayoutHelper) {

        const fldName = new Text(
            toUppercase(def.name ?? def.id),
            this.skin?.baseStyle);

        layout.addLine(fldName);
        layout.indent();
        layout.spaceY();

        if (def.type) {
            layout.addLine(new Text('Type: ' + this.getAbilityType(), this.smallWrappedStyle))
        }

        if (def.desc) {
            layout.addLine(new Text(def.desc, this.smallWrappedStyle));
        }

        if (def.cooldown) {
            const fldCd = new Text('Cooldown: ' + timeString(def.cooldown), this.skin?.smallStyle);
            layout.addLine(fldCd);
        }

        if (def.duration) {
            const fldDuration = new Text('Duration: ' + timeString(def.duration), this.skin?.smallStyle);
            layout.addLine(fldDuration);
        }

        layout.removeIndent();
        layout.spaceY(8);

    }

    private getAbilityType(type?: TAbilityType) {
        if (!type || type === 'trigger') {
            return 'activate';
        }
        return (type === 'aim') ? 'aimed' : 'passive';
    }

}