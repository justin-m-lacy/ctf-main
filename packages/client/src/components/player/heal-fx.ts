import { Component } from 'gibbon.js';
import { Container } from 'pixi.js';
import { GlowFilter } from '@pixi/filter-glow';
import { addFilter, removeFilter } from '../../utils/filters';
import { AbilitySchema } from '../../../../server/src/model/schema/data/ability-schema';
import { IAbilityControl } from './ability-control';
import { Player } from './player';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { isAlive } from '../../../../server/src/model/schema/types';
import { TAbilityDef } from '../../../../server/src/ctf/data/ability';

/**
 * Minimum time to keep heal effect alive.
 */
const MIN_TIME = 0.2;
export class HealFx extends Component<Container> implements IAbilityControl {

    private time: number = 0;

    private recheckTime: number = 0;

    private schema!: PlayerSchema;

    /**
     * Hp when heal started. Continue while hp increases?
     */
    private lastHp: number = 0;

    private filter: GlowFilter = new GlowFilter({
        distance: 12,
        color: 0x00bb00
    });

    init() {

        this.schema = this.get(Player)!.schema;

    }

    public endAbility() {
    }


    public startAbility(ability: AbilitySchema, data?: TAbilityDef) {

        if (ability.duration > this.recheckTime) {
            this.recheckTime = ability.duration;
        }

    }


    public addHeal(minTime: number = MIN_TIME) {

        if (isAlive(this.schema.state)) {
            this.lastHp = this.schema.hp;
            if (minTime > this.recheckTime) {
                this.recheckTime = minTime;
            }
            if (!this.enabled) {
                this.time = 0;
                this.enabled = true;
            }
        }
    }



    onEnable() {

        addFilter(this.clip!, this.filter);
    }

    onDisable() {
        if (this.clip && !this.clip.destroyed) {
            removeFilter(this.clip, this.filter);
        }
        this.time = 0;
        this.recheckTime = MIN_TIME;

    }

    update(delta: number) {

        if (!this.clip?.visible || !isAlive(this.schema.state)) {
            this.enabled = false;
        } else {

            this.time += delta;
            this.filter.outerStrength = 1.2 + 1 * Math.sin(3.5 * this.time);
            if (this.time > this.recheckTime) {

                if (this.schema.hp > this.lastHp && this.schema.hp < this.schema.maxHp) {
                    this.addHeal(MIN_TIME);
                } else {
                    this.enabled = false;
                }

            }

        }

    }

    onDestroy() {

        if (this.clip && !this.clip.destroyed) {
            removeFilter(this.clip, this.filter);
        }
        this.filter.destroy();
    }
}