import type { Attachment } from 'svelte/attachments';
import type { DropZoneCallbacks, DropZoneOptions } from './drop-zone-types';
import { _CUSTOM_DRAGGABLE_EVENT_DATA } from './constants';
import { getDraggingElement } from './shared';

export function dropzone<Data extends object>({
	names,
	disabled = false,
	highlighClasses = ['!border', '!rounded-2xl', '!border-success'],
	dropEffect = 'move',
	onDropped,
	onDragEntered,
	onDragLeft,
	onDragHover
}: DropZoneOptions & DropZoneCallbacks<Data>): Attachment<HTMLElement> {
	return (node) => {
		if (disabled) {
			return;
		}

		function handleDragStart(event: DragEvent) {
			if (!_isTargetedByDrag(event, names)) {
				return;
			}
			_clearCustomEventData(getDraggingElement() as HTMLElement);
		}

		function handleDragEnter(event: DragEvent) {
			if (!_isTargetedByDrag(event, names) || !node.contains(event.target as HTMLElement)) {
				return;
			}

			node.classList.add(...highlighClasses);
			onDragEntered?.({
				originalEvent: event,
				node: node,
				names: _getMatchingDropZoneNames(event, names)
			});
		}

		function handleDragLeave(event: DragEvent) {
			if (!_isTargetedByDrag(event, names)) {
				return;
			}

			if (
				!(event.target as HTMLElement).contains(node) &&
				event.relatedTarget &&
				node.contains(event.relatedTarget as HTMLElement)
			) {
				return;
			}

			node.classList.remove(...highlighClasses);
			onDragLeft?.({
				originalEvent: event,
				node: node,
				names: _getMatchingDropZoneNames(event, names)
			});
		}

		function handleDragOver(event: DragEvent) {
			if (!_isTargetedByDrag(event, names)) {
				return;
			}

			event.preventDefault();
			if (!event.dataTransfer) {
				return;
			}

			event.dataTransfer.dropEffect = dropEffect;

			if (node.contains(event.target as HTMLElement)) {
				onDragHover?.({
					originalEvent: event,
					node: node,
					names: _getMatchingDropZoneNames(event, names)
				});
			}
		}

		function handleDrop(event: DragEvent) {
			if (!_isTargetedByDrag(event, names)) {
				return;
			}

			event.preventDefault();

			if (!event.dataTransfer) {
				return;
			}

			const data = event.dataTransfer.getData('text/plain');
			node.classList.remove(...highlighClasses);
			const draggingElement = getDraggingElement() as HTMLElement;
			onDropped({
				data: JSON.parse(data),
				names: _getMatchingDropZoneNames(event, names),
				originalEvent: event,
				getCustomEventData: <T>(key: string) => {
					return _getCustomEventData(draggingElement, key) as T | undefined;
				},
				addCustomEventData: (key: string, data: any) => {
					_addCustomEventData(draggingElement, key, data);
				}
			});
		}

		node.addEventListener('dragstart', handleDragStart);
		node.addEventListener('dragenter', handleDragEnter);
		node.addEventListener('dragleave', handleDragLeave);
		node.addEventListener('dragover', handleDragOver);
		node.addEventListener('drop', handleDrop);

		return () => {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragenter', handleDragEnter);
			node.removeEventListener('dragleave', handleDragLeave);
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
			node.classList.remove(...highlighClasses);
		};
	};
}

const _dropZoneNamePrefixUUID =
	`draggable_action_${crypto?.randomUUID?.() ?? Date.now()}_DropZoneTargetSymbol_`.toLowerCase();

export function generateDropZoneTargetNames(names: string[]) {
	return `${_dropZoneNamePrefixUUID}:${JSON.stringify(names)}`.toLowerCase();
}

export function getDropZoneNames(event: DragEvent) {
	const types = event.dataTransfer?.types;

	if (!types || types.length == 0) {
		throw new Error('DragEvent.dataTransfer.types cannot be empty or null');
	}

	const targetType = types.find((value) => value.startsWith(_dropZoneNamePrefixUUID));
	if (!targetType) {
		throw new Error('this node is not a dropzone created by this action');
	}

	const splitted = targetType.split(':');
	if (splitted.length != 2) {
		throw new Error('types is not correctly set in dataTransfer');
	}

	const eventTargetDropZoneNames: string[] = JSON.parse(splitted[1]);
	return eventTargetDropZoneNames;
}

function _getMatchingDropZoneNames(event: DragEvent, names: string[]): string[] {
	return names.filter((nodeTargetZoneName) => {
		return (
			getDropZoneNames(event).find(
				(eventTargetName) => eventTargetName.toLowerCase() == nodeTargetZoneName.toLowerCase()
			) !== undefined
		);
	});
}

function _isTargetedByDrag(event: DragEvent, names: string[]): boolean {
	try {
		return _getMatchingDropZoneNames(event, names).length > 0;
	} catch (e) {
		return false;
	}
}

function _addCustomEventData(draggingElement: HTMLElement, key: string, data: any) {
	const customData = draggingElement.dataset[_CUSTOM_DRAGGABLE_EVENT_DATA];
	let parsedCustomData: Record<string, any> = {};
	if (customData && customData.trim().length > 0) {
		parsedCustomData = JSON.parse(customData);
	}
	draggingElement.dataset[_CUSTOM_DRAGGABLE_EVENT_DATA] = JSON.stringify({
		...parsedCustomData,
		[key]: data
	});
}

function _getCustomEventData(draggingElement: HTMLElement, key: string): unknown | undefined {
	const customData = draggingElement.dataset[_CUSTOM_DRAGGABLE_EVENT_DATA];
	let parsedCustomData: Record<string, any> = {};
	if (customData && customData.trim().length > 0) {
		parsedCustomData = JSON.parse(customData);
	}
	return parsedCustomData[key];
}

function _clearCustomEventData(draggingElement: HTMLElement) {
	draggingElement.dataset[_CUSTOM_DRAGGABLE_EVENT_DATA] = JSON.stringify({});
}
