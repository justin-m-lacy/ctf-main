import * as particles from '@pixi/particle-emitter';
import { Component } from 'gibbon.js';
import { Container } from 'pixi.js';
import smoke from '../../fx/smoke.json';
import { ScaleOffsetBehavior } from '../../fx/scale-offset';

export class SmokeComponent extends Component<Container> {

    private emitter?: particles.Emitter;

    private scaleOffset?: ScaleOffsetBehavior;

    constructor() {

        super();

        /*if (offset) {
            this.offset.x = offset.x;
            this.offset.y = offset.y;
        }*/
    }

    init() {


        /// created in order to scale smoke emitter.

        this.emitter = new particles.Emitter(this.clip!.parent, smoke);

        this.emitter.addAtBack = true;
        //this.clip!.addChild(this.emitter);
        this.emitter.spawnPos = this.position;

        this.scaleOffset = this.emitter.getBehavior(ScaleOffsetBehavior.type) as ScaleOffsetBehavior;


    }

    update(delta: number) {

        this.emitter!.update(delta);

        if (this.scaleOffset) {
            this.scaleOffset.scale = this.clip!.scale.x;
        }

    }


    onDestroy() {
        this.emitter?.destroy();
        this.emitter = undefined;
        this.scaleOffset = undefined;
    }


}