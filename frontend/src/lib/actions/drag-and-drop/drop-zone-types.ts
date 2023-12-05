export type DropEvent<Data extends object> = CustomEvent<{
	data: Data;
	names: string[];
	originalEvent: DragEvent;
	addCustomEventData: (key: string, data: any) => void;
	getCustomEventData: <T>(key: string) => T | undefined;
}>;
export type CustomDragEvent = CustomEvent<{
	names: string[];
	node: HTMLElement;
	originalEvent: DragEvent;
}>;
export type DropZoneOptions<Data extends object> = Partial<DataTransfer> & {
	highlighClasses?: string[];
	model: Data; // I have to w8 for svelte5 for native ts support in markup
	names: string[];
	disabled?: boolean;
};

export type DropZoneEvents<Data extends object> = {
	'on:dropped': (event: DropEvent<Data>) => void;
	'on:dragEntered'?: (event: CustomDragEvent) => void;
	'on:dragLeft'?: (event: CustomDragEvent) => void;
	'on:dragHover'?: (event: CustomDragEvent) => void;
};
