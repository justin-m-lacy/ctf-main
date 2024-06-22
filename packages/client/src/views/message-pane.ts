import { Text } from 'pixi.js';
import { Pane } from '@pixiwixi/index';

export class MessagePane extends Pane {

    private titleText?: Text;
    private fldText?: Text;

    private canClose: boolean = false;

    constructor() {
        super();

        this.on('pointerdown', () => {

            if (this.canClose) {
                this.visible = false;
            }
        });

    }


    public showMessage(title: string, msg: string) {

        this.titleText = this.titleText ?? new Text(title, {

            fontWeight: 'bold',
            fill: 0x222222,
            fontSize: 18
        });

        if (this.fldText) {
            this.fldText.text = msg;
        } else {
            this.fldText = this.skin!.makeTextSmall(msg)
        }


        this.titleText.text = title;
        this.fldText.text = msg;

        this.titleText.y = 24;
        this.fldText.y = this.titleText.y + this.titleText.height + 2 * 12;

        this.addChild(this.titleText, this.fldText);

        this.visible = true;

    }

    destroy() {

        this.titleText?.destroy();
        this.fldText?.destroy();

        super.destroy();
    }


}