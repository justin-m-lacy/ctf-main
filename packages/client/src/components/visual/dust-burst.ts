import * as particles from '@pixi/particle-emitter';
import { Component } from 'gibbon.js';
import { Container } from 'pixi.js';
import dustBurst from '../../fx/dust-burst.json';

export class DustBurst extends Component<Container> {

    private emitter?: particles.Emitter;

    init() {

        this.emitter = new particles.Emitter(this.clip!, dustBurst);
        this.emitter.addAtBack = true;


        this.emitter.playOnce(() => {
            this.enabled = false;
            this.destroy();
        })
    }

    update(delta: number) {
        this.emitter!.update(delta);

    }


    onDestroy() {
        this.emitter?.destroy();
    }


}