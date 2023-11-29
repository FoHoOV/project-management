import type { ActionReturn } from 'svelte/action';

export type DropEvent<Data extends object> = CustomEvent<{ data: Data }>;
export type DropZoneOptions<Data extends object> = Partial<DataTransfer> & {
	highlighClasses?: string[];
	model: Data; // I have to w8 for svelte5 for native ts support in markup
	type: string;
};
export type DropZoneEvents<Data extends object> = {
	'on:dropped': (event: DropEvent<Data>) => void;
};

export function dropzone<Data extends object>(
	node: HTMLElement,
	options: DropZoneOptions<Data>
): ActionReturn<DropZoneOptions<Data>, DropZoneEvents<Data>> {
	if (options.highlighClasses === undefined) {
		options.highlighClasses = ['!border', '!rounded-2xl', '!border-success'];
	}

	if (!options.dropEffect) {
		options.dropEffect = 'move';
	}

	node.dataset.dropZoneCategory = options.type;

	function handleDragEnter(e: DragEvent) {
		if (!checkIfIsInSameDropZoneCategory(node, options.type)) {
			return;
		}

		if (e.target !== node) {
			return;
		}

		node.classList.add(...(options.highlighClasses as string[]));
	}

	function handleDragLeave(e: DragEvent) {
		if (!checkIfIsInSameDropZoneCategory(node, options.type)) {
			return;
		}

		if (e.target !== node || (e.relatedTarget && node.contains(e.relatedTarget as HTMLElement))) {
			return;
		}

		node.classList.remove(...(options.highlighClasses as string[]));
	}

	function handleDragOver(e: DragEvent) {
		if (!checkIfIsInSameDropZoneCategory(node, options.type)) {
			return;
		}

		e.preventDefault();
		if (!e.dataTransfer) {
			return;
		}

		e.dataTransfer.dropEffect = options.dropEffect!;
	}

	function handleDrop(e: DragEvent) {
		if (!checkIfIsInSameDropZoneCategory(node, options.type)) {
			return;
		}

		e.preventDefault();

		if (!e.dataTransfer) {
			return;
		}

		const data = e.dataTransfer.getData('text/plain');
		node.classList.remove(...(options.highlighClasses as string[]));
		node.dispatchEvent(
			new CustomEvent('dropped', {
				detail: {
					data: JSON.parse(data)
				}
			})
		);
	}

	node.addEventListener('dragenter', handleDragEnter);
	node.addEventListener('dragleave', handleDragLeave);
	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		destroy() {
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
		}
	};
}

function checkIfIsInSameDropZoneCategory(node: HTMLElement, type: string) {
	return node.dataset.dropZoneCategory === type;
}
