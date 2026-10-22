export type DraggableOptions<Data extends object> = {
	data: Data;
	targetDropZoneNames: string[];
	disabled?: boolean;
};
