import { TPoint, System } from 'gibbon.js';
import * as particles from '@pixi/particle-emitter';
import { Container } from 'pixi.js';
import { RandColorBehavior } from '@/fx/random-color';
import { quickSplice } from 'gibbon.js/src/utils/array-utils';
import { EmitterConfigV3 } from '@pixi/particle-emitter';
import { ColorLerpsBehavior } from '../fx/color-lerps';
import { lighten } from '../utils/display';
import burst from '../fx/burst.json';
import explosion from '../fx/explosion.json';
import smoke from '../fx/smoke.json';
import { ScaleOffsetBehavior } from '../fx/scale-offset';

particles.Emitter.registerBehavior(RandColorBehavior);
particles.Emitter.registerBehavior(ColorLerpsBehavior);
particles.Emitter.registerBehavior(ScaleOffsetBehavior);

export class ParticleSystem extends System {

    private readonly emitters: particles.Emitter[] = [];

    constructor(parent: Container) {
        super(new Container());
        parent.addChild(this.clip!);
    }


    /**
     * Make a color burst. Currently used for player dying.
     * Not working???
     * @param at 
     * @param colors 
     */
    public makeBurst(at: TPoint, ...colors: number[]) {

        this.enable();

        const addColor = this.addLightenLerp(burst, colors);

        const e = new particles.Emitter(this.clip!, addColor);

        e.spawnPos.set(at.x, at.y);

        this.emitters.push(e);

    }

    /**
     * Make a basic particle explosion.
     * @param at 
     */
    public makeExplode(at: TPoint) {

        this.enable();

        const e = new particles.Emitter(this.clip!, explosion);

        e.spawnPos.set(at.x, at.y);

        this.emitters.push(e);

    }

    /**
     * Create movable smoke emitter.
     * @param at 
     */
    public makeSmoke(at: TPoint) {

        this.enable();

        const container = new Container();
        this.clip!.addChild(container);

        const e = new particles.Emitter(container, smoke);

        e.spawnPos.set(at.x, at.y);

        this.emitters.push(e);

    }

    /**
     * Add color interpolation that lightens the particle colors
     * over the particle lifetime.
     * @param fx 
     * @param colors 
     * @returns 
     */
    private addLightenLerp(fx: EmitterConfigV3, colors: number[]): EmitterConfigV3 {

        const lerps = colors.map(num => {

            return {
                list: [
                    {
                        value: lighten(num, 0.9),
                        time: 0
                    },
                    {
                        value: num,
                        time: 1
                    }
                ]
            }

        });

        const ind = fx.behaviors.findIndex(v => v.type === ColorLerpsBehavior.type);
        if (ind >= 0) {
            fx.behaviors[ind] = {

                type: ColorLerpsBehavior.type,
                config: {
                    lerps: lerps
                }
            };
        } else {
            fx.behaviors.push({

                type: ColorLerpsBehavior.type,
                config: {
                    lerps: lerps
                }
            });
        }

        return fx;

    }

    /**
     * Update all emitters.
     * @param delta 
     */
    update(delta: number) {

        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const e = this.emitters[i];
            if (e.destroyed) {
                quickSplice(this.emitters, i);
            } else {
                e.update(delta);
            }

        }
    }

}
