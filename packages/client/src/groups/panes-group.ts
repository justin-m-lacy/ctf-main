
import { Group, Actor } from 'gibbon.js';
import ConnectPane from '../views/connect-pane';
import { ChatPane } from '@/views/chat-pane';
import { ClientGame } from '../client-game';
import { MatchChat } from '../../../server/src/messages/chat-events';
import { IActiveMatch } from '../model/iactive-match';
import { AppEvent } from '../model/app-events';
import { MatchEvent } from '../model/match-events';
import { AbilityPane } from '../views/ability-pane';
import { MessagePane } from '../views/message-pane';
import { CommandKey } from '../input/commands';
import { NavMenu } from '../views/nav-menu';
import { SettingsPane } from '../views/settings-pane';
import { InputGroup } from './input-group';
import { Container, Sprite, Texture } from 'pixi.js';
import { SplashScreen } from '../components/visual/splashscreen';


export default class PanesGroup extends Group<ClientGame> {

    private connectPane!: ConnectPane;
    private chatPane!: ChatPane;

    public readonly abilityPane: AbilityPane;

    private messagePane?: MessagePane;

    private settingsMenu?: SettingsPane;
    private mainMenu?: NavMenu;

    private layer: Container;

    private splash?: SplashScreen;

    constructor(uiLayer: Container) {

        super();

        this.layer = uiLayer;

        this.abilityPane = this.makeAbilityPane();

    }

    public hideMessage() {
        this.messagePane?.hide();
    }
    public showMessage(title: string, text: string) {
        if (!this.messagePane) {
            this.messagePane = new MessagePane();
        }
        this.messagePane.showMessage(title, text);
    }

    public showError(err: Error | unknown) {

        if (!this.messagePane) {
            this.messagePane = new MessagePane();
        }
        this.messagePane.showMessage('Error', `${err}`);

    }

    onAdded() {

        this.makeChatPane();
        this.makeConnectPane();

        this.makeAbilityPane();

        this.game!.dispatcher.on(AppEvent.MatchReady, this.onMatchReady, this);
        this.game!.dispatcher.on(AppEvent.MatchLeft, this.onMatchLeft, this);
        this.game!.dispatcher.on(AppEvent.JoinFailed, this.onJoinFail, this);

        this.game!.on(CommandKey.ToggleChat, this.chatPane.toggleVisible, this.chatPane);
        this.game!.on(CommandKey.Menu, this.toggleMenu, this);
        this.game!.on(CommandKey.Settings, this.showSettings, this);

    }

    onRemoved() {

        this.game!.dispatcher.off(AppEvent.MatchReady, this.onMatchReady, this);
        this.game!.dispatcher.off(AppEvent.MatchLeft, this.onMatchLeft, this);
        this.game!.off(CommandKey.ToggleChat, this.chatPane.toggleVisible, this.chatPane);
        this.game!.off(CommandKey.Menu, this.toggleMenu, this);
        this.game!.off(CommandKey.Settings, this.showSettings, this);

    }

    private showSettings() {

        if (this.mainMenu?.enabled) {
            this.mainMenu.hide();
        }

        if (!this.settingsMenu) {

            this.settingsMenu = new SettingsPane(this.game!.getGroup(InputGroup)!);
            this.layer.addChild(this.settingsMenu.view);

            const a = new Actor(this.settingsMenu.view);
            a.addInstance(this.settingsMenu);
            this.add(a);


        } /*else {
            console.log(`Enabling SettingsMenu`);
            this.settingsMenu.enabled = true;
        }*/
        const screen = this.game!.screen;
        this.settingsMenu.view.position.set(
            0.5 * (screen.width - this.settingsMenu.width),
            0.5 * (screen.height - this.settingsMenu.height)
        );

        this.settingsMenu.show();

    }

    /**
     * Set image to a random background image.
     */
    public async showSplashscreen() {

        const image = await this.game?.assets.getImageType('maps');
        if (image) {
            this.makeSplashScreen(image);
        }

    }

    private makeSplashScreen(texture?: Texture) {

        if (!this.splash) {

            const sprite = new Sprite(texture);
            sprite.alpha = 0.8;
            //this.layer.addChild(sprite);
            this.layer.addChildAt(sprite, 0);

            const a = new Actor(sprite);
            this.splash = new SplashScreen();

            a.addInstance(this.splash);
            a.on(SplashScreen.EvtComplete, this.removeSplash, this);

            this.add(a);

            const screen = this.game?.screen;
            if (screen) {
                sprite.width = screen.width;
                sprite.height = screen.height;
            }

        } else {
            this.splash.texture = texture;
        }

    }
    private removeSplash() {

        // const actor = this.splash?.actor;
        this.splash?.actor?.destroy();
        this.splash = undefined;
    }

    private toggleMenu() {

        if (this.settingsMenu?.enabled) {

            this.settingsMenu.hide();
            if (!this.game?.activeMatch) {
                this.connectPane.enabled = true;
            }

        } else if (this.mainMenu?.enabled) {

            this.mainMenu.hide();

            if (!this.game?.activeMatch) {
                this.connectPane.enabled = true;
            }

        } else {

            if (this.connectPane.enabled) {
                this.connectPane.enabled = false;
            }

            if (!this.mainMenu) {
                this.mainMenu = new NavMenu(this.game!);
                this.layer.addChild(this.mainMenu.view);

                const a = new Actor(this.mainMenu.view);
                a.addInstance(this.mainMenu);
                this.add(a);
            }

            const screen = this.game!.screen;


            this.mainMenu.layout(screen);
            this.mainMenu.view.position.set(
                0.5 * (screen.width - this.mainMenu.width),
                0.17 * (screen.height)
            );
            this.mainMenu.show();

        }

    }

    private onMatchReady(match: IActiveMatch) {

        this.chatPane.enabled = true;
        this.connectPane.enabled = false;

        match.on(MatchEvent.MatchChat, this.onMatchChat, this);

        this.splash?.play();
    }

    private onMatchLeft() {

        this.chatPane.enabled = false;
        this.connectPane.enabled = true;

    }

    private onMatchChat(evt: MatchChat) {
        this.chatPane.onChatEvent(evt);
    }

    private makeChatPane() {
        const obj = new Actor();
        this.chatPane = obj.add(new ChatPane());
        this.chatPane!.enabled = false;

        obj.on(AppEvent.SendChat, this.sendChat, this);

        /**
         * configure send event.
         */
        //obj.on(LocalEvents.EvtSendChat, this.netGame.network.sendRoomMsg, this.netGame.network);

        this.add(obj);

    }

    private makeAbilityPane() {

        const obj = new Actor();

        const abilityPane = new AbilityPane();
        obj.add(abilityPane);

        this.add(obj);

        return abilityPane;
    }

    private sendChat(text: string) {
        this.game!.dispatcher.emit(AppEvent.SendChat, text);
    }

    private onJoinFail() {
        this.connectPane.setBusy(false);
    }

    private makeConnectPane() {

        const obj = new Actor();
        this.connectPane = obj.add(new ConnectPane());

        obj.on('joinClicked', async (name?: string) => {
            await this.game!.connection.joinOrCreateMatch({ name: name ?? 'unnamed' });
        });

        obj.on("newGameClicked", async (name?: string) => {
            await this.game!.connection.createNewMatch({ name: name ?? 'unnamed' });
        });

        this.add(obj);

    }

    onDestroy() {

        super.onDestroy?.();
        this.messagePane?.destroy();

        this.settingsMenu = undefined;
        this.mainMenu = undefined;
    }
}