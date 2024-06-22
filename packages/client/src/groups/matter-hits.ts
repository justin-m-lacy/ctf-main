import { Group } from 'gibbon.js';
import { MatterGroup } from './matter-group';
import { Player } from '@components/player/player';
import { Pair, Body } from 'matter-js';
import { LocalEvent } from '../model/app-events';
import { MatterPlayer } from '@components/hits/matter-player';
import type { IActiveMatch } from '../model/iactive-match';
import { MatchEvent } from '../model/match-events';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { HitCategory } from '../../../server/src/model/matter';
import { Group as TweenGroup } from 'tweedle.js';
import { DamageFlash } from '../components/player/damage-flash';
import { BodyHit } from '../components/hits/body-hit';


// Mainly controls hit visuals.
export class MatterHits extends Group {

    private readonly matterGroup: MatterGroup;

    private match: IActiveMatch;

    private readonly playerHits: Map<string, MatterPlayer> = new Map();

    private tweens?: TweenGroup;

    constructor(match: IActiveMatch, matterSystem: MatterGroup, tweens?: TweenGroup) {

        super();

        this.match = match;
        this.matterGroup = matterSystem;
        this.tweens = tweens;

    }

    onAdded() {

        super.onAdded();

        this.game!.on(LocalEvent.PlayerSpawned, this.onPlayerSpawned, this);
        this.match.on(MatchEvent.HitMask, this.onMaskChanged, this);
        this.match.on(MatchEvent.PlayerLeave, this.onPlayerLeft, this);


    }

    onRemoved() {
        this.game!.off(LocalEvent.PlayerSpawned, this.onPlayerSpawned, this);

    }

    private onPlayerSpawned(player: Player) {

        const schema = player.schema;

        player.actor?.on(MatterGroup.Collision, this.onCollision, this);
        player.actor?.off(MatterGroup.EndCollision, this.endCollision, this);

        const mp = new MatterPlayer(schema);
        player.add(mp);

        this.playerHits.set(schema.id, mp);

        this.matterGroup.addActor(mp);

    }

    private onMaskChanged(id: string, mask: number) {

        const player = this.playerHits.get(id);
        if (player) {
            player.hitMask = mask;
        }
    }

    private onPlayerLeft(player: PlayerSchema) {
        this.playerHits.delete(player.id);
    }

    private endCollision(mp: MatterPlayer, pair: Pair, other: Body, hit?: BodyHit) {

        const category = other.collisionFilter.category;
        if (!category) return;

        if (hit?.onlyTeam && (hit.onlyTeam !== mp.data?.team)) {
            return;
        } else if (hit?.ignoreTeam && (hit.ignoreTeam === mp.data?.team)) {
            return;
        }



        if (category & HitCategory.Damager) {

            const flash = mp.get(DamageFlash) ?? mp.actor?.addInstance(new DamageFlash(this.tweens));
            flash?.removeDamager();

        }

    }

    private onCollision(mp: MatterPlayer, pair: Pair, other: Body, hit?: BodyHit) {

        const category = other.collisionFilter.category;
        if (!category) return;

        if (hit?.onlyTeam && (hit.onlyTeam !== mp.data?.team)) {
            return;
        } else if (hit?.ignoreTeam && (hit.ignoreTeam === mp.data?.team)) {
            return;
        }

        if (category & (HitCategory.Damager | HitCategory.Bullet)) {


            const flash = mp.get(DamageFlash) ?? mp.actor?.addInstance(new DamageFlash(this.tweens));
            if (category === HitCategory.Bullet) {
                flash?.flashHit();
            } else {
                flash?.addDamager();
            }



        } else if (category & (HitCategory.Wall | HitCategory.Water)) {

            const pos = mp.data!.pos;
            const depth = pair.collision.penetration;


            /// NOTE: separation is equal to penetration abs.
            /*console.log(`separation: ${pair.separation}`);
            console.log(`depth: ${depth.x},${depth.y} == ${d}`);
            console.log(`speed: $${mover.speed}`);*/
            /*const dot = mover.dx * depth.x + mover.dy * depth.y;*/

            const factor = pair.bodyA === mp.body ? 1 : -1;
            mp.position.set(pos.x + factor * depth.x, pos.y + factor * depth.y);

        } /*else {

            /// todo: messy way to check. use matter spawn?
            if (mp.data?.team === other.label) {

                mp.require(HealFx).addHeal(0);
            }

        }*/

    }


}