import { Application } from 'pixi.js';
import { Game } from 'gibbon.js';
import { Connection } from './net/connection';
import PanesGroup from './groups/panes-group';
import BgGroup from './groups/bg-group';
import { Container } from 'pixi.js';
import { Dispatcher } from './dispatcher';
import { AppEvent } from './model/app-events';
import { CtfGroup } from './groups/ctf-group';
import { LayerOptions } from 'gibbon.js/src/layerManager';
import { LoaderGroup } from './groups/loader-group';
import { Group } from 'tweedle.js';
import { InputGroup } from './groups/input-group';
import { RollOverGroup } from './groups/rollover';
import EventEmitter from 'eventemitter3';
import { BgmLoop } from './groups/bgm-loop';

export class ClientGame extends Game {

    public readonly connection: Connection;

    public get activeMatch() { return this.connection.activeMatch }

    private loaderGroup!: LoaderGroup;
    public get assets() { return this.loaderGroup }

    public readonly dispatcher: Dispatcher;

    public gameGroup?: CtfGroup | null;

    public readonly filterLayer: Container = new Container();

    private readonly bgLayer: Container = new Container();

    public get inputGroup() { return this._inputGroup }
    private _inputGroup!: InputGroup;

    public panes!: PanesGroup;

    private bgmLoop!: BgmLoop;

    constructor(app: Application<HTMLCanvasElement>) {

        super(app);

        this.dispatcher = new EventEmitter();

        /// Layer which can filter all objects.
        const filterLayer = this.filterLayer;
        filterLayer.name = 'matchLayer';
        this.filterLayer = filterLayer;

        this.bgLayer.name = 'bgLayer';
        filterLayer.addChildAt(this.bgLayer, 0);


        /// effectsLayer must contain all children visually affected by effects,
        /// but cannot scroll due to pixi filter system.

        this.connection = new Connection(this.dispatcher);
        this.connection.on(AppEvent.JoiningMatch, this.onJoiningMatch, this);
        this.connection.on(AppEvent.JoinFailed, this.onJoinFailed, this);
        this.connection.on(AppEvent.MatchJoined, this.onJoinedCtf, this);
        this.connection.on(AppEvent.JoinedLobby, this.onLobbyJoined, this);
        this.connection.on(AppEvent.MatchLeft, this.onMatchLeft, this);
        this.connection.on(AppEvent.JoinLobbyFailed, this.onJoinLobbyFailed, this);

        this.on(AppEvent.TryLogin, this.tryLogin, this);

        this.fullscreen();

    }

    private tryLogin() {
    }

    init() {

        super.init(this.initLayers());

        this.initGroups();
        this.initInput();

        this.camera!.panClip = this.filterLayer;

        this.connection.connect();

        this.addUpdater(this);

        this.start();

    }

    private initInput() {

        this._inputGroup = new InputGroup(this.app.renderer.events);
        this.addGroup(this._inputGroup);

    }

    public update(delta: number) {
        Group.shared.update(delta);
    }


    private initLayers(): LayerOptions {

        const objects = new Container();
        objects.name = 'objects';
        this.filterLayer.addChild(objects);

        this.stage.addChild(this.filterLayer);

        const uiLayer = new Container();
        uiLayer.name = 'uiLayer';
        this.stage.addChild(uiLayer);

        return {

            objects: objects,
            uiLayer: uiLayer,

        }

    }

    onJoiningMatch() {

        this.panes.showMessage('Joining Match', 'Attempting to Join Game...');
        if (this.gameGroup != null) {
            console.warn(`Creating CtfGroup: CtfGroup already exists.`);
            this.gameGroup.onLeave();

        }
        this.bgmLoop.stopBgm();
        this.loaderGroup.initGameTextures();

        this.gameGroup = new CtfGroup();
        this.addGroup(this.gameGroup);

    }

    private onJoinedCtf() {


        this.panes.hideMessage();

        if (this.gameGroup == null) {
            console.warn(`Joining Ctf match but CtfGroup does not yet exist.`);
            this.onJoiningMatch();
        }

    }

    private onJoinFailed(err: Error) {

        this.bgmLoop.playDefault();

        this.panes.showError(err);
        if (this.gameGroup) {
            this.gameGroup.onLeave();
            this.gameGroup.destroy();
            this.gameGroup = null;
        }

    }

    private onJoinLobbyFailed(err: any) {

    }

    private onLobbyJoined() {

    }

    private onMatchLeft() {

        if (this.gameGroup) {
            this.gameGroup.destroy();
            this.gameGroup = null;
        }

    }


    private initGroups() {

        this.loaderGroup = new LoaderGroup();
        this.addGroup(this.loaderGroup);

        this.bgmLoop = new BgmLoop(this.loaderGroup);
        this.addGroup(this.bgmLoop);

        const bgGroup = new BgGroup(this.bgLayer);
        /// Background display.
        this.addGroup(bgGroup);

        this.panes = new PanesGroup(this.uiLayer);
        /// Handles display and hiding of popup/control/settings panes.
        this.addGroup(this.panes);
        this.emitter.once(LoaderGroup.AssetMapLoaded, () => {
            this.panes.showSplashscreen();
        });

        this.addGroup(new RollOverGroup());
    }

}