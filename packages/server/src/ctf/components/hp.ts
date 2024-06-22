import { Component } from '../../engine/component';

export const EventHpZero = 'evt_hp_zero';

export class Hp extends Component {

    private max: number = 0;
    private hp: number = 0;

    public setMax(max: number) {
        this.max = max;
    }

    constructor(max: number) {
        super();

        this.hp = this.max = max;

    }

    public addHp(v: number) {

        this.hp += v;
        if (this.hp > this.max) {
            this.hp = this.max;
        } else if (this.hp <= 0) {
            this.hp = 0;
            this.emit(EventHpZero, this);
        }

    }
}