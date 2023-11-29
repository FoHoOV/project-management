export function cursorOnElementPositionY(
	element: HTMLElement,
	position: { x: number; y: number }
): 'top' | 'bottom' {
	const bounds = element.getBoundingClientRect();

	if (position.y <= bounds.top + bounds.height / 2) {
		return 'top';
	} else {
		return 'bottom';
	}
}

export function cursorOnElementPositionX(
	element: HTMLElement,
	position: { x: number; y: number }
): 'left' | 'right' {
	const bounds = element.getBoundingClientRect();

	if (position.x <= bounds.left + bounds.width / 2) {
		return 'left';
	} else {
		return 'right';
	}
}
