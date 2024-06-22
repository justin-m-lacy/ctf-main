import { Component } from 'gibbon.js';
import { Container, } from 'pixi.js';

import { IAbilityControl } from './ability-control';
import { MotionBlurFilter } from '@pixi/filter-motion-blur';
import { Player } from './player';
import { addFilter, removeFilter } from '../../utils/filters';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';

export class DashFx extends Component<Container> implements IAbilityControl {

    /*startAbility(): void {
    }*/

    private player?: PlayerSchema;

    private motionBlur?: MotionBlurFilter;

    init() {
        this.player = this.get(Player)!.schema;
    }

    startAbility(): void {

        const angle = this.player!.angle;
        const speed = -0.01 * this.player!.motion.speed;

        if (!this.motionBlur) {
            this.motionBlur = new MotionBlurFilter([
                speed * Math.cos(angle), speed * Math.sin(angle)
            ], 7, 14);
        } else {
            this.motionBlur.velocity.set(
                speed * Math.cos(angle), speed * Math.sin(angle)
            );
        }

        addFilter(
            this.clip!,
            this.motionBlur
        );

    }

    update(delta: number) {

        const angle = this.player!.angle;
        const speed = -0.01 * this.player!.motion.speed;
        this.motionBlur?.velocity.set(
            speed * Math.cos(angle), speed * Math.sin(angle)
        );

    }

    endAbility(): void {

        if (this.clip && this.motionBlur) {
            removeFilter(this.clip, this.motionBlur);
            this.motionBlur = undefined;
        }

    }

    onDestroy() {

        this.player = undefined;
        this.motionBlur?.destroy();
        this.motionBlur = undefined;
    }

}