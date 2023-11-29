export type DraggableOptions<Data extends object> = Partial<DataTransfer> & {
	data: Data;
	targetDropZoneName: string;
};

const _typePrefixUUID = crypto.randomUUID();

export function generateDropZoneTargetName(type: string) {
	return `draggable_action_${_typePrefixUUID}_DropZoneTargetSymbol_${type}`.toLowerCase();
}

export function draggable<Data extends object>(node: HTMLElement, options: DraggableOptions<Data>) {
	node.draggable = true;
	node.classList.add('cursor-grab');

	function handleDragStart(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.setData('text/plain', JSON.stringify({ ...options.data }));
		e.dataTransfer.setData(generateDropZoneTargetName(options.targetDropZoneName), '');
	}

	node.addEventListener('dragstart', handleDragStart);

	return {
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
		}
	};
}
