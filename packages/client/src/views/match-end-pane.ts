import { Pane, DefaultSkin, Button } from '@pixiwixi/index';
import { Text, Container } from 'pixi.js';
import { FlowLayout } from '@pixiwixi/src/layout/flow-layout';

type TeamInfo = {
    id: string;
    name?: string;
    color: number;
    score: number
}

const PADDING = 12;
const FONT_COLOR = 0x222222;

/**
 * Colors are provided separately since they can override the default colors.
 */
export type MatchEndParams = {
    winTeam: TeamInfo,
    loseTeam: TeamInfo,
    winColor?: number,
    loseColor?: number
}

const RestartString = 'New match will begin in ';
export class MatchEndPane extends Pane {

    private winTeam: TeamInfo;
    private loseTeam: TeamInfo;

    //private scores: Map<string, number>;

    private winColor: number;
    private loseColor: number;

    private title?: Text;
    private scoreLine?: Container;

    public btnLeave: Button;

    /**
     * Countdown to restart.
     */
    private countdown: number = 0;

    /**
     * Last rounded count actually displayed.
     */
    private lastCount: number = 0;

    /**
     * Text to hold countdown to next match.
     */
    private readonly restartText: Text;

    constructor(result: MatchEndParams, restartTime: number = 0) {

        super({
            width: 640,
            height: 480,
            skin: DefaultSkin

        });

        this.winColor = result.winColor ?? result.winTeam.color;
        this.loseColor = result.loseColor ?? result.loseTeam.color;

        this.winTeam = result.winTeam;
        this.loseTeam = result.loseTeam;

        this.title = this.makeTitle();
        this.scoreLine = this.makeScoreLine();


        this.restartText = this.makeRestartMsg();
        this.countdown = restartTime;
        if (restartTime > 0) {
            this.updateCountdown(restartTime);
        }

        this.btnLeave = this.makeLeaveButton();


        super.setLayout(new FlowLayout({
            items: [
                this.title,
                this.scoreLine,
                this.restartText,
                this.btnLeave
            ]
        }))
    }

    /**
     * Update the counter til restart.
     * @param n 
     */
    updateCountdown(n: number) {

        const f = Math.ceil(n);
        if (this.lastCount !== f) {
            this.lastCount = f;
            this.restartText.text = RestartString + f.toString();
        }

    }

    update(delta: number): void {

        this.countdown -= delta;
        if (this.countdown >= 0) {

            this.updateCountdown(this.countdown);

        } else {

            if (this.lastCount !== 0) {
                this.updateCountdown(0);
            }

        }

    }

    makeLeaveButton() {

        const text = new Text('Leave Match', {
            fontSize: 32,
            dropShadow: false
        });

        const btn = new Button(
            {
                width: 1.2 * text.width,
                height: 1.1 * text.height
            }
        );

        btn.center(text);
        btn.addChild(text);

        this.center(btn);
        this.addChild(btn);

        return btn;

    }

    makeTitle() {

        const winName = this.winTeam.name && this.winTeam.name.length > 0 ? this.winTeam.name : this.winTeam.id;

        const text = new Text(`Team ${winName} Wins`, {
            fill: this.winColor,
            fontSize: 58,
            fontWeight: 'bolder'
        });

        text.y = 4 * PADDING;
        this.addChild(text);

        this.center(text);

        return text;
    }

    makeRestartMsg() {

        const style = {

            wordWrap: true,
            wordWrapWidth: this.width * 0.75,
            fontSize: 32,
            fill: FONT_COLOR
        };

        const text = new Text('', style);

        return text;
    }

    makeScoreLine(): Container {

        const winScore = this.winTeam.score;
        const loseScore = this.loseTeam.score;

        const scoreLine = new Container();
        scoreLine.interactive = false;

        const winText = new Text(`${winScore}`, {

            fontSize: 96,
            fontWeight: 'bold',
            fill: this.winColor,

        });
        winText.alpha = 0.8

        const vsText = new Text(` vs. `, {
            fontSize: 42,
            fill: 0x222222
        });

        vsText.y = 0.5 * (winText.height - vsText.height);

        const loseText = new Text(`${loseScore}`, {
            fontSize: 96,
            fill: this.loseColor,
            fontWeight: 'bold',
        });
        loseText.alpha = 0.8

        vsText.x = winText.width + 12;
        loseText.x = vsText.x + vsText.width + 12;

        scoreLine.addChild(winText, vsText, loseText);

        this.center(scoreLine, 0.5,);

        return scoreLine;


    }

}