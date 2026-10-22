import { getContext, setContext } from 'svelte';
import type { Persisted } from './persisted.svelte';

const PERSISTED_CONTEXT_KEY = Symbol();

export function getPersistedUtils() {
	return getContext<Persisted>(PERSISTED_CONTEXT_KEY);
}

export function setPersistedUtils(store: Persisted) {
	return setContext(PERSISTED_CONTEXT_KEY, store);
}
