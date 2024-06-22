import { Component, Game } from 'gibbon.js';
import { Container, Text } from 'pixi.js';
import type { TeamSchema } from '../../../../server/src/model/schema/team-schema';
import { Tween } from 'tweedle.js';
import { RadPerDeg } from '../../utils/geom';

/**
 * Scoreboard of all teams.
 */
export class Scoreboard extends Component<Container, Game> {

    private readonly scoreFields: Map<string, Text> = new Map();

    private fadeInOut() {
        this.clip!.visible = true;
        new Tween(this.clip).from({ alpha: 0 }).to({ alpha: 1 }, 3).yoyo(true).repeatDelay(3).repeat(1).start();
    }

    public updateScore(id: string, value: number) {

        this.fadeInOut();
        const fld = this.scoreFields.get(id);
        if (fld) {
            fld.text = value;
        }

    }

    public initTeams(teams: Map<string, TeamSchema>) {

        const y: number = 32;
        const padding: number = 40;
        const angleStep: number = 16 * RadPerDeg;
        let x: number = 40;
        let angle: number = -angleStep / 2;

        let count = teams.size - 1;
        for (const team of teams.values()) {
            const box = this.addTeamBox(team, x,);
            box.rotation = angle;
            box.anchor.set(0.5, 0.5);
            angle += angleStep;
            x += box.width + padding;

            if (count-- > 0) {
                const vsFld = this.makeVsBox();
                vsFld.anchor.set(0.5, 0.5);
                vsFld.x = x;
                vsFld.y = y;
                x += vsFld.width / 2 + padding;
            }


            box.y = y;

        }

        const screen = this.game!.screen;
        const clip = this.clip!;

        clip!.position.set((screen.width - clip.x) / 2, screen.top + 4);

    }

    public reset() {
        for (const fld of this.scoreFields.values()) {
            fld.text = 0;
        }
        this.fadeInOut();
    }

    private addTeamBox(team: TeamSchema, x: number) {

        const fld = new Text(`${team.score}`, {
            stroke: 0x222222,
            strokeThickness: 3,
            fontSize: 42,
            fontWeight: 'bolder',
            fill: team.color,

        });
        fld.x = x;
        this.scoreFields.set(team.id, fld);

        this.clip!.addChild(fld);
        return fld;
    }

    /**
     * 'vs' text.
     */
    private makeVsBox() {

        const fld = new Text('vs', {
            stroke: 0x222222,
            strokeThickness: 3,
            fontSize: 36,
            fill: 0xfefefe,

        });
        this.clip!.addChild(fld);
        return fld;
    }

    private removeTeam(id: string) {

        /// remove score field.
        const fld = this.scoreFields.get(id);
        if (fld) {

            this.scoreFields.delete(id);
            fld.destroy();

        }


    }

    onDestroy() {

        for (const id of this.scoreFields.keys()) {
            this.removeTeam(id);
        }
        this.scoreFields.clear();

    }
}