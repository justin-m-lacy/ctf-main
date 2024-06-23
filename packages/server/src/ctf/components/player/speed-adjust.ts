import { CtfMatch } from '@/ctf/ctf-match';
import { Component } from '../../../engine/component';
import { SchemaMover } from '../../../engine/components/schema-mover';
import { quickSplice } from '../../../engine/utils/array-utils';

type SpeedMod = {
    change: number,
    time: number
}
export class SpeedAdjust extends Component<CtfMatch> {

    private mover!: SchemaMover;
    private readonly _mods: SpeedMod[] = [];

    constructor() {
        super();
    }

    init() {
        super.init();
        this.mover = this.get(SchemaMover)!;

    }

    public addPercent(percent: number, time: number) {

        const amt = percent * this.mover.baseSpeed;
        this.mover.maxSpeed += amt;

        this._mods.push({
            change: amt,
            time: time
        });


    }

    update(delta: number) {

        for (let i = this._mods.length - 1; i >= 0; i--) {

            this._mods[i].time -= delta;
            if (this._mods[i].time <= 0) {
                this.endSpeed(i);
            }

        }

    }
    private endSpeed(ind: number) {
        this.mover.maxSpeed -= this._mods[ind].change;
        quickSplice(this._mods, ind);

        if (this._mods.length <= 0) {
            this.destroy();
        }

    }

}