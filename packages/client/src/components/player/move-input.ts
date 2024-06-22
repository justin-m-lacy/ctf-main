import { Component, FSM } from 'gibbon.js';
import { Point, Container, FederatedMouseEvent, EventSystem } from 'pixi.js';
import { CommandKey } from '../../input/commands';
import { ClientGame } from '../../client-game';
import { IActiveMatch } from '@model/iactive-match';
import { PlayerState } from '../../../../server/src/model/schema/types';

/**
 * Input for aim-firing mode.
 */
export class MoveInput extends Component<Container, ClientGame> {

    private readonly clickPoint: Point = new Point();

    private readonly match: IActiveMatch;

    private events!: EventSystem;

    constructor(match: IActiveMatch) {

        super();

        this.match = match;
    }

    init() {

        const fsm = this.get(FSM)!;
        const state = fsm.getState(PlayerState.dead)!;

        this.events = this.game?.app.renderer.events!;

        state.addEnterDisable(this);
        state.addExitEffect({ enable: [this] });

    }

    onDisable() {
        this.removeEvents();
    }

    onEnable() {

        //this.game!.on(CommandKey.UsePrimary, this.cmdFire, this);
        this.game!.on(CommandKey.MoveDest, this.cmdMove, this);
        document.addEventListener('contextmenu', this.preventDefault);

    }

    private removeEvents() {
        //this.game!.off(CommandKey.UsePrimary, this.cmdFire, this);
        this.game!.off(CommandKey.MoveDest, this.cmdMove, this);
        document.removeEventListener('contextmenu', this.preventDefault);
    }

    private cmdMove(cmd: CommandKey, evt: FederatedMouseEvent) {

        this.events.pointer.getLocalPosition(this.game!.objectLayer, this.clickPoint);
        this.match.sendMove(this.clickPoint);

    }

    onDestroy() {
        this.removeEvents();
    }

    private preventDefault(e: Event) {
        e.preventDefault();
    }


}