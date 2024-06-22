import { Container, DisplayObject, NineSlicePlane, FederatedEvent, Rectangle } from 'pixi.js';
import { ILayout } from '../layout/layout';
import { UiSkin } from '@pixiwixi/src/ui-skin';

export type PaneOptions = {

	skin?: UiSkin,

	name?: string,

	/**
	 * Whether to create a mask for the content.
	 * @default true
	 */
	createMask?: boolean,

	width?: number,
	height?: number,
	interactive?: boolean,

	padding?: number,
	x?: number,
	y?: number,

	layout?: ILayout,

	bg?: Container | NineSlicePlane
};

export class Pane extends Container implements ILayout {

	/**
	 * Width and height are overloaded to change the pane size
	 * without affecting sizing of elements in pane.
	 */
	public get width() { return this.m_width }
	public set width(v) {
		this.m_width = v;
		if (this._bg) { this._bg.width = v; }

		if (this.mask) {
			// @ts-ignore
			this.mask.width = v;
		}

	}
	public get height() { return this.m_height }
	public set height(v) {
		this.m_height = v;
		if (this._bg) { this._bg.height = v; }
		if (this.mask) {
			// @ts-ignore
			this.mask.height = v;
		}
	}

	/**
	 * Pane background that fills the pane behind all other elements.
	 */
	public get bg(): Container | NineSlicePlane | undefined { return this._bg; }
	public set bg(v: Container | NineSlicePlane | undefined) {
		if (this._bg) {
			this.removeChild(this._bg);
		}
		this._bg = v;
		if (v) {
			this.addChildAt(v, 0);
		}
	}

	/**
	 * Background graphic for the panel.
	 */
	private _bg?: Container | NineSlicePlane;

	public get skin() { return this._skin }
	private _skin?: UiSkin;

	/**
	 * Private width/height is used to disentage background sizing from
	 * parent scaling.
	 */
	private m_width: number;
	private m_height: number;

	/**
	 * Object used to layout content.
	 */
	private _layout?: ILayout;

	/**
	 *
	 * @param {PIXI.Application} app
	 * @param {Object} [opts=null]
	 */
	constructor(opts?: PaneOptions) {

		super();

		this.interactive = this.interactiveChildren = opts?.interactive !== undefined ? opts.interactive : true;

		this._skin = opts?.skin;

		this.m_width = opts?.width ?? 64;
		this.m_height = opts?.height ?? 64;

		this._bg = opts?.bg ?? this._skin?.makeFrame(this.m_width, this.m_height);
		if (this._bg) {
			this._bg.width = this.m_width;
			this._bg.height = this.m_height;
			this.addChild(this._bg);
		} else {
			this.width = this.m_width;
			this.height = this.m_height;
		}


		if (opts) {
			if (opts.name) this.name = opts.name;
			this.position.set(opts.x ?? 0, opts.y ?? 0);
			if (opts.layout) {
				this.setLayout(opts.layout);
			}
		}
		if (opts?.createMask === undefined || opts?.createMask === true) {
			this.createMask();
		}

		this.on('pointerdown', (e: FederatedEvent) => e.stopPropagation());

	}

	public setLayout(layout?: ILayout): void {
		this._layout = layout;
	}

	public layout(rect?: Rectangle): Container {

		//console.log(`pane layout...: ${rect?.x},${rect?.y} size: ${rect?.width},${rect?.height}`);
		if (rect) {
			if (this.width > rect.width) this.width = rect.width;
			if (this.height > rect.height) this.height = rect.height;

			this.x = rect.x + (rect.width - this.width) / 2;
			this.y = rect.y + (rect.height - this.height) / 2;
		}

		this._layout?.layout(new Rectangle(0, 0, this.m_width, this.m_height), this);
		return this;
	}

	private createMask() {

		const sprite = this.skin?.makeFrame(this.m_width, this.m_height);
		if (sprite) {
			this.addChild(sprite);
			this.mask = sprite;
		}

	}

	/**
	 * The bounds of a pane is defined by its background and mask, not its intrinsic Container size.
	 */
	public getBounds(): Rectangle { return new Rectangle(this.x, this.y, this.m_width, this.m_height); }

	/**
	 * Center a clip in the view.
	 * @param {DisplayObject} clip
	 */
	public center(clip: DisplayObject, pctX: number = 0.5, pctY: number = 0.5) {

		const bnds = clip.getBounds();
		clip.x = pctX * (this.m_width - bnds.width);
		clip.y = pctY * (this.m_height - bnds.height);

	}

}