import { getContext, setContext } from '$lib/stores';
import type { Persisted } from './persisted.svelte';

const PERSISTED_CONTEXT_KEY = Symbol();

export function getPersistedUtils() {
	return getContext<Persisted>(PERSISTED_CONTEXT_KEY);
}

export function setPersistedUtils(store: Persisted, setToRoot: boolean = true) {
	return setContext(store, PERSISTED_CONTEXT_KEY, setToRoot);
}
