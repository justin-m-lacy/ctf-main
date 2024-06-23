import { AbilitySchema } from '../../../../model/schema/data/ability-schema';
import { TPoint, Point } from '../../../../engine/data/geom';
import { AimAbility } from './aim-ability';
import { PlayerSchema } from '@/model/schema/player-schema';
import { Driver } from '@/ctf/components/player/driver';
import { Player } from '../player';
import { PlayerState } from '../../../../model/schema/types';


/**
 * Teleport to selected point.
 */
export class Teleport extends AimAbility {


    private driver!: Driver;
    private player!: Player;

    private readonly at: Point = new Point();

    constructor(schema: AbilitySchema, params?: any) {
        super(schema, params);
    }

    init() {
        super.init();

        this.driver = this.get(Driver)!;
        this.player = this.get(Player)!;
    }

    /**
     * Override start to prevent invalid de
     * @param at 
     */
    public onStart(at?: TPoint): void {

        if (at) {

            this.at.set(at.x, at.y);

        } else {
            console.warn(`Teleport dest is undefined: ${at}`);
            this.end();
        }

    }
    public onEnd() {

        if (this.player.state === PlayerState.busy) {
            this.player.switchState(PlayerState.movable);
        }
    }

    /**
     * 
     */
    public override onFire(schema: PlayerSchema) {

        this.game.reposition(this.player, this.at);
        //console.log(`teleport to: ${this.at.x},${this.at.y}`);

        //this.mover.forceStop();

    }

}