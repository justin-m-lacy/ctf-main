import { IPoint, Group, tweenOf, TPoint } from 'gibbon.js';
import { ActorBuilder } from '../builders/actor-builder';
import { IActiveMatch } from '../model/iactive-match';
import { ClientGame } from '../client-game';
import { Player } from '@components/player/player';
import type { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import type { DriverSchema } from '../../../server/src/model/schema/data/driver-schema';
import type { TeamSchema } from '../../../server/src/model/schema/team-schema';
import { AlphaFilter } from '@pixi/filter-alpha';
import { warnMissingComponent } from 'gibbon.js/src/utils/logging';
import { MatchViews } from './match-views';
import { MatchEvent } from '../model/match-events';
import { LocalEvent } from '../model/app-events';
import { MatterGroup } from './matter-group';
import { MatterHits } from './matter-hits';
import { AbilityGroup } from './ability-group';
import { addFilter } from '../utils/filters';
import { Followers } from '@components/followers';
import { CtfGroup } from './ctf-group';
import { HealFx } from '../components/player/heal-fx';
import { ParticleSystem } from './particle-system';
import { BodyType, isAlive, PlayerState } from '../../../server/src/model/schema/types';
import { PlayerLerp } from '../components/motion/player-lerp';
import { DamageFlash } from '../components/player/damage-flash';


/**
 * Manage a single team.
 */
export class PlayersGroup extends Group<ClientGame> {

    readonly players: Map<string, Player> = new Map();

    private builder?: ActorBuilder;

    private match?: IActiveMatch;

    private ctf: CtfGroup;

    private particles!: ParticleSystem;

    private matchViews!: MatchViews;

    constructor(ctf: CtfGroup, match: IActiveMatch, builder: ActorBuilder) {

        super();

        this.ctf = ctf;

        this.match = match;
        this.builder = builder;

    }

    onAdded() {

        const match = this.match!;

        this.matchViews = this.ctf.getGroup(MatchViews)!;

        this.particles = this.parent?.getGroup(ParticleSystem)!;

        const matterSystem = this.parent?.getGroup(MatterGroup)!;
        const matterHits = new MatterHits(match, matterSystem, this.ctf.tweens);

        this.addGroup(matterHits);

        this.addGroup(new AbilityGroup(this));

        match.on(MatchEvent.PlayerJoin, this.onPlayerJoin, this);
        match.on(MatchEvent.MatchStart, this.onMatchStart, this);
        match.on(MatchEvent.PlayerHit, this.onPlayerHit, this);
        match.on(MatchEvent.PlayerHp, this.onPlayerHp, this);
        match.on(MatchEvent.PlayerLeave, this.onPlayerLeave, this);
        match.on(MatchEvent.PlayerPos, this.onReposition, this);
        match.on(MatchEvent.PlayerDest, this.onPlayerDest, this);
        match.on(MatchEvent.PlayerHidden, this.onPlayerHide, this);
        match.on(MatchEvent.PlayerMotion, this.onPlayerMotion, this);
        match.on(MatchEvent.PlayerState, this.onPlayerState, this);
        match.on(MatchEvent.CraftChanged, this.onCraftChange, this);

    }

    private onPlayerHp(schema: PlayerSchema, hp: number, increase?: boolean) {

        if (increase) {

            if (isAlive(schema.state)) {

                const p = this.players.get(schema.id);
                if (p) {

                    const fx = p.require(HealFx);
                    fx.addHeal();


                }
            }

        }

    }

    private onPlayerHit(hit: PlayerSchema, hp: number, bodyType?: BodyType) {

        const p = this.players.get(hit.id);

        if (p) {

            let damage = p.get(DamageFlash);
            if (!damage) {
                damage = new DamageFlash(this.ctf.tweens);
                p.add(damage);
            }
            damage.flashHit();
            if (bodyType === BodyType.trap) {
                if (p.isLocalPlayer) {
                    this.matchViews.showMessage(
                        'Trap Triggered!', { size: 42, color: 0xcc0000ff });
                }
            }

        }


    }


    /**
     * Update craft visual.
     * @param id 
     * @param craftId 
     */
    private onCraftChange(schema: PlayerSchema, craftId: string) {

        //console.log(`craft changed: ${id}-> ${craftId}`);
        const player = this.players.get(schema.id);
        if (player) {
            this.builder?.updateCraftImage(player, craftId);
        }
        this.game?.assets.preloadCraft(craftId);


    }

    /**
     * Player hidden due to special ability.
     * @param id 
     * @param hidden 
     * @param isLocal 
     */
    private onPlayerHide(id: string, hidden: boolean, isLocal: boolean) {

        const player = this.players.get(id);
        if (player) {

            const clip = player.clip!;
            const filter = clip.filters?.find(v => v instanceof AlphaFilter) as AlphaFilter
                ?? addFilter(clip, new AlphaFilter());

            const tween = tweenOf(filter);

            const followers = player.get(Followers);

            if (hidden === false) {

                tween.reset();
                tween.to({ alpha: 1 }, 0.5).start();

                followers?.showAll();


            } else {

                if (isLocal) {


                    tween.to({ alpha: 0.5 }, 0.5).start();
                } else {
                    followers?.hideAll();
                    tween.to({ alpha: 0 }, 0.2).start();
                }

            }

        }
    }

    public getPlayer(id: string) {
        return this.players.get(id);
    }

    private onMatchStart() {

        for (const p of this.players.values()) {
            p.reset();
        }
    }


    /**
     * Player State change.
     * @param id 
     * @param state 
     */
    private onPlayerState(schema: PlayerSchema, state: PlayerState, prevState?: PlayerState) {

        const p = this.players.get(schema.id);
        if (p) {

            p.updateState(state, prevState);
            if (state === PlayerState.dead) {

                const state = this.match!.getState();
                const team = state.teams.get(schema.team)!;

                const craftColor = this.game!.assets.getCraftColor(schema.craft)
                this.particles.makeBurst(p.position, team.color, p.color, craftColor ?? team.color);
                if (p.isLocalPlayer) {

                    if (this.matchViews) {
                        this.matchViews.showRespawnTimer(this.match!.getState()!.params.respawnTime)
                    } else {
                        console.warn(`onPlayerState() missing view group.`)
                    }
                }
            }

        } else {
            warnMissingComponent(Player, this.onPlayerState);
        }

    }

    private onPlayerJoin(schema: PlayerSchema, isLocal: boolean) {

        console.log(`player joined: ${schema.id}`);

        const cur = this.players.get(schema.id);
        if (cur) {
            console.warn(`Joined Player Already exists: ${schema.id}`);
            return;
        }

        const state = this.match!.getState();
        const team = state.teams.get(schema.team)!;
        const player = isLocal ? this.spawnLocalPlayer(schema, team) : this.spawnPlayer(schema, team);

        if (player) {
            this.game!.emit(LocalEvent.PlayerSpawned, player);
        } else {
            console.error(`Failed to create Player Actor: ${schema.id} local: ${isLocal}`);
        }

    }

    private spawnLocalPlayer(schema: PlayerSchema, team: TeamSchema) {

        const player = this.builder?.makeLocalPlayer(schema, team.color, this);
        if (player) {

            const state = this.match!.getState();
            this.players.set(schema.id, player);
            this.game!.camera!.target = player.actor!;

            player.actor!.addInstance(
                new PlayerLerp(schema,
                    this.match!.getLatency(),
                    state.patchRate
                ));


            /*player.add(new MoverBounds(
                new Rectangle(0, 0, state.params.arenaWidth, state.params.arenaHeight), schema.radius
            ));*/

        }

        return player;

    }


    private spawnPlayer(schema: PlayerSchema, team: TeamSchema) {

        const player = this.builder?.makeRemotePlayer(schema, team.color, this);
        if (player) {
            this.players.set(schema.id, player);

            player.actor!.addInstance(
                new PlayerLerp(schema,
                    this.match!.getLatency(),
                    this.match!.getState().patchRate
                ));


        }


        return player;

    }

    private onPlayerLeave(player: PlayerSchema) {

        console.log(`PlayersGroup.onPlayerLeave(): ${player.id}`);
        const p = this.players.get(player.id);
        if (p) {

            this.remove(p.actor!);
            p.actor!.destroy();


        }

    }

    private onPlayerMotion(id: string, schema: DriverSchema) {
        /*if (id === this.localPlayerId) {
            (this.players.get(id) as LocalPlayer)?.updateDriver(schema);
        }*/
    }

    /**
     * Event not currently used or even dispatched by client.
     * set player destination.
     * @param id 
     * @param dest 
     */
    private onPlayerDest(id: string, dest: IPoint, angle?: number) {
        /*if (id === this.localPlayerId) {
            (this.players.get(id) as LocalPlayer)?.setDest(dest, angle);
        }*/
    }

    private onReposition(id: string, pos: TPoint, angle?: number) {
        this.players.get(id)?.setPosition(pos, angle);
    }


    onDestroy() {

        this.players.clear();

        this.builder = undefined;
        this.match = undefined;


    }

}