import { Component } from 'gibbon.js';
import { Container, Graphics } from 'pixi.js';
import { addFilter, removeFilter } from '../../utils/filters';
import { AbilitySchema } from '../../../../server/src/model/schema/data/ability-schema';
import { IAbilityControl } from './ability-control';
import { Player } from './player';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { isAlive } from '../../../../server/src/model/schema/types';
import { TAbilityDef } from '../../../../server/src/ctf/data/ability';
import { Tween } from 'tweedle.js';
import { ClientGame } from '../../client-game';
import { BubbleFilter } from '../../shaders/bubble/bubble-filter';


/**
 * Display an area of effect aura.
 */
export class BubbleFx extends Component<Container, ClientGame> implements IAbilityControl {

    private schema!: PlayerSchema;

    private color: number = 0x334422;

    /**
     * Graphic representing the fx.
     */
    private container: Container = new Container();

    /**
     * Timer for any visual.
     */
    private time: number = 0;

    private filter?: BubbleFilter;

    private showTween?: Tween<Container>;

    init() {
        this.schema = this.get(Player)!.schema;

        const radius = this.schema.radius * 1.5;
        this.filter = new BubbleFilter({
            radius: radius
        });


        const g = this.createGraphic(radius + 2);
        this.container.addChild(g);

    }

    public endAbility() {
        this.enabled = false;
    }

    public startAbility(ability: AbilitySchema, data?: TAbilityDef, params?: { color?: number, radius?: number }) {

        if (params) {
            if (params.color) {
                this.color = params.color;
            }
        }

        this.startFilter();

    }

    private startFilter() {

        this.container.alpha = 0;
        this.showTween = this.showTween ?? new Tween(this.container, this.game!.gameGroup?.tweens).to({
            alpha: 1
        }, 0.5);
        if (this.filter) {
            addFilter(this.container, this.filter);
            this.clip?.addChild(this.container);
        }
        this.showTween.start();

    }
    private createGraphic(radius: number) {


        const g = new Graphics();
        /// use tint for color.

        g.lineStyle(2, this.color);
        g.beginFill(0xffffff, 0.2);
        g.drawCircle(0, 0, radius);
        g.endFill();


        return g;

    }

    onEnable() {

        if (this.container && !this.container.destroyed) {

            this.startFilter();

            if (this.filter) {
                this.filter.enabled = true;
                this.container.visible = true;
                this.container.alpha = 1;
            }

        }
    }

    onDisable() {

        this.showTween?.stop();
        if (this.container && !this.container.destroyed) {


            new Tween(this.container, this.game!.gameGroup?.tweens).to({
                alpha: 0
            }, 0.2).safetyCheck(v => !v.destroyed).onComplete(v => {

                if (this.filter) {
                    this.filter.enabled = false;
                }
                v.visible = false
                //removeFilter(v, this.filter);

            }).start();


        }
    }

    update(delta: number) {

        if (!isAlive(this.schema.state)) {
            this.enabled = false;
        } else if (this.filter) {

            this.time += delta;
            this.filter.time = 100 * this.time;

        }

    }

    onDestroy() {

        if (this.container && !this.container.destroyed) {
            if (this.filter) {
                removeFilter(this.container, this.filter);
                this.filter.destroy();
            }
            this.container.destroy();
        }

    }
}