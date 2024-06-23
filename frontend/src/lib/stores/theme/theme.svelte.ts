import { browser } from '$app/environment';
import { getTheme as getThemeFromContext, setTheme as setThemToContext } from './context';

export type Theme = 'dark' | 'light';

export function getSelectedTheme$() {
	const theme: Theme = $derived.by(() => {
		if (!browser) {
			return 'dark';
		}
		if (
			getThemeFromContext()?.current.theme === 'light' ||
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

export function changeTheme(theme: Theme) {
	setThemToContext(theme);
}
