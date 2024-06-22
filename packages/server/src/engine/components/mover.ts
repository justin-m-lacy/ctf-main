import { Component } from "../component";
import { Point, IPoint, TPoint } from '../data/geom';


export interface IMover {

	/**
 * @property {number} rotation - wraps gameObject rotation in radians.
 */
	get rotation(): number;
	set rotation(v);

	get position(): TPoint;
	set position(v);

	get velocity(): TPoint;
	set velocity(v);

	get speed(): number;
	set speed(v);

	get omega(): number;
	set omega(v);

}

export default class Mover extends Component {

	/**
	 * @property {number} rotation - wraps gameObject rotation in radians.
	 */
	get rotation() { return this.actor!.rotation; }
	set rotation(v) {
		this.actor!.rotation = v;
	}

	get position() { return this.actor!.position; }
	set position(v) { this.actor!.position = v; }

	/**
	 * @property velocity
	 */
	get velocity() { return this._velocity; }
	set velocity(v) {
		this._velocity.set(v.x, v.y);
	}

	/**
	 * @property {IPoint} accel
	 */
	get accel(): IPoint { return this._accel; }
	set accel(v: IPoint) {

		if (v.x === 0 && v.y === 0) {
			this._accel.set(0, 0);
		} else if (this._accelMax > 0) {

			const d = this._accelMax / Math.sqrt(v.x * v.x + v.y * v.y);
			this._accel.set(d * v.x, d * v.y);

		} else {
			this._accel.set(v.x, v.y);
		}
	}

	/**
	 * @property {number} velocityMax - Maximum absolute value of velocity.
	 */
	get speedMax(): number { return this._speedMax; }
	set speedMax(v: number) { this._speedMax = v; }

	/**
	 * @property {number} accelMax
	 */
	get accelMax() { return this._accelMax; }
	set accelMax(v: number) { this._accelMax = v; }

	/**
	 * @property {number} omegaAcc
	 */
	get omegaAcc() { return this._omegaAcc; }
	set omegaAcc(v) { this._omegaAcc = v; }

	/**
	 * @property {number} omega - angular velocity in radians/frame.
	 */
	get omega() { return this._omega; }
	set omega(v) { this._omega = v; }

	/**
	 * @property {number} omegaMax
	 */
	get omegaMax() { return this._omegaMax; }
	set omegaMax(v) { this._omegaMax = v; }

	readonly _velocity: Point = new Point();
	readonly _accel: Point = new Point();

	private _speedMax: number = 400;
	private _accelMax: number = 20;
	private _omegaAcc: number = 0;
	private _omega: number = 0;
	private _omegaMax: number = Math.PI / 40;

	constructor() {
		super();
	}

	/**
	 * Set mover velocity.
	 * @param {number} vx
	 * @param {number} vy
	 */
	set(vx: number, vy: number) {
		this.velocity.set(vx, vy);
	}

	update(delta: number) {

		if (this._omegaAcc !== 0) this._omega += this._omegaAcc * delta;
		if (this._omega > this._omegaMax) this._omega = this._omegaMax;
		else if (this._omega < -this._omegaMax) this._omega = -this._omegaMax;

		this.rotation += this._omega * delta;

		/*let abs = this._accel.x * this.accel.x + this._accel.y * this._accel.y;
		if (abs > this._accelMax) {
			abs = this._accelMax / Math.sqrt(abs);
			this._accel.set(abs * this._accel.x, abs * this._accel.y);
		}*/

		const vel = this._velocity;
		vel.x += this._accel.x * delta;
		vel.y += this._accel.y * delta;

		let abs = vel.x * vel.x + vel.y * vel.y;
		if (abs > this._speedMax * this._speedMax) {
			abs = this._speedMax / Math.sqrt(abs);
			vel.set(abs * vel.x, abs * vel.y);
		}

		const pos = this.position;
		pos.x = pos.x + vel.x * delta;
		pos.y = pos.y + vel.y * delta;
	}

}