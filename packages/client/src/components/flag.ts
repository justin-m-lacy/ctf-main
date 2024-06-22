import { Component, TPoint } from 'gibbon.js';
import { Container } from 'pixi.js';
import { FlagState } from '../../../server/src/model/schema/flag-schema';

export class Flag extends Component<Container> {

    private readonly teamId: string;
    private readonly color: number;

    constructor(teamId: string, color: number) {
        super();

        this.color = color;
        this.teamId = teamId;

    }

    public setState(state: FlagState, pos?: TPoint) {

        if (state === FlagState.base || state === FlagState.dropped) {
            //this.actor!.visible = true;

            if (pos) {
                this.position.set(pos.x, pos.y);
            }

        }
    }

    public updatePos(pos: TPoint) {
        this.position.set(pos.x, pos.y);
    }

}