import { generateDropZoneTargetNames } from './drop-zone';

export type DraggableOptions<Data extends object> = Partial<DataTransfer> & {
	data: Data;
	targetDropZoneNames: string[];
};

export function draggable<Data extends object>(node: HTMLElement, options: DraggableOptions<Data>) {
	node.draggable = true;
	node.classList.add('cursor-grab');

	function handleDragStart(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.setData('text/plain', JSON.stringify({ ...options.data }));
		e.dataTransfer.setData(generateDropZoneTargetNames(options.targetDropZoneNames), '');
	}

	node.addEventListener('dragstart', handleDragStart);

	return {
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
		}
	};
}
