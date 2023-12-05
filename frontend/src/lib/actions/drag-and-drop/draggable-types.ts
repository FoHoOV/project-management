export type DraggableOptions<Data extends object> = Partial<DataTransfer> & {
	data: Data;
	targetDropZoneNames: string[];
	disabled?: boolean;
};
