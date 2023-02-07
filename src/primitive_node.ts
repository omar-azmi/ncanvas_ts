import { AbstractNode, Ctx2D, OutRect } from "./abstract_node.ts"
import { AnyImageSource, constructImageBitmapSource } from "./deps.ts"


export class Rect extends AbstractNode {
	width: number = 0
	height: number = 0

	constructor(config?: {}) {
		super()
		this.style.fillStyle = "red"
	}

	drawSelf(ctx: Ctx2D): void {
		const { width, height } = this
		ctx.fillStyle = this.style.fillStyle
		ctx.fillRect(0, 0, width, height)
	}

	drawOverlay(ctx: Ctx2D): void { return }
}

export class RTLContainer extends AbstractNode {
	width: number = 0
	height: number = 0

	constructor(config?: {}) {
		super()
	}

	goSelf(ctx: Ctx2D) {
		const { x, y, width, height, rot } = this
		this.ox = width
		this.oy = 0
		ctx.translate(x, y)
		ctx.rotate(rot)
		ctx.translate(width, 0)
		ctx.scale(-1, 0)
		this.temp.self_tr = ctx.getTransform()
	}

	drawSelf(ctx: Ctx2D): void {
		const { width, height } = this
		ctx.fillStyle = this.style.fillStyle
		ctx.fillRect(0, 0, width, height)
	}

	drawOverlay(ctx: Ctx2D): void { return }
}

const default_sprite_config = {
	x: 0,
	y: 0,
	height: 1,
	width: 1,
	orx: 0.5,
	ory: 0.5,
	rot: 0.0,
}

export class Sprite extends AbstractNode {
	bitmap?: ImageBitmap
	source_loaded!: Promise<this>
	private resolve_source_loaded!: () => void
	private reject_source_loaded!: (reason?: any) => void
	private reset_source_loaded = (): void => {
		this.source_loaded = new Promise<this>((resolve, reject) => {
			this.resolve_source_loaded = () => resolve(this)
			this.reject_source_loaded = reject
		})
	}

	declare width: number
	declare height: number

	get orx(): number {
		return this.ox / this.width
	}

	set orx(value: number) {
		this.ox = this.width * value
	}

	get ory(): number {
		return this.oy / this.height
	}

	set ory(value: number) {
		this.oy = this.height * value
	}

	setSource = (source_img: AnyImageSource) => {
		this.reset_source_loaded()
		constructImageBitmapSource(source_img)
			.then(createImageBitmap)
			.then((bitmap) => {
				this.bitmap = bitmap
				this.resolve_source_loaded()
			})
			.catch(() => { throw new Error(`failed to load source image:\n\t${source_img}`) })
		return this.source_loaded
	}

	constructor(config: Partial<OutRect> & { src?: AnyImageSource } = {}) {
		super()
		const { src, orx, ory, ...rect } = { ...default_sprite_config, ...config }
		Object.assign(this, rect)
		this.orx = orx
		this.ory = ory
		if (src) this.setSource(src)
		else this.reset_source_loaded()
	}

	drawSelf(ctx: Ctx2D) {
		const { width, height } = this
		if (this.bitmap) ctx.drawImage(this.bitmap, 0, 0, width, height)
	}

	drawOverlay(ctx: Ctx2D): void { return }
}
