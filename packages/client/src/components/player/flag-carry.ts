import { Logging as Log } from 'gibbon.js';
import { Component } from 'gibbon.js';
import { createShape } from 'gibbon.js/src/utils/draw';
import { Circle, Container, DisplayObject, GraphicsData, LineStyle } from 'pixi.js';
import { Player } from './player';

/**
 * Component when player is carrying flag
 * Not Used.
 */
export class FlagCarry extends Component<Container> {

    private display?: DisplayObject;


    /**
     * Team of flag being carried.
     * Stored in case of 3+ team situations where multiple carries
     * could change in a single frame.
     */
    private teamId?: string;

    private carryFlag(teamId: string, teamColor: number) {

        if (this.teamId === teamId && this.display) {
            /// Display for this team was drawn previously.
            this.display.visible = true;
        } else {

            this.teamId = teamId;
            this.display?.destroy();
            this.draw(teamColor);
        }

    }

    private dropFlag(teamId: string) {

        if (this.teamId === teamId) {

            if (this.display) {
                this.display.visible = false;
            }

        } else {
            console.warn(`dropped flag unexpected team: ${teamId}`);
        }

    }

    private draw(teamColor: number) {


        const player = this.get(Player);
        if (player) {

            const outline = new LineStyle();
            outline.alpha = 0.5;
            outline.color = teamColor;
            outline.width = 8;

            const graphic = createShape(new GraphicsData(

                new Circle(0, 0, 1.5 * player.radius),
                undefined,
                outline

            ));

            if (graphic) {
                this.display = graphic;
                this.clip!.addChild(graphic);
            }

        } else {
            Log.warnMissingComponent(Player, this.draw);
        }

    }

    onDestroy() {
        this.display?.destroy(true);
    }

}