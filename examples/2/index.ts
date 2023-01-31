import { Sprite, Rect } from "../../src/mod.ts"

/*on mount*/
const canvas = document.getElementById("canvas") as HTMLCanvasElement
canvas.width = canvas.getBoundingClientRect().width * (window.devicePixelRatio ?? 1)
canvas.height = canvas.getBoundingClientRect().height * (window.devicePixelRatio ?? 1)
const ctx = canvas.getContext("2d")!
const FPS = 60

const world = new Rect()
world.orect = { x: canvas.width / 4, y: canvas.height / 2, width: canvas.width, height: canvas.height, cx: 0.25, cy: 0.5, rot: 0 * Math.PI / 6 }
world.irect.width = 100
world.irect.height = 100
world.style.fillStyle = "orange"
world.temp.debug = true

for (let i = 0; i < 30; i++) {
	const n = new Sprite({
		src: "./bunny.png"
	})
	n.orect = {
		...n.orect,
		x: Math.random() * 100,
		y: Math.random() * 100 - 50,
		width: Math.random() * 10 + 5,
		height: - (Math.random() * 10 + 5),
		cx: 0.5,
		cy: 1.0,
	}
	n.irect.width = 80
	n.irect.height = 40
	n.style.fillStyle = "blue"
	world.add(n)
	n.temp.debug = true
}

const pickRandomElem = (arr: Array<T>): T => {
	return arr[Math.floor(Math.random() * arr.length)]
}

let fwd = 1
const drawAll = () => {
	ctx.resetTransform()
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	world.draw(ctx)
	world.irect.rot += 2 * Math.PI / (FPS * 50)
	world.orect.rot -= 2 * Math.PI / (FPS * 100) * Math.random()
	if (world.irect.x > 300) fwd = -1
	if (world.irect.x < -200) fwd = +1
	world.irect.x += 50 * fwd / FPS
	pickRandomElem(world.children).orect.rot += 2 * Math.PI / (FPS * 1) * Math.random()
	pickRandomElem(world.children).irect.rot -= 2 * Math.PI / (FPS * 0.5) * Math.random()
	//setTimeout(() => {
	//requestAnimationFrame(drawAll)
	//}, 1000 / FPS)
}
drawAll()

const RUN = setInterval(requestAnimationFrame, 1000 / FPS, drawAll)
// clearInterval(RUN) // stop the `RUN` animation interval