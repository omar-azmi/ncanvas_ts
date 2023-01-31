import { AbstractNode, Ctx2D, OutRect } from "./abstract_node.ts"
import { AnyImageSource, constructImageBitmapSource } from "./deps.ts"


export class Rect extends AbstractNode {
	constructor(config?: {}) {
		super()
		this.style.fillStyle = "red"
	}

	drawSelf(ctx?: Ctx2D): void {
		ctx ??= this.temp.ctx!
		const
			{ x, y, width, height, cx, cy } = this.orect,
			[rx, ry] = [- width * cx, - height * cy]
		this.goOut(ctx)
		ctx.fillStyle = this.style.fillStyle
		ctx.fillRect(rx, ry, width, height)
	}

	drawOverlay(ctx?: Ctx2D): void { return }
}

const default_sprite_orect: OutRect = {
	x: 0,
	y: 0,
	height: 1,
	width: 1,
	cx: 0.5,
	cy: 0.5,
	rot: 0.0,
}

export class Sprite extends AbstractNode {
	bitmap!: ImageBitmap
	source_loaded!: Promise<this>
	private resolve_source_loaded!: () => void
	private reject_source_loaded!: (reason?: any) => void
	private reset_source_loaded = (): void => {
		this.source_loaded = new Promise<this>((resolve, reject) => {
			this.resolve_source_loaded = () => resolve(this)
			this.reject_source_loaded = reject
		})
	}
	private draw_self_awaiting: boolean = false

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
		const { src, ...orect } = { ...default_sprite_orect, ...config }
		this.orect = orect
		if (src) this.setSource(src)
		else this.reset_source_loaded()
	}

	async drawSelf(ctx: Ctx2D) {
		if (this.draw_self_awaiting === false) {
			this.draw_self_awaiting = true
			await this.source_loaded
			const
				{ width, height, cx, cy } = this.orect,
				[rx, ry] = [- width * cx, - height * cy]
			this.goOut(ctx)
			ctx.drawImage(this.bitmap, rx, ry, width, height)
			this.draw_self_awaiting = false
		}
	}

	drawOverlay(ctx?: Ctx2D): void { return }
}
