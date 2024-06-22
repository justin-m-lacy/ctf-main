import { System } from 'gibbon.js';
import { Container, Point } from 'pixi.js';
import { PlayerSchema } from '../../../server/src/model/schema/player-schema';
import { MatchEvent } from '../model/match-events';
import { AbilitySchema, AbilityState } from '../../../server/src/model/schema/data/ability-schema';
import { AbilityTimer } from '../views/ability-timer';
import { ClientGame } from '@/client-game';
import { CommandKey } from '../input/commands';
import { RollOverGroup, RollOverParams } from './rollover';
import { InputGroup } from './input-group';
import { AbilityPane } from '../views/ability-pane';
import { TCraftFull } from '../../../server/src/ctf/data/craft-type';
import { InputBinding } from '../input/bindings';

const BoxSpacing = 32;
const BoxWidth = 36;
const BoxHeight = 36;
const BoxColor = 0xaa00aa;

export class AbilitiesBar extends System<ClientGame> {

    public get position(): Point { return this.container.position; }

    public get x() { return this.container.x }
    public set x(v) { this.container.x = v }

    public get y() { return this.container.y }
    public set y(v) { this.container.y = v }

    private readonly container: Container;

    private readonly timers: AbilityTimer<string>[] = [];

    private inputGroup!: InputGroup;

    private rollOvers!: RollOverGroup;
    private abilityPane?: AbilityPane;


    /**
     * Current craft information.
     */
    private craft?: TCraftFull;

    constructor(container?: Container) {

        super(container ?? new Container());
        this.container = this.clip!;

    }

    onAdded() {

        super.onAdded();

        this.abilityPane = this.game!.panes.abilityPane;

        const match = this.game!.activeMatch!;
        match.on(MatchEvent.PlayerJoin, this.onPlayerJoin, this);
        match.on(MatchEvent.AbilityState, this.onAbilityState, this);
        match.on(MatchEvent.CraftChanged, this.onCraftChange, this);

        this.game!.on(InputGroup.EventBindInput, this.onBindInput, this);

        if (import.meta.env.DEV) {
            this.game!.on(CommandKey.DebugResetAbilities, this.debugResetAbilities, this);
        }

        this.inputGroup = this.game!.getGroup(InputGroup)!;
        this.rollOvers = this.game!.getGroup(RollOverGroup)!;

    }

    onRemoved() {

        super.onRemoved();

        this.game!.off(InputGroup.EventBindInput, this.onBindInput, this);

        for (let i = this.timers.length - 1; i >= 0; i--) {
            this.rollOvers.removeRollOver(this.timers[i]);
        }

        if (import.meta.env.DEV) {
            this.game!.off(CommandKey.DebugResetAbilities, this.debugResetAbilities, this);
        }


        this.game!.uiLayer.removeChild(this.container);

    }


    private debugResetAbilities() {

        for (let count of this.timers) {
            count.clearTimer();
        }
    }

    private onBindInput(cmd: CommandKey, newBinding: InputBinding, index: number) {

        for (let t of this.timers) {
            if (t.bindings?.command === cmd) {
                t.bindings = this.inputGroup.getBindings(cmd);

            }
        }

    }

    /**
     * player changed craft.
     */
    private onCraftChange(schema: PlayerSchema, craftId: string, isLocal: boolean) {

        if (isLocal) {

            this.craft = this.game?.assets.getCraftData(craftId);

            /// reset all abilitiy boxes.
            /// todo: reuse/repurpose any existing boxes?
            for (let i = 0; i < this.timers.length; i++) {

                this.rollOvers.removeRollOver(this.timers[i]);
                this.timers[i].destroy();

            }
            this.timers.length = 0;
            this.makeBoxes(schema.abilities);
        }

    }

    private onAbilityState(p: PlayerSchema, ability: AbilitySchema, isLocal: boolean) {

        if (isLocal) {

            if (ability.id === p.primary?.id) {
                /// don't monitor primary ability.
                return;
            }

            for (const c of this.timers) {
                if (c.data === ability.id) {

                    if (ability.state === AbilityState.available) {
                        c.clearTimer();
                    } else {
                        c.setTimer(ability.state === AbilityState.active ? ability.duration : ability.cooldown);
                    }


                    break;
                }
            }
        }

    }

    private onPlayerJoin(schema: PlayerSchema, isLocal: boolean) {
        if (isLocal) {
            this.makeBoxes(schema.abilities);
        }
    }

    private makeBoxes(abilities: AbilitySchema[]) {

        let prevX = 0;

        let count: number = 0;

        for (let i = 0; i < abilities.length; i++) {

            const ability = abilities[i];
            if (ability.type === 'passive' || !ability.id) {
                continue;
            }
            count++;

            const box = this.makeAbilityBox(ability, count);
            box.x = prevX + BoxSpacing;
            prevX = box.x + BoxWidth;

            this.timers.push(box);

        }

    }

    /**
     * 
     * @param ability 
     * @param num - ability number, 1-based index.
     * @returns 
     */
    private makeAbilityBox(ability: AbilitySchema, num: number) {

        const command = ('ability' + num) as CommandKey;

        const box = new AbilityTimer({
            bindings: this.inputGroup.getBindings(command),
            width: BoxWidth,
            height: BoxHeight,
            color: BoxColor,
            data: ability.id
        });

        this.rollOvers.addRollOver<[AbilitySchema, CommandKey]>({

            target: box,
            data: [ability, command],
            popup: this.abilityPane,
            onOver: v => this.onRollOver(v),
            //onOut: this.onRollOut
        });

        this.container.addChild(box);

        return box;

    }

    private onRollOver(params: RollOverParams<[AbilitySchema, CommandKey]>) {

        const bindings = this.inputGroup.getBindings(params.data[1]);
        const pane = params.popup as AbilityPane;
        if (pane) {
            const abilityId = params.data[0].id;
            pane.showAbility(params.data[0], this.craft?.abilities.find(v => v.id === abilityId), bindings);
        }

    }
    /*private onRollOut(params: RollOverParams<[AbilitySchema, CommandKey]>) {
        if (this.abilityPane) {
            this.abilityPane.enabled = false;
        }
    }*/

    update(delta: number) {

        for (let i = 0; i < this.timers.length; i++) {
            this.timers[i].update(delta);
        }

    }


    onDestroy() {

        super.onDestroy?.();
        this.container.destroy();
    }

}