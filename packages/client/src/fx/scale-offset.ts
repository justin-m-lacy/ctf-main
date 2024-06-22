import { IEmitterBehavior } from '@pixi/particle-emitter/lib/behaviors';
import { Particle, PropertyList, PropertyNode, ValueList } from '@pixi/particle-emitter';

/**
 * Duplicates the base scaling behavior, but allows individual particles to
 * use a current scale offset.
 * This is useful if the particle-generating object is scaling during
 * particle generation.
 */
export class ScaleOffsetBehavior implements IEmitterBehavior {
    public static type = 'offsetScale';

    public order = 2;
    private list: PropertyList<number>;
    private minMult: number;

    public get scale(): number { return this.curScale }
    public set scale(v) { this.curScale = v }

    /**
     * current scaling multiplier.
     */
    private curScale: number;

    constructor(config: {
        /**
         * Scale of the particles, with a minimum value of 0
         */
        scale: ValueList<number>;
        /**
         * A value between minimum scale multipler and 1 is randomly
         * generated and multiplied with each scale value to provide the actual scale for each particle.
         */
        minMult: number;

    }) {

        this.curScale = 1;

        this.list = new PropertyList(false);
        this.list.reset(PropertyNode.createList(config.scale));
        this.minMult = config.minMult ?? 1;
    }

    initParticles(first: Particle): void {
        let next = first;


        const s = this.curScale;
        while (next) {
            const mult = (Math.random() * (1 - this.minMult)) + this.minMult;

            next.config.scaleMult = s * mult;
            next.scale.x = next.scale.y = this.list.first.value * mult;

            next = next.next;
        }
    }

    updateParticle(particle: Particle): boolean {
        particle.scale.x = particle.scale.y = this.list.interpolate(particle.agePercent) * particle.config.scaleMult;
        return false;
    }
}
