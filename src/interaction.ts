import { Vec2 } from "./abstract_node.ts"


export const getPointerPos = (event: MouseEvent): Vec2 => {
	const
		canvas = event.target as HTMLCanvasElement,
		canvas_rect = canvas.getBoundingClientRect(),
		[sx, sy] = [canvas.width / canvas_rect.width, canvas.height / canvas_rect.height],
		pointer: Vec2 = {
			x: sx * (event.clientX - canvas_rect.left),
			y: sy * (event.clientY - canvas_rect.top),
		}
	return pointer
}

/// temps

export type DomId = string | Element | undefined
export type DomEvent = [dom_id: string | Element, event_name: string & keyof DocumentEventMap]

export const $ = (id: string | Element): Element | null => {
	if (id instanceof Element || id instanceof Document) return id as Element
	return document.getElementById(id)
}

export const $obj = (id: string | Element): Element | {} => {
	const elem = $(id)
	return elem || {}
}

export const $bulkConvert = (obj: { [var_name: string]: DomId }): { [var_name: string]: Element | string } => {
	// bulk convert in-place an object of DOM ids, into their corresponding DOM elements
	for (const [var_name, dom_id] of Object.entries(obj)) {
		const elem = $(dom_id as string)
		obj[var_name] = elem == undefined ? dom_id as string : elem
	}
	return obj
}

export const $evt = (id: DomEvent[0], event_name: DomEvent[1], callback: VoidFunction) => {
	const elem = $(id)
	if (elem instanceof Element) elem.addEventListener(event_name, callback)
}

export const $bulkEvt = (callback: VoidFunction, ...dom_events: DomEvent[]) => {
	// bulk attach event listeners to the dom ids and event names provided in `dom_events`
	for (const [dom_id, event_name] of dom_events) {
		$evt(dom_id, event_name, callback)
	}
}
