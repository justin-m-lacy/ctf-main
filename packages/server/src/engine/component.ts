import type Actor from "./actor";
import { IPoint } from "./data/geom";
import type { Game } from "./game";
import { EngineEvent } from './actor';

export declare type Constructor<T> = {
	new(...args: any[]): T;
};

export const BasePriority = 3000;

export class Component<G extends Game = Game> {

	get game() { return this.actor!.game; }

	/**
	 * Group controlling the component's GameObject, if any.
	 */
	get group() { return this.actor?.group; }

	/**
	 * @property {boolean} enabled - Whether the component is enabled.
	 */
	get enabled() { return this._enabled; }
	set enabled(v) {

		if (v != this._enabled) {
			this._enabled = v;

			if (v === true) {
				this.onEnable?.();
			} else {
				this.onDisable?.();
			}
		}


	}

	/**
	 * @property {number} x
	 */
	get x() { return this.actor?.x ?? 0; }
	set x(v) {
		if (this.actor != null) {
			this.actor.x = v;
		}
	}

	/**
	 * @property {number} y
	*/
	get y(): number { return this.actor?.y ?? 0; }
	set y(v) { if (this.actor != null) this.actor.y = v; }

	/**
	* @property {number} rotation - underlying clip rotation in radians.
	*/
	get rotation(): number { return this.actor?.rotation ?? 0; }
	set rotation(v: number) {
		if (this.actor) this.actor.rotation = v;
	}

	/**
	 * @property position - only usable after init()
	 */
	get position(): IPoint { return this.actor!.position; }
	set position(v: IPoint) { this.actor!.position = v; }

	/**
	 * Indicates the component has been marked for disposal and should no longer
	 * be referenced.
	 * @property {Boolean} isDestroyed
	 */
	get isDestroyed() { return this._destroyed; }

	get sleep() { return this._sleep; }
	set sleep(v: boolean) { this._sleep = v; }

	/**
 * Priority of component. Higher priority components'
 * update functions are updated before lower priority.
 * (0 is lowest priority.)
 * Priority should not be changed once a component is
 * added to an Actor.
 */
	priority: number = BasePriority;

	/**
	 * @property {Actor} - Game object containing this component.
	 */
	actor?: Actor<G>;

	_enabled: boolean = true;
	_destroyed: boolean = false;

	/**
	 * True if component should sleep.
	 */
	_sleep: boolean = false;

	/**
	 * Constructor intentionally empty so components can be
	 * instantiated and added to GameObjects without
	 * knowledge of the underlying game system.
	 * @note component properties such as gameObject, clip, and game,
	 * are not available in component constructor.
	 * Override the init() function to access them.
	 */
	constructor() { }

	/**
	 * Override in subclass to initialize component.
	 * Basic component properties are now available.
	 * This component is also now in the gameObjects own component map.
	 */
	init() { }

	/**
	 * Private initializer calls subclassed init()
	 * @param actor
	 */
	_init(actor: Actor<G>) {

		this.actor = actor;

		this.init();

		if (this._enabled) {
			this.onEnable?.();
		}
	}

	/**
	 * Called when gameObject.active is set to true.
	 */
	onActivate?(): void;

	/**
	 * Called when gameObject.active is set to false.
	 */
	onDeactivate?(): void;

	onEnable?(): void;
	onDisable?(): void;
	update?(delta: number): void;

	/**
	 *
	 * @param {class} cls - class to add to the component's game object.
	 * @returns
	 */
	add<T extends Component>(cls: T): T {
		return this.actor!.add(cls);
	}

	/**
	 * Emits an event through the owning actor.
	 * @param evt 
	 * @param args
	 */
	emit(evt: string, ...args: any[]) {
		this.actor?.emit(evt, ...args);
	}

	/**
	 * Add a component already instantiated. Wraps gameObject.addExisting()
	 * @param {Component} comp
	 * @returns {Component} The added component instance.
	 */
	addInstance(comp: Component, cls?: Constructor<Component>): Component {

		return this.actor!.addInstance(comp, cls);
	}

	/**
	 * Add a component already instantiated. Wraps gameObject.addExisting()
	 * @deprecated Use addInstance()
	 * @param {Component} comp
	 * @returns {Component} The added component instance.
	 */
	addExisting(comp: Component, cls?: Constructor<Component>): Component {

		return this.actor!.addInstance(comp, cls);
	}

	/**
	 *
	 * @param {class} cls - wrapper for gameObject get()
	 * @returns {Component|null}
	 */
	get<T extends Component>(cls: Constructor<T>): T | undefined {
		return this.actor!.get(cls);
	}

	/**
	 * Wraps GameObject require().
	 * @param {*} cls
	 * @returns {Component}
	 */
	require<T extends Component>(cls: Constructor<T>, ...args: any[]): T { return this.actor!.require(cls, ...args); }

	onDestroy?(): void;

	/**
	 * Use to destroy a Component.
	 * override onDestroy() to clean up your components.
	 * Do not call _destroy() or destroy() directly.
	 */
	destroy() { this._destroy(); }

	/**
	 * calls destroy() and cleans up any variables.
	 */
	_destroy() {

		if (this._destroyed === false) {

			this.enabled = false;
			this.onDestroy?.();

			this.actor?.emit(EngineEvent.ComponentDestroyed, this);
			this._enabled = false;
			this._destroyed = true;
			this.actor = undefined;
		}

	}

}