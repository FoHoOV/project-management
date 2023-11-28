export function draggable<T extends object>(node: HTMLElement, data: T) {
	node.draggable = true;
	node.classList.add('cursor-grab');

	function handleDragStart(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.setData('application/json', JSON.stringify(data));
	}

	node.addEventListener('dragstart', handleDragStart);

	return {
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
		}
	};
}
