import Actor from "./actor";
import Engine from './engine';
import Visual from '../model/visual';
import { Game } from "./game";
import { contains } from './utils/array-utils';

/**
 * If a clip is supplied to the Group, it will act as the parent
 * of all GameObject clips added to the group.
 */
export default class Group<T extends Game = Game> {


	get actor(): Actor | undefined {
		return this._actor;
	}

	/**
	  * @property clip - clip associated with group, if any.
	  * Objects added to the group are added to clip's child clips.
	  */
	readonly body?: Visual | null;

	/**
	 * @property {string} name
	 */
	name?: string;

	/**
	 * @property {boolean} paused
	 */
	get paused() { return this._paused; }


	readonly subgroups: Group<T>[];

	readonly objects: Actor[];

	get game() { return this._game }
	private _game?: T;

	/**
	 * GameObject to hold group components.
	 */
	_actor?: Actor;

	_paused: boolean = false;

	/**
	 * Parent group, if any.
	 */
	private _parent?: Group<T>;


	/**
	 *
	 * @param {Game} game
	 * @param {DisplayObject} [clip=null]
	 * @param {boolean} [paused=false]
	 */
	constructor(clip?: Visual | null, paused: boolean = false) {

		this._paused = paused;

		this.body = clip;

		this.objects = [];
		this.subgroups = [];

	}

	pause() {

		if (this._paused) return;
		this._paused = true;

		for (let obj of this.objects) {
			if (('pause' in obj) && typeof obj.pause === 'function') {
				obj.pause();
			}
			obj.active = false;
		}

		for (let g of this.subgroups) {
			g.pause();
		}

	}

	unpause() {

		if (this._paused === false) return;

		for (let obj of this.objects) {
			if (obj.unpause) obj.unpause();
			obj.active = true;
		}
		for (let g of this.subgroups) {
			g.unpause();
		}

		this._paused = false;

	}

	/**
	 * Override in subclasses for notification of when
	 * group is added to game.
	 */
	onAdded() { };

	/**
	 * Override in subclasses to be notified when group is removed.
	 */
	onRemoved() { };

	/**
	 * Internal message of group being added to game.
	 * Do not call directly.
	 * Override onAdded() in subclasses for the event.
	 */
	_onAdded(game: T) {

		if (this._game !== game) {
			this._game = game;
			if (this._actor && !this._actor.isAdded) {
				/// add actor to group.
				game.addActor(this._actor);
			}

			/// Add all objects in group.
			for (const a of this.objects) {
				game.addActor(a);
			}

			this.onAdded?.();

			for (const sub of this.subgroups) {
				sub._onAdded(game);
			}

		}

	}

	/**
	 * Internal message of group being removed from game.
	 * Do not call directly.
	 * Override onRemoved() in subclasses for the event.
	 */
	_onRemoved() {

		if (this._game) {

			this.onRemoved?.();

			/*for (const a of this.objects) {
				this.game!.engine.remove(a);
			}*/

			this._game = undefined;
			for (const g of this.subgroups) {
				g._onRemoved();
			}
		}


	}

	/**
	 * Show all the objects in the group and subgroups.
	 */
	show() {

		if (this.actor) {
			this.actor.visible = true;
		}


		for (let i = this.subgroups.length - 1; i >= 0; i--) {
			this.subgroups[i].show();
		}

	}

	hide() {

		if (this.actor) {
			this.actor.visible = false;
		}

		for (let i = this.subgroups.length - 1; i >= 0; i--) {
			this.subgroups[i].hide();
		}

	}

	findGroup(gname: string): Group<T> | undefined {

		for (let i = this.subgroups.length - 1; i >= 0; i--) {
			if (this.subgroups[i].name == gname) return this.subgroups[i];
		}

		return undefined;
	}

	/**
	 * Add subgroup to this group.
	 * @param {Group} g
	 */
	addGroup(g: Group<T>) {

		if (g._parent) {

			if (g._parent === this) return;
			g._parent.removeGroup(g);
		}

		g._parent = this;
		if (!contains(this.subgroups, g)) {

			this.subgroups.push(g);
			if (this._game && g._game !== this._game) {
				g._onAdded(this._game);
			}

		}

	}
	/**
	 * Remove subgroup from this group.
	 * @param {Group} g
	 */
	removeGroup(g: Group) {

		if (g._parent !== this) {
			return;
		}
		g._parent = undefined;

		for (let i = this.subgroups.length - 1; i >= 0; i--) {

			if (this.subgroups[i] == g) {
				this.subgroups.splice(i, 1);

				g.onRemoved?.();

				return;
			}
		}

	}

	/**
	 * Remove GameObject from group, but not Engine.
	 * @param {Actor} obj
	 */
	remove(obj: Actor, removeClip: boolean = true) {

		let ind = this.objects.indexOf(obj);
		if (ind < 0) return;

		this.objects.splice(ind, 1);

		obj.off('destroy', this.remove, this);

		obj.group = null;

	}

	/**
	 * Destroy all objects currently in group
	 * without destroying the group itself.
	 */
	public clearObjects(subgroups: boolean = true) {

		if (subgroups) {
			for (let i = this.subgroups.length - 1; i >= 0; i--) {
				this.subgroups[i].clearObjects();
			}
		}

		/// make a copy of objects to reduce conflicts.
		const cur = this.objects.slice();
		this.objects.length = 0;

		for (let i = cur.length - 1; i >= 0; i--) {
			cur[i].off('destroy', this.remove, this);
			cur[i].destroy();
		}

	}

	/**
	 *
	 * @param {Actor} obj
	 * @returns {Actor} the object.
	 */
	addActor(obj: Actor): Actor {

		obj.group = this;
		obj.on('destroy', this.remove, this);

		this.objects.push(obj);
		this._game?.engine.add(obj);

		return obj;

	}

	destroy() {

		this._paused = true;

		this.clearObjects();

		this.objects.length = 0;
		this.subgroups.length = 0;
		this._game = undefined;

	}

}