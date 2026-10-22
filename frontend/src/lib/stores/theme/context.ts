import { getContext, setContext } from 'svelte';
import type { ThemeManager } from './theme.svelte';

export const THEME_CONTEXT_KEY = Symbol();

export function getTheme() {
	return getContext<ThemeManager>(THEME_CONTEXT_KEY);
}

export function setTheme(themeManager: ThemeManager) {
	return setContext(THEME_CONTEXT_KEY, themeManager);
}
