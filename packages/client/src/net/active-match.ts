import { Room } from 'colyseus.js';
import { MessageType } from '../../../server/src/messages/message-types';
import { IActiveMatch } from '../model/iactive-match';
import EventEmitter from 'eventemitter3';
import { ServerEvents, MatchEvent } from '../model/match-events';
import { ColyseusUser } from './colyseus-user';
import { CtfSchema, CtfState } from '../../../server/src/model/schema/ctf-schema';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { TPoint } from 'gibbon.js';
import { TeamSchema } from '../../../server/src/model/schema/team-schema';
import { FlagSchema } from '../../../server/src/model/schema/flag-schema';
import { PlayerDied, PlayerHit, Reposition, TeamScored } from '../../../server/src/messages/game-messages';
import { Latency } from './latency';
import { AbilitySchema, AbilityState } from '../../../server/src/model/schema/data/ability-schema';
import { GeomData, MapData } from '../../../server/src/ctf/data/parser';

/**
 * Handles active game.
 */
export class ActiveMatch implements IActiveMatch {

    private _room?: Room<CtfSchema> | null;

    public get localPlayerId() { return this._room?.sessionId ?? null }
    public isLocalPlayer(p: PlayerSchema) { return p.id === this._room?.sessionId; }
    public getLocalPlayer() { return this._room?.state.players.get(this._room.sessionId) }

    private readonly emitter: EventEmitter<ServerEvents> = new EventEmitter();

    private readonly user: ColyseusUser;

    private readonly latency: Latency = new Latency();

    getDelay() { return this.latency.getDelay() }

    getLatency() { return this.latency }

    constructor(auth: ColyseusUser) {
        this.user = auth;
    }

    private pinger?: number;

    private pingSendTime: number = 0;

    destroy() {

        if (this.pinger) {
            clearInterval(this.pinger);
        }

        if (this._room) {
            this._room.removeAllListeners();
            this._room = null;
        }
        this.emitter.removeAllListeners();
    }

    setRoom(room: Room<CtfSchema>) {

        this._room = room;


        this.watchRoom(room);
        this.watchTeams(room.state);
        this.watchBullets(room.state);
        this.watchPlayers(room.state);
        this.watchBodies(room.state);

        this.startPing();

    }

    private startPing() {

        this.pinger = window.setInterval(() => {

            if (this.pingSendTime > 0) {
                console.log(`Already sending ping. skipping duplicate send.`);
                return;
            }
            this.pingSendTime = Date.now();
            this._room?.send(MessageType.Ping, {});

        }, 5000);

    }

    /**
     * Listen for room events.
     */
    private watchRoom(room: Room<CtfSchema>) {

        room.onMessage(MessageType.Ping, () => {
            if (this.pingSendTime > 0) {

                this.latency.addRtt(Date.now() - this.pingSendTime);
                this.pingSendTime = 0;
            }

        });

        room.onMessage(MessageType.MatchChat, data => {

            // convert id to player name.
            const player = this.getPlayer(data.from);
            if (player) {
                data.from = player.name;
                this.emitter.emit(MatchEvent.MatchChat, data);
            } else {
                console.log(`chat from missing player: ${data.from}`);
            }

        });

        room.onMessage(MessageType.MapData, (msg: { map: MapData<GeomData>, serverTime: number }) => {
            this.latency.setServerStart(msg.serverTime);
            this.emitter.emit(MatchEvent.InitialState, this.getState(), msg.map);
        });

        room.onStateChange.once((state) => {
            console.log(`First State Change`);
            //this.emitter.emit(MatchEvent.InitialState, state);
        });

        room.onMessage(MessageType.MatchTime, (msg: { time: number }) => {
            this.latency.setServerStart(msg.time);
        });

        room.onMessage(MessageType.PlayerDied, (message: PlayerDied) => {
            this.onPlayerDied(message);
        });

        room.onMessage(MessageType.PlayerHit, (msg: PlayerHit) => {

            this.emitter.emit(MatchEvent.PlayerHit,
                this.getPlayer(msg.who)!, msg.hp, msg.bodyType,
                msg.by ? this.getPlayer(msg.by) : undefined);

        });

        room.onMessage(MessageType.Reposition, (msg: Reposition) => {
            this.emitter.emit(MatchEvent.PlayerPos, msg.who, msg.pos, msg.angle);
        });

        room.onMessage(MessageType.TeamScored, (msg: TeamScored) => {
            this.emitter.emit(MatchEvent.TeamScored, msg.team, msg.score, msg.who);
        });

        room.onError((code: number, message?: string) => {

            console.log(`Room error: ${code} ${message}`);
            this.emitter.emit(MatchEvent.MatchError, code);
        });

        room.onLeave((code) => {
            console.log(`Left room. Code: ${code}`);
            this.destroy();
        });

        room.state.listen('state', (value) => {
            if (value === CtfState.ended) {
                this.emitter.emit(MatchEvent.MatchEnd, room.state, this.findWinTeam(room.state)!);
            } else if (value === CtfState.setup) {
                this.emitter.emit(MatchEvent.MatchWaiting, room.state);
            } else if (value === CtfState.active) {
                this.emitter.emit(MatchEvent.MatchStart, room.state)
            }
        });

    }

    /**
     * Player died message received. update the schema and trigger manually.
     * @param message 
     */
    private onPlayerDied(message: PlayerDied) {

        const player = this.getPlayer(message.who);
        if (player) {

            /// Note: local schema objects do not contain functions.
            player.pos.x = message.at.x;
            player.pos.y = message.at.y;
            //player.state = PlayerState.dead;


            /// questionable practice.
            //player.triggerAll();

            /*if (message.flag) {
                const flag = this.getState().teams.get(message.flag)?.flag;
                if (flag) {
                    flag.pos.x = message.at.x;
                    flag.pos.y = message.at.y;
                    /// Note: for unknown reasons, flag carrier
                    /// cannot be reset here.
                    flag.state = FlagState.dropped;
                    //flag.triggerAll();
                }
            }*/

            if (message.by) {

                const by = this.getPlayer(message.by);
                if (by) {
                    this.emitter.emit(MatchEvent.PlayerKilled, player, by);
                }
            }

        }
    }

    public getPlayer(id?: string) {
        return id ? this._room?.state?.players.get(id) : undefined;
    }

    /**
     * Watch players in CtfSchema for changes.
     * @param state 
     */
    private watchPlayers(state: CtfSchema) {

        state.players.onAdd((player, key) => {

            console.log(`new player: ${key}: ${player}  id: ${player.id}`);

            this.emitter.emit(MatchEvent.PlayerJoin, player, player.id === this._room?.sessionId);
            this.watchPlayer(player);

        });

        state.players.onRemove((player, key) => {
            this.emitter.emit(MatchEvent.PlayerLeave, player, key === this.localPlayerId);
        })

    }

    private watchTeams(state: CtfSchema) {

        state.teams.onAdd((team, key) => {

            this.watchTeam(team);
            //this.emitter.emit("teamAdded", team);

        })
        state.teams.onRemove((team, key) => {
            // this.emitter.emit("teamRemoved", team);
        })

    }

    /**
     * Watch changes in individual team.
     * @param team 
     */
    private watchTeam(team: TeamSchema) {

        team.listen('flag', (newVal, oldVal) => {
            console.log(`Flag change: ${newVal}`);
            this.watchFlag(team);
        });

        /*team.onChange = (changes) => {

            for (let i = changes.length - 1; i >= 0; i--) {

                const c = changes[i];
                if (c.field === 'flag') {

                    if (c.op === OPERATION.ADD || c.op === OPERATION.TOUCH) {
                        this.watchFlag(team);
                        this.emitter.emit(MatchEvent.FlagSpawned, c.value as FlagSchema);
                    }


                }

            }
        };*/

    }

    private watchFlag(team: TeamSchema) {

        const flag: FlagSchema = team.flag;

        flag.pos.onChange(() => this.emitter.emit(MatchEvent.FlagMoved, flag));
        flag.listen('state', (value, prev) => {
            //console.log(`new flag state: ${newState}`);
            this.emitter.emit(
                MatchEvent.FlagState,
                team,
                prev,
                team.id === this.getLocalPlayer()?.team,
            );
        });

        flag.listen('carrier', (value, prev) => {
            this.emitter.emit(MatchEvent.FlagCarrier, team, value, prev);
        });
    }

    private watchBodies(state: CtfSchema) {

        state.bodies.onAdd((body, key) => {
            this.emitter.emit(MatchEvent.BodySpawned, body);
        });
        state.bodies.onRemove((body, key) => {
            this.emitter.emit(MatchEvent.BodyRemoved, body);
        });

    }

    private watchBullets(state: CtfSchema) {

        state.bullets.onAdd((bullet, key) => {
            this.emitter.emit(MatchEvent.BulletSpawned, bullet);
        });
        state.bullets.onRemove((bullet, key) => {
            this.emitter.emit(MatchEvent.BulletRemoved, key);
        });

    }

    private watchPlayer(p: PlayerSchema) {

        p.motion.onChange(() => {
            this.emitter.emit(MatchEvent.PlayerMotion, p.id, p.motion);
        });

        /*p.motion.dest.onChange = () => {
            this.emitter.emit(MatchEvent.PlayerDest, p.id, p.motion.dest, p.motion.destAngle);
        }*/

        this.watchStats(p);

        p.listen('hp', (value, prev) => {
            this.emitter.emit(MatchEvent.PlayerHp, p, value, value > prev);
        });
        p.listen('state', (value, prev) => {
            this.emitter.emit(MatchEvent.PlayerState, p, value, prev);
        });
        p.listen('hitMask', (value) => {
            this.emitter.emit(MatchEvent.HitMask, p.id, value);
        });
        p.listen('hidden', (value) => {
            this.emitter.emit(MatchEvent.PlayerHidden, p.id, value, p.id === this.localPlayerId);
        });
        p.listen('craft', (value) => {
            /// watch the new abilities for changes.
            /// todo?: remove old listeners???
            this.watchAbilities(p);
            this.emitter.emit(MatchEvent.CraftChanged, p, value, p.id === this.localPlayerId);
        });

    }

    private watchStats(p: PlayerSchema) {

        /*const stats = p.stats;
        stats.onChange = (changes) => {

            for (let i = changes.length - 1; i >= 0; i--) {
            }

        }*/
    }

    private watchAbilities(p: PlayerSchema) {

        if (p.primary) {
            this.watchAbility(p, p.primary);
        }
        for (const ability of p.abilities) {
            this.watchAbility(p, ability);
        }
    }

    private watchAbility(p: PlayerSchema, ability: AbilitySchema) {

        ability.onRemove(() => {
            // Colyseus will not send this change to clients???
            // TODO: improve handling of removed abilities.
            ability.state = AbilityState.removed;
            this.emitter.emit(MatchEvent.AbilityState, p, ability, p.id === this.localPlayerId);
        });


        ability.listen('state', (value) => {
            this.emitter.emit(
                MatchEvent.AbilityState,
                p, ability,
                p.id === this.localPlayerId);
        });

        /// Tracking a target.
        if (p.id !== this.localPlayerId) {
            ability.listen('trackPos', (value) => {
                if (value) this.trackPoint(p, ability);
            });
        }
    }

    /**
     * Debug only. Reset ability timers.
     */
    public sendResetCooldowns() {

        this._room?.send(MessageType.ClientResetCooldowns)
    }

    private trackPoint(p: PlayerSchema, a: AbilitySchema) {

        a.trackPos!.onChange(() => {
            this.emitter.emit(MatchEvent.TrackPoint, p.id, a.trackPos!, a.id);
        });

    }

    public sendTrackPoint(at: TPoint, ability: string,) {

        this._room?.send(MessageType.ClientTrackPoint, {
            at: at,
            ability: ability
        })
    }

    public sendMove(to: TPoint) {

        if (this._room) {

            this._room.send(MessageType.ClientDest, { to: to })
        }
    }


    public sendChat(message: string) {

        if (this._room) {
            this._room.send(MessageType.ClientChat, {
                from: this.localPlayerId,
                message: message
            })
        }
    }


    public sendSelectCraft(id: string) {
        this._room?.send(MessageType.ClientCharSelect, { craft: id });
    }

    public sendCancelCharge() {
        if (this._room) {
            this._room.send(MessageType.ClientCancelFire);
        }
    }

    public sendUsePrimary(at: TPoint): void {
        this._room?.send(MessageType.ClientUsePrimary, { at: at });
    }

    public sendUseAbility(msg: { id: string, at?: TPoint }): void {

        this._room?.send(MessageType.ClientUseAbility, msg);
    }

    public sendFireAt(at: TPoint) {
        this._room?.send(MessageType.ClientUsePrimary, { at: at });
    }

    public getUser() { return this.user; }

    public getState() { return this._room!.state; }

    public once<T extends EventEmitter.EventNames<ServerEvents>>(evt: T, fn: EventEmitter.EventListener<ServerEvents, T>, context: any) {
        this.emitter.once(evt, fn, context);
        return this;
    }

    public on<T extends EventEmitter.EventNames<ServerEvents>>(evt: T, fn: EventEmitter.EventListener<ServerEvents, T>, context: any) {
        this.emitter.on(evt, fn, context);
        return this;
    }
    public off<T extends EventEmitter.EventNames<ServerEvents>>(evt: T, fn?: EventEmitter.EventListener<ServerEvents, T>, context?: any) {
        this.emitter.off(evt, fn, context);
        return this;
    }

    /**
     * Find team with highest score.
     */
    private findWinTeam(state: CtfSchema) {

        let highScore: number = 0;
        let highTeam: TeamSchema | null = null;

        for (const t of state.teams.values()) {

            if (t.score > highScore) {
                highTeam = t;
                highScore = t.score;
            }

        }

        return highTeam;

    }

    async leaveMatch() {
        try {

            await this._room?.leave();
            this._room = null;

        } catch (err) {
            console.warn(`Error leaving match: ${err}`);
        }
    }

}