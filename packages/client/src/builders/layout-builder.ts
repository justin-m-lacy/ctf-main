import { Container } from 'pixi.js';


/// TODO: remove this class.
export default class LayoutHelper {

    private readonly container;

    private edgeY: number = 32;
    private edgeX: number = 28;

    private paddingX: number = 20;
    private paddingY: number = 20;

    /**
     * Size of each indent.
     */
    private indentX: number = 20;


    private baseX: number = 0;

    /**
     * next x coordinate for the current line.
     */
    private curX: number = 0;

    private curY: number = 0;

    /**
     * 
     * @param container 
     * @param params
     * @param params.indent - width of each indent.
     */
    constructor(container: Container,
        params?: {
            edgeX?: number,
            edgeY?: number,
            paddingX?: number,
            paddingY?: number,
            indent?: number
        }) {

        this.container = container;

        if (params) {

            if (params.edgeX !== undefined) this.edgeX = params.edgeX;
            if (params.edgeY !== undefined) this.edgeY = params.edgeY;
            if (params.paddingX !== undefined) this.paddingX = params.paddingX;
            if (params.paddingY !== undefined) this.paddingY = params.paddingY;
            if (params.indent !== undefined) this.indentX = params.indent;

        }

        this.curX = this.baseX = this.edgeX;
        this.curY = this.edgeY;


    }

    public setX(x: number) {
        this.curX = x;
    }

    public setY(y: number) {
        this.curY = y;
    }

    public setPosition(x: number, y: number) {
        this.curX = x;
        this.curY = y;
    }

    /**
     * Reset current position.
     */
    public reset() {
        this.curX = this.baseX = this.edgeX;
        this.curY = this.edgeY;
    }

    public indent() {
        this.baseX += this.indentX;
    }

    /**
     * Increase current y position.
     * @param space 
     */
    public spaceY(space: number = 4) {
        this.curY += space;
    }

    /**
     * Increase current x position.
     * @param space 
     */
    public spaceX(space: number = 4) {
        this.curX += space;
    }
    /**
     * Remove a level of indentation.
     */
    public removeIndent() {
        if (this.baseX >= this.indentX + this.edgeX) {
            this.baseX -= this.indentX;
            this.curX = this.baseX;
        }
    }

    /**
     * Add display object at the next available y position.
     * @param display 
     */
    public addLine(display: Container) {
        display.position.set(

            this.curX, this.curY
        );
        this.curX = this.baseX;
        this.curY += display.height + this.paddingY;
        this.container.addChild(display);
    }

    /**
     * Add object to current line.
     * @param display 
     */
    public add(display: Container) {

        display.position.set(this.curX, this.curY);
        this.curX += display.width + this.paddingX;

    }

}

/*const PmColor: number = 0xbb00bb;
const MsgColor: number = 0xbbbb00;

const pmStyle: TextStyle = new TextStyle({

    fill: PmColor,
    fontSize: 16

});

const msgStyle: TextStyle = new TextStyle({

    fill: MsgColor,
    fontSize: 16

});*/

/*makeLabel = (label: string, at: Point, style: TextStyle): Actor => {

    const clip = new Container();
    const fromText = new Text(label, msgStyle);
    clip.addChild(
        fromText
    );

    const go = new Actor(clip, at);

    return go;

}

makeRoomMsg = (from: string, msg: string, fadeMs?: number): Actor => {

    const clip = new Container();
    clip.addChild(
        new Text(`${from}: ${msg}`)
    );

    const go = new Actor(clip);

    if (fadeMs) {
        const dest = go.add(TimeDestroy);
        dest.timeMs = fadeMs;
    }

    //const pre = `${from}: `;
    //const tm = TextMetrics.measureText(pre, UiSkin.Default!.baseStyle);

    return go;

}*/