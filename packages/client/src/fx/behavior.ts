

import { Particle } from '@pixi/particle-emitter';
export interface IEmitterBehavior {

    order: number;

    initParticles?(first: Particle): void;

    /**
     * @param natural true if the reycling was due to natural lifecycle,
     * false if it was due to emitter cleanup.
     */

    recycleParticle?(particle: Particle, natural: boolean): void;


    updateParticle?(particle: Particle, dt: number): boolean;

}