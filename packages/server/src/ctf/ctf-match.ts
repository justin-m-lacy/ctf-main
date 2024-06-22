import { Game } from "../engine/game";
import { CtfRoom } from '../rooms/ctf-room';
import { PlayerSchema } from '../model/schema/player-schema';
import { Player } from './components/player/player';
import { CtfSchema, CtfState } from '../model/schema/ctf-schema';
import { Builder } from "./builders/builder";
import { FlagState } from '../model/schema/flag-schema';
import { FlagSystem } from './systems/flag-system';
import { BlastSystem } from "./systems/blast-system";
import { InternalEvent } from './data/consts';
import { TeamSchema } from '../model/schema/team-schema';
import { MoveSystem } from './systems/player-move';
import { WaitGroup } from './systems/wait-group';
import { MessageType } from "../messages/message-types";
import { TPoint } from '../engine/data/geom';
import { AbilitySystem } from './systems/ability-system';
import { ServerCharSelect } from "./systems/char-select";
import { BulletGroup } from './systems/bullet-group';
import { HealSystem } from './systems/heal-system';
import { MatterSystem } from './systems/matter-system';
import { WorldBuilder } from './builders/matter-world';
import { isAlive, BodyType } from '../model/schema/types';
import { Group as TweenGroup } from "tweedle.js";

export class CtfMatch extends Game {

    readonly state: CtfSchema;

    private readonly builder: Builder;

    public readonly blasts: BlastSystem;
    public readonly bullets: BulletGroup;

    readonly players: Map<string, Player> = new Map();

    /// Used to send events.
    public readonly room: CtfRoom;

    public readonly tweenGroup = new TweenGroup();

    /**
     * Get current amount of game run time, in seconds.
     */
    get currentTime() { return this.room.clock.currentTime / 1000; }
    get deltaTime() { return this.room.clock.deltaTime / 1000 }

    get clock() { return this.room.clock }


    public readonly matterSystem: MatterSystem;


    constructor(room: CtfRoom, state: CtfSchema) {

        super();

        this.room = room;

        this.state = state;
        state.assignTeamColors();

        this.matterSystem = this.addGroup(new MatterSystem(
            new WorldBuilder(this.state).build(room.getMapData()!)
        ));

        this.builder = new Builder(this, state.params);

        this.blasts = this.addGroup(new BlastSystem(this.state));
        this.bullets = this.addGroup(new BulletGroup(this, this.builder, this.blasts));

        this.addGroup(new HealSystem());


        this.init();

    }

    public getPlayer(id: string) { return this.state.players.get(id); }
    public getTeam(team: string) { return this.state.teams.get(team); }

    init() {

        super.init();

        this.on(InternalEvent.PlayerHit, this.onPlayerHit, this);
        this.on(InternalEvent.TeamWon, this.onTeamWon, this);
        this.on(InternalEvent.TeamScored, this.sendTeamScored, this);

        const flags = this.builder.makeFlags(this.state);
        this.root.add(new FlagSystem(this.state, flags));

        this.addGroup(new MoveSystem(this))
        this.addGroup(new AbilitySystem(this));
        this.addGroup(new ServerCharSelect(this));

        this.start();

        this.on(InternalEvent.MatchStart, this.onMatchStart, this);
        this.enterWaiting();
    }


    /**
     * Reset player and flag states.
     */
    private onMatchStart() {

        console.log(`ctfMatch.onStartMatch()`)
        for (const p of this.players.values()) {

            const t = this.state.teams.get(p.teamId);
            if (!t) {
                console.error(`player missing team: ${p.id} team: ${p.teamId}`);
            } else {

                if (!t.inSpawnRegion(p.position)) {
                    this.reposition(p, t.getSpawnPoint())
                }
                p.reset(p.position);
            }

        }

        for (const t of this.state.teams.values()) {
            t.score = 0;
        }

    }

    update(deltaSec: number) {

        this.tweenGroup.update(deltaSec);
        /*let timing = Math.random() < 0.01;
        if (timing) console.time('frame');*/
        this.engine.update(deltaSec);
        //if (timing) console.timeEnd('frame');


    }

    private enterWaiting() {
        console.log(`enter waiting: cur state: ${CtfState[this.state.state]}`);
        const waiter = this.getGroup(WaitGroup);
        if (waiter) {
            waiter.beginWait();
        } else {
            this.addGroup(new WaitGroup());
        }
    }

    public onPlayerJoin(id: string, player: PlayerSchema) {

        console.log(`onPlayerJoin id: ${player.id}`);
        const team = this.state.randSmallestTeam();
        if (team) {
            team.addPlayer(player);
            const loc = team.getSpawnPoint();
            player.pos.set(loc.x, loc.y);
        }

        const p = this.builder.makePlayerActor(player);
        this.players.set(id, p);
        this.state.players.set(id, player);

        this.emit(InternalEvent.PlayerSpawned, p);
    }

    public onPlayerLeft(id: string) {

        const comp = this.players.get(id);
        this.emit(InternalEvent.PlayerLeft, id);

        if (comp) {
            this.dropPlayerFlag(comp.schema);
            comp.actor?.destroy();
            this.players.delete(id);
        } else {
            console.warn(`playerLeft: missing player component: ${id}`);
        }
        this.state.removePlayer(id);

    }

    private onPlayerHit(schema: PlayerSchema, damage: number, bodyType?: BodyType, by?: string,) {

        if (!isAlive(schema.state)) {
            return;
        }

        const player = this.players.get(schema.id);

        if (player) {

            schema.hp -= damage;
            if (schema.hp > 0) {
                this.sendPlayerHit(schema.id, schema.hp, bodyType, by);
            } else {
                const flag = this.dropPlayerFlag(schema);
                player.die();
                this.sendPlayerDied(schema.id, schema.pos, by, flag);

            }

        } else {
            console.warn(`playerHit: missing player component: ${schema.id}`);
        }

    }

    /**
     * Force reposition player.
     * @param p 
     * @param to 
     * @param angle 
     */
    public reposition(p: Player, to: TPoint, angle?: number): void {
        p.reposition(to);
        this.sendSetPos(p.id, to);
    }

    public sendTeamScored(team: TeamSchema, player: Player): void {
        this.room.broadcast(MessageType.TeamScored, {
            who: player.id,
            team: team.id,
            score: team.score
        });

    }
    /**
     * Send message to force player position.
     * @param who 
     * @param pos 
     * @param angle 
     */
    public sendSetPos(who: string, pos: TPoint, angle?: number): void {

        this.room.broadcast(MessageType.Reposition, {
            who: who,
            pos: pos,
            angle: angle
        });
    }

    private sendPlayerHit(who: string, hp: number, bodyType?: BodyType, by?: string,): void {

        this.room.broadcast(MessageType.PlayerHit, {
            who: who,
            by: by,
            bodyType: bodyType,
            hp: hp
        });
    }

    private sendPlayerDied(who: string, at: TPoint, by?: string, flag?: string): void {

        this.room.broadcast(MessageType.PlayerDied, {

            who: who,
            by: by,
            at: at,
            flag: flag
        });
    }

    /**
     * Find player target..
     */
    public findTarget(from: TPoint, maxDist2: number, ignoreTeam?: string) {

        /// current minimum distance.
        let minD: number = 99999;

        /// position of nearest player.
        let nearest: PlayerSchema | null = null;

        let d: number, dx: number, dy: number;
        for (let p of this.state.players.values()) {

            if (p.team !== ignoreTeam) {

                const pos = p.pos;
                dx = pos.x - from.x;
                dy = pos.y - from.y;
                d = dx * dx + dy * dy;

                if (d < maxDist2) {

                    if (d < minD) {
                        nearest = p;
                        minD = d;
                    }

                }

            }
        }

        return nearest;

    }


    /**
     * Drop flag carried by player when player left or died.
     * dropPlayerFlag() should be called before a player is
     * repositioned so flag is dropped in right place.
     * TODO: move this to flag system?
     * @returns id flag dropped, if any.
     */
    private dropPlayerFlag(player: PlayerSchema): string | undefined {

        for (let team of this.state.teams.values()) {

            if (team.flag.carrier === player.id) {
                const flagSchema = team.flag;
                flagSchema.carrier = undefined;
                flagSchema.state = FlagState.dropped;
                flagSchema.pos.setTo(player.pos)

                console.log(`flag state: ${FlagState[flagSchema.state]}`);
                return team.id;

            }

        }

    }

    onTeamWon(team: TeamSchema) {

        this.state.state = CtfState.ended;
        this.enterWaiting();

    }




    destroy() {

        for (const p of this.players.values()) {
            p.destroy();
        }

        this.players.clear();

        super.destroy();

    }

}