import { browser } from '$app/environment';
import { CACHED_THEME_KEY_NAME } from './constants';
import { persisted } from '$lib/stores/persisted';

const _storedTheme = persisted.primitive$(CACHED_THEME_KEY_NAME, null);

export function getSelectedTheme$() {
	const theme = $derived.by(() => {
		if (!browser) {
			return 'dark';
		}
		if (
			_storedTheme.current === 'light' ||
			!window.matchMedia('(prefers-color-scheme: dark)').matches
		) {
			return 'light';
		}

		return 'dark';
	});

	return {
		get current() {
			return theme;
		}
	};
}

export function setTheme(theme: 'dark' | 'light') {
	_storedTheme.current = theme;
}
