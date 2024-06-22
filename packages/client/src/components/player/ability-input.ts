import { Component, TPoint } from 'gibbon.js';
import { Point, DisplayObject, type EventSystem } from 'pixi.js';
import { CommandKey } from '../../input/commands';
import { ClientGame } from '../../client-game';
import { Player } from './player';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { AbilitySchema, AbilityState } from '../../../../server/src/model/schema/data/ability-schema';

/**
 * Input for triggering special abilities.
 */
export class AbilityInput extends Component<DisplayObject, ClientGame> {

    private readonly clickPoint: Point = new Point();


    private events!: EventSystem;

    private player!: PlayerSchema;

    //private fireTarget!: FireTarget;


    init() {
        this.player = this.get(Player)!.schema;
        this.events = this.game!.app.renderer.events;

        //this.fireTarget = this.get(FireTarget)!;

    }

    onDisable() { this.removeEvents(); }

    onEnable() {

        this.game!.on(CommandKey.UsePrimary, this.cmdUsePrimary, this);
        this.game!.on(CommandKey.UseAbility1, this.cmdUseAbility, this);
        this.game!.on(CommandKey.UseAbility2, this.cmdUseAbility, this);
        this.game!.on(CommandKey.UseAbility3, this.cmdUseAbility, this);
        this.game!.on(CommandKey.UseAbility4, this.cmdUseAbility, this);


    }

    /**
     * TODO: Add ability used to command binding, instead of searching
     * every time.
     * @param num 
     */
    private getAbility(cmd: CommandKey) {

        const abilities = this.player.abilities;

        let num;
        if (cmd === CommandKey.UseAbility1) {
            num = 1;
        } else if (cmd === CommandKey.UseAbility2) {
            num = 2;
        } else if (cmd === CommandKey.UseAbility3) {
            num = 3;
        } else {
            num = 4;
        }

        for (let i = 0; i < abilities.length; i++) {

            if (abilities[i].type !== 'passive') {

                num--;
                if (num <= 0) {
                    return abilities[i];
                }

            }


        }

    }

    private removeEvents() {
        this.game!.off(CommandKey.UsePrimary, this.cmdUsePrimary, this);
        this.game!.off(CommandKey.UseAbility1, this.cmdUseAbility, this);
        this.game!.off(CommandKey.UseAbility2, this.cmdUseAbility, this);
        this.game!.off(CommandKey.UseAbility3, this.cmdUseAbility, this);
        this.game!.off(CommandKey.UseAbility4, this.cmdUseAbility, this);
    }

    private cmdUsePrimary(cmd: CommandKey) {
        this.events.pointer.getLocalPosition(this.game!.objectLayer, this.clickPoint);
        this.game!.activeMatch?.sendUsePrimary(this.clickPoint);
    }

    private useAbility(ability: AbilitySchema, at: TPoint, angle: number) {

        this.game!.activeMatch?.sendUseAbility(
            {
                id: ability.id,
                at: ability.type === 'aim' ? this.clickPoint : undefined
            }
        );
    }

    private cmdUseAbility(cmd: CommandKey) {

        const ability = this.getAbility(cmd);

        if (ability?.state === AbilityState.available) {

            //console.log(`using ability: ${ability.id}`);
            this.events.pointer.getLocalPosition(this.game!.objectLayer, this.clickPoint);

            /// TODO: add local check of time lapse to not send unnecessary messages.

            //this.match.getServerTime()
            this.game!.activeMatch?.sendUseAbility(
                {
                    id: ability.id,
                    at: ability.type === 'aim' ? this.clickPoint : undefined
                }
            );
        }

    }

    onDestroy() {
        this.removeEvents();
    }


}