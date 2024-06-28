import { getContext, setContext } from '$lib/stores';
import type { ThemeManager } from './theme.svelte';

export const THEME_CONTEXT_KEY = Symbol();

export function getTheme() {
	return getContext<ThemeManager>(THEME_CONTEXT_KEY);
}

export function setTheme(themeManager: ThemeManager, setToRoot: boolean = true) {
	return setContext(themeManager, THEME_CONTEXT_KEY, setToRoot);
}
