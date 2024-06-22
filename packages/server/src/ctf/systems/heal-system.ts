import { MatterSystem } from './matter-system';
import { CtfMatch } from '../ctf-match';
import { Engine, Events, IEventCollision } from 'matter-js';
import { PlayerSchema } from '../../model/schema/player-schema';
import Group from '../../engine/group';
import { HitCategory } from '../../model/matter';


const SPAWN_HEAL_RATE = 0.04;

export class HealSystem extends Group<CtfMatch> {

    private hits!: MatterSystem;

    private _onCollision?: (e: IEventCollision<Engine>) => void;

    onAdded() {

        this.hits = this.game?.getGroup(MatterSystem)!;
        Events.on(this.hits.engine, "collisionActive", this.createHandler());

    }

    private createHandler() {

        if (!this._onCollision) {

            this._onCollision = (e: IEventCollision<Engine>) => {

                for (let i = e.pairs.length - 1; i >= 0; i--) {

                    const p = e.pairs[i];

                    const [spawn, charBody] = (p.bodyA.collisionFilter.category === HitCategory.Spawn) ? [p.bodyA, p.bodyB] : (p.bodyB.collisionFilter.category === HitCategory.Spawn ? [p.bodyB, p.bodyA] : [null, p.bodyB]);

                    if (spawn != null) {

                        const mb = this.hits.getLinkedBody(charBody);
                        if (mb?.data && mb.data.team === spawn.label) {

                            const player = mb.data as PlayerSchema;
                            const hp = player.hp + SPAWN_HEAL_RATE * this.hits.engine.timing.lastDelta;
                            player.hp = hp > player.maxHp ? player.maxHp : hp;

                        }
                    }



                }

            }

        }
        return this._onCollision;

    }

    onRemoved() {
        if (this._onCollision) {
            Events.off(this.hits.engine, "collisionActive", this._onCollision);
        }
    }

    onDestroy() {
        if (this._onCollision) {
            Events.off(this.hits.engine, "collisionActive", this._onCollision);
        }
        this._onCollision = undefined;

    }

}