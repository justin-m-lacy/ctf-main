import { Pane, PaneOptions } from './pane';
import { Separate } from '@pixiwixi/src/layout/separate';
import { Text, Container, FederatedPointerEvent, FederatedEvent } from 'pixi.js';
import { InputBinding, CommandBindings } from '../input/bindings';
import { CommandKey } from '../input/commands';
import { RebindListener } from '../input/rebind-listener';
import { FlowLayout } from '@pixiwixi/src/layout/flow-layout';
import { Axis, Button, Padding } from '@pixiwixi/index';


/**
 * Display of single row of a command and its current input.
 */
export class RebindRow extends Pane {


    private readonly bindButtons: Button[] = [];

    /**
     * Command label.
     */
    private readonly fldCommand: Text;

    /**
     * Frame around command text.
     */
    private readonly cmdFrame: Container;

    private bindings?: CommandBindings;

    private readonly rebinder: RebindListener;

    private readonly commandKey: CommandKey;

    constructor(rebinder: RebindListener,
        opts: PaneOptions & { command: CommandKey, label: string, bindings?: CommandBindings, }) {

        super(opts);

        this.commandKey = opts.command;


        this.fldCommand = new Text(opts.label, this.skin?.baseStyle);
        this.cmdFrame = this.frameText(this.fldCommand);

        this.bindings = opts.bindings;

        this.bindButtons =

            [
                this.makeButton(0), this.makeButton(1)
            ];


        this.rebinder = rebinder;



        this.setLayout();
    }

    private beginRebind(e: FederatedEvent, index: number = 0) {

        e.data.originalEvent.preventDefault();
        e.data.originalEvent.stopImmediatePropagation();
        this.rebinder.beginRebind(this.commandKey, index);

    }

    public setBinding(binding: InputBinding, index: number = 0) {
        this.bindButtons[index].text = binding.toString();
    }

    public setLayout() {

        super.setLayout(

            Padding.Sides(24, 8,
                new Separate(
                    this.cmdFrame,

                    new FlowLayout(
                        {
                            items: this.bindButtons,
                            axis: Axis.Horizontal,
                            spacing: 8
                        }
                    ),
                    Axis.Horizontal,
                )

            ));

    }

    private makeButton(index: number) {

        return new Button(
            {
                width: 50,
                height: 40,
                skin: this.skin,
                text: this.bindings?.getBinding(index)?.toString() ?? ''
            }
        )
            .on('pointerdown', (e) => this.beginRebind(e, index), this)
            .on('touchend', (e) => this.beginRebind(e, index), this);

    }

    private frameText(display: Container) {

        const g = this.skin!.makeFrame(display.width + 32, display.height + 8)!;
        g.interactive = g.interactiveChildren = true;

        g.addChild(display);

        display.position.set(0.5 * (g.width - display.width), 0.5 * (g.height - display.height) - 1);

        return g;
    }

    public destroy() {

        this.cmdFrame.destroy(true);
        this.bindButtons.every(v => v.destroy());

        super.destroy();

    }

}