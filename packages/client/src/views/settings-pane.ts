import { ViewControl } from './view-control';
import { CommandKey } from '../input/commands';
import { InputBinding } from '../input/bindings';
import { InputGroup } from '../groups/input-group';
import { RebindRow } from './command-row';
import { RebindListener } from '../input/rebind-listener';
import { DefaultSkin, FlowLayout, Align, Axis, Padding } from '@pixiwixi/index';
import { Container, Text, FederatedWheelEvent, EventSystem } from 'pixi.js';

const bindables: CommandKey[] = [

    CommandKey.UsePrimary,
    CommandKey.UseAbility1,
    CommandKey.UseAbility2,
    CommandKey.UseAbility3,
    CommandKey.UseAbility4,
    CommandKey.ToggleCraftSelect,
    CommandKey.Menu,
    CommandKey.Settings,
    CommandKey.ToggleSound,

];

const commandNames: Partial<{ [key in CommandKey]: string }> = {

    [CommandKey.UsePrimary]: 'Primary',
    [CommandKey.UseAbility1]: 'Use Ability 1',
    [CommandKey.UseAbility2]: 'Use Ability 2',
    [CommandKey.UseAbility3]: 'Use Ability 3',
    [CommandKey.UseAbility4]: 'Use Ability4',
    [CommandKey.ToggleCraftSelect]: 'Craft Select',
    [CommandKey.Menu]: 'Toggle Menu',
    [CommandKey.Settings]: 'Settings',
    [CommandKey.ToggleSound]: 'Toggle Sound',


}

export class SettingsPane extends ViewControl {

    private readonly inputRows: Map<CommandKey, RebindRow> = new Map();
    private readonly inputGroup: InputGroup;

    private readonly rebindListener: RebindListener;

    /**
     * Scrolling content.
     */
    private readonly content: Container;

    private title: Text;

    private contentPad: number = 20;


    constructor(inputGroup: InputGroup) {

        super({
            width: 600,
            height: 500,
            skin: DefaultSkin
        });

        this.inputGroup = inputGroup;
        this.rebindListener = new RebindListener(this.inputGroup);

        this.title = new Text('Settings',
            {
                fontSize: 32,
                fontWeight: 'bold',
                stroke: 0,
                fill: 0xffffff,
                align: 'center'

            });

        this.content = this.makeContent();

        this.getCurBindings();

    }

    public init() {

        super.init();
        EventSystem.defaultEventFeatures.wheel = true;
    }

    public onEnable() {

        super.onEnable();
        this.game!.on(InputGroup.EventBindInput, this.bindingChanged, this);

        this.view.on('wheel', this.onScroll, this);


    }

    private onScroll(evt: FederatedWheelEvent) {

        //const dy = wheel.deltaY;
        //this.scroll.scroll 
        this.content.y -= 0.3 * evt.deltaY;

        if (this.content.y + this.content.height + 2 * this.contentPad < this.view.height) {
            this.content.y = this.view.height - this.content.height - 2 * this.contentPad;
        } else if (this.content.y > 0) {
            this.content.y = 0;
        }


    }

    /**
     * Create container for the scroll container.
     */
    private makeContent() {

        /// scrollable content
        const content = new Container();
        const mask = this.skin?.makeFrame(this.width - 8, this.height - 8,);
        if (mask) {
            mask.position.set(4, 4);
            content.mask = mask;
            this.view.addChild(mask);
        }
        this.view.addChild(content);

        return content;
    }

    public onDisable() {
        super.onDisable();
        this.game!.off(InputGroup.EventBindInput, this.bindingChanged, this);
    }

    private bindingChanged(cmd: CommandKey, newInput: InputBinding, index: number) {

        this.inputRows.get(cmd)?.setBinding(newInput, index);
    }

    public setLayout() {

        super.setLayout(Padding.All(

            this.contentPad,

            new FlowLayout({

                items: [
                    new FlowLayout({

                        items: [this.title],
                        axis: Axis.Horizontal,
                        align: Align.Center,
                        justify: Align.Center

                    }),
                    ...this.inputRows.values()
                ],
                axis: Axis.Vertical,
                align: Align.Stretch,
                spacing: 8,
                parent: this.content,
                overflow: true

            })

        ));

    }

    public getCurBindings() {

        for (const cmd of bindables) {

            const row = new RebindRow(

                this.rebindListener,
                {
                    command: cmd,
                    label: commandNames[cmd]!,
                    bindings: this.inputGroup.getBindings(cmd),
                    skin: this.skin,
                    width: this.width,
                    height: 80

                }
            );

            this.inputRows.set(cmd, row);

            this.addChild(row);

        }

    }

    public onDestroy() {


        for (const row of this.inputRows.values()) {
            row.destroy()
        }
        this.inputRows.clear();

        this.rebindListener.destroy();

        super.onDestroy?.();

    }

}