import { getContext, setContext } from '$lib/stores';
import type { Theme, ThemeManager } from './theme.svelte';
import { Persisted } from '$lib/stores/persisted';

type StoreType = ReturnType<typeof Persisted.cookie$<{ theme: Theme }>>;

export const THEME_CONTEXT_KEY = Symbol();

export function getTheme() {
	return getContext<ThemeManager>(THEME_CONTEXT_KEY);
}

export function setTheme(themeManager: ThemeManager, setToRoot: boolean = true) {
	return setContext(themeManager, THEME_CONTEXT_KEY, setToRoot);
}
