import { ClientGame } from '@/client-game';
import { Group } from 'gibbon.js';
import { Player } from '../components/player/player';
import { LocalEvent } from '../model/app-events';
import { AbilityInput } from '../components/player/ability-input';
import { MatchEvent } from '../model/match-events';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { AbilitySchema, AbilityState } from '../../../server/src/model/schema/data/ability-schema';
import { SnipeControl } from '../components/player/snipe-control';

import { IAbilityControl } from '../components/player/ability-control';
import { HealFx } from '../components/player/heal-fx';
import { AoeFx } from '../components/player/aoe-fx';
import { TAbilityDef } from '../../../server/src/ctf/data/ability';
import { BubbleFx } from '../components/player/bubble-fx';
import { LeapAttackFx } from '../components/player/leap-attack-fx';
import { CommandKey } from '../input/commands';
import { DashFx } from '../components/player/dash-effect';
import { PlayersGroup } from './players-group';
import { PhaseEffect } from '@components/player/phase-effect';
import { MagicCircleFx } from '../components/player/magic-circle';

/**
 * Whether to use an ability control class when ability
 * is triggered by other player, own player, or both.
 */
enum ClientTypes {
    Local = 1,
    Remote = 2,
    All = 3
}

//declare type ConstructorFunction<T> = abstract new (...args: ConstructorParameters<>) => T;

type Constructor<T> = new (args: any) => T;

type BaseInitializer<T extends IAbilityControl> = Constructor<T> |
{
    clients?: ClientTypes,
    cls: Constructor<T>,
    params?: any

}

type Initializer = BaseInitializer<IAbilityControl> | BaseInitializer<IAbilityControl>[];


/**
 * Enables use of special abilities 1->4
 */
export class AbilityGroup extends Group<ClientGame> {

    readonly players: PlayersGroup;

    /**
     * Ability initializers, either to control an ability, or display graphic effects.
     */
    readonly Initializers: { [key: string]: Initializer } = {
        'aoedamage': {
            cls: AoeFx,
            params: { color: 0xcc0000 }
        },
        'aoeheal': {
            cls: AoeFx,
            params: { color: 0x00bb00 }
        },
        'baseport': MagicCircleFx,
        'dash': DashFx,

        'flagport': MagicCircleFx,
        //'flamecone': FlameAbility,
        'healself': HealFx,
        'hibernate': {
            cls: BubbleFx,
            params: { color: 0x83ecfc }
        },
        'leapattack': LeapAttackFx,
        'phase': PhaseEffect,
        'snipe': {
            cls: SnipeControl,
            clients: ClientTypes.Local
        }


    };

    constructor(players: PlayersGroup) {

        super();
        this.players = players;

    }

    onAdded() {

        this.game!.on(LocalEvent.PlayerSpawned, this.initPlayer, this);
        this.game!.activeMatch!.on(MatchEvent.AbilityState, this.onAbility, this);
        this.game!.activeMatch!.on(MatchEvent.CraftChanged, this.onCraftChange, this);

        if (import.meta.env.DEV) {
            this.game!.on(CommandKey.DebugResetAbilities, this.debugResetAbilities, this);
        }

    }

    onRemoved() {

        this.game!.off(LocalEvent.PlayerSpawned, this.initPlayer, this);

        if (import.meta.env.DEV) {
            this.game!.off(CommandKey.DebugResetAbilities, this.debugResetAbilities, this);
        }

    }

    private debugResetAbilities() {
        this.game?.activeMatch?.sendResetCooldowns();
    }
    private onCraftChange(schema: PlayerSchema, newCraft: string, isLocal: boolean) {

        for (let i = 0; i < schema.abilities.length; i++) {
        }

    }

    private onAbility(p: PlayerSchema, ability: AbilitySchema, isLocal: boolean) {


        const player = this.players.getPlayer(p.id);
        if (!player) {
            return;
        }

        switch (ability.state) {

            case AbilityState.active:

                this.initAbility(player, ability, isLocal);
                break;

            case AbilityState.cooldown:
                if (ability.cooldown > 0) {
                    this.endAbility(player, ability, isLocal);
                    break;
                }
            case AbilityState.available:
                if (ability.cooldown <= 0) {
                    this.endAbility(player, ability, isLocal);
                }
                break;
            case AbilityState.removed:
                this.endAbility(player, ability, isLocal);
                break;
        }

    }

    /**
     * Add any visual or controller components associated with ability.
     * @param p 
     * @param ability 
     * @param isLocal 
     */
    private initAbility(p: Player, ability: AbilitySchema, isLocal: boolean) {

        const data = this.game?.assets.getCraftData(p.schema.craft)?.abilities.find(v => v.id == ability.id);


        const init = this.Initializers[ability.id];
        if (init) {
            if (Array.isArray(init)) {
                for (let i = init.length - 1; i >= 0; i--) {
                    this.initController(init[i], p, ability, data, isLocal);
                }
            } else {
                this.initController(init, p, ability, data, isLocal);
            }
        }

    }

    /**
     * Initialize controller component for an ability.
     * @param init
     * @param p 
     * @param ability
     * @param data - raw ability definition.
     * @param isLocal 
     * @returns 
     */
    private initController(init: Exclude<Initializer, Initializer[]>, p: Player, ability: AbilitySchema, data?: TAbilityDef, isLocal: boolean = false) {

        if ('cls' in init) {

            if (init.clients) {
                // ability limits to client types.
                if (isLocal && !(init.clients & ClientTypes.Local)) {
                    return;
                } else if (!isLocal && !(init.clients & ClientTypes.Remote)) {
                    return;
                }
            }

            const comp = p.actor!.require(init.cls);
            comp.startAbility(ability, data, init.params);
            comp.enabled = true;

        } else {

            const comp = p.actor!.require(init);
            comp.startAbility(ability, data);
            comp.enabled = true;
        }

    }

    private endAbility(p: Player, ability: AbilitySchema, isLocal: boolean) {

        const init = this.Initializers[ability.id];
        if (init) {
            if (Array.isArray(init)) {
                for (let i = init.length - 1; i >= 0; i--)this.stopController(init[i], p, isLocal)
            } else {
                this.stopController(init, p, isLocal);
            }
        }
    }


    /**
     * Disable controller component for an ability.
     */
    private stopController(init: Exclude<Initializer, Initializer[]>, p: Player, isLocal: boolean) {

        if ('cls' in init) {

            if (isLocal && init.clients && !(init.clients & ClientTypes.Local) || !isLocal && init.clients && !(init.clients & ClientTypes.Remote)) {
                return;
            }
            const c = p.actor!.get(init.cls);
            if (c) {
                c.endAbility();
            }

        } else {
            const c = p.actor!.get(init);
            if (c) {
                c.endAbility();
            }
        }
    }

    /**
     * Initialize player Actor.
     * @param player 
     */
    private initPlayer(player: Player) {

        if (player.isLocalPlayer) {
            console.assert(player.actor != null, 'player should not be null');
            player.actor!.add(new AbilityInput());
        }
    }


}