import type { ActionReturn } from 'svelte/action';

export type DropZoneOptions<Data extends object> = DataTransfer & {
	highlighClasses?: string[];
	model: Data;
};
export type DropZoneEvents<Data extends object> = {
	'on:dropped': (event: CustomEvent<{ data: Data }>) => void;
};

export function dropzone<Data extends object>(
	node: HTMLElement,
	options: DropZoneOptions<Data>
): ActionReturn<DropZoneOptions<Data>, DropZoneEvents<Data>> {
	if (options.highlighClasses === undefined) {
		options.highlighClasses = [
			'pointer-events-none',
			'bordered',
			'rounded-md',
			'border-info-primary'
		];
	}

	function handleDragEnter(e: DragEvent) {
		if (!(e.target instanceof HTMLElement)) return;
		e.target.classList.add(...(options.highlighClasses as string[]));
	}

	function handleDragLeave(e: DragEvent) {
		if (!(e.target instanceof HTMLElement)) return;
		e.target.classList.remove(...(options.highlighClasses as string[]));
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		e.dataTransfer.dropEffect = options.dropEffect;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!e.dataTransfer) return;
		const data = e.dataTransfer.getData('application/javascript');
		if (!(e.target instanceof HTMLElement)) return;
		e.target.classList.remove(...(options.highlighClasses as string[]));
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
