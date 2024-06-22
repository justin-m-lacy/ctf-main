import { Component } from 'gibbon.js';
import { FederatedEvent, FederatedMouseEvent, Point } from 'pixi.js';
import { IActiveMatch } from '@model/iactive-match';

/**
 * Input for charge-up attacks fire mode.
 */
export class ChargeInput extends Component {

    private clickPoint: Point = new Point();

    private keyDownHandler?: (evt: KeyboardEvent) => void;
    private keyUpHandler?: (evt: KeyboardEvent) => void;

    private readonly match: IActiveMatch;

    constructor(match: IActiveMatch) {

        super();

        this.match = match;

    }

    onEnable() {
        this.game.stage.on('pointerdown', this.stageClick, this);

        this.makeKeyHandlers();

        window.addEventListener('keydown', this.keyDownHandler!);
        window.addEventListener('keyup', this.keyUpHandler!);
    }
    onDisable() {
        this.removeEvents();
    }

    makeKeyHandlers() {

        if (!this.keyDownHandler) {
            this.keyDownHandler = (evt) => {


                if (document.activeElement instanceof HTMLInputElement) {
                    return;
                }
                if (evt.key === " ") {
                    evt.preventDefault();
                    if (!evt.repeat) {
                        //this.match.sendCharge();
                    }
                }

            }
        }

        if (!this.keyUpHandler) {
            this.keyUpHandler = (evt) => {


                if (evt.key === " ") {
                    evt.preventDefault();
                    //this.match.sendFireCharge();
                }

            }
        }

    }

    removeEvents() {

        this.game.stage.off('pointerdown', this.stageClick, this);

        if (this.keyDownHandler) {
            window.removeEventListener('keydown', this.keyDownHandler)
        }
        if (this.keyUpHandler) {
            window.removeEventListener('keyup', this.keyUpHandler)
        }
    }

    stageClick(evt: FederatedMouseEvent) {

        if (this.actor) {
            evt.getLocalPosition(this.game!.objectLayer, this.clickPoint);
            this.match.sendMove(this.clickPoint);
        }

    }

    onDestroy() {

        this.removeEvents();
        this.keyDownHandler = undefined;
        this.keyUpHandler = undefined;
    }

}