import { Component } from 'gibbon.js';
import { Container, Graphics, Sprite } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { addFilter, removeFilter } from '../../utils/filters';
import { AbilitySchema } from '../../../../server/src/model/schema/data/ability-schema';
import { IAbilityControl } from './ability-control';
import { Player } from './player';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { isAlive } from '../../../../server/src/model/schema/types';
import { TAbilityDef } from '../../../../server/src/ctf/data/ability';

/// TODO: radius from server.
/// TODO: tween in.

/**
 * Display an area of effect aura.
 */
export class AoeFx extends Component<Container> implements IAbilityControl {

    private schema!: PlayerSchema;

    private color: number = 0xcc0000;

    /**
     * Graphic representing the aoe.
     */
    private graphic?: Sprite | Graphics;

    /**
     * Timer for any visual.
     */
    private time: number = 0;

    private filter: GlowFilter = new GlowFilter({
        distance: 12,
        color: this.color
    });

    init() {

        this.schema = this.get(Player)!.schema;
        //addFilter(this.clip!, this.filter);

    }

    public endAbility() { this.enabled = false; }

    public startAbility(ability: AbilitySchema, data?: TAbilityDef, params?: { color: number }) {


        if (params) {
            this.color = params.color;
            this.filter.color = params.color;
        }


        if (!this.graphic) {

            this.graphic = this.createGraphic(ability, data?.radius ?? this.schema.radius);
            this.graphic.tint = this.color;

            this.clip?.addChildAt(this.graphic, 0);
        }

    }

    private createGraphic(ability: AbilitySchema, radius: number) {

        const g = new Graphics();
        g.lineStyle({
            width: 1,
            color: 0xffffff,
            alpha: 0.5
        });
        g.beginFill(0xffffff, 0.12);
        g.drawCircle(0, 0, radius);
        g.endFill();


        return g;

    }

    onEnable() {

        addFilter(this.clip!, this.filter);
        if (this.graphic) {
            this.graphic.visible = true;
        }
    }

    onDisable() {
        if (this.graphic) {
            this.graphic.visible = false;
        }
        if (this.clip && !this.clip.destroyed) {
            removeFilter(this.clip, this.filter);
        }
    }

    update(delta: number) {

        if (!isAlive(this.schema.state)) {
            this.enabled = false;
        } else {

            this.time += delta;
            this.filter.outerStrength = 0.5 + Math.sin(3.5 * this.time);

        }

    }

    onDestroy() {

        if (this.clip && !this.clip.destroyed) {
            removeFilter(this.clip, this.filter);
        }
        this.graphic?.destroy();
        this.graphic = undefined;
    }
}