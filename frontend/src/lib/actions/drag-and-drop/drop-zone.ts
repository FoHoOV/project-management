import type { ActionReturn } from 'svelte/action';

export type DropEvent<Data extends object> = CustomEvent<{ data: Data }>;

export type DropZoneOptions<Data extends object> = Partial<DataTransfer> & {
	highlighClasses?: string[];
	model: Data; // I have to w8 for svelte5 for native ts support in markup
	name: string;
	disabled?: boolean;
};

export type DropZoneEvents<Data extends object> = {
	'on:dropped': (event: DropEvent<Data>) => void;
};

export function dropzone<Data extends object>(
	node: HTMLElement,
	options: DropZoneOptions<Data>
): ActionReturn<DropZoneOptions<Data>, DropZoneEvents<Data>> {
	setOptionsDefaults(options);

	node.dataset.dropZoneName = options.name;

	function handleDragEnter(event: DragEvent) {
		if (!checkIfIsInSameDropZoneName(node, event, options.name) || options.disabled) {
			return;
		}

		if (event.target !== node) {
			return;
		}

		node.classList.add(...(options.highlighClasses as string[]));
	}

	function handleDragLeave(event: DragEvent) {
		if (!checkIfIsInSameDropZoneName(node, event, options.name) || options.disabled) {
			return;
		}

		if (
			event.target !== node ||
			(event.relatedTarget && node.contains(event.relatedTarget as HTMLElement))
		) {
			return;
		}

		node.classList.remove(...(options.highlighClasses as string[]));
	}

	function handleDragOver(event: DragEvent) {
		if (!checkIfIsInSameDropZoneName(node, event, options.name) || options.disabled) {
			return;
		}

		event.preventDefault();
		if (!event.dataTransfer) {
			return;
		}

		event.dataTransfer.dropEffect = options.dropEffect!;
	}

	function handleDrop(event: DragEvent) {
		if (!checkIfIsInSameDropZoneName(node, event, options.name) || options.disabled) {
			return;
		}

		event.preventDefault();

		if (!event.dataTransfer) {
			return;
		}

		const data = event.dataTransfer.getData('text/plain');
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
		update(newOptions) {
			options = newOptions;
			setOptionsDefaults(options);
		},
		destroy() {
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
		}
	};
}

function setOptionsDefaults<Data extends object>(options: DropZoneOptions<Data>) {
	if (options.highlighClasses === undefined) {
		options.highlighClasses = ['!border', '!rounded-2xl', '!border-success'];
	}

	if (!options.dropEffect) {
		options.dropEffect = 'move';
	}

	if (options.disabled === undefined) {
		options.disabled = false;
	}
}

const _dropZoneNamePrefixUUID =
	`draggable_action_${crypto.randomUUID()}_DropZoneTargetSymbol_`.toLowerCase();

export function generateDropZoneTargetNames(names: string[]) {
	return `${_dropZoneNamePrefixUUID}:${JSON.stringify(names)}`.toLowerCase();
}

export function existInDropZoneTargetNames(types: readonly string[], name: string): boolean {
	const targetType = types.find((value) => value.startsWith(_dropZoneNamePrefixUUID));
	if (!targetType) {
		return false;
	}

	const splitted = targetType.split(':');
	if (splitted.length != 2) {
		return false;
	}

	try {
		const names: string[] = JSON.parse(splitted[1]);
		return names.find((value) => value == name.toLowerCase()) !== undefined;
	} catch (e) {
		return false;
	}
}

function checkIfIsInSameDropZoneName(node: HTMLElement, event: DragEvent, name: string) {
	return (
		node.dataset.dropZoneName === name &&
		event.dataTransfer?.types &&
		existInDropZoneTargetNames(event.dataTransfer.types, name)
	);
}
