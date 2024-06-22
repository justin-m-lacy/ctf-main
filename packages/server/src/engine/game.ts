
import Engine from './engine';
import Actor, { ListenerFn } from './actor';
import Group from './group';
import { contains } from './utils/array-utils';
import EventEmitter from 'eventemitter3';
import { IUpdater } from './engine';
import Container from './data/container';
import { ITicker } from './ticker';
import { Constructor } from './utils/types';

/**
 * Extendable Game class.
 */
export class Game {

	/**
	 * @property {Container} stage
	 */
	get stage() { return this._stage; }
	private _stage?: Container;

	/**
	 * @property {Actor} root - Actor containing the main Camera component
	 * and base objectLayer.
	 * Basic game systems can also be added to root as Components.
	 */
	get root(): Actor { return this._root!; }

	/**
	 * @property {EventEmitter} emitter - Game-level Emitter. By default, the PIXI shared EventEmitter.
	 */
	get emitter() { return this._emitter; }

	/**
	 * @property {Group[]} groups
	 */
	get groups() { return this._groups; }

	/**
	 * @property {Engine} engine
	 */
	get engine() { return this._engine; }


	private readonly _groups: Group[] = [];

	private _emitter: EventEmitter;

	private _engine: Engine;

	private _root?: Actor;

	constructor(opts?: { ticker?: ITicker }) {

		this._groups = [];
		this._emitter = new EventEmitter();

		this._engine = new Engine(this, opts);

		this._root = new Actor();

	}

	/**
	 * After init(), layerManager and game layers are available for use.
	 */
	init() {

		this._engine.add(this._root!);

	}

	/**
	 * Start the game object ticker and engine ticker.
	 */
	start() { this._engine.start(); }

	pause() { this._engine.stop(); }
	unpause() { this._engine.start(); }

	/**
	 * Wrapper for default game event emitter.
	 * @param {string} event
	 * @param {Function} func
	 * @param {*} [context=null]
	 * @returns {PIXI.utils.EventEmitter}
	 */
	on(event: string, func: ListenerFn, context?: any) {
		return this._emitter.on(event, func, context);
	}

	/**
	 * Emit event with game emitter.
	 * @param  {...any} args
	 */
	emit(...args: any) {
		this._emitter.emit.apply(this._emitter, args);
	}


	off(evt: string, fn?: ListenerFn, context?: any) {
		return this._emitter.off(evt, fn, context);
	}

	getGroup<G extends Group>(type: Constructor<G>): G | undefined {

		for (let i = this._groups.length - 1; i >= 0; i--) {

			if (this._groups[i] instanceof type) {
				return this._groups[i] as G;
			}
		}
	}

	findGroup(name: string): Group | undefined {
		return this._groups.find((g) => g.name === name);
	}

	addGroup<T extends Group>(g: T) {
		if (!contains(this._groups, g)) {
			this._groups.push(g);
			g._onAdded(this);
		}
		return g;
	}

	/**
	 *
	 * @param {Group} g
	 * @returns {boolean} True if g was found and removed.
	 */
	removeGroup(g: Group): boolean {

		let ind = this._groups.indexOf(g);
		if (ind >= 0) {
			this._groups.splice(ind, 1);
			g._onRemoved();
			return true;
		}

		return false;

	}

	/**
	 * Wrapper for Engine.add(Actor)
	 * @param {Actor} Actor
	 */
	addActor(actor: Actor) {
		actor.game = this;
		this._engine.add(actor);
	}

	/**
	 *
	 * @param {*} sys
	 */
	addUpdater(sys: IUpdater) { this._engine.addUpdater(sys); }

	/**
	 *
	 * @param {*} sys
	 */
	removeUpdater(sys: IUpdater) { this._engine.removeUpdater(sys); }

	destroy() {

		this._emitter.removeAllListeners();

		for (let i = this._groups.length - 1; i >= 0; i--) {
			const g = this._groups[i];
			g.destroy();
		}
		this._groups.length = 0;

		this.engine.ticker?.stop();
		this._engine.cleanup();
		this._root = undefined;
	}

}