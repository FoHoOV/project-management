import { browser } from '$app/environment';

export class LocalStorage {
	getItem(key: string) {
		return browser ? null : window.localStorage.getItem(key);
	}
	setItem(key: string, value: string) {
		if (!browser) {
			return;
		}
		window.localStorage.setItem(key, value);
	}
}
