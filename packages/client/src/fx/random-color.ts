import * as particles from '@pixi/particle-emitter';
import { IEmitterBehavior } from '@pixi/particle-emitter/lib/behaviors';

export class RandColorBehavior implements IEmitterBehavior {

    static type: string = 'colorRandom';

    order = 0;

    private colors: number[];

    constructor(config: { colors: number[] }) {
        this.colors = config.colors ?? [];
    }

    public setColors(colors: number[]) {
        this.colors = colors;
    }
    initParticles(first: particles.Particle): void {

        const colors = this.colors;

        while (first) {
            first.tint = colors[Math.floor(Math.random() * this.colors.length)];
            first = first.next;
        }
    }

}