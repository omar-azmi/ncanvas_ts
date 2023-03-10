import { drawDebug, drawDebugOrigin } from "./debug.ts"
import { MembersOf } from "./deps.ts"


export type Vec2 = { x: number, y: number }
export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
export type Ctx2DStyle =
	| MembersOf<CanvasFillStrokeStyles>
	| MembersOf<CanvasPathDrawingStyles>
	| CanvasShadowStyles
	| CanvasTextDrawingStyles

/** describes the rectangle position and bounds of a drawable node */
export interface OutRect {
	/** x-position of center in parent-node-coords */
	x: number
	/** y-position of center in parent-node-coords */
	y: number
	/** width in parent-node-coords */
	width: number
	/** height in parent-node-coords */
	height: number
	/** x-origin normalized with-respect-to `this.width` in parent-node-coords */
	cx: number
	/** y-origin normalized with-respect-to `this.height` in parent-node-coords */
	cy: number
	/** rotation in radians about the (`this.cx`, `this.cy`) origin point */
	rot: number
}

/** describes the internal coordinate system of a drawable node */
export interface InRect {
	/** x-position of inner-origin with-respect-to outer origin (cx, cy) <br>
	 * defaults to: `0`
	*/
	x: number
	/** y-position of inner-origin with-respect-to outer origin (cx, cy) <br>
	 * defaults to: `0`
	*/
	y: number
	/** inner-coords-rect width. if undefined, then use `OutRect.width` */
	width: number | undefined
	/** inner-coords-rect height. if undefined, then use `OutRect.height` */
	height: number | undefined
	/** inner-coords-rect rotation in radians about the (x, y) origin point. <br>
	 * defaults to: `0`
	*/
	rot: number
}

/** describes a transfromation to go from parent-node-coords to re-centered and rotated coord system <br>
 * scaling is unaffected, and remains the same as parent-node-coords
*/
export type OutTransform = DOMMatrixReadOnly

/** describes a transfromation to go from parent-node-coords to inner-coords */
export type InTransform = DOMMatrixReadOnly


export const getOutTransform = (orect: OutRect): OutTransform => {
	const
		sin = Math.sin(orect.rot),
		cos = Math.cos(orect.rot),
		// computing inverse rotation and inverse translation matrix components
		a = +cos, c = +sin, e = orect.x,
		b = -sin, d = +cos, f = orect.y
	return new DOMMatrixReadOnly([a, b, c, d, e, f])
}

export const getInTransform = (irect: InRect, orect: OutRect): InTransform => {
	const
		sin = Math.sin(irect.rot),
		cos = Math.cos(irect.rot),
		sx = irect.width ? orect.width / irect.width : 1,
		sy = irect.height ? orect.height / irect.height : 1,
		// computing inverse rotation and inverse translation matrix components
		a = +sx * cos, c = +sy * sin, e = irect.x,
		b = -sx * sin, d = +sy * cos, f = irect.y
	const inner_tr = new DOMMatrixReadOnly([a, b, c, d, e, f])
	return getOutTransform(orect).multiply(inner_tr)
}


export abstract class AbstractNode {
	static number_of_nodes: number = 0
	id: string = ""
	x: number = 0
	y: number = 0
	ox: number = 0
	oy: number = 0
	rot: number = 0
	width?: number = 0
	height?: number = 0
	children: AbstractNode[] = []
	flags: {
		absStroke?: boolean
		absText?: boolean
	} = {}
	style: Partial<Ctx2DStyle> = {}
	/** runtime temporaries for caching or fallbacking. <br>
	 * these are generally the first things defined during the {@link draw} function
	*/
	temp: {
		readonly rid: number // runtime unique id. this gets registered immediately during construction.
		dirty: boolean // do transformations need to be recalculated?
		parent?: AbstractNode // this node's parent-node
		debug?: boolean // whether or not to draw grid lines of inner coords
		self_tr: DOMMatrixReadOnly
	}

	/** add child(ren) node(s) */
	add(...nodes: AbstractNode[]): void {
		this.children.push(...nodes)
		for (const new_child of nodes) new_child.temp.parent = this
	}

	/** draw this node and its children on the provided `ctx` <br>
	 * the actual drawing of `this` must occur in the subclassed node's {@link drawSelf} method, <br>
	 * or the {@link drawOverlay} method
	*/
	draw(ctx: Ctx2D, parent?: AbstractNode): void {
		const original_tr = ctx.getTransform()
		if (parent) this.temp.parent = parent
		this.goSelf(ctx)
		this.drawSelf(ctx)
		ctx.setTransform(original_tr)
		if (this.temp.debug) drawDebugOrigin(this, ctx) //drawDebug(this,  ctx)
		ctx.setTransform(original_tr)
		this.drawChildren(ctx)
		ctx.setTransform(original_tr)
		this.drawOverlay(ctx)
		ctx.setTransform(original_tr)
	}

	/** preferably `goOut()` then customize as you please */
	abstract drawSelf(ctx: Ctx2D): void

	drawChildren(ctx: Ctx2D): void {
		const original_tr = ctx.getTransform()
		for (const child of this.children) {
			this.goSelf(ctx)
			child.draw(ctx, this)
			ctx.setTransform(original_tr)
		}
	}

	/** preferably `goOut()` then customize as you please */
	abstract drawOverlay(ctx: Ctx2D): void

	goSelf(ctx: Ctx2D): void {
		const { x, y, ox, oy, rot } = this
		ctx.translate(x, y)
		ctx.rotate(rot)
		ctx.translate(ox, oy)
		this.temp.self_tr = ctx.getTransform()
	}

	goSelfInverse(ctx: Ctx2D): void {
		const { x, y, ox, oy, rot } = this
		ctx.translate(-ox, -oy)
		ctx.rotate(-rot)
		ctx.translate(-x, -y)
	}

	/** go to absolute canvas coordinates (identity, or resetTransform) */
	goAbs(ctx: Ctx2D): void {
		ctx.resetTransform()
	}

	/** get absolute 2d point relative to `self` coordinates */
	getAbsPointOfSelf(point: DOMPointReadOnly): DOMPointReadOnly {
		return this.temp.self_tr.inverse().transformPoint(point)
	}

	constructor() {
		this.temp = {
			rid: AbstractNode.number_of_nodes,
			dirty: true,
		}
		AbstractNode.number_of_nodes += 1
	}
}
