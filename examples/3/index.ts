import { Sprite, Rect } from "../../src/mod.ts"

/*on mount*/
const canvas = document.getElementById("canvas") as HTMLCanvasElement
canvas.width = 500 // canvas.getBoundingClientRect().width * (window.devicePixelRatio ?? 1)
canvas.height = 500 // canvas.getBoundingClientRect().height * (window.devicePixelRatio ?? 1)
const ctx = canvas.getContext("2d")!
const FPS = 6

const world = new Rect()
Object.assign(world, {
	x: 100,
	y: 100,
	width: 200,
	height: 100,
	ox: -50,
	oy: -50,
	rot: Math.PI / 6,
})
world.style.fillStyle = "yellow"
world.temp.debug = true


for (let i = 10; i < 5; i++) {
	const n = new Sprite({
		src: "./bunny.png",
		x: Math.random() * 100,
		y: Math.random() * 100 - 50,
		width: 26,
		height: 37,
		orx: 0.5,
		ory: 0.0,
		rot: 0.0
	})
	n.style.fillStyle = "blue"
	world.add(n)
	n.temp.debug = true
}

const bunny = new Sprite({
	src: "./bunny.png",
	x: 100,
	y: 100,
	width: 26,
	height: 37,
	orx: -0.5,
	ory: 0.0,
	rot: 0.0
})
world.add(bunny)
bunny.temp.debug = true


let fwd = 1
const drawAll = () => {
	ctx.resetTransform()
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = "orange"
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	world.draw(ctx)
}
drawAll()

const RUN = setInterval(requestAnimationFrame, 1000 / FPS, drawAll)
// clearInterval(RUN) // stop the `RUN` animation interval
Object.assign(window, {
	world,
	drawAll,
	bunny,
	RUN,
})
