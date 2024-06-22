import { Component, DrawUtils } from "gibbon.js";
import { Container, Graphics, TilingSprite } from 'pixi.js';
import { EngineEvent } from 'gibbon.js/src/events/engine-events';

export default class Grid extends Component {

    private xSpace: number = 100;
    private ySpace: number = 100;

    private gridTiler?: TilingSprite;

    private bgColor: number;

    constructor(bgColor: number = 0) {

        super();
        this.bgColor = bgColor;


    }

    init() {

        this.buildGrid();
        (this.clip as Container).addChild(this.gridTiler!);

        this.game!.on(EngineEvent.ScreenResized, this.onResize, this);

    }

    private onResize(rect: { x: number, y: number, width: number, height: number }) {

        if (this.gridTiler) {
            this.gridTiler.width = rect.width;
            this.gridTiler.height = rect.height;
        }

    }


    private buildGrid() {

        const graphics = new Graphics();

        graphics.beginFill(this.bgColor);
        graphics.lineStyle(1, 0x222222, 0.1);
        graphics.drawRect(0.5, 0.5, this.xSpace, this.ySpace);

        const app = this.game.app;
        const texture = DrawUtils.drawToTexture(graphics, this.game.app.renderer);

        graphics.destroy();
        this.gridTiler = new TilingSprite(texture, app.view.width, app.view.height);

    }

    update() {

        this.gridTiler!.tilePosition.set(-this.game.camera!.x, -this.game.camera!.y);

    }

    onDestroy() {

        this.gridTiler?.destroy(true);
        this.game!.off(EngineEvent.ScreenResized, this.onResize, this);


    }

}