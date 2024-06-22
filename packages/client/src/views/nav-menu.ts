import { LocalEvent } from '../model/app-events';
import { CommandKey } from '../input/commands';
import { ClientGame } from '../client-game';
import { ViewControl } from './view-control';
import { FlowLayout, Align, Padding, Button } from '@pixiwixi/index';
import { DefaultSkin } from '@pixiwixi/index';

export class NavMenu extends ViewControl {


    private btnLeaveGame: Button;
    private btnSettings: Button;

    private btnClose: Button;

    private client: ClientGame;
    constructor(game: ClientGame) {

        super({ width: 400, height: 500, skin: DefaultSkin });

        this.client = game;

        this.btnLeaveGame = new Button({
            text: 'Leave Game',
            name: 'btnLeaveGame',
            onClick: () => {

                this.enabled = false;
                this.client.emit(LocalEvent.LeaveMatch);
            },
            skin: this.skin

        });
        this.btnLeaveGame.name = 'btnLeaveGame';

        this.btnSettings = new Button({
            text: 'Settings',
            name: 'btnSettings',
            onClick: () => {
                this.client.emit(CommandKey.Settings)
            },
            skin: this.skin
        });

        this.btnClose = new Button({
            text: 'Close',
            name: 'btnClose',
            onClick: () => this.enabled = false,
            skin: this.skin
        });

    }

    public setLayout(): void {

        super.setLayout(new Padding({

            left: 20, right: 20, top: 40, bottom: 40
        },

            new FlowLayout(
                {
                    items: [

                        this.btnSettings,
                        this.btnLeaveGame,
                        this.btnClose
                    ],
                    align: Align.Stretch,
                    spacing: 14,
                    parent: this.view

                }
            )

        ));

    }

    onEnable() {

        if (this.client.activeMatch) {
            this.btnLeaveGame.visible = true;
        } else {
            this.btnLeaveGame.visible = false;
        }
        super.onEnable();
    }


}