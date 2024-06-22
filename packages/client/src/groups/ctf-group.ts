import { System } from 'gibbon.js';
import { ClientGame } from '@/client-game';
import { ActorBuilder } from '../builders/actor-builder';
import { IActiveMatch } from '../model/iactive-match';
import { CtfSchema } from '../../../server/src/model/schema/ctf-schema';
import { FlagGroup } from './flag-group';
import { PlayersGroup } from './players-group';
import { MatchViews } from './match-views';
import { BodySystem } from './body-system';
import { Visuals } from '@/groups/visuals';
import { ArenaData } from '../model/arena';
import { AppEvent, LocalEvent } from '../model/app-events';
import { MatchEvent } from '../model/match-events';
import { MatterGroup } from './matter-group';
import { WorldBuilder } from '../../../server/src/ctf/builders/matter-world';
import { TeamSchema } from '../../../server/src/model/schema/team-schema';
import { Container } from 'pixi.js';
import { MatchAudio } from './match-audio';
import { Group as TweenGroup } from 'tweedle.js'
import { ParticleSystem } from './particle-system';
import BgGroup from './bg-group';
import { GeomData, MapData } from '../../../server/src/ctf/data/parser';

export class CtfGroup extends System<ClientGame> {

    public readonly tweens: TweenGroup = new TweenGroup();

    private builder?: ActorBuilder;

    private arenaClip?: Container;

    private views?: MatchViews;

    private match?: IActiveMatch;

    private visuals!: Visuals;

    private matterGroup?: MatterGroup;

    private bgGroup?: BgGroup;

    private players!: PlayersGroup;

    public getPlayer(id: string) { return this.players.getPlayer(id); }

    onAdded() {

        super.onAdded();

        this.bgGroup = this.game!.getGroup(BgGroup);

        this.name = 'ctfGroup';
        this.game!.dispatcher.addListener(AppEvent.MatchJoined, this.onJoin, this);
        this.game!.dispatcher.addListener(AppEvent.MatchLeft, this.onLeftMatch, this);

        this.visuals = new Visuals(this.game!.assets);
        this.addGroup(this.visuals);

        this.matterGroup = new MatterGroup();
        this.addGroup(this.matterGroup);


        this.builder = new ActorBuilder(this.visuals, this.matterGroup, this);
        this.addGroup(this.builder);


    }
    private onJoin(match: IActiveMatch) {

        this.addGroup(new MatchAudio());

        this.match = match;

        this.game!.on(LocalEvent.LeaveMatch, this.onLeave, this);

        this.views = new MatchViews(this.game!.uiLayer);
        this.addGroup(this.views);

        this.addGroup(new ParticleSystem(this.game!.filterLayer));

        this.players = new PlayersGroup(this, match, this.builder!);
        this.addGroup(this.players);

        this.addGroup(new FlagGroup(match, this.builder!));
        this.addGroup(new BodySystem(this.game!.objectLayer, this.players, this.builder!));

        match.on(MatchEvent.InitialState, this.onInitState, this);
        match.on(MatchEvent.MatchEnd, this.onMatchEnd, this);

    }

    /**
     * Initial state from server.
     * @param state 
     */
    private onInitState(state: CtfSchema, map: MapData<GeomData>) {

        const container = this.arenaClip = new Container();
        const arena = new ArenaData(state, map);

        try {

            arena.decode();

            /// TODO: don't use Server's WorldBuilder?
            new WorldBuilder(state).build(map, this.matterGroup!.world);

            if (map.background) {
                this.game!.on(BgGroup.EvtBgLoaded, this.bgLoaded, this);

                this.bgGroup?.setBackground(map.background, map.width, map.height);
            } else {
                console.log(`Map: No bg`);
                this.bgLoaded();
            }
            this.game!.assets.arena = arena;

        } catch (err) {
            console.error(`${err}`);
            this.match?.leaveMatch();
        }

        this.visuals.drawArena(arena, container);

        this.game!.objectLayer.addChildAt(container, 0);

        // testing end screen.
        //this.onMatchEnd(Array.from(state.teams.values())[0].id)

    }

    private bgLoaded() {
        if (this.game) {
            this.game?.dispatcher.emit(AppEvent.MatchReady, this.match!);
        }
    }

    private onMatchEnd(state: CtfSchema, winner: TeamSchema) {

        if (!this.match) {
            console.log(`CtfGroup.onMatchEnd(): No active match.`);
            this.destroy();
            return;
        }

        const teams: TeamSchema[] = Array.from(state.teams.values());

        if (!winner) {
            console.error(`Winning team not found`);
            return;
        }
        const loser = teams.find(v => v.id !== winner.id);
        if (!loser) {
            console.error(`No losing team found. Team count: ${teams.length}`);
            return;
        }


        this.views?.showMatchEnd({
            winTeam: winner,
            loseTeam: loser
        }, state.stateTimer);

    }

    public onLeave() { this.match?.leaveMatch(); }
    private onLeftMatch() { this.destroy(); }

    update(delta: number) {
        this.tweens.update(delta);
    }

    onRemoved() {

        super.onRemoved?.();

        console.log(`ctfGroup ${this.name} onRemoved()`);
        this.game!.dispatcher.removeListener(AppEvent.MatchJoined, this.onJoin, this);
        this.game!.dispatcher.removeListener(AppEvent.MatchLeft, this.onLeave, this);
        this.game!.off(BgGroup.EvtBgLoaded, this.bgLoaded, this);

    }

    private onMatchError(err: any) {
        console.dir(err);
    }

    onDestroy() {

        super.onDestroy?.();

        if (this.game?.camera) {
            this.game.camera.target = null;
        }

        this.builder = undefined;
        this.tweens.removeAll();

        this.game?.assets.arena?.destroy();
        this.game?.assets.clearMatchData();

        this.arenaClip?.destroy();

    }



}