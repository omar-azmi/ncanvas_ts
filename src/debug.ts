import { AbstractNode, Ctx2D, Ctx2DStyle, Vec2 } from "./abstract_node.ts"

/** interface for configuring your debugging grid. <br>
 * default config fields are listed in {@link defaultDebugGridConfig}
*/
export interface debugGridConfig {
	interval_x?: [number, number]
	interval_y?: [number, number]
	/** gridline vertical and horizontal spacing */
	spacing: Vec2
	/** guarantee that gridlines will intersect at this point. in general, you want this to be the origin point */
	align: Vec2
	/** enable flashing of the gridline's background rect */
	flashing?: boolean
	/**
	 * - `style.lineWidth` => set gridline absolute width
	 * - `style.strokeStyle` => set gridline color
	 * - `style.fillStyle` => set flashing rect background color
	*/
	style: Ctx2DStyle
	origin: {
		/**
		 * `style.lineWidth` => set axis-unit vectors' absolute width
		 * `style.strokeStyle` => set axis-unit vectors' color
		 * `style.fillStyle` => set origin dot fill color
		*/
		styleX: Ctx2DStyle
		styleY: Ctx2DStyle
		radius: number // origin dot, absolute size
		arrow_length: number // unit vector arrow's length, absolute size
	}
}

/** default debugging grid. see {@link debugGridConfig} */
export const defaultDebugGridConfig: debugGridConfig = {
	interval_x: undefined,
	interval_y: undefined,
	spacing: { x: 10, y: 10 },
	align: { x: 0, y: 0 },
	style: {
		lineWidth: 3,
		strokeStyle: "black",
		fillStyle: "rgba(255, 192, 86, 0.75)",
	},
	origin: {
		styleX: {
			lineWidth: 5,
			strokeStyle: "red",
			fillStyle: "red",
		},
		styleY: {
			lineWidth: 5,
			strokeStyle: "green",
			fillStyle: "green",
		},
		radius: 5,
		arrow_length: 25,
	}
}

/** draw debugging stuff, such as grid lines <br>
 * your `node` must contain a canvas context in `n.temp.ctx`, or otherwise provided in `config` as `config.ctx`
*/
export const drawDebug = (node: AbstractNode, ctx: Ctx2D, config?: debugGridConfig) => {
	ctx.save()
	const
		{ style, spacing, align, origin, flashing } = { ...defaultDebugGridConfig, ...config },
		{ orect, otransform, itransform } = node,
		out_to_in_tr = itransform.inverse().multiply(otransform),
		o_corners = [ // the 4 corners of orect. the ordering is:
			{ x: - orect.width * orect.cx, y: - orect.height * orect.cy }, // top-left
			{ x: - orect.width * orect.cx, y: orect.height * (1 - orect.cy) }, // bottom-left
			{ x: orect.width * (1 - orect.cx), y: orect.height * (1 - orect.cy) }, // bottom-right
			{ x: orect.width * (1 - orect.cx), y: - orect.height * orect.cy }, // top-right
		]
	let { interval_x, interval_y } = Object.assign({}, config) // we need a copy of the intervals. not a reference to them
	const
		i_corners = o_corners.map((pos) => out_to_in_tr.transformPoint(pos)), // the inner coordinates of the positions where the external orect corners map internally
		i_corners_xpos = i_corners.map((pos) => pos.x),
		i_corners_ypos = i_corners.map((pos) => pos.y),
		i_xrange = { min: Math.min(...i_corners_xpos), max: Math.max(...i_corners_xpos) },
		i_yrange = { min: Math.min(...i_corners_ypos), max: Math.max(...i_corners_ypos) },
		modulo = (n: number, d: number): number => ((n % d) + d) % d // javascript's `%` operator behaves as the remained operator, whereas in python, `%` gives you the modulo, which is why we have to define it here
	interval_x = interval_x || [i_xrange.min, i_xrange.max]
	interval_y = interval_y || [i_yrange.min, i_yrange.max]
	const align_offset = {
		x: modulo((Math.min(...interval_x) - align.x), spacing.x),
		y: modulo((Math.min(...interval_y) - align.y), spacing.y),
	}
	interval_x = [Math.min(...interval_x) - align_offset.x, Math.max(...interval_x) + align_offset.x]
	interval_y = [Math.min(...interval_y) - align_offset.y, Math.max(...interval_y) + align_offset.y]
	node.goIn(ctx)
	Object.assign(ctx, style)
	if (flashing && Math.random() > 0.5) ctx.fillStyle = "rgba(255, 255, 255, 0.25)" // flashing effect
	ctx.fillRect(i_xrange.min, i_yrange.min, i_xrange.max - i_xrange.min, i_yrange.max - i_yrange.min)
	ctx.beginPath()
	for (let x = interval_x[0]; x <= interval_x[1]; x += spacing.x) {
		ctx.moveTo(x, interval_y[0])
		ctx.lineTo(x, interval_y[1])
	}
	for (let y = interval_y[0]; y <= interval_y[1]; y += spacing.y) {
		ctx.moveTo(interval_x[0], y)
		ctx.lineTo(interval_x[1], y)
	}
	node.goAbs(ctx)
	ctx.stroke()
	const
		global_origin = itransform.transformPoint({ x: 0, y: 0 }),
		origin_tr = new DOMMatrixReadOnly([1, 0, 0, 1, -global_origin.x, -global_origin.y]),
		to_global_uvec = (u: DOMPoint): DOMPoint => {
			const
				global_u = itransform.transformPoint(u).matrixTransform(origin_tr),
				global_u_length = (global_u.x ** 2 + global_u.y ** 2) ** 0.5,
				scale = origin.arrow_length / global_u_length
			return global_u.matrixTransform({ a: scale, d: scale })
		},
		global_u1 = to_global_uvec({ x: 1, y: 0 }),
		global_u2 = to_global_uvec({ x: 0, y: 1 })
	Object.assign(ctx, origin.style)
	ctx.translate(global_origin.x, global_origin.y)
	ctx.beginPath()
	ctx.moveTo(global_u1.x, global_u1.y)
	ctx.lineTo(0, 0)
	ctx.lineTo(global_u2.x, global_u2.y)
	ctx.stroke()
	ctx.restore()
}


export const drawDebugOrigin = (node: AbstractNode, ctx: Ctx2D, origin_config?: debugGridConfig["origin"]) => {
	ctx.save()
	node.goSelf(ctx)
	ctx.translate(-node.ox, -node.oy)
	const
		{ arrow_length, styleX, styleY } = { ...defaultDebugGridConfig.origin, ...origin_config },
		ctx_origin_tr = ctx.getTransform(),
		global_origin = ctx_origin_tr.transformPoint({ x: 0, y: 0 }),
		origin_tr = new DOMMatrixReadOnly([1, 0, 0, 1, -global_origin.x, -global_origin.y]),
		to_global_uvec = (u: DOMPoint): DOMPoint => {
			const
				global_u = ctx_origin_tr.transformPoint(u).matrixTransform(origin_tr),
				global_u_length = (global_u.x ** 2 + global_u.y ** 2) ** 0.5,
				scale = arrow_length / global_u_length
			return global_u.matrixTransform({ a: scale, d: scale })
		},
		global_u1 = to_global_uvec({ x: 1, y: 0 }),
		global_u2 = to_global_uvec({ x: 0, y: 1 })
	node.goAbs(ctx)
	ctx.translate(global_origin.x, global_origin.y)
	Object.assign(ctx, styleX)
	ctx.beginPath()
	ctx.moveTo(0, 0)
	ctx.lineTo(global_u1.x, global_u1.y)
	ctx.stroke()
	Object.assign(ctx, styleY)
	ctx.beginPath()
	ctx.moveTo(0, 0)
	ctx.lineTo(global_u2.x, global_u2.y)
	ctx.stroke()
	ctx.restore()
}
