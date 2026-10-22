import { getContext, setContext } from 'svelte';
import type { StorageTypes } from './storage-types';

const STORAGE_TYPES_CONTEXT_KEY = Symbol();

export function getStorageTypes() {
	return getContext<StorageTypes>(STORAGE_TYPES_CONTEXT_KEY);
}

export function setStorageTypes(store: StorageTypes) {
	return setContext(STORAGE_TYPES_CONTEXT_KEY, store);
}
