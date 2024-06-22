import { Component } from 'gibbon.js';
import { Container, Point } from 'pixi.js';
import { TAbilityDef } from '../../../../server/src/ctf/data/ability';
import { AbilitySchema } from '../../../../server/src/model/schema/data/ability-schema';
import { IAbilityControl } from './ability-control';
import { DustBurst } from '../visual/dust-burst';

export class LeapAttackFx extends Component<Container> implements IAbilityControl {

    private maxScale: number = 0.4;

    private readonly startPos: Point = new Point();
    private totDist: number = 0;

    public endAbility() {
        this.clip?.scale.set(1, 1);

        if (this.actor && !this.actor.isDestroyed) {
            this.enabled = false;
            this.actor.addInstance(new DustBurst())
        }
    }


    public startAbility(ability: AbilitySchema, data?: TAbilityDef) {

        const dest = ability.dest;
        const pos = this.position;
        this.startPos.set(pos.x, pos.y);

        let d: number = 0;
        if (dest) {
            const dx = dest.x - pos.x;
            const dy = dest.y - pos.y;
            d = Math.sqrt(dx * dx + dy * dy);

        }
        this.totDist = Math.max(d, 200);

    }

    update(delta: number) {

        const pos = this.position;
        const dx = pos.x - this.startPos.x;
        const dy = pos.y - this.startPos.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const curScale = 1 + this.maxScale * Math.sin(Math.PI * d / this.totDist);
        this.clip?.scale.set(curScale);

    }


}