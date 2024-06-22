import Group from './group';
import { Component } from './component';
import { IPoint, Point, TPoint, clampToPi } from './data/geom';
import EventEmitter from "eventemitter3";
import { Game } from './game';
import { Transform } from './components/transform';

declare type Constructor<T> = {
	new(...args: any[]): T;
};

export type ComponentKey = Component | Constructor<Component>;
export type ListenerFn = (...args: any[]) => void;

/**
 * Options for destroying an Actor
 */
export type DestroyOptions = {

	children?: boolean | undefined,
	/// Exists to mirror pixi.js
	texture?: boolean | undefined,
	/// Exists to mirror pixi.js
	baseTexture?: boolean | undefined
};

export enum EngineEvent {
	/**
	 * Actor added to Engine.
	 */
	ActorAdded = 'addActor',

	ActorDestroyed = 'destroy',
	ComponentDestroyed = 'compDestroy',
	ChildAdded = 'addChild',
	ChildRemoved = 'removeChild',
	Collision = 'collision'

}

/**
 *
 */
export default class Actor<G extends Game = Game> {

	/**
	 * Unique Id to assign to next created Actor.
	 */
	private static NextId: number = 1;

	private readonly _position: IPoint = new Point();

	get game(): G { return this._game; }
	set game(v: G) { this._game = v; }

	/**
	 * owning group of the Actor, if any.
	 */
	get group(): Group | null { return this._group; }
	set group(v: Group | null) { this._group = v; }

	/**
	 * @property {string} name - Name of the Actor.
	 */
	get name() { return this._name; }
	set name(v) { this._name = v; }


	/**
	 * @property {boolean} active
	 */
	get active() { return this._active; }
	set active(v: boolean) {

		if (this._active != v) {
			this._active = v;

			if (v) {
				for (let comp of this._components) {
					comp.onActivate?.();
				}
			} else {
				this._components.every(v => v.onDeactivate?.());
			}

		}
	}


	/**
	 * @property {Point} position - Position of the object and Display clip.
	 */
	get position(): IPoint { return this._position; }
	set position(v: IPoint) { this._position.set(v.x, v.y); }

	/**
	 * @property {number} x
	 */
	get x(): number { return this.transform.position.x; }
	set x(v: number) { this.transform.position.x = v; }

	/**
	 * @property {number} y
	 */
	get y(): number { return this.transform.position.y; }
	set y(v: number) { this.transform.position.y = v; }

	/**
	 * @property {number} rotation - Rotation in radians.
	 */
	get rotation(): number { return this.transform.rotation; }
	set rotation(v) {
		this.transform.rotation = v;
	}

	get width() { return this.transform.width; }
	get height() { return this.transform.height; }

	get sleeping(): boolean { return this._sleep; }
	set sleep(v: boolean) { this._sleep = v; }

	/**
	 * @property {Point} orient - returns the normalized orientation vector of the object.
	 */
	get orient() {
		return { x: Math.cos(this.rotation), y: Math.sin(this.rotation) };
	}

	private _visible: boolean = true;
	get visible() { return this._visible; }
	set visible(v: boolean) {
		this._visible = v;
	}

	/**
	 * {Boolean} destroy was requested on the Actor, and will be destroyed
	 * on the next frame. It should be treated as destroyed.
	 */
	/** get destroying() { return this._destroying; }
	set destroying() { this._destroying=true;}*/

	/**
	 * @property {boolean} isAdded - true after Actor has been added to Engine.
	 */
	get isAdded() { return this._isAdded; }

	/**
	 * @property {boolean} destroyed
	 */
	get isDestroyed() { return this._destroyed }

	readonly _components: Component[];

	private _destroyed: boolean = false;

	/**
	 * Game object was added to engine.
	 */
	private _isAdded: boolean = false;

	readonly emitter: EventEmitter;

	protected _sleep: boolean = false;

	protected _name: string;

	protected _destroyOpts?: DestroyOptions;

	protected _active: boolean = false;

	private _game!: G;

	protected _group: Group | null = null;

	/**
	 * Optional flags to apply to actor. Can be used to narrow hit testing.
	 */
	flags: number = 0;

	private readonly _compMap: Map<Constructor<Component> | Function, Component>;

	/**
	 * List of components waiting to be added next update.
	 * Components cannot add while actor is updating.
	 */
	private _toAdd: Component[] = [];

	readonly transform: Transform = new Transform();

	readonly id: number;

	/**
	 *
	 * @param {DisplayObject} [body=null]
	 * @param {Point} [pos=null]
	 */
	constructor(pos?: TPoint | null) {

		this.id = Actor.NextId++;

		this._components = [];
		this._compMap = new Map();

		this._name = '';

		if (pos) this._position.set(pos.x, pos.y);

		this.addInstance(this.transform);

		this._active = true;

		this.flags = 0;
		this.emitter = new EventEmitter();

	}

	pause() { }
	unpause() {
	}

	/**
	 * Called when Actor added to engine.
	 * Calls init() on all components and self.added()
	 */
	_added(game: G) {

		this._game = game;

		this._isAdded = true;

		/// add any waiting.
		this._addNew();

		let len = this._components.length;
		for (let i = 0; i < len; i++) {
			this._components[i]._init(this);
		}
		if (this._active) {
			for (let i = 0; i < len; i++) {
				this._components[i].onActivate?.();
			}
		}

		this.added();

	}

	/**
	 * Override in subclass.
	 */
	added() { }

	/**
	 *
	 * @param {string} evt
	 * @param {function} func
	 * @param {*} [context=null]
	 * @returns EventEmitter
	 */
	on(evt: string, func: ListenerFn, context?: any) {
		return this.emitter.on(evt, func, context);
	}


	once(evt: string, func: ListenerFn, context?: any) {
		return this.emitter.once(evt, func, context);
	}

	/**
	 * Emit an event through the underlying Actor clip. If the Actor
	 * does not contain a clip, the event is emitted through a custom emitter.
	 * @param {*} args - First argument should be the {string} event name.
	 */
	emit(event: string, ...args: any[]) {
		this.emitter.emit(event, ...args);
	}

	/**
	 * Wrap emitter off()
	 * @param  {...any} args
	 */
	off(e: string, fn: ListenerFn, context?: any) {
		this.emitter.off(e, fn, context);
	}

	/**
	 * Add an existing component to the Actor.
	 * @param {Component} inst
	 * @param {?Object} [cls=null]
	 * @returns {Component} Returns the instance.
	 */
	addInstance<T extends Component>(inst: T, cls?: Constructor<T>): T {

		const key = cls ?? (<any>inst).constructor ?? Object.getPrototypeOf(inst).constructor ?? inst;

		this._compMap.set(key, inst);
		this._toAdd.push(inst);

		if (this._isAdded) {

			inst._init(this);
			if (this._active) {
				inst.onActivate?.();
			}
		}

		return inst;

	}

	/**
	 * Instantiate and add a component to the Actor.
	 * @param {class} cls - component class to instantiate.
	 * @returns {Object}
	*/
	add<T extends Component>(cls: T | Constructor<T>, ...args: any[]): T {
		if (cls instanceof Component) {
			return this.addInstance(cls);
		} else {
			return this.addInstance(new cls(...args), cls);
		}
	}

	/**
	 *
	 * @param {number} x
	 * @param {number} y
	 */
	translate(x: number, y: number) {
		this.transform.translate(x, y);
	}

	/**
	 * Determine if Actor contains a Component entry
	 * under class or key cls.
	 * @param {*} cls - class or key of component.
	 */
	has(cls: Constructor<Component>) {
		return this._compMap.has(cls);
	}

	/**
	 *
	 * @param {*} cls
	 */
	get<T extends Component>(cls: Constructor<T>): T | undefined {

		let inst = this._compMap.get(cls) as T;
		if (inst !== undefined && !inst.isDestroyed) return inst;

		for (let i = this._components.length - 1; i >= 0; i--) {
			if (this._components[i] instanceof cls && !this._components[i].isDestroyed) return this._components[i] as T;
		}
		return undefined;

	}

	/**
	 *
	 * @param {*} cls
	 */
	require<T extends Component>(cls: Constructor<T>, ...params: any[]): T {

		let inst = this._compMap.get(cls);
		if (inst !== undefined && !inst.isDestroyed) return inst as T;

		for (let i = this._components.length - 1; i >= 0; i--) {
			if (this._components[i] instanceof cls && !this._components[i].isDestroyed) return this._components[i] as T;
		}
		return this.add(cls, ...params);

	}

	/**
	 * Creates a copy of the given component and adds it
	 * to this Actor.
	 * @param {Component} comp
	 */
	addCopy(comp: Component) {

		let copy = Object.assign(
			Object.create(Object.getPrototypeOf(comp)),
			comp);

		return this.addInstance(copy);

	}

	/**
	 *
	 * @param {number} delta
	 */
	update(delta: number) {

		const comps = this._components;
		let destroyed = 0;

		this._addNew();

		let priority = 999999;

		for (let i = comps.length - 1; i >= 0; i--) {

			const comp = comps[i];
			if (comp._destroyed === true) {

				destroyed++;
				continue;
			}
			if (comp.priority > priority) {
				console.log(`priority backwards: ${comp.priority}`);
			}
			priority = comp.priority;
			if (comp.update && comp.sleep !== true && comp.enabled === true) {
				comp.update(delta);
			}

		}

		this._removeDestroyed(destroyed);

	}

	/**
	 * Private function adds waiting components at start of update.
	 */
	_addNew() {

		if (this._toAdd.length > 0) {
			this._components.push.apply(this._components, this._toAdd);
			this._components.sort((a, b) => a.priority - b.priority);
			this._toAdd.length = 0;
		}

	}


	/**
		 * Remove destroyed components at the end of update.
		 */
	_removeDestroyed(count: number) {

		const comps = this._components;
		const len = comps.length;

		/// Slide down non-destroyed components over the destroyed ones.
		/// Move destroyed components forward until they reach end.
		for (let i = 0; i < len; i++) {

			const c = comps[i];
			if (!c._destroyed) {

				/// slide down until a non-destroyed component is hit.
				let j = i - 1;
				while (j >= 0) {

					if (!comps[j]._destroyed) {
						break;
					} else {
						j--;
					}
				}
				/// swap destroyed component ahead. 
				if (++j < i) {
					comps[i] = comps[j];
					comps[j] = c;
				}

			}

		}

		///  all destroyed components are now at the end of the array.
		while (count--) {
			comps.pop();
		}


	}
	/**
	 *
	 * @param {Component} comp - the component to remove from the game object.
	 * @param {bool} [destroy=true] - whether the component should be destroyed.
	 */
	remove(comp: Component | Constructor<Component>) {

		if (!(comp instanceof Component)) {
			const c = this._compMap.get(comp);
			if (c) {
				comp = c;
			} else {
				return false;
			}
		}

		comp._destroy();

		this._compMap.delete(comp.constructor);


		//let ind = this._components.indexOf( comp);
		//if ( ind < 0) return false;

		//this._components.splice(ind, 1);
		//this.components[ind] = this.components[ this.components.length-1];
		//this.components.pop();

		return true;

	}

	show() {
		this.visible = true;
	}
	hide() {
		this.visible = false;
	}

	/**
	 * Set options for destroying the PIXI DisplayObject when
	 * the Actor is destroyed.
	 * @param {boolean} children
	 * @param {boolean} texture
	 * @param {boolean} baseTexture
	 */
	setDestroyOpts(children: boolean, texture: boolean, baseTexture: boolean) {

		if (this._destroyOpts == null) {
			this._destroyOpts = {
				children: children,
				texture: texture,
				baseTexture: baseTexture

			};
		} else {
			this._destroyOpts.children = children;
			this._destroyOpts.texture = texture;
			this._destroyOpts.baseTexture = baseTexture;
		}



	}

	/**
	 * Call to destroy the game Object.
	 * Do not call _destroy() directly.
	 */
	destroy() {

		if (this._destroyed === false) {
			this._destroyed = true;

			this.emitter.emit(EngineEvent.ActorDestroyed, this);

			let comps = this._components;

			for (let i = comps.length - 1; i >= 0; i--) {
				this.remove(comps[i]);
			}
			if (this._group) {
				this._group.remove(this);
			}
			this.emitter.removeAllListeners();
		}

	}

}