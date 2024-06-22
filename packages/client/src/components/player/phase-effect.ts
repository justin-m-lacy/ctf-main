import { Component } from 'gibbon.js';
import { Container, } from 'pixi.js';

import { IAbilityControl } from './ability-control';
import { addFilter, removeFilter } from '../../utils/filters';
import { AlphaFilter } from '@pixi/filter-alpha';
import { Tween } from 'tweedle.js';

export class PhaseEffect extends Component<Container> implements IAbilityControl {

    /*startAbility(): void {
    }*/

    private filter?: AlphaFilter;
    private tween?: Tween<AlphaFilter>;

    private undo?: Tween<AlphaFilter>;

    startAbility(): void {

        this.filter = this.filter ?? new AlphaFilter(1);
        this.tween = this.tween ?? new Tween(this.filter,).to({ alpha: 0.7 }, 0.2).safetyCheck(v => v.enabled && !this.isDestroyed);

        addFilter(this.clip!, this.filter);

        this.tween.start();

    }

    endAbility(): void {

        this.tween?.stop();


        if (this.filter) {
            this.undo = this.undo ?? new Tween(this.filter).to({ alpha: 1, }, 0.2).safetyCheck(
                v => v.enabled && !this.isDestroyed).onComplete(() => {
                    if (!this.isDestroyed) {
                        if (this.filter) {
                            this.filter.enabled = false;
                        }
                    }
                });
            this.undo.start();
        };



    }

    onDisable() {

        this.tween?.stop();
        this.undo?.stop();
        if (this.filter) {
            removeFilter(this.clip!, this.filter);
            this.filter.enabled = false;
        };

    }

    onDestroy() {
        super.onDestroy?.();
        this.filter?.destroy();
        this.undo = undefined;
        this.filter = undefined;
        this.tween = undefined;
    }

}