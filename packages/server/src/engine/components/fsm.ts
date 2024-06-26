import { Component } from '../component';
import { State, StateEffect, EffectDef, Transition } from '../data/state';
import { Priorities } from '../../ctf/data/consts';
import { ComponentKey } from '../actor';

export enum StateEvent {
    enter = 'enterState',
    exit = 'exitState'
}

/**
 * Basis State Machine for adding/removing components on state changes.
 */
export class FSM<TKey = string | Symbol | number, TTrigger = string | Symbol> extends Component {

    private _startState: State<TKey, TTrigger>;

    private readonly _states: Map<TKey, State<TKey, TTrigger>> = new Map();

    public get current() { return this._current; }
    private _current!: State<TKey, TTrigger>;

    /**
     * Get name of current state.
     */
    public get state() { return this._current.name }

    /**
     * True if state is changing. Used to detect
     * multiple simultaneous state changes.
     */
    private _changeState: State<TKey, TTrigger> | null = null;

    /**
     * Current transition for timed transitions.
     */
    private curTransition: Transition<TKey> | null = null;
    /**
     * Timer on current transition.
     */
    private transTimer: number = 0;

    priority = Priorities.FSM;

    constructor(start: State<TKey, TTrigger> | TKey) {

        super();

        this._startState = start instanceof State ? start : new State<TKey, TTrigger>(start);

        this.addState(this._startState);

        this._current = this._startState;

    }

    init() {
        this.enterState(this._current);
    }

    getState(name: TKey) {
        return this._states.get(name);
    }

    /**
     * Trigger transition on current state.
     * @param trigger
     * @returns new State or false on error.
     */
    trigger(trigger: TTrigger) {

        const next = this._current.getNextState(trigger);
        if (next) {
            return this.switchState(next);
        }
        return false;
    }

    /**
     * Switch to new state, triggering exit and enter transitions
     * from current and next states respectively.
     * @param newState
     * @throws Error if state change already in progress, or attempting to change state
     * on an FSM not initialized with an Actor.
     * @returns new State<TKey> or false on failure.
     */
    switchState(stateName: TKey) {

        if (stateName === this._current.name) {
            // No state change.
            return false;
        } else if (!this.actor) {
            throw new Error(`Attempting to change state with no actor: ${stateName}`);
        }

        const newState = this.getState(stateName) ?? null;
        if (!newState) {
            return false;
        }
        if (this._changeState) {

            if (this._changeState.priority > newState.priority) {
                return;
            } else if (newState.priority === this._changeState.priority) {
                console.warn(`Overlapping State Change: Current: ${this._current.name}
                    Old transition: ${this._changeState.name}
                    New Transition: ${stateName}`);
                return;
            }

        }

        this._changeState = newState;
        this.clearTransition();



        this._current.onExit?.apply(this.actor!);
        this.actor?.emit(StateEvent.exit, this._current);

        this.enterState(newState);

        this._changeState = null;
        return newState ?? false;

    }

    private clearTransition() {
        this.curTransition = null;
    }

    private enterState(newState: State<TKey, TTrigger>) {

        this._current = newState;
        newState.onEnter?.apply(this.actor!);
        this.actor!.emit(StateEvent.enter, newState, this.actor);

        if (newState.autoNext) {

            this.curTransition = newState.autoNext;
            this.transTimer = newState.autoNext.enterTime;
        }

    }

    update(delta: number) {

        if (this.curTransition) {

            this.transTimer -= delta;
            if (this.transTimer <= 0) {
                this.switchState(this.curTransition.dest);
            }

        }

    }

    /**
     * Returns true if the current state responds
     * to trigger.
     * @param trigger 
     */
    canTrigger(trigger: TTrigger) {
        return this.current.canTrigger(trigger);
    }


    /**
     * Set current state without triggering transitions.
     * @param name 
     */
    jumpState(name: TKey) {

        const state = this._states.get(name);
        if (state) {
            this.enterState(state);
        } else {
            console.warn(`unexpected missing state: ${name}`);
        }

    }

    /**
     * Create and return new state of FSM.
     * @param name 
     * @returns 
     */
    createState(name: TKey, opts?: {
        onEnter?: StateEffect | EffectDef, onExit?: StateEffect | EffectDef,
        autoNext?: Transition<TKey>
    }) {

        if (this._states.has(name)) {
            return this._states.get(name)!;
        } else {

            const st = new State<TKey, TTrigger>(name, opts);
            this._states.set(name, st);

            return st;
        }

    }

    /**
     * Add a component to enable when entering a state.
     * @param state 
     * @param enable 
     */
    addStateEnable(state: TKey, enable: ComponentKey) {

        const st = this._states.get(state);
        if (st) {
            st.addEnterEnable(enable);
        } else {
            console.warn(`FSm.addStateEnable() unexpected missing state: ${state}`);
        }

    }

    /**
     * Add component to disable when entering a state.
     * @param state 
     * @param disable 
     */
    addStateDisable(state: TKey, disable: ComponentKey) {

        const st = this._states.get(state);
        if (st) {
            st.addEnterDisable(disable);
        } else {
            console.warn(`FSm.addStateDisable() unexpected missing state: ${state}`);
        }

    }

    /**
     * Set FSM Start State.
     * @param state 
     */
    setStart(state: State<TKey, TTrigger> | TKey) {

        if (state instanceof State) {
            this.addState(state);
            this._startState = state;

        } else {
            const st = this._states.get(state);
            if (st) {
                this._startState = st;
            }

        }

    }

    addState(state: State<TKey, TTrigger>) {
        this._states.set(state.name, state);
    }

}