let _draggingElement: HTMLElement | null;

export function getDraggingElement() {
	return _draggingElement;
}

export function setDraggingElement(node: HTMLElement) {
	_draggingElement = node;
}
