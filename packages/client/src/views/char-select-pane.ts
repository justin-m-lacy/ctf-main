import { Button, DefaultSkin } from '@pixiwixi/index';
import { TCraftFull } from '../../../server/src/ctf/data/craft-type';
import { LoaderGroup } from '../groups/loader-group';
import { Container, Sprite } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { Tween } from 'tweedle.js';
import { RollOverGroup } from '../groups/rollover';
import { frameSprite } from '../utils/display';
import { ViewControl } from './view-control';
import { Padding, Center } from '@pixiwixi/index';


const GoldColor = 0xFFD700;
export class CharSelectPane extends ViewControl {

    private buttonWidth: number = 84;
    private buttonHeight: number = 84;

    private readonly buttonsParent: Container = new Container();
    private readonly buttons: Map<string, Button> = new Map();
    private readonly tweens: Map<string, Tween<GlowFilter>> = new Map();

    private cols: number = 5;

    /**
     * Space between rows.
     */
    private rowGap: number = 24;

    /**
     * Space between cols.
     */
    private colGap: number = 16;

    private readonly loader: LoaderGroup;

    public get selection() { return this._selected }
    public get hasCraftData() { return this.crafts != null }

    private crafts?: TCraftFull[];

    /**
     * Currently selected craft.
     */
    private _selected?: TCraftFull;

    private readonly onSelectCraft?: (craft?: TCraftFull) => void;

    private rollOvers!: RollOverGroup;



    constructor(loader: LoaderGroup, onSelectCraft?: (craft?: TCraftFull) => void) {
        super({
            width: 640,
            height: 480,
            skin: DefaultSkin,
            padding: 48,
        });

        this.view.visible = false;
        this.view.alpha = 0;

        if (this.view.bg) {
            this.view.bg.alpha = 0.8;
        }

        this.loader = loader;
        this.onSelectCraft = onSelectCraft;

    }

    public setLayout() {

        super.setLayout(

            Padding.All(48,
                new Center(
                    this.buttonsParent
                ))
        );

    }

    init() {

        this.rollOvers = this.game!.getGroup<RollOverGroup>(RollOverGroup)!;
        super.init();

    }

    public setCrafts(crafts: Map<string, TCraftFull>) {

        this.crafts = Array.from(crafts.values());
        this.makeCraftButtons(this.crafts);

        if (this.visible) {
            this.addRollOvers();
        }

    }

    onDisable() {

        this.removeRollOvers();
        super.onDisable();
    }

    public hide() {
        this.deselectBtn();
        super.hide();
    }

    public show() {
        super.show();
        this.addRollOvers();
    }

    private addRollOvers() {

        if (!this.crafts) return;
        for (let i = this.crafts!.length - 1; i >= 0; i--) {

            const data = this.crafts[i];
            const b = this.buttons.get(data.id);
            if (b) {

                this.rollOvers.addRollOver({
                    target: b,
                    avoid: this.view,
                    data: data,

                });
            }

        }

    }

    private removeRollOvers() {
        if (this.rollOvers) {
            for (const b of this.buttons.values()) {
                this.rollOvers.removeRollOver(b);
            }
        }
    }

    /*private makeConfirm() {

        const btnConfirm = new Button({
            onClick: () => this.confirmCraft(),
            width: 80,
            height: 42
        });

        addChildCenter(new Text('Close', this.skin?.smallStyle), btnConfirm);

        btnConfirm.y = this.height - btnConfirm.height - this.padding;
        btnConfirm.x = this.width - btnConfirm.width - this.padding;

        this.addChild(btnConfirm);

    }*/

    private _selectCraft(craft: TCraftFull) {

        this.deselectBtn();

        this._selected = craft;
        this.selectBtn(craft.id);

        this.onSelectCraft?.(craft);
    }

    private makeCraftButtons(crafts: TCraftFull[]) {

        const container = this.buttonsParent;

        for (let i = 0; i < crafts.length; i++) {

            const col = i % this.cols;
            const row = Math.floor(i / this.cols);

            const button = this.makeButton(crafts[i]);
            this.buttons.set(crafts[i].id, button);

            button.position.set(

                col * (this.buttonWidth + this.colGap),
                row * (this.buttonHeight + this.rowGap)

            );

            container.addChild(button);

        }

        if (this.width < container.width) {
            this.width = container.width + 2 * this.colGap;
        }
        if (this.height < container.height) {
            this.height = container.height + 2 * this.rowGap;
        }

        this.addChild(container);


    }

    private makeButton(craft: TCraftFull) {

        const base = new Button({
            onClick: () => this._selectCraft(craft)
        });

        base.width = this.buttonWidth;
        base.height = this.buttonHeight;

        this.loader.loadCraftImage(craft.id).then((tex) => {

            if (!this.isDestroyed) {

                const sprite = Sprite.from(tex);
                frameSprite(sprite, this.buttonWidth, this.buttonHeight, base);

            }

        }).catch(err => console.warn(`asset not found: ${craft.id}`));

        return base;

    }

    /**
     * deselect current button, if any.
     */
    private deselectBtn() {

        const craftId = this._selected?.id;
        if (!craftId) {
            return;
        }

        const tween = this.tweens.get(craftId);
        if (tween) {

            tween.reset().to({ outerStrength: 0 }, 0.3).onComplete(v => {
                v.enabled = false
            }).start();
        }

    }

    /**
     * Display select-effect on button.
     * @param btn 
     */
    private selectBtn(craftId: string) {

        const btn = this.buttons.get(craftId);
        if (!btn) return;

        /// Find or create filter tween.
        let t = this.tweens.get(craftId);
        if (t) {
            t.reset();
        } else {

            const filter = new GlowFilter({
                color: GoldColor,
                outerStrength: 0
            });
            // @ts-ignore
            btn.filters = [filter];

            t = new Tween(filter).safetyCheck(() => !btn.destroyed)
            this.tweens.set(craftId, t);

        }

        /// must overwrite onComplete to overwrite deselect onComplete()
        t.to({ outerStrength: 3 }, 0.3).onStart(v => {
            v.enabled = true;
        }).onComplete(v => { });

        t.start();
    }

    public onDestroy() {

        this.removeRollOvers();

        this.buttons.clear();
        for (const t of this.tweens.values()) {
            t.stop();
        }
        this.tweens.clear();

        super.onDestroy?.();

    }
}