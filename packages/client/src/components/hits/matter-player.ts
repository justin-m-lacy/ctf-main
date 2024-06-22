import { ForwardMover } from '@components/motion/forward-mover';
import { Bodies } from 'matter-js';
import { HitCategory } from '../../../../server/src/model/matter';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { BodyHit } from './body-hit';

export class MatterPlayer extends BodyHit<PlayerSchema> {

    public mover!: ForwardMover;
    //private damageFlash!: DamageFlash;


    constructor(schema: PlayerSchema) {
        super(
            Bodies.circle(0, 0, schema.radius, {

                friction: 0,
                frictionAir: 0,
                isSensor: true,
                collisionFilter: {
                    category: HitCategory.Player,
                    mask: schema.hitMask
                }
            }), schema

        );

    }

    init() {
        super.init();
        this.mover = this.require(ForwardMover);
        //this.damageFlash = this.actor!.add(new DamageFlash(this.game.activeMatch.));
    }

    /**
     * Override in subclass.
     * @param pair 
     * @param other 
     */
    /*collide(pair: Pair, other: Body, hit?: BodyHit) {

        const category = other.collisionFilter.category ?? 0;

        if (hit?.onlyTeam && (hit.onlyTeam !== this.data?.team)) {
            return;
        }

        if (category & (HitCategory.Damager | HitCategory.Bullet)) {


            const flash = this.get(DamageFlash) ?? this.actor?.addInstance(new DamageFlash());
            if (category === HitCategory.Bullet) {
                flash?.flashHit();
            } else {
                flash?.addDamager();
            }

        }


    }

    endCollide(pair: Pair, other: Body, hit?: BodyHit) {

        if (other.collisionFilter.category ===
            HitCategory.Damager) {
            this.damageFlash.removeDamager();
        }

    } */



}