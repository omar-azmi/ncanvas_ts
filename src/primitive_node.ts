import { AbstractNode, Ctx2D } from "./abstract_node.ts"


export class Rect extends AbstractNode {
	constructor(config?: {}) {
		super()
		this.style.fillStyle = "red"
	}

	drawSelf(ctx?: Ctx2D): void {
		ctx = ctx || this.temp.ctx!
		const { x, y, width, height, cx, cy } = this.orect
		const [rx, ry] = [- width * cx, - height * cy]
		this.goOut()
		ctx.fillStyle = this.style.fillStyle
		ctx.fillRect(rx, ry, width, height)
	}
	
	drawOverlay(ctx?: Ctx2D): void { return }
}

