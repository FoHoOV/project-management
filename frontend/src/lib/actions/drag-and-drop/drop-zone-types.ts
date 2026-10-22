export type DropEvent<Data extends object> = {
	data: Data;
	names: string[];
	originalEvent: DragEvent;
	addCustomEventData: (key: string, data: any) => void;
	getCustomEventData: <T>(key: string) => T | undefined;
};
export type CustomDragEvent = {
	names: string[];
	node: HTMLElement;
	originalEvent: DragEvent;
};
export type DropZoneOptions<Data extends object> = Partial<DataTransfer> & {
	highlighClasses?: string[];
	model: Data; // I have to w8 for svelte5 for native ts support in markup
	names: string[];
	disabled?: boolean;
};

export type DropZoneCallbacks<Data extends object> = {
	onDropped: (event: DropEvent<Data>) => void;
	onDragEntered?: (event: CustomDragEvent) => void;
	onDragLeft?: (event: CustomDragEvent) => void;
	onDragHover?: (event: CustomDragEvent) => void;
};
