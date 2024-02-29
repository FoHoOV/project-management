export interface IPage {
	goto(...args: unknown): Promise<void>;
}
