import { getContext, setContext } from '$lib/stores';
import type { StorageTypes } from './storage-types';

const STORAGE_TYPES_CONTEXT_KEY = Symbol();

export function getStorageTypes() {
	return getContext<StorageTypes>(STORAGE_TYPES_CONTEXT_KEY);
}

export function setStorageTypes(store: StorageTypes, setToRoot: boolean = true) {
	return setContext(store, STORAGE_TYPES_CONTEXT_KEY, setToRoot);
}
