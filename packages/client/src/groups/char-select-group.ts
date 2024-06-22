import { ClientGame } from '@/client-game';
import { CharSelectPane } from '@/views/char-select-pane';
import { System, Actor } from 'gibbon.js';
import { TCraftFull } from '../../../server/src/ctf/data/craft-type';
import { LoaderGroup } from './loader-group';
import { ArenaData } from '../model/arena';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { CharDetailsPane } from '../views/char-details-pane';
import { Container } from 'pixi.js';
import { Align, Axis } from '@pixiwixi/index';
import { FlowLayout } from '@pixiwixi/src/layout/flow-layout';

/**
 * Displays and hides the CharSelectPane
 */
export class CharSelectGroup extends System<ClientGame> {

    private selectPane?: CharSelectPane;

    private detailsPane?: CharDetailsPane;

    private arena?: ArenaData;

    private localPlayer?: PlayerSchema;

    private _uiLayer: Container;

    /**
     * Layout view items.
     */
    //private _layout: ILayout;

    /**
     * 
     * @param container - Container to add ui elements to.
     */
    constructor(container: Container) {

        super();
        this._uiLayer = container;

    }

    override onAdded() {

        const loader = this.game!.assets;

        this.arena = loader.arena;

        this.localPlayer = this.game!.activeMatch!.getLocalPlayer();

        if (!this.arena?.inSpawnRegion(this.localPlayer)) {

            this.destroy();
            return;

        }

    }

    override update() {

        if (!this.arena?.inSpawnRegion(this.localPlayer)) {
            this.destroy();
        }

    }

    public enable() {

        super.enable();

        const loader = this.game!.assets;

        this.selectPane = this.selectPane ?? this.makeSelectPane(loader);
        this.selectPane.setCrafts(loader.crafts);

        this._uiLayer!.addChild(this.selectPane.view);

        this.layout();
        this.selectPane.show();
    }

    public disable() {

        super.disable();

        this.switchCraft();

        this.selectPane?.hide();
        this.detailsPane?.hide();

    }

    /**
 * Actually change current craft to whatever was selected.
 */
    private switchCraft() {

        const craft = this.selectPane?.selection;
        if (craft && this.localPlayer?.craft != craft.id && this.arena?.inSpawnRegion(this.localPlayer)) {

            this.game?.activeMatch?.sendSelectCraft(craft.id);
        }

    }
    private craftPicked(craft?: TCraftFull) {

        this.switchCraft();

        if (craft && this.game) {

            const details = this.detailsPane ?? this.makeDetailsPane(this.game.assets);
            this._uiLayer.addChild(details.view);


            details.setCraft(craft);

            this.layout();
            details.show();

        } else {
            this.detailsPane?.hide();
        }


    }

    public layout() {

        if (this.game && (this.selectPane || this.detailsPane)) {

            const items = [];
            if (this.selectPane) items.push(this.selectPane);
            if (this.detailsPane) items.push(this.detailsPane);

            new FlowLayout({
                items: items,
                axis: Axis.Horizontal,
                spacing: 28,
                justify: Align.Center,
                align: Align.Center
            }).layout(this.game!.screen, this._uiLayer);

        } else {
            console.log(`Nothing to layout: ${this.game}  ${this.selectPane}   ${this.detailsPane}`);
        }


    }

    private makeSelectPane(loader: LoaderGroup) {

        const a = new Actor();

        const pane = new CharSelectPane(loader, (v) => this.craftPicked(v));
        a.addInstance(pane);

        this.add(a);

        return pane;

    }

    private makeDetailsPane(loader: LoaderGroup) {

        const a = new Actor();

        this.detailsPane = new CharDetailsPane(this.game!.activeMatch?.getState()!, loader);
        a.addInstance(this.detailsPane);

        this.add(a);

        return this.detailsPane;

    }


    override onDestroy() {

        this.switchCraft();
        this.selectPane?.destroy();
        this.detailsPane?.destroy();

        this.selectPane = undefined;
        this.arena = undefined;

        super.onDestroy?.();
    }


}