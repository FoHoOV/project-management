/**
 * if we reassign the same value to a primitive then effects and derived runes won't rerun for it,
 * to get around this issue I had to create this stupid class, I hope I won't need it in the future.
 * see: https://github.com/sveltejs/svelte/issues/10593 which is marked as not planned :(
 */
export class ReactiveString {
	private _nonce = new Date().getTime();

	constructor(public val: string | null | undefined) {}
}
