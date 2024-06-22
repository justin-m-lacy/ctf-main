import Actor from './actor';
import { quickSplice } from './utils/array-utils';
import { IContainer } from './data/container';
import { ITicker } from './ticker';
import type { Game } from './game';
import EventEmitter from 'eventemitter3';
import { EngineEvent } from './actor';

export interface IUpdater {

    update(delta: number): void;
}

export default class Engine implements IUpdater {

    ticker?: ITicker;

    /**
     * @property {Container} objectLayer
     */
    objectLayer?: IContainer;

    /**
     * @property {GameObject[]} objects
     */
    readonly actors: Actor[];

    /**
     * @property {IUpdater[]} updaters - Updaters are for systems or objects with update
     * functions that don't require complex GameObjects.
     */
    readonly updaters: IUpdater[];


    /**
     * Game the engine is running.
     */
    readonly game: Game;

    readonly emitter: EventEmitter;

    constructor(game: Game, opts?: { ticker?: ITicker }) {

        this.actors = [];
        this.updaters = [];

        this.game = game;
        this.emitter = game.emitter;

        this.ticker = opts?.ticker;

    }

    start() {
        this.ticker?.start();
    }

    stop() {
        this.ticker?.stop();
    }

    /**
     * Add GameObject to the engine.
     * @param {Actor} a
    */
    add(a: Actor) {

        if (a === null || a === undefined) {
            console.log('ERROR: engine.add() object is null');
            return;
        }

        a._added(this.game);
        this.actors.push(a);

        this.emitter.emit(EngineEvent.ActorAdded, a);

    }

    /**
     *
     * @param sys
     */
    addUpdater(sys: IUpdater) {
        this.updaters.push(sys);
    }

    /**
     *
     * @param {IUpdater} sys
     */
    removeUpdater(sys: IUpdater) {

        let ind = this.updaters.indexOf(sys);
        if (ind >= 0) {
            this.updaters.splice(ind, 1);
        }

    }

    update(delta: number) {


        const objs = this.actors;

        for (let i = objs.length - 1; i >= 0; i--) {

            const a = objs[i];
            if (a.isDestroyed === true) {

                quickSplice(objs, i);
                this.emitter.emit(EngineEvent.ActorDestroyed, a);

            } else if (a.active) a.update(delta);

        }

        const updaters = this.updaters;
        for (let i = updaters.length - 1; i >= 0; i--) {
            updaters[i].update(delta);
        }

    }

    /**
     * Destroy a game object.
     * @param {Actor} obj
     */
    destroy(obj: Actor) {

        if (obj.isDestroyed !== true) {
            obj.destroy();
        }

    }

    cleanup() {

        for (let i = this.actors.length - 1; i >= 0; i--) {

            const a = this.actors[i];
            if (!a.isDestroyed) {
                a.emitter.removeAllListeners();
                a.destroy();
            }
        }

        this.actors.length = 0;
        this.objectLayer = undefined;
        this.ticker = undefined;
        this.updaters.length = 0;
    }

}