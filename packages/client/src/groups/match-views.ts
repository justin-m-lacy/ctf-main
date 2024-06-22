import { Actor, EngineEvent, System } from 'gibbon.js';
import { Container, TextStyle, Text } from 'pixi.js';
import { ClientGame } from '../client-game';
import { Scoreboard } from '../components/ui/scoreboard';
import { CtfSchema } from '../../../server/src/model/schema/ctf-schema';
import { IActiveMatch } from '../model/iactive-match';
import { MatchEndPane, MatchEndParams } from '../views/match-end-pane';
import { Countdown } from '@components/ui/countdown';
import { MatchEvent } from '../model/match-events';
import { LocalEvent } from '../model/app-events';
import { Player } from '@components/player/player';
import { fitAndPlace } from '../utils/layout';
import { WaitReady } from '../components/ui/wait-ready';
import { AbilitiesBar } from './abilities-bar';
import { CommandKey } from '../input/commands';
import { CharSelectGroup } from './char-select-group';
import { TeamSchema } from '../../../server/src/model/schema/team-schema';
import { FlagState } from '../../../server/src/model/schema/flag-schema';
import { Group as TweenGroup, Tween } from 'tweedle.js';
import { LifeHUD } from './life-hud';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { MatterPlayer } from '../components/hits/matter-player';
import { Pair, Body } from 'matter-js';
import { HitCategory } from '../../../server/src/model/matter';
import { MatterGroup } from './matter-group';


export class MatchViews extends System<ClientGame> {

    private abilityBar!: AbilitiesBar;

    private tweens: TweenGroup = new TweenGroup();

    private scoreboard?: Scoreboard | null;

    private endPane?: MatchEndPane;

    /**
     * Prompt to change craft in spawn.
     */
    private spawnPrompt?: Tween<Text>;

    /**
     * in-game alerts.
     */
    private readonly messages: Text[] = [];


    constructor(uiLayer: Container) {

        const child = new Container();
        child.name = 'match_views';
        uiLayer.addChild(child);

        super(child);

    }

    onAdded() {

        const match: IActiveMatch = this.game!.activeMatch!;

        this.makeAbilitiesBar(match);

        this.buildScoreDisplay();

        const lifeHud = new LifeHUD();
        this.addGroup(lifeHud);

        lifeHud.x = 340;
        lifeHud.y = this.abilityBar.y;

        this.game!.on(EngineEvent.ScreenResized, this.onViewResize, this);

        match.once(MatchEvent.InitialState, this.onInitState, this);
        match.on(MatchEvent.MatchStart, this.onMatchStart, this);
        match.on(MatchEvent.MatchWaiting, this.onMatchWaiting, this);
        match.on(MatchEvent.TeamScored, this.onTeamScored, this);
        match.on(MatchEvent.FlagState, this.onFlagState, this);
        match.on(MatchEvent.PlayerJoin, this.onPlayerJoin, this);
        match.on(MatchEvent.PlayerLeave, this.onPlayerLeave, this);

        this.game!.on(CommandKey.ToggleCraftSelect, this.toggleCrafts, this);
        this.game!.on(LocalEvent.PlayerSpawned, this.playerSpawned, this);

    }

    update(delta: number) {
        this.tweens.update(delta);
    }

    private onPlayerJoin(player: PlayerSchema, isLocal: boolean) {

        if (!isLocal) {

            this.showMessage((player.name ?? player.craft) + ' has joined.');

        }

    }

    private onPlayerLeave(player: PlayerSchema, isLocal: boolean) {

        if (isLocal) {
            console.log(`local player left match.`);
        } else {

            this.showMessage((player.name ?? player.craft) + ' has left the match.');

        }

    }

    private toggleCrafts() {

        const cur = this.getGroup(CharSelectGroup);
        if (cur) {
            console.log(`Destroy CharSelect.`);
            cur.destroy();
        } else {
            const select = new CharSelectGroup(this.clip!);
            this.addGroup(select);
        }

    }

    private onFlagState(team: TeamSchema, prevState: FlagState, myFlag: boolean) {

        const curState = team.flag.state;

        console.log(`Flag State: ${FlagState[prevState]}->${FlagState[team.flag.state]}`);
        if (curState === FlagState.carried) {
            if (myFlag) {
                this.showMessage("Your Team's " + import.meta.env.VITE_FLAG_NAME + ' Was Taken!',);
            } else {
                this.showMessage("Opponent " + import.meta.env.VITE_FLAG_NAME + ' Taken!',);
            }
        } else if (curState === FlagState.dropped) {

            this.showMessage((myFlag ? "Your Team's " : "Opponent's ") + import.meta.env.VITE_FLAG_NAME + ' Was Dropped');

        } else if (curState === FlagState.returned || (curState === FlagState.base && (prevState === FlagState.dropped || prevState == FlagState.returned))) {

            console.log(`Flag returned: State: ${FlagState[prevState]}->${FlagState[team.flag.state]}`);
            this.showMessage((myFlag ? "Your Team's " : "Opponent's ") + import.meta.env.VITE_FLAG_NAME + ' Was Returned');
        }

    }


    public showMessage(text: string, props?: {
        size?: number, color?: number, alignBottom?: boolean
    }) {

        const fld = new Text(
            text, {
            fontSize: props?.size ?? 42,
            stroke: 0,
            strokeThickness: 4,
            fill: props?.color ?? 0xffffff,
        });
        fld.alpha = 0;
        this.clip!.addChild(fld);

        fitAndPlace(fld, this.game!.screen.width, this.game!.screen.height, 0.5, props?.alignBottom ? 0.9 : 0.2);

        if (!props?.alignBottom && this.messages.length > 0) {
            fld.y = this.messages[this.messages.length - 1].y + this.messages[this.messages.length - 1].height + fld.height + 10;
        }

        this.messages.push(fld);

        return new Tween(fld, this.tweens).from({ alpha: 0.05 }).to({ alpha: 0.9 }, 2.5).yoyo(true).repeat(1).onComplete(t => {
            const ind = this.messages.indexOf(t);
            if (ind >= 0) this.messages.splice(ind, 1);
            t?.destroy();
        }).start();

    }

    private onViewResize(rect: { x: number, y: number, width: number, height: number }) {

        const ab = this.getGroup(AbilitiesBar)!;
        ab.position.set(ab.position.x, rect.y + 8);

    }

    private makeAbilitiesBar(match: IActiveMatch) {

        const container = new Container();

        this.clip!.addChild(container);

        this.abilityBar = new AbilitiesBar(container);
        this.addGroup(this.abilityBar);
        container.visible = true;
        container.y = this.game!.screen.top + 8;

    }

    /**
     * @param time 
     */
    public showRespawnTimer(time: number) {
        this.getCountdown().startCount(time);
    }

    private onMatchStart(schema: CtfSchema) {
        this.destroyEndPane();

        this.scoreboard?.reset();

        const waiter = this.actor!.get(WaitReady);
        if (waiter) {
            waiter.enabled = false;
        }
    }

    private onMatchWaiting(schema: CtfSchema) {

        this.endPane?.destroy();
        this.endPane = undefined;

        const waiter = this.actor!.require(WaitReady, schema, 'stateTimer', this.tweens);
        waiter.show('Waiting for players...', 'Match Starting...');
    }

    public showMatchEnd(params: MatchEndParams, restartTime: number = 0) {


        this.destroyEndPane();
        this.endPane = new MatchEndPane(params, restartTime);
        this.game?.addUpdater(this.endPane);

        const view = this.game!.screen;
        this.endPane.position.set((view.width - this.endPane.width) / 2, (view.height - this.endPane.height) / 2);

        this.clip?.addChildAt(this.endPane, 0);

        /**const waiter = this.actor!.require(WaitReady, this.match.getState(), 'stateTimer');
        waiter.show('', 'Restaring match...', 10);**/

        this.endPane.btnLeave.on('pointerdown',
            () => this.game?.emit(
                LocalEvent.LeaveMatch));

    }

    private onInitState(schema: CtfSchema) {

        this.scoreboard?.initTeams(schema.teams);

    }

    private onTeamScored(id: string, score: number) {
        this.scoreboard?.updateScore(id, score);
    }

    /**
     * Build match start/respawn countdown.
     */
    private getCountdown() {

        return this.actor!.get(Countdown) ?? this.actor!.add(new Countdown(

            new TextStyle({

                fontSize: 256,
                fill: 0x221235


            })

        ));

    }

    private buildScoreDisplay() {

        if (!this.scoreboard) {
            const go = new Actor(new Container());

            this.scoreboard = go.add(new Scoreboard());

            this.add(go);
        }

    }

    public playerSpawned(player?: Player) {
        if (player?.isLocalPlayer) {
            player?.actor?.on(MatterGroup.Collision, this.onCollision, this);
            player?.actor?.on(MatterGroup.EndCollision, this.endCollision, this);
        }
    }

    /**
     * End checking spawn hit.
     * @param mp 
     * @param pair 
     * @param other 
     */
    private endCollision(mp: MatterPlayer, pair: Pair, other: Body) {

        if (other.collisionFilter.category === HitCategory.Spawn && other.label === mp.data?.team) {
            mp.clip!.interactive = false;
            if (this.game!.inputGroup.supportsTouch) {
                mp.clip!.off('touchstart', this.toggleCrafts, this);
            }
            mp.clip!.off("pointerdown", this.toggleCrafts, this);
        }

    }

    /**
     * Check collision with spawn for craft toggling.
     * @param mp 
     * @param pair 
     * @param other 
     */
    private onCollision(mp: MatterPlayer, pair: Pair, other: Body) {

        if (other.collisionFilter.category === HitCategory.Spawn && other.label === mp.data?.team) {
            mp.clip!.interactive = true;
            if (this.game!.inputGroup.supportsTouch) {

                mp.clip!.on('touchstart', this.toggleCrafts, this);
            }
            mp.clip!.on("pointerdown", this.toggleCrafts, this);


            this.showSpawnPrompt();

        }

    }

    /**
     * Show prompt for changing character.
     */
    private showSpawnPrompt() {
        if (this.spawnPrompt) {
            this.spawnPrompt.rewind();
            this.spawnPrompt.start();
        } else {


            let msg: string;

            if (this.game!.inputGroup.supportsTouch) {
                msg = 'Tap character to open character select pane.'
            } else {
                const key = this.game?.inputGroup.getInputKey(CommandKey.ToggleCraftSelect)?.toUpperCase();
                msg = "Press '" + key + "' in spawn to change character.";
            }

            this.spawnPrompt = this.showMessage(msg, {
                size: 48, alignBottom: true
            });

            this.spawnPrompt.onComplete((t) => {
                t.destroy();
                const ind = this.messages.indexOf(t);
                if (ind >= 0) this.messages.splice(ind, 1);
                this.spawnPrompt = undefined;
            });
        }
    }

    public override add(actor: Actor): Actor {

        if (actor.clip) {
            this.clip!.addChild(actor.clip);
        }
        super.add(actor);

        return actor;

    }

    /**
     * Destroy match end pane.
     */
    private destroyEndPane() {

        if (this.endPane) {

            this.game?.removeUpdater(this.endPane);
            this.endPane?.destroy();
            this.endPane = undefined;
        }
    }

    onDestroy() {

        super.onDestroy?.();

        this.messages.length = 0;
        this.tweens.removeAll();

        this.game?.off(EngineEvent.ScreenResized, this.onViewResize, this);
        this.game?.off(LocalEvent.PlayerSpawned);

        this.game?.off(CommandKey.ToggleCraftSelect, this.toggleCrafts, this);

        this.destroyEndPane();

        this.scoreboard?.actor?.destroy();
        this.scoreboard = null;

    }

}