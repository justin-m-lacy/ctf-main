import { Priorities } from '../../data/consts';
import { Component } from '../../../engine/component';
import { PlayerSchema } from '../../../model/schema/player-schema';

import { Driver } from './driver';
import { SchemaMover } from '../../../engine/components/schema-mover';
import { FSM } from '@/engine/components/fsm';
import { StateEvent } from '../../../engine/components/fsm';
import { State, Transition } from '@/engine/data/state';
import { TPoint } from '@/engine/data/geom';
import { Respawner } from '../respawner';
import { MatterPlayer } from '../hits/matter-player';
import { MatchParams } from '@/model/schema/data/match-params';
import { PlayerState, isAlive } from '../../../model/schema/types';

export class Player extends Component {

    get id() { return this.schema.id }

    get teamId() { return this.schema.team; }
    get state() { return this.schema.state; }

    public readonly schema: PlayerSchema;

    private motion!: SchemaMover;
    private nav!: Driver;

    public readonly fsm: FSM<PlayerState>;

    priority = Priorities.Player;

    private fillRate: number;

    constructor(schema: PlayerSchema, params: MatchParams) {

        super();

        this.fillRate = params.manaFillRate;

        this.schema = schema;
        this.fsm = this.createFSM(params);

    }

    init() {

        this.motion = this.require(SchemaMover, this.schema.motion);

        this.position.set(this.schema.pos.x, this.schema.pos.y);
        this.rotation = this.schema.angle;

        this.nav = this.require(Driver, this.schema.motion);
        this.nav.slowRadius = this.schema.slowRadius;
        this.nav.stopRadius = this.schema.stopRadius;

        this.actor!.on(StateEvent.enter, this.onEnterState, this);
        this.addInstance(this.fsm);



    }

    die() {

        this.schema.hp = 0;

        this.switchState(PlayerState.dead);

        this.require(Respawner).enabled = true;
    }

    /**
     * Reset player at game start.
     * Not for respawning.
     */
    reset(at: TPoint) {

        this.reposition(at);

        const respawn = this.actor?.get(Respawner);
        if (respawn) { respawn.enabled = false; }

        this.fsm.switchState(PlayerState.movable);
        this.schema.hp = this.schema.maxHp;
        this.schema.manaPct = 1;

    }

    switchState(state: PlayerState) {
        this.schema.state = state;
        this.fsm.switchState(state);
    }

    /**
     * Set player's current position. Current navigation and motion
     * is stopped.
     * @param to 
     * @param movable 
     */
    public reposition(to: TPoint) {

        this.schema.pos.set(to.x, to.y);
        this.position.set(to.x, to.y)

        this.motion.forceStop();
        this.nav.enabled = false;

    }

    private createFSM(params: MatchParams) {

        const fsm = new FSM<PlayerState>(

            new State(PlayerState.movable, {
                onEnter: {
                    enable: [SchemaMover]
                }
            })

        );


        const deadState = fsm.createState(PlayerState.dead, {
            onEnter: {
                disable: [Driver, SchemaMover, MatterPlayer]
            },
            onExit: {
                enable: [MatterPlayer]
            },
            autoNext: new Transition(PlayerState.movable, params.respawnTime)

        });
        deadState.setPriority(100);

        fsm.createState(PlayerState.busy, {
            onEnter: {
                disable: [SchemaMover, Driver]
            },
            onExit: {
                enable: [SchemaMover]
            }
        });

        fsm.createState(PlayerState.firing, {

            onEnter: {
                disable: [SchemaMover]
            },
            autoNext: new Transition(PlayerState.movable, params.fireTime)

        });

        fsm.createState(PlayerState.disabled, {
            onEnter: {
                disable: [SchemaMover, Driver, MatterPlayer]
            },
            onExit: {
                enable: [MatterPlayer]
            }
        })

        return fsm;

    }

    private onEnterState(state: State<PlayerState>) {

        console.assert(state !== undefined && state.name !== undefined, 'State must be a valid player state.');

        if (state.name === PlayerState.dead) {
            this.motion.forceStop();
        }

        this.schema.state = state.name;
    }

    update(delta: number) {

        const state = this.schema.state;
        if (this.fsm.state !== state) {
            this.switchState(state);
        }

        if (isAlive(state)) {
            this.schema.manaPct += this.fillRate * delta;
            if (this.schema.manaPct >= 1) {
                this.schema.manaPct = 1;
            }
        }
        this.schema.pos.setTo(this.position);
        this.schema.angle = this.rotation;

    }

}