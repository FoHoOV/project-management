export type DispatcherToCallbackEvent<TDispatcherType> = {
	[Key in keyof TDispatcherType as `on${Capitalize<string & Key>}`]: (
		data: TDispatcherType[Key]
	) => void;
};
