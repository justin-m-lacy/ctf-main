import { Component, FSM, Game, TPoint } from 'gibbon.js';
import { Container } from 'pixi.js';
import { Follow } from '../follow';
import { PlayerSchema } from '../../../../server/src/model/schema/player-schema';
import { State } from 'gibbon.js/src/data/state';
import { Followers } from '@components/followers';
import { PlayerState } from '../../../../server/src/model/schema/types';
import { LerpPos } from '../motion/lerp-pos';

const DefaultPlayerColor = 0xdd0000;
export class Player extends Component<Container, Game> {

    public get isLocalPlayer() { return false; }

    readonly schema: PlayerSchema;

    protected fsm: FSM = new FSM(PlayerState.disabled);
    get state() { return this.fsm.current.name; }

    get radius() { return this.schema.radius ?? 0 }

    color: number;

    constructor(schema: PlayerSchema, color?: number,) {

        super();

        this.schema = schema;

        this.color = color ?? DefaultPlayerColor;

    }

    override init() {
        /// Force matching this position during respawn, dead, certain events.
        const follow = new Follow(this.schema.pos);
        this.add(follow);
        follow.enabled = false;


        this.actor!.addInstance(new LerpPos(this.schema.pos)).enabled = false;
        this.initFSM();

    }

    public reset() {

        const pos = this.schema.pos;
        this.position.set(pos.x, pos.y);
        this.fsm.setState(PlayerState.movable);
    }

    protected initFSM() {

        const lerpPos = this.get(LerpPos)!;

        this.fsm.addState(new State(PlayerState.dead, {

            onEnter: {
                enable: [Follow],
                disable: [Followers]
            },
            onExit: {
                enable: [Followers],
                disable: [Follow, lerpPos],
            }

        }));

        this.fsm.createState(PlayerState.movable, {
            onEnter: {
                enable: []
            }
        });

        this.fsm.createState(PlayerState.firing, {
            onEnter: {
                disable: []
            },
            onExit: {
                enable: []
            }
        });

        this.fsm.createState(PlayerState.busy, {

            onEnter: {
                //disable: [PlayerLerp],
                enable: [lerpPos],
            },
            onExit: {
                // enable: [PlayerLerp],
                disable: [lerpPos]
            }
        });

        this.fsm.createState(PlayerState.disabled, {
            onEnter: {
                disable: []
            },
            onExit: {
                enable: []
            }
        })

        this.add(this.fsm);

    }

    updateState(newState: PlayerState, prevState?: PlayerState) {

        if (prevState === PlayerState.dead) {
            // copy in the last position.
            this.position.set(this.schema?.pos.x, this.schema?.pos.y);
        }

        if (newState === PlayerState.dead) {
            //this.mover.forceStop();
            this.clip!.visible = false;
        } else {
            this.clip!.visible = true;
        }
        this.fsm.switchState(newState);

    }

    setPosition(pos: TPoint, angle?: number) {

        this.position.set(pos.x, pos.y);
        this.rotation = angle ?? this.schema.angle;
        //this.driver.enabled = false;

    }

    onDestroy() {
    }

}