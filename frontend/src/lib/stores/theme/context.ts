import { getContext, setContext } from '$lib/stores';
import type { Theme } from './theme.svelte';
import { Persisted } from '$lib/stores/persisted';

type StoreType = ReturnType<typeof Persisted.cookie$<{ theme: Theme }>>;

export const CACHED_THEME_KEY_NAME = 'CACHED_THEME_KEY_NAME' as const;

export function getTheme() {
	return getContext<StoreType>(CACHED_THEME_KEY_NAME);
}

export function setTheme(value: Theme, setToRoot: boolean = true) {
	const store: StoreType = Persisted.cookie$(CACHED_THEME_KEY_NAME, {
		initializer: { theme: value }
	});
	return setContext(store, CACHED_THEME_KEY_NAME, setToRoot);
}
