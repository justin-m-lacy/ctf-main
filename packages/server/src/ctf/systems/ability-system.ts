import { MessageType } from '../../messages/message-types';
import { CtfRoom } from "../../rooms/ctf-room";
import { CtfMatch } from '../ctf-match';
import { Player } from "../components/player/player";
import { InternalEvent } from '../data/consts';
import { ClientUseAbility, ClientUsePrimary } from '../../messages/client-messages';
import Group from '@/engine/group';
import { SpeedBoost } from '../components/player/abilities/speed-boost';
import { AbilitySchema, AbilityState } from '@/model/schema/data/ability-schema';
import { Constructor } from '@/engine/utils/types';
import { Ability } from '../components/player/abilities/ability';
import { Invisible } from '../components/player/abilities/invisible';
import { Swim } from '../components/player/abilities/swim';
import { Dash } from '../components/player/abilities/dash';
import { Phase } from '../components/player/abilities/phase';
import { ManaBoost } from '../components/player/abilities/mana-boost';
import { TAbilityDef } from '../data/ability';
import { TCraft } from '../data/craft-type';
import { PortToBase } from '../components/player/abilities/base-port';
import { PortToFlag } from '../components/player/abilities/flag-port';
import { TripleShot } from '../components/player/abilities/triple-shot';
import { Teleport } from '../components/player/abilities/teleport';
import { Grenade } from '../components/player/abilities/fire-grenade';
import { ManaFire } from '../components/player/abilities/mana-fire';
import { TPoint } from '../../engine/data/geom';
import { PlayerState } from '@/model/schema/types';
import { Snipe } from '../components/player/abilities/fire-snipe';
import Actor from '../../engine/actor';
import { HealSelf } from '../components/player/abilities/heal-self';
import { AoeHeal } from '../components/player/abilities/aoe-heal';
import { FirePortal } from '../components/player/abilities/fire-portal';
import { AoeDamage } from '../components/player/abilities/aoe-damage';
import { SpawnBlockers } from '../components/player/abilities/spawn-blockers';
import { Regen } from '../components/player/abilities/regen';
import { CtfState } from '@/model/schema/ctf-schema';
import { CircleShot } from '../components/player/abilities/circle-shot';
import { DropBomb } from '../components/player/abilities/drop-bomb';
import { FireHoming } from '../components/player/abilities/fire-homing';
import { SpawnWall } from '../components/player/abilities/spawn-wall';
import { Hibernate } from '../components/player/abilities/hibernate';
import { LeapAttack } from '../components/player/abilities/leap-attack';
import { SlowTarget } from '../components/player/abilities/slow-target';
import { DropCaltrops } from '../components/player/abilities/drop-caltrop';
import { PlayerSchema } from '../../model/schema/player-schema';
import { SpawnCastle } from '../components/player/abilities/spawn-castle';
import { FireHook } from '../components/player/abilities/fire-hook';
import { FlameCone } from '../components/player/abilities/flame-cone';
import { FlameBurst } from '../components/player/abilities/flame-burst';

type AbilityInitializer = Constructor<Ability> | {

    cls: Constructor<Ability>,
    params: object
}



export const AbilityMap: { [key: string]: AbilityInitializer } = {

    "aoeheal": AoeHeal,
    "aoedamage": AoeDamage,
    'baseport': PortToBase,
    'circleshot': CircleShot,
    'dash': Dash,
    'dropcaltrops': DropCaltrops,
    'droptrap': DropBomb,
    'firehoming': FireHoming,
    'firehook': FireHook,
    'fireportal': FirePortal,
    'flagport': {
        cls: PortToFlag,
        params: {
            ownFlag: true
        }
    },
    'flameburst': FlameBurst,
    'flamecone': FlameCone,
    'grenade': Grenade,
    "healself": HealSelf,
    'hibernate': Hibernate,
    'invisible': Invisible,
    'leapattack': LeapAttack,
    'manaboost': ManaBoost,
    'manafire': ManaFire,
    'phase': Phase,
    'slowtarget': SlowTarget,
    'snipe': Snipe,
    'spawnblockers': SpawnBlockers,
    'spawncastle': SpawnCastle,
    'spawnwall': SpawnWall,
    'speed': SpeedBoost,
    'swim': Swim,
    'teleport': Teleport,
    "tripleshot": TripleShot,
    'regen': Regen,
    'enemyflag': {
        cls: PortToFlag,
        params: {
            ownFlag: false
        }
    }
}

export type AbilityKey = keyof typeof AbilityMap & string;

export class AbilitySystem extends Group<CtfMatch> {

    private readonly match: CtfMatch;

    private readonly globalDefs: TAbilityDef[];

    constructor(match: CtfMatch) {

        super();

        this.match = match;
        this.globalDefs = match.room.getAbilityTypes();

        this.addRoomEvents(match.room);
        this.match.on(InternalEvent.PlayerSpawned, this.onPlayerSpawn, this);

    }

    private onPlayerSpawn(player: Player) {
        //player.require(FireTarget, this.state.params);

        if (player.schema.primary) {
            this.initAbility(player.schema.primary, player);
        }

        const abilities = player.schema.abilities;
        for (const a of abilities) {
            this.initAbility(a, player);
        }

    }

    /**
     * Player's craft was changed. must update ability components.
     * @param player 
     */
    public swapCraft(player: Player, craft: TCraft) {

        this.removeAbilities(player);

        const schema = player.schema;

        const primaryDef = this.mergeAbilityDef(schema.primary ?? 'manafire');
        const mergedDefs = this.getCraftAbilities(craft);

        this.setAbilities(schema, mergedDefs, primaryDef);

        const abilities = schema.abilities;
        for (const a of abilities) {
            this.initAbility(a, player);
        }

        if (schema.primary) {
            this.initAbility(schema.primary, player);
        }

    }

    private setAbilities(schema: PlayerSchema, arr: TAbilityDef[], primary?: TAbilityDef) {

        //this.abilities.length = arr.length;

        /// TODO: reuse ability schemas with new data.
        for (let i = 0; i < arr.length; i++) {
            schema.abilities.push(new AbilitySchema(arr[i]));
        }
        if (primary) {
            schema.primary = new AbilitySchema(primary);
        }

    }

    /**
     * Remove all ability components
     * @param player
     * @param keep - abilities not to remove.
     */
    private removeAbilities(player: Player,) {

        const actor = player.actor;

        if (actor) {
            const abilities = player.schema.abilities;
            /// remove components.
            while (abilities.length > 0) {

                const a = abilities.pop()!;
                /*if (keep.findIndex(def => def.id === a.id) >= 0) {
                    continue;
                }*/

                const comp = AbilityMap[a.id];
                if (comp) {

                    if ('cls' in comp) {
                        actor.remove(comp.cls);
                    } else if (!actor.remove(comp)) {
                        console.log(`failed to remove component: ${a.id}`)
                    }

                } else {
                    console.log(`no component found for: ${a.id}`)
                }

            }
        }

    } // removeAbilities()

    addRoomEvents(room: CtfRoom) {

        room.onMessage(MessageType.ClientUsePrimary, (client, msg: ClientUsePrimary) => {
            const player = this.match.players.get(client.id);
            if (player) {

                if (player.state === PlayerState.movable || player.state == PlayerState.firing) {
                    if (player.schema.primary) {
                        this.tryUseAbility(player.schema.primary, player, msg.at);
                    }
                } else if (player.state !== PlayerState.busy) {
                    return;
                }

                const abilities = player.schema.abilities;

                for (let i = 0; i < abilities.length; i++) {

                    const a = abilities[i];
                    if (a.state === AbilityState.active) {
                        const comp = this.getAbilityComponent(player.actor!, a.id);
                        if (comp?.onPrimary) {
                            comp.onPrimary(player.schema, msg.at);
                            return;
                        }
                    }

                }




            }


        });

        room.onMessage(MessageType.ClientUseAbility, (client, msg: ClientUseAbility) => {

            //console.log(`client use ability: ${msg.id}`)
            const player = this.match.players.get(client.id);
            if (player) {

                if (player.state !== PlayerState.movable && player.state !== PlayerState.firing) {
                    return;
                }
                if (msg.id === player.schema.primary?.id) {

                    this.tryUseAbility(player.schema.primary, player, msg.at);
                    return;

                }
                const abilities = player.schema.abilities;

                for (let i = 0; i < abilities.length; i++) {

                    const a = abilities[i];
                    if (a.id === msg.id) {
                        this.tryUseAbility(a, player, msg.at)
                        break;
                    }

                }

            }

        });

        if (process.env.NODE_ENV !== 'production') {
            room.onMessage(MessageType.ClientResetCooldowns, (client) => {
                this.resetAbilities(client.id);
            });

        }

        /**
         * CURRENTLY UNUSED.
         */
        /*room.onMessage(MessageType.ClientTrackPoint, (client, msg: ClientTrackPoint) => {

            const player = this.match.players.get(client.id);
            if (!player) {
                return;
            }
            const abilities = player.schema.abilities;

            for (let i = 0; i < abilities.length; i++) {

                const a = abilities[i];
                if (a.id === msg.ability) {
                    if (!a.trackPos) {
                        a.trackPos = new PointSchema();
                    }
                    a.trackPos.setTo(msg.at);
                    break;
                }

            }


        });*/


    }

    /**
     * Reset ability timers.
     * @param id 
     */
    private resetAbilities(id: string) {

        const player = this.match.players.get(id)?.schema;
        if (player) {

            for (const ability of player.abilities) {

                if (ability.state === AbilityState.cooldown) {
                    ability.state = AbilityState.available;
                    ability.lastUsed = -999999;
                }

            }

        }

    }

    /**
     * Get actor's component for an ability.
     * @param id 
     * @returns 
     */
    private getAbilityComponent(a: Actor, id: string) {
        const init = AbilityMap[id];
        return a.get('cls' in init ? init.cls : init);
    }

    private tryUseAbility(a: AbilitySchema, player: Player, at?: TPoint) {
        if (a.state === AbilityState.available) {

            //console.log(`starting ability: ${a.id}`);

            const init = AbilityMap[a.id];
            player.get('cls' in init ? init.cls : init)?.start(at);

        } else {
            //console.log(`unable to use: ${AbilityState[a.state]}`);
        }
    }

    /**
     * Map ability strings/partial ability overwrites to ability definition type.
     * @param craft 
     */
    private getCraftAbilities(craft: TCraft) {

        const results: TAbilityDef[] = [];
        const defs = craft.abilities;
        for (let i = 0; i < defs.length; i++) {

            const merged = this.mergeAbilityDef(defs[i]);

            if (merged) {
                results.push(merged);
            }

        }

        return results;

    }

    /**
     * Merge a craft's own ability definition with the global ability definitions.
     * @param def 
     */
    private mergeAbilityDef = (def: string | TAbilityDef) => {

        const id = typeof def === 'string' ? def : def.id;

        const baseAbility = this.globalDefs.find(v => v.id === id);
        if (baseAbility) {
            return Object.assign({}, baseAbility, typeof def === 'object' ? def : undefined);
        } else if (typeof def === 'object') {
            return def;
        } else {
            console.warn(`Base Ability json not found: ${id}`);
        }

    }

    private initAbility(ability: AbilitySchema, targ: Player) {


        const init = AbilityMap[ability.id];
        if (init) {

            let comp;
            if ('cls' in init) {

                comp = targ.require(init.cls, ability, init.params);
            } else {

                comp = targ.require(init, ability);

            }
            if (this.match.state.state === CtfState.active) {
                comp.waitCooldown();
            }

        } else {
            console.warn(`AbilitySystem: Ability not found: ${ability.id}`);
        }

    }
}