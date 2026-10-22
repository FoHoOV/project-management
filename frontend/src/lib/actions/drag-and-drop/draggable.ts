import type { Attachment } from 'svelte/attachments';
import type { DraggableOptions } from './draggable-types';
import { generateDropZoneTargetNames } from './drop-zone';
import { setDraggingElement } from './shared';

export function draggable<Data extends object>({
	data,
	targetDropZoneNames,
	disabled = false
}: DraggableOptions<Data>): Attachment<HTMLElement> {
	return (node) => {
		if (disabled) {
			return;
		}

		function handleDragStart(e: DragEvent) {
			if (!e.dataTransfer || e.target !== node) {
				return;
			}
			setDraggingElement(node);
			e.dataTransfer.setData('text/plain', JSON.stringify({ ...data }));
			e.dataTransfer.setData(generateDropZoneTargetNames(targetDropZoneNames), '');
		}

		node.draggable = true;
		node.classList.add('cursor-grab');
		node.addEventListener('dragstart', handleDragStart);

		return () => {
			node.draggable = false;
			node.classList.remove('cursor-grab');
			node.removeEventListener('dragstart', handleDragStart);
		};
	};
}
