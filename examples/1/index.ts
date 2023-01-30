import { Rect, $bulkEvt, $evt, $obj, getPointerPos } from "../../src/mod.ts"


/*on mount*/
const canvas = document.getElementById("canvas") as HTMLCanvasElement
canvas.width = canvas.getBoundingClientRect().width * window.devicePixelRatio || 1
canvas.height = canvas.getBoundingClientRect().height * window.devicePixelRatio || 1
const ctx = canvas.getContext("2d")
const FPS = 60

const update_pos_label = (evt: PointerEvent) => {
	const global_pos = getPointerPos(evt)
	$obj("pointer-global-x").textContent = +global_pos.x.toFixed(4)
	$obj("pointer-global-y").textContent = +global_pos.y.toFixed(4)
	const world_pos = world.getAbsPointIn(global_pos)
	$obj("pointer-x").textContent = +world_pos.x.toFixed(4)
	$obj("pointer-y").textContent = +world_pos.y.toFixed(4)
}
let onmouseover_interval = undefined
const onmouseover_polling_rate = FPS / 1000 // in milliseconds
$evt("canvas", "mousemove", (evt) => {
	update_pos_label(evt)
	// handling stationary mouse hover via interval polling
	clearInterval(onmouseover_interval)
	onmouseover_interval = setInterval(update_pos_label, onmouseover_polling_rate, evt)
})
$bulkEvt(
	(evt) => {
		clearInterval(onmouseover_interval)
		update_pos_label(evt)
	},
	["canvas", "mouseover"],
	["canvas", "mouseout"],
)

const world = new Rect()
world.orect = { x: canvas.width / 4, y: canvas.height / 2, width: canvas.width, height: canvas.height, cx: 0.25, cy: 0.5, rot: 0 * Math.PI / 6 }
world.irect.width = 100
world.irect.height = 100
world.style.fillStyle = "orange"
world.temp.debug = true

for (let i = 0; i < 12; i++) {
	let n = new Rect()
	n.orect = {
		...n.orect,
		x: Math.random() * 100,
		y: Math.random() * 100 - 50,
		width: Math.random() * 10 + 5,
		height: - (Math.random() * 10 + 5),
		cy: 0.25,
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
	pickRandomElem(world.children).orect.rot += 2 * Math.PI / (FPS * 10) * Math.random()
	pickRandomElem(world.children).irect.rot -= 2 * Math.PI / (FPS * 5) * Math.random()
	//setTimeout(() => {
	//requestAnimationFrame(drawAll)
	//}, 1000 / FPS)
}
drawAll()

const RUN = setInterval(requestAnimationFrame, 1000 / FPS, drawAll)
// clearInterval(RUN) // stop the `RUN` animation interval