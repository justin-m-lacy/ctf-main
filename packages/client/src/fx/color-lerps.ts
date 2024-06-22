import * as particles from '@pixi/particle-emitter';
import { IEmitterBehavior } from '@pixi/particle-emitter/lib/behaviors';

import { PropertyList, ValueList, PropertyNode, BasicTweenable, Particle } from '@pixi/particle-emitter';
//import { IEmitterBehavior } from './behavior';

const combineRGBComponents = particles.ParticleUtils.combineRGBComponents;

type Color = {
    r: number,
    g: number,
    b: number,
    a?: number
}


/**
 * 
 * Replaces the built-in particle color lerp with a list of color lerps
 * chosen randomly.
 * Sample configuration:
    "config": {
                "lerps": [

                    [
                        {
                            "time": 0,
                            "value": "#020202"
                        },
                        {
                            "time": 1,
                            "value": "#ffffff"
                        }
                    ],
                    [
                        {
                            "time": 0,
                            "value": "#6e6766"
                        },
                        {
                            "time": 1,
                            "value": "#cccaca"
                        }
                    ]
                ]
            }
 * 
 */

export class ColorLerpsBehavior implements IEmitterBehavior {

    static type: string = 'colorLerps';

    order = 0;

    private readonly lists: PropertyList<Color>[] = [];

    constructor(config: { lerps: ValueList<number>[] }) {

        for (let i = 0; i < config.lerps.length; i++) {

            this.lists.push(new PropertyList(true));
            this.lists[i].reset(createColorList(config.lerps[i]))

        }


    }


    public initParticles(first: particles.Particle): void {

        const lists = this.lists;

        while (first) {
            const ind = first.config.cIndex = Math.floor(Math.random() * lists.length);
            const color = lists[ind].first.value;
            first.tint = combineRGBComponents(color.r, color.g, color.b);
            first = first.next;
        }
    }

    public updateParticle(particle: Particle): boolean {
        particle.tint = this.lists[particle.config.cIndex ?? 0].interpolate(particle.agePercent);

        return false;

    }

}


const splitColor = (v: number) => {

    return {
        r: 0xff & (v >> 16),
        g: 0xff & (v >> 8),
        b: 0xff & v
    }
}

export const createColorList = (data: ValueList<number> | BasicTweenable<number>): PropertyNode<Color> => {

    if ('list' in data) {

        const array = data.list;
        let node;
        const { value, time } = array[0];

        // eslint-disable-next-line max-len
        const first = node = new PropertyNode<Color>(splitColor(value), time, data.ease);

        // only set up subsequent nodes if there are a bunch or the 2nd one is different from the first
        if (array.length > 2 || (array.length === 2 && array[1].value !== value)) {
            for (let i = 1; i < array.length; ++i) {
                const { value, time } = array[i];

                node.next = new PropertyNode<Color>(splitColor(value), time);
                node = node.next;
            }
        }
        first.isStepped = !!data.isStepped;

        return first as PropertyNode<Color>;

    } else {

        // Handle deprecated version here
        const start = new PropertyNode<Color>(splitColor(data.start), 0);
        // only set up a next value if it is different from the starting value

        if (data.end !== data.start) {
            start.next = new PropertyNode<Color>(splitColor(data.end), 1);
        }

        return start as PropertyNode<Color>;

    }
}