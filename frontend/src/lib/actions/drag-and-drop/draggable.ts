import type { Attachment } from 'svelte/attachments';
import type { DraggableOptions } from './draggable-types';
import { generateDropZoneTargetNames } from './drop-zone';
import { setDraggingElement } from './shared';

export function draggable<Data extends object>(
	options: DraggableOptions<Data>
): Attachment<HTMLElement> {
	return (node) => {
		_init(node, options);

		function handleDragStart(e: DragEvent) {
			if (!e.dataTransfer || e.target !== node) {
				return;
			}
			setDraggingElement(node);
			e.dataTransfer.setData('text/plain', JSON.stringify({ ...options.data }));
			e.dataTransfer.setData(generateDropZoneTargetNames(options.targetDropZoneNames), '');
		}

		node.addEventListener('dragstart', handleDragStart);

		return () => {
			node.removeEventListener('dragstart', handleDragStart);
		};
	};
}

function _init<Data extends object>(node: HTMLElement, options: DraggableOptions<Data>) {
	if (options.disabled === undefined) {
		options.disabled = false;
	}

	node.draggable = !options.disabled;
	if (node.draggable) {
		node.classList.add('cursor-grab');
	} else {
		node.classList.remove('cursor-grab');
	}
}
