import { MatchEvent } from '@model/match-events';
import { System } from 'gibbon.js';
import { ITextStyle, Text } from 'pixi.js';
import { Tween, Group as TweenGroup } from 'tweedle.js';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { ClientGame } from '../client-game';
import { IActiveMatch } from '../model/iactive-match';


/**
 * Text life counter on HUD
 */
export class LifeHUD extends System<ClientGame> {

    /**
     * Last value actually displayed.
     */
    private displayHp: number;
    /**
     * Last maximum value displayed.
     */
    private displayMax: number;

    private fldHp: Text;

    private showTween: Tween<LifeHUD>;
    private hideTween: Tween<LifeHUD>;

    public get visible() { return this.enabled; }
    public set visible(v: boolean) { this.fldHp.visible = v; }


    public get x(): number { return this.fldHp.x; }
    public set x(v: number) { this.fldHp.x = v; }

    public get y(): number { return this.fldHp.y; }
    public set y(v: number) { this.fldHp.y = v; }

    private myPlayer?: PlayerSchema;

    constructor(max: number = 100, style?: Partial<ITextStyle>, g?: TweenGroup) {
        super();

        this.fldHp = this.makeField(max, style);

        this.displayHp = max;
        this.displayMax = max;

        this.showTween = new Tween(this, g).to({ alpha: 1 }, 0.2);
        this.hideTween = new Tween(this, g).to({ alpha: 0 }, 0.5).onComplete(v => {
            v.disable();
        }
        );
    }

    private makeField(val: number, style?: Partial<ITextStyle>) {

        return new Text(val, style ?? {

            fontSize: 36,
            fontWeight: 'bold',
            fill: 0xfefefe,
            stroke: 0x050505,
            strokeThickness: 2

        });
    }

    onAdded() {

        this.parent?.clip?.addChild(this.fldHp);

        const match: IActiveMatch = this.game!.activeMatch!;

        match.on(MatchEvent.PlayerJoin, this.onPlayerJoin, this);
        match.on(MatchEvent.CraftChanged, this.onCraftChange, this);
        match.on(MatchEvent.PlayerHp, this.onHp, this);
        /// Hit is watched as a separate event because it is triggered by server immediately
        /// and sends Hp data before schema catches up.
        match.on(MatchEvent.PlayerHit, this.onHp, this);

    }

    private onCraftChange(schema: PlayerSchema) {
        if (this.myPlayer?.id == schema.id) {
            this.enable();
        }
    }
    private onPlayerJoin(schema: PlayerSchema, isLocal: boolean) {

        if (isLocal) {
            this.myPlayer = schema;
            this.enable();
        }
    }

    private onHp(p: PlayerSchema, hp: number) {

        if (p.id === this.myPlayer?.id) {
            this.enable();
        }

    }

    public hide() {
        this.showTween.stop();
        this.hideTween.stop();
        this.disable();
    }

    update() {

        if (!this.myPlayer) {
            return;
        }
        const targHp = this.myPlayer.hp;

        const dCur = (targHp - this.displayHp) / 10;
        const dMax = (this.myPlayer.maxHp - this.displayMax) / 10;

        if (Math.abs(dCur) <= 1) {
            this.displayHp = targHp;
        } else {
            this.displayHp += dCur;
        }

        if (Math.abs(dMax) <= 1) {
            this.displayMax = this.myPlayer.maxHp;
        } else {
            this.displayMax += dMax;
        }
        this.setCurVal(this.displayHp, this.displayMax);

        if (targHp === this.displayHp && (this.myPlayer.maxHp === this.displayMax)) {
            this.disable();
        }

    }

    private setCurVal(cur: number, max: number) {

        cur = Math.ceil(cur);
        max = Math.floor(max);

        this.fldHp.text = cur + '/' + max;

    }

    onDestroy() {

        this.hideTween.stop();
        this.showTween.stop();

    }

}