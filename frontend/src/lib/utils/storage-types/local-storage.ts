import { browser } from '$app/environment';

export class LocalStorage {
	#serverSideItems = new Map<string, string>();

	getItem(key: string) {
		return browser ? window.localStorage.getItem(key) : (this.#serverSideItems.get(key) ?? null);
	}
	setItem(key: string, value: string) {
		if (browser) {
			window.localStorage.setItem(key, value);
			return;
		}
		this.#serverSideItems.set(key, value);
	}
}
