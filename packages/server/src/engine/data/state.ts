import { Component } from '../component';
import { ComponentKey } from '../actor';
import Actor from '../actor';

export type EffectDef = {

    enable?: Array<ComponentKey>;

    disable?: Array<ComponentKey>;

}

export class Transition<TKey = string | number | symbol> {

    dest: TKey;

    /**
     * Time in seconds before transition enters new state.
     */
    enterTime: number;

    constructor(destState: TKey, enterTime: number = 0) {
        this.dest = destState;
        this.enterTime = enterTime;
    }

}

export class StateEffect {

    /**
     * Components to disable.
     */
    protected disable?: Array<ComponentKey>;

    protected enable?: Array<ComponentKey>;


    constructor(
        changes: EffectDef) {

        this.disable = changes.disable;
        this.enable = changes.enable;


    }

    addEnable(key: ComponentKey) {

        if (this.enable !== undefined) {
            this.enable.push(key);
        } else {
            this.enable = [key];
        }
    }

    addDisable(key: ComponentKey) {

        if (this.disable !== undefined) {
            this.disable.push(key);
        } else {
            this.disable = [key];
        }
    }


    /**
     * Set components to disable on this transition.
     * @param disable 
     */
    setDisables(disable: ComponentKey[]) {
        this.disable = disable;
    }

    /**
     * Set components to disable on this transition.
     * @param enable 
     */
    setEnable(enable: ComponentKey[]) {
        this.enable = enable;
    }

    /**
     * Apply transition to actor.
     * @param actor 
     */
    apply(actor: Actor) {


        if (this.enable) {

            const enable = this.enable;
            for (let i = 0; i < enable.length; i++) {
                let comp = enable[i];
                if (comp instanceof Component) {
                    comp.enabled = true;
                } else if (!comp) {

                    console.log(`enabling undefined: ${comp} of:`);
                    console.dir(enable);
                }
                else {
                    const val = actor.get(comp);
                    if (val) {
                        val.enabled = true;
                    }
                }
            }

        }


        if (this.disable) {

            const disable = this.disable;
            for (let i = 0; i < disable.length; i++) {
                let comp = disable[i];
                if (comp instanceof Component) {
                    comp.enabled = false;
                } else if (!comp) {
                    console.error(`Disabling undefined Component in list:`);
                    console.dir(disable);
                } else {
                    const val = actor.get(comp);
                    if (val) {
                        val.enabled = false;
                    }
                }
            }
        }

    }


}


export class State<TKey = string | number | Symbol, TTrigger = string | Symbol> {

    readonly name: TKey;

    onEnter?: StateEffect;
    onExit?: StateEffect;

    autoNext?: Transition<TKey>;

    /**
     * Priority if overlapping transitions attempt to switch to
     * both this state, and another state. Higher values take precedence.
     */
    priority: number = 0;

    /**
     * Maps triggers to next state key.
     */
    private readonly edges: Map<TTrigger, TKey> = new Map();

    public setPriority(num: number) {
        this.priority = num;
    }

    constructor(name: TKey, opts?: { onEnter?: StateEffect | EffectDef, onExit?: StateEffect | EffectDef, autoNext?: Transition<TKey> }) {
        this.name = name;

        if (opts) {
            if (opts.onEnter) {
                this.onEnter = opts.onEnter instanceof StateEffect ? opts.onEnter : new StateEffect(opts.onEnter);
            }
            if (opts.onExit) {
                this.onExit = opts.onExit instanceof StateEffect ? opts.onExit : new StateEffect(opts.onExit);
            }
            this.autoNext = opts.autoNext;
        }
    }

    /**
     * 
     * @param state 
     * @returns true if an edge exists that leads
     * from this state to the named state. This is not
     * an efficient search.
     */
    hasEdge(state: TKey) {
        for (const name of this.edges.values()) {
            if (name === state) return true;
        }
        return false;
    }

    /**
     * @param trigger 
     * @returns True if the state contains an edge
     * to another state with this trigger.
     */
    canTrigger(trigger: TTrigger) {
        return this.edges.has(trigger);
    }

    /**
     * Add trigger to next state.
     * @param trigger 
     * @param state 
     */
    addTrigger(trigger: TTrigger, state: TKey) {
        this.edges.set(trigger, state);
    }

    removeTrigger(trigger: TTrigger) {
        this.edges.delete(trigger);
    }

    /**
     * Get name of state resulting from trigger.
     * @param trigger 
     * @returns 
     */
    getNextState(trigger: TTrigger) {
        return this.edges.get(trigger);
    }

    addEnterEnable(key: ComponentKey) {
        if (this.onEnter) {

            this.onEnter.addEnable(key);
        } else {
            this.onEnter = new StateEffect({
                enable: [key]
            })
        }
    }

    addEnterDisable(key: ComponentKey) {
        if (this.onEnter) {

            this.onEnter.addDisable(key);
        } else {
            this.onEnter = new StateEffect({
                disable: [key]
            })
        }
    }

    /**
     * Set Enter-State Transition.
     * @param t 
     */
    addEnter(t: StateEffect | EffectDef) {
        this.onEnter = t instanceof StateEffect ? t : new StateEffect(t);
    }

    /**
     * Set leave-state transition.
     * @param t 
     */
    addExit(t: StateEffect | EffectDef) {
        this.onExit = t instanceof StateEffect ? t : new StateEffect(t);
    }

}