export type CursorOnElementPosition = 'top' | 'bottom' | 'right' | 'left';
export function cursorOnElementPosition(
	element: HTMLElement,
	position: { x: number; y: number }
): CursorOnElementPosition {
	const bounds = element.getBoundingClientRect();

	if (position.y <= bounds.top + bounds.height / 2) {
		return 'top';
	} else {
		return 'bottom';
	}

	// others ...
}
